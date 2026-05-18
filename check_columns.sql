-- Vérifie les colonnes exactes de user_activity
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_activity'
ORDER BY ordinal_position;
