-- Cherche les questions qui contiennent des marqueurs d'entretien
SELECT id, LEFT("textFr", 80) as apercu
FROM question
WHERE "textFr" ILIKE '%entretien%'
   OR "textFr" ILIKE '%interview%'
   OR "textFr" LIKE '%?%'
LIMIT 20;

-- Compte par type de marqueur
SELECT 
  SUM(CASE WHEN "textFr" ILIKE '%entretien%' THEN 1 ELSE 0 END) as contient_entretien,
  SUM(CASE WHEN "textFr" ILIKE '%interview%' THEN 1 ELSE 0 END) as contient_interview,
  COUNT(*) as total
FROM question;
