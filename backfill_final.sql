SET client_encoding = 'UTF8';

INSERT INTO user_activity (id, "userId", date, "questionsAnswered", "correctAnswers", "xpEarned", "createdAt")
SELECT
  gen_random_uuid(),
  h."userId",
  to_char(CURRENT_DATE, 'YYYY-MM-DD'),
  COUNT(*)::int,
  SUM(h."correctCount")::int,
  0,
  NOW()
FROM user_question_history h
WHERE h."lastSeenAt"::date = CURRENT_DATE
GROUP BY h."userId"
ON CONFLICT ("userId", date) DO UPDATE
  SET "questionsAnswered" = EXCLUDED."questionsAnswered",
      "correctAnswers"    = EXCLUDED."correctAnswers";

SELECT "userId", date, "questionsAnswered", "correctAnswers"
FROM user_activity;
