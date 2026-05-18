-- Fixe l'encodage pour cette session
SET client_encoding = 'UTF8';

-- Compte les questions qui mentionnent "entretien"
SELECT COUNT(*) as questions_entretien
FROM question
WHERE "textFr" ILIKE '%entretien%';

-- Les tagger toutes comme isInterviewQuestion
UPDATE question
SET "isInterviewQuestion" = true
WHERE "textFr" ILIKE '%entretien%';

-- Confirmation
SELECT COUNT(*) as tagged
FROM question
WHERE "isInterviewQuestion" = true;
