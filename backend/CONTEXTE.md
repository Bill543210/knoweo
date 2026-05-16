# Knoweo — Contexte du projet

## Stack technique
- Frontend : React TypeScript sur localhost:3000
- Backend : NestJS sur localhost:3001
- Base de données : PostgreSQL (password: $Language1, db: knoweo)
- Dossier projet : C:\Users\HP\OneDrive\Bill docs\Knoweo\Application

## Ce qui est déjà fait
- Authentification complète (inscription, connexion, JWT, Google/LinkedIn OAuth prévu)
- Page profil complet avec photo drag&drop, autocomplete écoles/entreprises, téléphone
- Page profil public style LinkedIn
- Dashboard avec vraies stats depuis la base de données
- Navigation hamburger avec recherche utilisateurs en temps réel
- Mode Infini fonctionnel (Learn.tsx) avec algorithme adaptatif
- 8 domaines en base de données (M&A, Comptabilité, PE, etc.)
- ~300 questions M&A en base (niveaux 1, 2, 3)
- Script seed_questions.js à la racine pour insérer les questions

## Architecture backend (NestJS)
- users/ : entité User, service, controller
- auth/ : JWT, inscription, connexion
- domains/ : entité Domain, 8 domaines seedés
- questions/ : entité Question, service avec algo adaptatif
- user-progress/ : stats utilisateur, XP, streaks
- schools/ : autocomplete écoles françaises
- companies/ : autocomplete entreprises
- search/ : recherche utilisateurs

## Architecture frontend (React)
- pages/Dashboard.tsx : tableau de bord avec stats réelles
- pages/Learn.tsx : mode infini fonctionnel
- pages/Profile.tsx : profil personnel éditable
- pages/PublicProfile.tsx : profil public style LinkedIn
- pages/Login.tsx et Register.tsx : authentification
- components/Navigation.tsx : menu hamburger + recherche
- components/AutocompleteInput.tsx : autocomplete réutilisable
- context/AuthContext.tsx : gestion de l'authentification
- services/api.ts : appels API avec token JWT
- styles.ts : couleurs et design system

## Prochaine étape prioritaire
Continuer à générer des questions dans seed_questions.js.
On vise 3000 questions par domaine (1000 par niveau).
Actuellement : ~300 questions M&A uniquement.
Le script seed_questions.js est à la racine du projet.

## Format du script seed_questions.js
Le fichier contient un tableau questions[] avec ce format :
{
  domainId: domainMap['ma'], // ou 'accounting', 'private-equity', etc.
  level: 1, // 1=débutant, 2=intermédiaire, 3=avancé
  textFr: "Question en français",
  textEn: "Question in English",
  propositionsFr: [
    { text: "Réponse 1", correct: true },
    { text: "Réponse 2", correct: false },
    { text: "Réponse 3", correct: false },
    { text: "Réponse 4", correct: false }
  ],
  propositionsEn: [...],
  explanationFr: "Explication simple avec image mentale et exemple concret",
  explanationEn: "Simple explanation with mental image and concrete example"
}

## Règles pour les questions
- Débutant : accessible à quelqu'un qui n'a jamais fait de finance
- Intermédiaire : quelqu'un avec une licence ou en entreprise
- Avancé : praticien, étudiant master finance, banquier
- Explications : simples, imagées, exemple du quotidien obligatoire
- Jamais de calcul demandé, juste les mécanismes et définitions
- 4 propositions dont exactement 1 correcte
- Distracteurs plausibles (pas absurdes)

## IDs des domaines en base
Ces IDs sont dans PostgreSQL, table domain :
- M&A (slug: ma) 
- Comptabilité (slug: accounting)
- Private Equity (slug: private-equity)
- Financement Structuré (slug: structured-finance)
- Project Finance (slug: project-finance)
- Marchés Financiers (slug: capital-markets)
- IBD (slug: ibd)
- Gestion d'Actifs (slug: asset-management)