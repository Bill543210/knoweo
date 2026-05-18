-- Cherche les questions qui mentionnent explicitement "entretien M&A"
SELECT id, LEFT("textFr", 120) as apercu
FROM question
WHERE "textFr" ILIKE '%question d''entretien%'
   OR "textFr" ILIKE '%senior%'
   OR "textFr" ILIKE '%junior%'
LIMIT 20;

-- Montre les 5 premières questions pour voir le format exact
SELECT id, LEFT("textFr", 100) as apercu
FROM question
ORDER BY "createdAt" DESC
LIMIT 10;
