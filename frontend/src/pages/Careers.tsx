import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  ink:     '#0F1923',
  inkSoft: '#3D4F5C',
  inkMute: '#8899A6',
  cream:   '#FAFAF8',
  paper:   '#F2F1EE',
  border:  '#E4E2DC',
  gold:    '#F5A623',
  violet:  '#5B5BD6',
  mint:    '#17B890',
  rose:    '#E8445A',
  white:   '#FFFFFF',
};

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface CareerLevel {
  title:         string;
  years:         string;
  salary?:       string;   // undefined = pas de donnée fiable France
  salarySource?: string;
  tasks:         string[];
}

interface CareerDomain {
  id:           string;
  icon:         string;
  name:         string;
  color:        string;
  tagline:      string;
  description:  string;
  active:       boolean;
  skills:       string[];
  knoweoCovers: string[];
  levels:       CareerLevel[];
  formations:   { type: string; examples: string[] }[];
  employers:    string[];
  outlook:      string;
}

// ── DONNÉES ───────────────────────────────────────────────────────────────────
// Salaires : uniquement données fiables France.
// Sources utilisées quand disponibles :
//   - Robert Half Finance & Comptabilité France 2024
//   - Michael Page Finance France Salary Guide 2024
//   - APEC Références Salaires 2024
//   - Heidrick & Struggles European Banking Survey 2023

interface Category {
  id:       string;
  icon:     string;
  name:     string;
  color:    string;
  active:   boolean;
  tagline:  string;
}

const CATEGORIES: Category[] = [
  { id: 'finance',     icon: '🏦', name: 'Finance',           color: T.violet, active: true,  tagline: '8 métiers · 620+ questions disponibles' },
  { id: 'economie',    icon: '🌍', name: 'Économie',          color: T.mint,   active: false, tagline: 'Micro, macro, comportementale — bientôt' },
  { id: 'data',        icon: '🤖', name: 'Data & IA',         color: '#0EA5E9', active: false, tagline: 'Data science, ML, engineering — bientôt' },
  { id: 'strategie',   icon: '♟️', name: 'Stratégie',         color: T.gold,   active: false, tagline: 'Consulting, business strategy — bientôt' },
  { id: 'droit',       icon: '⚖️', name: 'Droit',             color: T.rose,   active: false, tagline: 'Droit des affaires, fiscal, social — bientôt' },
  { id: 'marketing',   icon: '📣', name: 'Marketing',         color: '#EC4899', active: false, tagline: 'Digital, brand, growth — bientôt' },
  { id: 'management',  icon: '🏛️', name: 'Management',        color: '#10B981', active: false, tagline: 'Leadership, RH, gestion de projet — bientôt' },
];

const CAREERS: CareerDomain[] = [

  // ── M&A ────────────────────────────────────────────────────────────────────
  {
    id: 'ma',
    icon: '🤝',
    name: 'Fusions & Acquisitions (M&A)',
    color: T.violet,
    tagline: 'Conseiller les entreprises dans leurs opérations de croissance externe',
    description: 'Le M&A regroupe les professionnels qui accompagnent entreprises et fonds dans leurs acquisitions, cessions, fusions et restructurations. C\'est l\'un des métiers les plus exigeants et les mieux rémunérés de la finance de marché.',
    active: true,
    skills: ['Modélisation financière', 'Valorisation DCF', 'Analyse de comparables', 'Due diligence', 'Négociation', 'Droit des affaires'],
    knoweoCovers: ['Processus M&A', 'Valorisation & WACC', 'Financement LBO', 'Aspects juridiques (MAC, GAP, SPA)', 'Questions typiques d\'entretien M&A'],
    levels: [
      {
        title: 'Analyste M&A',
        years: '0 – 2 ans',
        salary: '55 000 – 85 000 €',
        salarySource: 'Robert Half Finance France 2024',
        tasks: ['Modélisation financière (DCF, LBO, comps)', 'Préparation de pitchbooks', 'Recherches sectorielles', 'Due diligence documentaire'],
      },
      {
        title: 'Associate M&A',
        years: '2 – 5 ans',
        salary: '85 000 – 140 000 €',
        salarySource: 'Michael Page Finance France 2024',
        tasks: ['Pilotage des modèles financiers', 'Gestion des datarooms', 'Coordination due diligence', 'Relation directe avec les clients'],
      },
      {
        title: 'Vice-President (VP)',
        years: '5 – 8 ans',
        salary: '140 000 – 220 000 €',
        salarySource: 'Michael Page Finance France 2024',
        tasks: ['Exécution des transactions', 'Management des équipes juniors', 'Structuration des deals', 'Présentation aux comités d\'investissement'],
      },
      {
        title: 'Director / Executive Director',
        years: '8 – 12 ans',
        salary: '220 000 – 380 000 €',
        salarySource: 'Heidrick & Struggles European Banking 2023',
        tasks: ['Origination de mandats', 'Relation directe C-suite', 'Supervision des exécutions', 'Développement commercial'],
      },
      {
        title: 'Managing Director (MD)',
        years: '12+ ans',
        salary: '380 000 € et plus',
        salarySource: 'Heidrick & Struggles European Banking 2023',
        tasks: ['Leadership business développement', 'P&L du département', 'Relation institutionnelle', 'Stratégie de la banque'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 minimum', 'Master en Finance, Gestion ou Droit des affaires', 'Double compétence Finance + Droit appréciée'] },
      { type: 'Compétences académiques clés', examples: ['Modélisation financière (Excel avancé)', 'Comptabilité & analyse financière', 'Droit des sociétés et des contrats', 'Macroéconomie & marchés financiers'] },
      { type: 'Certifications valorisées', examples: ['CFA (Chartered Financial Analyst)', 'Certification AMF', 'Maîtrise de l\'anglais financier (C1/C2)'] },
    ],
    employers: ['BNP Paribas CIB', 'Société Générale CIB', 'Lazard', 'Rothschild & Co', 'JP Morgan Paris', 'Goldman Sachs Paris', 'Messier Maris', 'Alantra', 'Lincoln International'],
    outlook: 'Marché compétitif mais stable. La consolidation industrielle dans l\'énergie, la tech et la santé maintient une forte demande, aussi bien en boutiques qu\'en bulge bracket.',
  },

  // ── COMPTABILITÉ ───────────────────────────────────────────────────────────
  {
    id: 'accounting',
    icon: '📊',
    name: 'Comptabilité & Analyse Financière',
    color: T.mint,
    tagline: 'Comprendre, analyser et piloter la performance financière des entreprises',
    description: 'La comptabilité et l\'analyse financière sont le socle de toute carrière en finance. Ces métiers couvrent le contrôle de gestion, l\'analyse crédit, l\'audit et la direction financière, dans des entreprises de toutes tailles.',
    active: true,
    skills: ['Normes IFRS / PCG', 'Analyse des états financiers', 'Modélisation Excel', 'Contrôle budgétaire', 'Consolidation', 'Audit'],
    knoweoCovers: ['Bilan & compte de résultat', 'Ratios financiers (ROE, ROCE)', 'BFR, FRNG & trésorerie', 'Consolidation & normes IFRS', 'Goodwill, provisions & audit'],
    levels: [
      {
        title: 'Analyste Financier Junior',
        years: '0 – 2 ans',
        salary: '30 000 – 42 000 €',
        salarySource: 'APEC Références Salaires 2024',
        tasks: ['Reporting mensuel', 'Analyse des écarts budgétaires', 'Consolidation des données', 'Préparation des clôtures trimestrielles'],
      },
      {
        title: 'Contrôleur de Gestion',
        years: '2 – 6 ans',
        salary: '42 000 – 65 000 €',
        salarySource: 'Robert Half Finance France 2024',
        tasks: ['Pilotage du budget', 'Analyse de rentabilité par BU', 'Construction des tableaux de bord direction', 'Prévisions financières rolling'],
      },
      {
        title: 'Responsable Financier / DAF Adjoint',
        years: '6 – 12 ans',
        salary: '65 000 – 100 000 €',
        salarySource: 'Michael Page Finance France 2024',
        tasks: ['Supervision de l\'équipe finance', 'Relation commissaires aux comptes', 'Structuration du reporting groupe', 'Accompagnement stratégique de la direction'],
      },
      {
        title: 'Directeur Administratif et Financier (DAF)',
        years: '12+ ans',
        salary: '90 000 – 180 000 €',
        salarySource: 'Robert Half Finance France 2024',
        tasks: ['Stratégie financière & cash management', 'Levées de fonds et relations bancaires', 'Relations investisseurs', 'Gouvernance, compliance et fiscalité'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+3 à Bac+5', 'Licence ou Master en Comptabilité, Finance ou Contrôle de gestion', 'BTS Comptabilité + expérience comme point d\'entrée possible'] },
      { type: 'Compétences académiques clés', examples: ['Maîtrise des normes IFRS et PCG', 'Excel & outils ERP (SAP, Oracle)', 'Analyse financière & consolidation', 'Fiscalité des entreprises'] },
      { type: 'Certifications valorisées', examples: ['DSCG (Diplôme Supérieur de Comptabilité et Gestion)', 'Expert-Comptable (DEC — accessible après DSCG)', 'CFA niveau 1'] },
    ],
    employers: ['Grands groupes CAC 40', 'Cabinets Big Four (Deloitte, EY, KPMG, PwC)', 'ETI et PME', 'Cabinets d\'expertise comptable', 'Banques & assurances'],
    outlook: 'Métier en tension permanente. La transformation digitale (ERP, IA) fait évoluer le rôle vers plus d\'analyse stratégique et moins d\'opérationnel — ce qui valorise les profils analytiques et les double compétences finance-tech.',
  },

  // ── PRIVATE EQUITY ─────────────────────────────────────────────────────────
  {
    id: 'pe',
    icon: '💼',
    name: 'Private Equity',
    color: T.gold,
    tagline: 'Investir dans des entreprises non cotées et créer de la valeur sur le long terme',
    description: 'Le Private Equity consiste à prendre des participations dans des entreprises non cotées, à les développer pendant 4 à 7 ans, puis à les céder avec une plus-value. C\'est l\'un des secteurs les plus sélectifs de la finance, avec une rémunération parmi les plus élevées.',
    active: false,
    skills: ['Modélisation LBO', 'Analyse stratégique', 'Due diligence opérationnelle', 'Valorisation', 'Gestion de portefeuille', 'Levée de fonds (LP/GP)'],
    knoweoCovers: ['Structure LBO & waterfall', 'Création de valeur & TRI', 'Carried interest & J-curve', 'Stratégies de sortie (IPO, secondary, trade sale)', 'Gestion de portefeuille'],
    levels: [
      {
        title: 'Analyste PE',
        years: '0 – 2 ans',
        // Pas de donnée fiable France publiée — très variable selon taille du fonds
        tasks: ['Screening de cibles', 'Modélisation LBO', 'Due diligence sectorielle', 'Rédaction des mémos d\'investissement'],
      },
      {
        title: 'Associate PE',
        years: '2 – 5 ans',
        tasks: ['Pilotage des transactions', 'Suivi du portefeuille', 'Relations avec le management des participations', 'Reporting LP'],
      },
      {
        title: 'Principal / VP',
        years: '5 – 8 ans',
        tasks: ['Origination de cibles', 'Structuration des opérations', 'Comité d\'investissement', 'Gestion opérationnelle des participations'],
      },
      {
        title: 'Partner / Managing Partner',
        years: '8+ ans',
        tasks: ['Levée de fonds (fundraising)', 'Relations investisseurs (LP)', 'Stratégie du fonds', 'Représentation aux Conseils d\'Administration'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 obligatoire', 'Master en Finance d\'entreprise ou Corporate Finance'] },
      { type: 'Parcours types d\'accès', examples: ['2 à 3 ans en M&A ou conseil stratégique avant le premier poste PE', 'Le PE se rejoint rarement en sortie d\'études — l\'expérience préalable est quasi-obligatoire'] },
      { type: 'Compétences académiques clés', examples: ['Modélisation LBO avancée', 'Analyse stratégique & sectorielle', 'Comptabilité avancée & retraitements', 'Anglais courant obligatoire'] },
      { type: 'Certifications valorisées', examples: ['CFA', 'CAIA (Chartered Alternative Investment Analyst)'] },
    ],
    employers: ['Ardian', 'PAI Partners', 'Eurazeo', 'Apax Partners', 'Tikehau Capital', 'KKR Paris', 'Blackstone Paris', 'IK Partners'],
    outlook: 'Secteur très sélectif mais en croissance. Les fonds de dette privée, infrastructure et impact créent de nouveaux profils de recrutement au-delà du LBO classique.',
  },

  // ── MARCHÉS FINANCIERS ─────────────────────────────────────────────────────
  {
    id: 'capital-markets',
    icon: '📈',
    name: 'Marchés Financiers',
    color: T.rose,
    tagline: 'Opérer sur les marchés actions, taux, dérivés et change à l\'échelle mondiale',
    description: 'Les marchés financiers regroupent le trading, la structuration et la vente de produits financiers (actions, obligations, dérivés, change). Ces métiers exigent réactivité, culture du risque et maîtrise macro solide. Les profils quantitatifs sont de plus en plus recherchés.',
    active: false,
    skills: ['Analyse technique & fondamentale', 'Produits dérivés (Greeks, pricing)', 'Gestion du risque de marché', 'Macro-économie', 'Python / C++ (profils quants)', 'Réglementation MIF II'],
    knoweoCovers: ['Actions & IPO', 'Obligations, duration & convexité', 'Options, futures & swaps', 'Change & risque macro', 'Market making & microstructure'],
    levels: [
      {
        title: 'Analyste Sales / Trading',
        years: '0 – 2 ans',
        tasks: ['Support desk', 'Analyse de marché intraday', 'Exécution d\'ordres', 'Reporting des positions'],
      },
      {
        title: 'Trader / Sales Junior',
        years: '2 – 5 ans',
        tasks: ['Tenue de livre (book)', 'Relation clients institutionnels', 'Structuration de produits', 'Risk management quotidien'],
      },
      {
        title: 'Senior Trader / Structureur VP',
        years: '5 – 10 ans',
        tasks: ['Gestion du P&L du desk', 'Innovation produit', 'Formation des juniors', 'Relations prime brokerage'],
      },
      {
        title: 'Head of Trading / MD Sales',
        years: '10+ ans',
        tasks: ['P&L global desk', 'Stratégie produit', 'Relation régulateurs (AMF, ACPR)', 'Leadership et recrutement'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 en Finance, Mathématiques appliquées ou Informatique', 'Les profils quants viennent souvent de masters de maths pures ou d\'informatique'] },
      { type: 'Compétences académiques clés', examples: ['Probabilités & statistiques avancées', 'Pricing de produits dérivés (Black-Scholes, modèles de taux)', 'Programmation Python ou C++', 'Macroéconomie & politique monétaire'] },
      { type: 'Certifications valorisées', examples: ['CFA', 'FRM (Financial Risk Manager)', 'Certification AMF (obligatoire pour exercer en France)'] },
    ],
    employers: ['BNP Paribas CIB', 'Société Générale', 'Natixis', 'Crédit Agricole CIB', 'JP Morgan Paris', 'Goldman Sachs Paris', 'Citadel', 'Jane Street'],
    outlook: 'Automatisation croissante du trading algorithmique. Les profils quants (maths, info, machine learning) sont très valorisés. Le sales institutionnel reste un métier humain résistant à l\'automatisation.',
  },

  // ── PROJECT FINANCE ────────────────────────────────────────────────────────
  {
    id: 'project-finance',
    icon: '🏗️',
    name: 'Project Finance',
    color: '#0EA5E9',
    tagline: 'Financer de grandes infrastructures via des structures dédiées sans recours',
    description: 'Le Project Finance consiste à financer de grands projets (centrales électriques, autoroutes, parcs éoliens, hôpitaux PPP) via des véhicules dédiés (SPV), sans recours aux actionnaires. C\'est un métier de niche, très technique, très international et en forte croissance avec la transition énergétique.',
    active: false,
    skills: ['Modélisation de cash flows long terme', 'Analyse des risques (construction, exploitation, marché)', 'Droit des contrats (EPC, O&M, PPA)', 'Financement bancaire syndiqué', 'Secteurs énergie & infrastructure'],
    knoweoCovers: ['Structure SPV & financement sans recours', 'Analyse des risques projet', 'Secteurs (énergie renouvelable, PPP)', 'Contrats clés (EPC, O&M, PPA, concession)'],
    levels: [
      {
        title: 'Analyste Project Finance',
        years: '0 – 3 ans',
        tasks: ['Modélisation financière des projets', 'Analyse des risques et due diligence technique', 'Rédaction des mémos de crédit', 'Coordination avec les conseils juridiques'],
      },
      {
        title: 'Chargé d\'affaires / Associate',
        years: '3 – 7 ans',
        tasks: ['Structuration des financements', 'Négociation avec les banques et les sponsors', 'Coordination juridique et technique', 'Closing des financements'],
      },
      {
        title: 'Directeur Project Finance',
        years: '7+ ans',
        tasks: ['Origination des mandats', 'Relation sponsors et institutionnels', 'Stratégie sectorielle', 'Management de l\'équipe'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 en Finance, Ingénierie ou Droit', 'Double compétence technique + finance très valorisée'] },
      { type: 'Compétences académiques clés', examples: ['Modélisation financière de projets long terme', 'Analyse des risques (construction, exploitation, marché)', 'Droit des contrats et des concessions', 'Connaissance des secteurs énergie & infrastructure'] },
      { type: 'Certifications valorisées', examples: ['CFA', 'PFQ (Project Finance Qualification — ICMA)', 'Anglais courant (projets souvent internationaux)'] },
    ],
    employers: ['Société Générale', 'BNP Paribas', 'Natixis', 'Crédit Agricole CIB', 'Banque des Territoires (CDC)', 'EDF Renewables', 'Engie', 'Vinci Concessions'],
    outlook: 'Forte croissance portée par la transition énergétique (solaire, éolien offshore, hydrogène vert) et le plan de rénovation des infrastructures publiques. Les profils finançant les projets énergétiques sont très recherchés.',
  },

  // ── FINANCEMENT STRUCTURÉ ──────────────────────────────────────────────────
  {
    id: 'structured-finance',
    icon: '🔗',
    name: 'Financement Structuré',
    color: '#EC4899',
    tagline: 'Concevoir des instruments financiers complexes adossés à des actifs',
    description: 'Le financement structuré regroupe la titrisation, les CLO, les financements leveragés et les instruments hybrides. C\'est un domaine très technique, à l\'intersection de la finance quantitative, du droit et de la gestion du risque de crédit.',
    active: false,
    skills: ['Titrisation (ABS, MBS, CLO)', 'Modélisation de cash flows', 'Notation crédit (S&P, Moody\'s, Fitch)', 'Instruments hybrides (OCA, OCEANE)', 'Droit des sûretés', 'Financement leveragé'],
    knoweoCovers: ['Titrisation ABS / MBS / CDO', 'Financement leveragé & CLO', 'Instruments hybrides (OCA, obligations convertibles)', 'Analyse des risques crédit & tranching'],
    levels: [
      {
        title: 'Analyste Structuration',
        years: '0 – 3 ans',
        tasks: ['Modélisation des cash flows du collatéral', 'Analyse du portefeuille d\'actifs', 'Rédaction des term sheets', 'Relation avec les agences de notation'],
      },
      {
        title: 'Associate / VP Structuration',
        years: '3 – 7 ans',
        tasks: ['Structuration des transactions de bout en bout', 'Closing et documentation juridique', 'Innovation produit', 'Relation investisseurs et arrangeurs'],
      },
      {
        title: 'Director / MD',
        years: '7+ ans',
        tasks: ['Origination des mandats', 'P&L du desk', 'Lobbying réglementaire (Bâle IV, Solvabilité II)', 'Leadership et recrutement'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 en Finance quantitative, Mathématiques ou Droit financier', 'Un des domaines les plus techniques de la finance — le niveau académique est élevé'] },
      { type: 'Compétences académiques clés', examples: ['Mathématiques financières & modélisation stochastique', 'Droit des sûretés et des contrats financiers', 'Comptabilité avancée & normes prudentielles (Bâle IV)', 'Analyse du risque de crédit'] },
      { type: 'Certifications valorisées', examples: ['CFA', 'FRM (Financial Risk Manager)', 'Certification AMF'] },
    ],
    employers: ['BNP Paribas', 'Société Générale', 'Crédit Agricole CIB', 'Natixis', 'AXA Investment Managers', 'Amundi', 'BlackRock Paris'],
    outlook: 'Domaine en transformation depuis 2008 mais en croissance via la dette privée, les CLO ESG et la titrisation verte. La réglementation européenne crée des besoins en profils capables de naviguer Bâle IV et Solvabilité II.',
  },

  // ── IBD ────────────────────────────────────────────────────────────────────
  {
    id: 'ibd',
    icon: '🏛️',
    name: 'Banque d\'Investissement (IBD)',
    color: '#0F2044',
    tagline: 'Lever des capitaux et conseiller les grandes entreprises sur leur stratégie financière',
    description: 'L\'IBD regroupe les activités ECM (introductions en bourse, augmentations de capital) et DCM (émissions obligataires). Les banquiers IBD accompagnent les grandes entreprises dans leurs opérations de marché et leur stratégie de financement à long terme.',
    active: false,
    skills: ['Marchés actions & obligations', 'Valorisation (IPO pricing)', 'Structuration d\'émissions', 'Roadshows & marketing investor', 'Rédaction de prospectus (AMF)', 'Relation émetteurs'],
    knoweoCovers: ['ECM : IPO, augmentations de capital, follow-on', 'DCM : émissions obligataires, programmes EMTN', 'Advisory M&A côté banque', 'Processus bancaire : origination, syndication, closing'],
    levels: [
      {
        title: 'Analyste IBD',
        years: '0 – 2 ans',
        salary: '60 000 – 85 000 €',
        salarySource: 'Robert Half Finance France 2024',
        tasks: ['Modélisation financière', 'Préparation de pitchbooks', 'Recherches sur les émetteurs', 'Support due diligence'],
      },
      {
        title: 'Associate IBD',
        years: '2 – 5 ans',
        salary: '90 000 – 145 000 €',
        salarySource: 'Michael Page Finance France 2024',
        tasks: ['Exécution des roadshows', 'Rédaction et dépôt des prospectus AMF', 'Coordination du syndicat bancaire', 'Relation investisseurs institutionnels'],
      },
      {
        title: 'VP / Director IBD',
        years: '5 – 10 ans',
        salary: '145 000 – 260 000 €',
        salarySource: 'Heidrick & Struggles European Banking 2023',
        tasks: ['Origination des mandats', 'Passage en comité de crédit', 'Management de la relation client', 'Leadership des équipes projet'],
      },
      {
        title: 'MD IBD',
        years: '10+ ans',
        salary: '260 000 € et plus',
        salarySource: 'Heidrick & Struggles European Banking 2023',
        tasks: ['P&L du département', 'Relations C-suite des émetteurs', 'Stratégie produit ECM/DCM', 'Recrutement et rétention des seniors'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 en Finance, Économie ou Droit-Finance', 'Double compétence Droit + Finance de plus en plus recherchée'] },
      { type: 'Compétences académiques clés', examples: ['Marchés actions & obligations', 'Valorisation d\'entreprises (IPO pricing, comps)', 'Rédaction de documentation réglementaire (prospectus AMF)', 'Anglais financier courant'] },
      { type: 'Certifications valorisées', examples: ['CFA', 'Certification AMF (obligatoire pour exercer en France)', 'CISI (pour les profils orientés UK/international)'] },
    ],
    employers: ['Goldman Sachs Paris', 'Morgan Stanley Paris', 'JP Morgan Paris', 'Deutsche Bank Paris', 'Citi Paris', 'BNP Paribas CIB', 'Rothschild & Co', 'Lazard'],
    outlook: 'Très cyclique selon les marchés actions et taux. Fort rebond ECM attendu avec la remontée des valorisations. Forte demande DCM avec l\'explosion des green bonds et des émissions souveraines européennes.',
  },

  // ── GESTION D'ACTIFS ───────────────────────────────────────────────────────
  {
    id: 'asset-management',
    icon: '📉',
    name: 'Gestion d\'Actifs',
    color: '#10B981',
    tagline: 'Gérer des portefeuilles d\'investissement pour le compte d\'institutionnels ou de particuliers',
    description: 'La gestion d\'actifs consiste à investir et gérer des capitaux pour le compte de tiers — fonds de pension, assureurs, family offices, particuliers. C\'est un métier alliant rigueur analytique, vision macro et gestion rigoureuse du risque.',
    active: false,
    skills: ['Allocation d\'actifs', 'Analyse financière buy-side', 'Gestion du risque (VaR, stress tests)', 'Investissement ESG & taxonomie EU', 'Reporting & attribution de performance', 'Relations clients institutionnels'],
    knoweoCovers: ['Construction de portefeuille & optimisation', 'Types de fonds (OPCVM, ETF, hedge funds)', 'Alpha, beta, ratio de Sharpe & tracking error', 'Investissement ESG & ISR', 'VaR & stress tests'],
    levels: [
      {
        title: 'Analyste Buy-Side',
        years: '0 – 3 ans',
        tasks: ['Analyse financière des émetteurs', 'Modélisation et valorisation', 'Reporting de performance', 'Veille sectorielle et macroéconomique'],
      },
      {
        title: 'Gérant Junior / Analyste Senior',
        years: '3 – 6 ans',
        tasks: ['Gestion d\'un sous-portefeuille délégué', 'Présentation au CIO / comité d\'investissement', 'Due diligence fonds externes', 'Relations gérants tiers'],
      },
      {
        title: 'Gérant de Portefeuille',
        years: '6 – 12 ans',
        tasks: ['P&L et gestion autonome du fonds', 'Décisions d\'allocation stratégique et tactique', 'Relations LP et clients institutionnels', 'Innovation de produit'],
      },
      {
        title: 'Directeur de Gestion / CIO',
        years: '12+ ans',
        tasks: ['Stratégie d\'investissement globale', 'Développement commercial institutionnel', 'Relations avec les régulateurs (AMF, ESMA)', 'Leadership et recrutement de l\'équipe'],
      },
    ],
    formations: [
      { type: 'Niveau d\'études recommandé', examples: ['Bac+5 en Finance, Économie ou Mathématiques appliquées', 'Les profils ESG viennent aussi de formations en développement durable ou sciences politiques'] },
      { type: 'Compétences académiques clés', examples: ['Théorie du portefeuille & allocation d\'actifs', 'Analyse financière (actions, obligations, fonds)', 'Mesure de la performance & attribution', 'Investissement ESG & taxonomie européenne'] },
      { type: 'Certifications valorisées', examples: ['CFA (standard du secteur — quasi-obligatoire pour progresser)', 'CIIA (Certified International Investment Analyst)', 'Certification AMF (obligatoire en France)', 'ESG Analyst Certificate — CFA Institute'] },
    ],
    employers: ['Amundi (1er gestionnaire européen)', 'AXA Investment Managers', 'Natixis Investment Managers', 'BNP Paribas Asset Management', 'BlackRock Paris', 'Carmignac', 'Comgest', 'La Financière de l\'Échiquier'],
    outlook: 'Consolidation du secteur mais forte demande pour les profils ESG, quantitatifs et alternatifs. La gestion passive (ETF) compresse les marges sur les fonds actifs, mais crée des besoins en smart beta et en gestion thématique.',
  },
];

// ── ORIENTATION ───────────────────────────────────────────────────────────────

const ORIENTATION_QUESTIONS = [
  {
    id: 'motivation',
    question: 'Ce qui te motive le plus dans la finance, c\'est :',
    options: [
      { label: 'Conseiller des entreprises dans leurs décisions stratégiques',       tags: ['ma', 'ibd'] },
      { label: 'Analyser les chiffres et comprendre la performance d\'une entreprise', tags: ['accounting', 'asset-management'] },
      { label: 'Investir et créer de la valeur sur le long terme',                   tags: ['pe', 'asset-management'] },
      { label: 'Opérer sur les marchés, gérer des positions en temps réel',          tags: ['capital-markets', 'structured-finance'] },
      { label: 'Financer de grands projets d\'infrastructure ou d\'énergie',          tags: ['project-finance', 'structured-finance'] },
    ],
  },
  {
    id: 'environment',
    question: 'Ton environnement de travail idéal :',
    options: [
      { label: 'Rythme intense, deals à cycle court, adrénaline permanente',            tags: ['ma', 'ibd', 'capital-markets'] },
      { label: 'Projets longs, vision industrielle, accompagnement des équipes',         tags: ['pe', 'project-finance'] },
      { label: 'Rigueur analytique, reporting régulier, pilotage de la performance',     tags: ['accounting', 'asset-management'] },
      { label: 'Innovation financière, structuration de produits complexes',             tags: ['structured-finance', 'capital-markets'] },
    ],
  },
  {
    id: 'strength',
    question: 'Ta plus grande force professionnelle :',
    options: [
      { label: 'La relation client et la capacité à convaincre',                         tags: ['ma', 'ibd', 'asset-management'] },
      { label: 'La rigueur quantitative et la modélisation financière',                   tags: ['capital-markets', 'structured-finance', 'pe'] },
      { label: 'La vision stratégique et l\'analyse sectorielle',                         tags: ['pe', 'ma', 'asset-management'] },
      { label: 'L\'organisation, la rigueur process et la fiabilité',                     tags: ['accounting', 'project-finance'] },
    ],
  },
  {
    id: 'horizon',
    question: 'Ton horizon d\'investissement / de deal préféré :',
    options: [
      { label: 'Court terme — quelques jours à quelques semaines',                        tags: ['capital-markets'] },
      { label: 'Moyen terme — 6 mois à 2 ans (durée d\'une transaction)',                 tags: ['ma', 'ibd', 'structured-finance'] },
      { label: 'Long terme — 3 à 10 ans (cycle d\'un fonds ou d\'un projet)',             tags: ['pe', 'project-finance', 'asset-management'] },
      { label: 'Je préfère la récurrence et la prévisibilité à l\'épisodique',            tags: ['accounting', 'asset-management'] },
    ],
  },
];

// ── HOOK ──────────────────────────────────────────────────────────────────────

const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
};

// ── STYLES ────────────────────────────────────────────────────────────────────

const injectStyles = () => {
  if (document.getElementById('knoweo-careers-styles')) return;
  const style = document.createElement('style');
  style.id = 'knoweo-careers-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    .kc-card  { transition: transform 0.22s ease, box-shadow 0.22s ease; }
    .kc-card:hover  { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(15,25,35,0.1); }
    .kc-option { transition: all 0.2s ease; }
    .kc-option:hover { border-color: ${T.violet} !important; background: ${T.violet}08 !important; }
    .kc-fade { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .kc-fade.visible { opacity: 1; transform: translateY(0); }
    .kc-bar { transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
  `;
  document.head.appendChild(style);
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

const CareersPage = () => {
  const navigate                            = useNavigate();
  const { user }                            = useAuth();
  const [selectedDomain, setSelectedDomain] = useState<CareerDomain | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filter, setFilter]                      = useState<'all' | 'active'>('all');

  const activeCat   = CATEGORIES.find(c => c.id === selectedCategory);
  const displayed   = selectedCategory
    ? CAREERS.filter(c => {
        // Pour l'instant tous les métiers sont Finance
        if (filter === 'active') return c.active;
        return true;
      })
    : [];

  useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{ backgroundColor: T.cream, minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      {user ? <Navigation /> : <PublicNav navigate={navigate} />}

      {/* HEADER */}
      <header style={{ padding: user ? '100px 24px 64px' : '80px 24px 64px', textAlign: 'center', backgroundColor: T.ink, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: T.gold, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: '16px' }}>
            Guide des métiers
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '900', color: T.white, letterSpacing: '-2px', lineHeight: '1.05', marginBottom: '16px' }}>
            Explore les métiers.<br />
            <span style={{ color: T.gold, fontStyle: 'italic' }}>Construis ta carrière.</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.65' }}>
            Parcours de carrière détaillés, salaires sourcés pour la France, formations recommandées. Tout ce qu'il faut savoir avant de choisir ta voie.
          </p>
          {!user && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
              <button onClick={() => navigate('/register')} style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', backgroundColor: T.gold, color: T.ink, fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Créer un compte gratuit
              </button>
              <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Se connecter
              </button>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px' }}>

  {/* ── GRILLE CATÉGORIES ── */}
  <div style={{ marginBottom: '48px' }}>
    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: T.ink, letterSpacing: '-0.5px', margin: '0 0 6px' }}>
      Choisis ta discipline
    </h2>
    <p style={{ fontSize: '14px', color: T.inkMute, margin: '0 0 24px' }}>
      Sélectionne une catégorie pour explorer les métiers associés.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
      {CATEGORIES.map((cat, i) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <div key={cat.id}
            onClick={() => cat.active && setSelectedCategory(isSelected ? null : cat.id)}
            style={{
              padding: '20px',
              borderRadius: '14px',
              border: `2px solid ${isSelected ? cat.color : T.border}`,
              backgroundColor: isSelected ? cat.color + '08' : cat.active ? T.white : T.paper,
              cursor: cat.active ? 'pointer' : 'default',
              opacity: cat.active ? 1 : 0.55,
              transition: 'all 0.2s',
              position: 'relative' as const,
              overflow: 'hidden',
            }}>
            {isSelected && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: cat.color }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '28px' }}>{cat.icon}</span>
              {!cat.active && (
                <span style={{ fontSize: '10px', fontWeight: '700', color: T.inkMute, backgroundColor: T.border, padding: '2px 8px', borderRadius: '100px' }}>
                  Bientôt
                </span>
              )}
              {isSelected && (
                <span style={{ fontSize: '10px', fontWeight: '700', color: cat.color, backgroundColor: cat.color + '15', padding: '2px 8px', borderRadius: '100px' }}>
                  ✓ Sélectionné
                </span>
              )}
            </div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: cat.active ? T.ink : T.inkMute, margin: '0 0 4px' }}>
              {cat.name}
            </p>
            <p style={{ fontSize: '12px', color: T.inkMute, margin: 0, lineHeight: '1.4' }}>
              {cat.tagline}
            </p>
          </div>
        );
      })}
    </div>
  </div>

  {/* ── MÉTIERS (si catégorie sélectionnée) ── */}
  {selectedCategory && activeCat && (
    <div>
      {/* Header section métiers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' as const, gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>{activeCat.icon}</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: T.ink, letterSpacing: '-0.5px', margin: 0 }}>
              Métiers — {activeCat.name}
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: T.inkMute, margin: 0 }}>
            {displayed.length} métier{displayed.length > 1 ? 's' : ''} · clique sur une fiche pour les détails
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: T.paper, padding: '4px', borderRadius: '10px', border: `1px solid ${T.border}` }}>
          {[{ key: 'all', label: 'Tous' }, { key: 'active', label: 'Disponibles' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', backgroundColor: filter === f.key ? T.white : 'transparent', color: filter === f.key ? T.ink : T.inkMute, fontSize: '13px', fontWeight: filter === f.key ? '700' : '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: filter === f.key ? '0 1px 4px rgba(15,25,35,0.1)' : 'none', transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outil orientation — utilisateur connecté */}
      {user && <OrientationSection />}

      {/* Grille métiers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '48px' }}>
        {displayed.map((domain, i) => (
          <DomainCard key={domain.id} domain={domain} index={i} onClick={() => setSelectedDomain(domain)} />
        ))}
      </div>

      {/* Note salaires */}
      <div style={{ padding: '20px 24px', borderRadius: '12px', backgroundColor: T.paper, border: `1px solid ${T.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: '13px', color: T.inkMute, margin: 0, lineHeight: '1.6' }}>
          <strong style={{ color: T.inkSoft }}>À propos des salaires :</strong> les fourchettes affichées concernent le marché français et sont issues de rapports publics datés (Robert Half Finance France 2024, Michael Page Finance France 2024, APEC Références Salaires 2024, Heidrick & Struggles European Banking Survey 2023). Elles incluent fixe et variable et varient selon la taille de l'établissement et la conjoncture. Les métiers sans données publiées fiables pour la France n'affichent pas de fourchette. Informations fournies à titre indicatif uniquement.
        </p>
      </div>
    </div>
  )}

  {/* ── ÉTAT INITIAL — aucune catégorie sélectionnée ── */}
  {!selectedCategory && (
    <div style={{ textAlign: 'center' as const, padding: '48px 24px', borderRadius: '16px', backgroundColor: T.paper, border: `1px dashed ${T.border}` }}>
      <p style={{ fontSize: '32px', margin: '0 0 12px' }}>👆</p>
      <p style={{ fontSize: '16px', fontWeight: '700', color: T.ink, margin: '0 0 8px' }}>
        Sélectionne une discipline ci-dessus
      </p>
      <p style={{ fontSize: '14px', color: T.inkMute, margin: 0 }}>
        Les métiers disponibles s'afficheront ici. Les disciplines grisées arrivent bientôt.
      </p>
    </div>
  )}

</div>

      {/* MODAL */}
      {selectedDomain && (
        <DomainModal domain={selectedDomain} onClose={() => setSelectedDomain(null)} navigate={navigate} user={user} />
      )}
    </div>
  );
};

// ── NAV PUBLIQUE ──────────────────────────────────────────────────────────────

const PublicNav = ({ navigate }: { navigate: (p: string) => void }) => (
  <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '60px', backgroundColor: T.white, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', boxShadow: '0 1px 8px rgba(15,25,35,0.06)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
      <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '900', color: T.gold }}>K</span>
      </div>
      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700', color: T.ink }}>Knoweo</span>
    </div>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={() => navigate('/login')} style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', background: 'none', color: T.inkMute, fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Connexion</button>
      <button onClick={() => navigate('/register')} style={{ padding: '7px 16px', borderRadius: '7px', border: 'none', backgroundColor: T.ink, color: T.white, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Commencer</button>
    </div>
  </nav>
);

// ── CARTE DOMAINE ─────────────────────────────────────────────────────────────

const DomainCard = ({ domain, index, onClick }: { domain: CareerDomain; index: number; onClick: () => void }) => {
  const { ref, inView } = useInView(0.05);
  const hasSalaryData   = domain.levels.some(l => l.salary);
  const minSalary       = hasSalaryData ? domain.levels.find(l => l.salary)?.salary?.split(' – ')[0] : null;
  const maxSalary       = hasSalaryData ? [...domain.levels].reverse().find(l => l.salary)?.salary : null;

  return (
    <div ref={ref} className={`kc-card kc-fade ${inView ? 'visible' : ''}`}
      onClick={onClick}
      style={{ padding: '24px', borderRadius: '14px', border: `1px solid ${T.border}`, backgroundColor: T.white, cursor: 'pointer', transitionDelay: `${(index % 4) * 0.07}s`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: domain.color }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <span style={{ fontSize: '28px' }}>{domain.icon}</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: domain.active ? domain.color : T.inkMute, backgroundColor: domain.active ? domain.color + '12' : T.paper, padding: '3px 10px', borderRadius: '100px' }}>
          {domain.active ? '✓ Disponible' : 'Bientôt'}
        </span>
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: '700', color: T.ink, margin: '0 0 6px', letterSpacing: '-0.3px', lineHeight: '1.3' }}>
        {domain.name}
      </h3>
      <p style={{ fontSize: '13px', color: T.inkMute, margin: '0 0 16px', lineHeight: '1.5' }}>
        {domain.tagline}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {hasSalaryData && minSalary && maxSalary ? (
          <div>
            <p style={{ fontSize: '10px', color: T.inkMute, margin: '0 0 1px', textTransform: 'uppercase' as const, letterSpacing: '0.3px', fontWeight: '600' }}>Fourchette France</p>
            <p style={{ fontSize: '12px', fontWeight: '700', color: T.inkSoft, margin: 0 }}>
              {minSalary} → {maxSalary.replace(' et plus', '+')}
            </p>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: T.inkMute, fontStyle: 'italic' }}>
            {domain.levels.length} niveaux de carrière
          </span>
        )}
        <span style={{ fontSize: '13px', fontWeight: '600', color: domain.color }}>
          Voir →
        </span>
      </div>
    </div>
  );
};

// ── OUTIL ORIENTATION ─────────────────────────────────────────────────────────

const OrientationSection = () => {
  const { ref, inView }       = useInView();
  const [started, setStarted] = useState(false);
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<{ [k: string]: string[] }>({});
  const [result, setResult]   = useState<CareerDomain[] | null>(null);

  const compute = (finalAnswers: { [k: string]: string[] }) => {
    const scores: { [id: string]: number } = {};
    CAREERS.forEach(c => { scores[c.id] = 0; });
    Object.values(finalAnswers).flat().forEach(tag => {
      if (scores[tag] !== undefined) scores[tag] += 1;
    });
    return CAREERS.map(c => ({ ...c, score: scores[c.id] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleAnswer = (qId: string, tags: string[]) => {
    const next = { ...answers, [qId]: tags };
    setAnswers(next);
    if (step < ORIENTATION_QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 200);
    } else {
      setResult(compute(next));
    }
  };

  const reset = () => { setStarted(false); setStep(0); setAnswers({}); setResult(null); };
  const q     = ORIENTATION_QUESTIONS[step];
  const pct   = (step / ORIENTATION_QUESTIONS.length) * 100;

  return (
    <div ref={ref} className={`kc-fade ${inView ? 'visible' : ''}`}
      style={{ marginBottom: '48px', padding: '36px', borderRadius: '20px', backgroundColor: T.ink, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {!started ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: T.gold, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Outil d'orientation</p>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: T.white, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              Quel métier est fait pour toi ?
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>4 questions · moins d'une minute · résultats personnalisés</p>
          </div>
          <button onClick={() => setStarted(true)}
            style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', backgroundColor: T.gold, color: T.ink, fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
            Commencer →
          </button>
        </div>
      ) : result ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: T.gold, letterSpacing: '2px', textTransform: 'uppercase' as const, marginBottom: '6px' }}>Résultats</p>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: T.white, margin: 0, letterSpacing: '-0.5px' }}>Les métiers qui te correspondent</h3>
            </div>
            <button onClick={reset} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
              Recommencer
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {result.map((d, i) => (
              <div key={d.id} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? d.color + '50' : 'rgba(255,255,255,0.1)'}`, position: 'relative' }}>
                {i === 0 && <div style={{ position: 'absolute', top: '-10px', left: '16px', backgroundColor: T.gold, color: T.ink, fontSize: '10px', fontWeight: '800', padding: '2px 10px', borderRadius: '100px' }}>Meilleur match</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: `${i === 0 ? '6px' : '0'} 0 10px` }}>
                  <span style={{ fontSize: '22px' }}>{d.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: T.white, lineHeight: '1.3' }}>{d.name}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 12px', lineHeight: '1.5' }}>{d.tagline}</p>
                <span style={{ fontSize: '11px', color: d.color, fontWeight: '600' }}>
                  {d.active ? '✓ Disponible sur Knoweo' : '⏳ Bientôt disponible'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Question {step + 1} / {ORIENTATION_QUESTIONS.length}</p>
              <p style={{ fontSize: '12px', color: T.gold, fontWeight: '600', margin: 0 }}>{Math.round(pct)}%</p>
            </div>
            <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
              <div className="kc-bar" style={{ height: '100%', width: `${pct}%`, backgroundColor: T.gold, borderRadius: '100px' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '600', color: T.white, margin: '0 0 20px', lineHeight: '1.5' }}>{q.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
            {q.options.map((opt, i) => (
              <button key={i} className="kc-option" onClick={() => handleAnswer(q.id, opt.tags)}
                style={{ padding: '13px 18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)', fontSize: '14px', cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'DM Sans, sans-serif', lineHeight: '1.4' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── MODAL DÉTAIL ──────────────────────────────────────────────────────────────

const DomainModal = ({ domain, onClose, navigate, user }: { domain: CareerDomain; onClose: () => void; navigate: (p: string) => void; user: any }) => {
  const [activeLevel, setActiveLevel] = useState(0);
  const level = domain.levels[activeLevel];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,25,35,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: T.white, borderRadius: '20px', maxWidth: '860px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(15,25,35,0.3)' }}>

        {/* Header sticky */}
        <div style={{ padding: '28px 32px 20px', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, backgroundColor: T.white, zIndex: 10, borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: domain.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: `2px solid ${domain.color}25` }}>
                {domain.icon}
              </div>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: T.ink, margin: '0 0 3px', letterSpacing: '-0.5px' }}>{domain.name}</h2>
                <p style={{ fontSize: '13px', color: T.inkMute, margin: 0 }}>{domain.tagline}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${T.border}`, backgroundColor: T.paper, color: T.inkMute, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column' as const, gap: '28px' }}>

          {/* Description */}
          <p style={{ fontSize: '15px', color: T.inkSoft, lineHeight: '1.7', margin: 0 }}>{domain.description}</p>

          {/* Fil conducteur */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: T.ink, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🗺️ Fil conducteur de carrière
            </h3>

            {/* Sélecteur niveaux */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '16px' }}>
              {domain.levels.map((l, i) => (
                <button key={i} onClick={() => setActiveLevel(i)}
                  style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${activeLevel === i ? domain.color : T.border}`, backgroundColor: activeLevel === i ? domain.color + '10' : 'transparent', color: activeLevel === i ? domain.color : T.inkMute, fontSize: '12px', fontWeight: activeLevel === i ? '700' : '500', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                  {l.title}
                </button>
              ))}
            </div>

            {/* Détail niveau */}
            <div style={{ padding: '22px', borderRadius: '14px', backgroundColor: T.paper, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: level.salary ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: T.inkMute, textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 4px' }}>Expérience requise</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: T.ink, margin: 0 }}>{level.years}</p>
                </div>
                {level.salary && (
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: T.inkMute, textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 4px' }}>Rémunération France</p>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: domain.color, margin: '0 0 3px' }}>{level.salary}</p>
                    <p style={{ fontSize: '10px', color: T.inkMute, margin: 0 }}>📌 Source : {level.salarySource}</p>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: T.inkMute, textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 10px' }}>Responsabilités principales</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                  {level.tasks.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: domain.color, flexShrink: 0, marginTop: '7px' }} />
                      <span style={{ fontSize: '13px', color: T.inkSoft, lineHeight: '1.5' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline barre */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '4px' }}>
              {domain.levels.map((_, i) => (
                <div key={i} onClick={() => setActiveLevel(i)}
                  style={{ flex: 1, height: '4px', borderRadius: '100px', backgroundColor: i <= activeLevel ? domain.color : T.border, transition: 'background 0.3s', cursor: 'pointer' }} />
              ))}
            </div>
          </div>

          {/* Compétences */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: T.ink, margin: '0 0 12px' }}>💡 Compétences clés</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '7px' }}>
                {domain.skills.map((s, i) => (
                  <span key={i} style={{ fontSize: '12px', color: T.inkSoft, backgroundColor: T.paper, border: `1px solid ${T.border}`, padding: '4px 10px', borderRadius: '100px' }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: T.ink, margin: '0 0 12px' }}>✅ Ce que Knoweo couvre</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '7px' }}>
                {domain.knoweoCovers.map((s, i) => (
                  <span key={i} style={{ fontSize: '12px', fontWeight: '600', color: domain.color, backgroundColor: domain.color + '10', border: `1px solid ${domain.color}25`, padding: '4px 10px', borderRadius: '100px' }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Formations */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: T.ink, margin: '0 0 14px' }}>🎓 Formations représentatives</h3>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
              {domain.formations.map((f, i) => (
                <div key={i} style={{ padding: '14px 18px', borderRadius: '10px', backgroundColor: T.paper, border: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: T.inkMute, textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 8px' }}>{f.type}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '7px' }}>
                    {f.examples.map((e, j) => (
                      <span key={j} style={{ fontSize: '12px', color: T.inkSoft, backgroundColor: T.white, border: `1px solid ${T.border}`, padding: '3px 10px', borderRadius: '100px' }}>{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employeurs */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: T.ink, margin: '0 0 12px' }}>🏢 Exemples d'employeurs</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '7px' }}>
              {domain.employers.map((e, i) => (
                <span key={i} style={{ fontSize: '12px', color: T.inkSoft, backgroundColor: T.paper, border: `1px solid ${T.border}`, padding: '5px 12px', borderRadius: '8px', fontWeight: '500' }}>{e}</span>
              ))}
            </div>
          </div>

          {/* Perspectives */}
          <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: T.ink + '06', border: `1px solid ${T.border}` }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: T.ink, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔭 Perspectives du marché
            </h3>
            <p style={{ fontSize: '13px', color: T.inkSoft, margin: 0, lineHeight: '1.6' }}>{domain.outlook}</p>
          </div>

          {/* CTA */}
          {domain.active ? (
            <button onClick={() => navigate(user ? '/learn' : '/register')}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: domain.color, color: T.white, fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: `0 8px 24px ${domain.color}30` }}>
              {user ? 'Préparer ce domaine sur Knoweo →' : 'Commencer gratuitement →'}
            </button>
          ) : (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: T.paper, border: `1px solid ${T.border}`, textAlign: 'center' as const }}>
              <p style={{ fontSize: '14px', color: T.inkMute, margin: 0 }}>
                Ce domaine arrive bientôt sur Knoweo.{' '}
                {!user && (
                  <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: T.violet, cursor: 'pointer', fontWeight: '700', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
                    Créer un compte gratuit →
                  </button>
                )}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CareersPage;
