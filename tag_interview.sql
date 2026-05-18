UPDATE question SET "isInterviewQuestion" = true WHERE "textFr" LIKE '%❓%';
SELECT COUNT(*) as interview_questions FROM question WHERE "isInterviewQuestion" = true;
SELECT COUNT(*) as total_questions FROM question;
