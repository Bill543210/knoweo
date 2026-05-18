SET client_encoding = 'UTF8';

INSERT INTO user_activity (id, "userId", date, "questionsAnswered", "correctAnswers", "xpEarned", "createdAt")
SELECT
  gen_random_uuid(),
  h."userId",
  '2026-05-17',
  COUNT(*)::int,
  SUM(h."correctCount")::int,
  0,
  NOW()
FROM user_question_history h
WHERE to_char(h."lastSeenAt", 'YYYY-MM-DD') = '2026-05-17'
GROUP BY h."userId"
ON CONFLICT ("userId", date) DO UPDATE
  SET "questionsAnswered" = EXCLUDED."questionsAnswered",
      "correctAnswers"    = EXCLUDED."correctAnswers";

SELECT "userId", date, "questionsAnswered", "correctAnswers"
FROM user_activity;
