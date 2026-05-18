SET client_encoding = 'UTF8';

-- Questions avec caractères corrompus (Æ, æ, ¯ sont des signes de corruption WIN1252)
SELECT COUNT(*) as corrompues
FROM question
WHERE "textFr" LIKE '%Æ%'
   OR "textFr" LIKE '%æ%'
   OR "textFr" LIKE '%¯%'
   OR "textFr" LIKE '%Å%';

-- Aperçu des 10 premières
SELECT id, LEFT("textFr", 100) as apercu
FROM question
WHERE "textFr" LIKE '%Æ%'
   OR "textFr" LIKE '%æ%'
   OR "textFr" LIKE '%¯%'
   OR "textFr" LIKE '%Å%'
LIMIT 10;
