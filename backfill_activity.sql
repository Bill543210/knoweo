-- Remplit user_activity pour aujourd'hui depuis user_question_history
INSERT INTO user_activity (id, "userId", date, "questionsAnswered", "correctAnswers", "xpEarned", "createdAt")
SELECT
  gen_random_uuid(),
  h."userId",
  CURRENT_DATE::text,
  COUNT(*)::int                        AS "questionsAnswered",
  SUM(h."correctCount")::int  AS "correctAnswers",
  0                                    AS "xpEarned",
  NOW()
FROM user_question_history h
WHERE h."lastSeenAt"::date = CURRENT_DATE
GROUP BY h."userId"
ON CONFLICT ("userId", date) DO UPDATE
  SET "questionsAnswered" = EXCLUDED."questionsAnswered",
      "correctAnswers"    = EXCLUDED."correctAnswers";

-- Confirmation
SELECT "userId", date, "questionsAnswered", "correctAnswers"
FROM user_activity
WHERE date = CURRENT_DATE::text;
