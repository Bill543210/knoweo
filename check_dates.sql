SET client_encoding = 'UTF8';

-- Voir les dates disponibles dans user_question_history
SELECT
  to_char("lastSeenAt", 'YYYY-MM-DD') as jour,
  COUNT(*) as nb_questions
FROM user_question_history
WHERE "lastSeenAt" IS NOT NULL
GROUP BY jour
ORDER BY jour DESC
LIMIT 10;
