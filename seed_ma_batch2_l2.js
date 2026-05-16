const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: '$Language1', database: 'knoweo' });

async function seed() {
  await client.connect();
  const domains = await client.query('SELECT id, slug FROM domain');
  const domainMap = {};
  domains.rows.forEach(d => domainMap[d.slug] = d.id);
  const maId = domainMap['ma'];

  const questions = [
    {
      domainId: maId, level: 2,
      textFr: "Comment construire un modèle LBO simplifié ? Quelles sont les étapes clés ?",
      textEn: "How do you build a simplified LBO model? What are the key steps?",
      propositionsFr: [
        { text: "1) Prix d'acquisition et sources/emplois, 2) Compte de résultat projeté et FCF, 3) Waterfall de remboursement de la dette, 4) Calcul de l'equity value à la sortie et de l'IRR", correct: true },
        { text: "1) Valorisation DCF de la cible, 2) Analyse de comparables, 3) Due diligence financière, 4) Négociation du prix", correct: false },
        { text: "1) Analyse du bilan, 2) Calcul de l'EBITDA normalisé, 3) Application d'un multiple, 4) Soustraction de la dette nette", correct: false },
        { text: "1) Projection du CA, 2) Calcul de la marge nette, 3) Actualisation au WACC, 4) Addition de la valeur terminale", correct: false },
      ],
      propositionsEn: [
        { text: "1) Purchase price and sources/uses, 2) Projected P&L and FCF, 3) Debt repayment waterfall, 4) Exit equity value and IRR calculation", correct: true },
        { text: "1) DCF valuation, 2) Comparable analysis, 3) Financial due diligence, 4) Price negotiation", correct: false },
        { text: "1) Balance sheet analysis, 2) Normalized EBITDA, 3) Multiple application, 4) Net debt subtraction", correct: false },
        { text: "1) Revenue projection, 2) Net margin calculation, 3) WACC discounting, 4) Terminal value addition", correct: false },
      ],
      explanationFr: "Un modèle LBO se construit en 4 blocs. Bloc 1 - Sources & Emplois : Emplois = Prix d'acquisition (EV) + frais de transaction. Sources = Dette senior + dette mezzanine + fonds propres du fonds. Bloc 2 - P&L et FCF : on projette le CA, l'EBITDA, soustrait les charges d'intérêts (qui diminuent avec le désendettement), les impôts, le capex et la variation de BFR pour obtenir le FCF annuel. Bloc 3 - Waterfall dette : le FCF sert à rembourser la dette dans l'ordre : senior sécurisée → senior non sécurisée → mezzanine. Bloc 4 - Sortie : on applique un multiple de sortie à l'EBITDA de l'année N pour obtenir l'EV de sortie, on soustrait la dette résiduelle → Equity Value de sortie → IRR = (EV sortie / Equity investi)^(1/durée) − 1.",
      explanationEn: "LBO model in 4 blocks: 1) Sources & Uses (debt + equity fund = purchase price + fees). 2) P&L/FCF projection (EBITDA minus interest, taxes, capex, working capital). 3) Debt repayment waterfall (FCF sweeps debt senior to junior). 4) Exit: apply exit multiple to EBITDA → EV → minus residual debt → equity value → IRR.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que la normalisation de l'EBITDA et pourquoi est-elle cruciale en M&A ?",
      textEn: "What is EBITDA normalization and why is it critical in M&A?",
      propositionsFr: [
        { text: "Le retraitement de l'EBITDA comptable pour éliminer les éléments non récurrents et refléter la vraie capacité bénéficiaire durable de la société", correct: true },
        { text: "L'ajustement de l'EBITDA pour le comparer à des normes comptables internationales IFRS ou US GAAP", correct: false },
        { text: "La conversion de l'EBITDA en free cash flow en déduisant les impôts et le capex", correct: false },
        { text: "L'ajustement de l'EBITDA d'une année atypique pour le remplacer par une moyenne des 3 dernières années", correct: false },
      ],
      propositionsEn: [
        { text: "Adjusting reported EBITDA to remove non-recurring items and reflect the true sustainable earnings capacity", correct: true },
        { text: "Adjusting EBITDA to conform to IFRS or US GAAP accounting standards", correct: false },
        { text: "Converting EBITDA to free cash flow by deducting taxes and capex", correct: false },
        { text: "Replacing an atypical year's EBITDA with a 3-year average", correct: false },
      ],
      explanationFr: "L'EBITDA normalisé est LA base de valorisation en M&A. Les ajustements typiques incluent : Ajouts (add-backs) : rémunérations excessives de dirigeants-actionnaires, coûts de restructuration one-off, frais de transaction, litiges exceptionnels, coûts de démarrage, coûts liés au COVID. Retraits : produits non récurrents, plus-values de cession d'actifs, subventions ponctuelles. Les ajustements de run-rate : si une acquisition ou un contrat important a été signé en cours d'année, on annualise l'impact comme si c'était là toute l'année. Exemple : une PME a un EBITDA comptable de 5 M€. Le dirigeant-actionnaire se rémunère 2 M€ (vs 0,5 M€ pour un salarié équivalent) et a eu un litige exceptionnel de 0,5 M€. EBITDA normalisé = 5 + 1,5 + 0,5 = 7 M€. La valorisation passe de 35 M€ à 49 M€ (à 7x) — d'où l'importance des négociations sur les add-backs !",
      explanationEn: "Normalized EBITDA removes non-recurring items (exceptional restructuring, excess owner salary, litigation) and adds run-rate effects of new contracts. Example: reported €5M EBITDA → after adding back €1.5M excess salary and €0.5M one-off litigation → normalized EBITDA = €7M. Changes valuation from €35M to €49M at 7x — hence fierce negotiations.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'un mécanisme de locked-box dans un SPA ?",
      textEn: "What is a locked-box mechanism in an SPA?",
      propositionsFr: [
        { text: "Un mécanisme où le prix est fixé définitivement à une date de référence passée (locked-box date) sans ajustement post-closing basé sur les comptes réels à la clôture", correct: true },
        { text: "Un mécanisme de séquestre où le prix est conservé par un tiers jusqu'à la validation de toutes les conditions suspensives", correct: false },
        { text: "Une clause qui bloque le versement d'une partie du prix jusqu'à l'expiration de la période de garantie", correct: false },
        { text: "Un mécanisme de calcul du prix basé sur les comptes audités à la date effective de closing", correct: false },
      ],
      propositionsEn: [
        { text: "A mechanism where the price is fixed at a historical reference date with no post-closing adjustment based on actual closing accounts", correct: true },
        { text: "An escrow mechanism where price is held by a third party until all conditions are met", correct: false },
        { text: "A clause blocking part of the price until the warranty period expires", correct: false },
        { text: "A price calculation mechanism based on audited accounts at the actual closing date", correct: false },
      ],
      explanationFr: "Il existe deux grands mécanismes de prix en M&A : Locked-Box : le prix est calculé sur des comptes à une date passée (ex: 31 décembre dernier), fixé définitivement. Le vendeur garantit qu'il n'y a pas eu de 'leakage' (fuite de valeur : dividendes, transactions avec parties liées) entre cette date et le closing. Avantage : simplicité, certitude du prix. Utilisé surtout en Europe. Completion Accounts : le prix indicatif est ajusté après le closing en fonction des comptes réels à la date de closing (dette nette réelle, BFR réel vs BFR normalisé). Avantage : prix reflète la réalité économique. Utilisé surtout aux États-Unis. Inconvénient : négociation post-closing qui peut dégénérer.",
      explanationEn: "Locked-box: price fixed at a historical date, no post-closing adjustment. Seller warrants no leakage between reference date and closing. Simple, certain. Preferred in Europe. Completion accounts: price adjusted post-closing based on actual debt/working capital. Reflects economic reality. Used in the US. Risk: post-closing disputes.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'une analyse de transactions comparables (precedent transactions) ?",
      textEn: "What is a precedent transaction analysis?",
      propositionsFr: [
        { text: "Une méthode de valorisation qui analyse les multiples payés lors de transactions récentes sur des sociétés comparables à la cible", correct: true },
        { text: "Une méthode qui compare les multiples boursiers de sociétés cotées similaires à la cible", correct: false },
        { text: "Une analyse des acquisitions réalisées par la cible elle-même dans le passé", correct: false },
        { text: "Une revue des offres reçues lors d'un processus d'enchères compétitif", correct: false },
      ],
      propositionsEn: [
        { text: "A valuation method analyzing multiples paid in recent transactions on companies comparable to the target", correct: true },
        { text: "A method comparing stock market multiples of listed peers to the target", correct: false },
        { text: "An analysis of acquisitions the target itself made in the past", correct: false },
        { text: "A review of bids received during a competitive auction process", correct: false },
      ],
      explanationFr: "La méthode des transactions comparables ('comps de deals') analyse les multiples EV/EBITDA payés lors de transactions récentes (3-5 ans) sur des sociétés du même secteur. Elle intègre naturellement la prime de contrôle (contrairement aux multiples boursiers) et reflète les conditions de marché au moment des transactions. Exemple : 5 transactions dans le secteur tech logiciels en 3 ans → multiples EV/EBITDA payés entre 10x et 18x, médiane 14x. Si la cible a 10 M€ d'EBITDA, valorisation indicative = 140 M€. Limites : les transactions ne sont pas toujours publiques (données difficiles à obtenir), les contextes peuvent être très différents (synergies spécifiques, marché M&A chaud/froid).",
      explanationEn: "Precedent transactions analyze EV/EBITDA multiples paid in comparable deals over 3-5 years. Naturally includes control premium. Reflects market conditions at deal time. Limitations: private deal data is scarce, contexts differ significantly.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que la dette senior sécurisée (Senior Secured Debt) dans un LBO ?",
      textEn: "What is Senior Secured Debt in an LBO?",
      propositionsFr: [
        { text: "La tranche de dette prioritaire adossée à des sûretés sur les actifs de la société, remboursée en premier en cas de défaut", correct: true },
        { text: "La dette émise directement par les actionnaires de la holding LBO sous forme d'obligations convertibles", correct: false },
        { text: "La dette contractée auprès d'un fonds de mezzanine rémunérée en cash et en warrants", correct: false },
        { text: "La dette obligataire émise en Bourse lors du refinancement post-LBO", correct: false },
      ],
      propositionsEn: [
        { text: "The priority debt tranche secured by collateral on company assets, repaid first in case of default", correct: true },
        { text: "Debt issued directly by LBO holding shareholders in the form of convertible bonds", correct: false },
        { text: "Debt from a mezzanine fund remunerated in cash and warrants", correct: false },
        { text: "Bond debt issued on the market during post-LBO refinancing", correct: false },
      ],
      explanationFr: "La structure de dette LBO est organisée en tranches selon la priorité de remboursement (waterfall). Du plus senior au plus junior : 1) Dette senior sécurisée (Senior Secured) : adossée à des actifs, intérêt le plus bas (ex: Euribor + 3%). Remboursée en premier. Comprend souvent une Revolving Credit Facility (RCF) pour la trésorerie courante. 2) Dette senior non sécurisée (Senior Unsecured) : plus risquée, intérêt plus élevé. 3) Mezzanine / Dette subordonnée : encore plus risquée, rémunération combinée (cash + PIK + warrants). 4) Equity : les fonds propres. Ce waterfall de priorité détermine le niveau de risque et donc le rendement exigé par chaque pourvoyeur de fonds.",
      explanationEn: "LBO debt waterfall from senior to junior: 1) Senior Secured (collateral, lowest rate e.g. Euribor+3%, first repaid). 2) Senior Unsecured (higher rate). 3) Mezzanine (cash + PIK + warrants). 4) Equity. Seniority determines risk and required return.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'un covenant financier dans un contrat de dette LBO ?",
      textEn: "What is a financial covenant in an LBO debt contract?",
      propositionsFr: [
        { text: "Une clause contractuelle imposant à l'emprunteur de respecter certains ratios financiers (ex: levier < 5x EBITDA), dont la violation déclenche un défaut technique", correct: true },
        { text: "Une clause stipulant le taux d'intérêt maximum que l'emprunteur s'engage à payer", correct: false },
        { text: "Une garantie personnelle donnée par les dirigeants pour couvrir une partie de la dette LBO", correct: false },
        { text: "Une clause autorisant le remboursement anticipé de la dette sans pénalité", correct: false },
      ],
      propositionsEn: [
        { text: "A contractual clause requiring the borrower to maintain certain financial ratios (e.g. leverage < 5x EBITDA), breach of which triggers a technical default", correct: true },
        { text: "A clause specifying the maximum interest rate the borrower commits to pay", correct: false },
        { text: "A personal guarantee from management to cover part of the LBO debt", correct: false },
        { text: "A clause allowing early debt repayment without penalty", correct: false },
      ],
      explanationFr: "Les covenants financiers sont les garde-fous des prêteurs en LBO. Les plus courants : Levier max (Dette Nette / EBITDA ≤ 5,5x), Couverture des intérêts (EBITDA / Charges d'intérêts ≥ 2x), Capex max (pour préserver le cash). Si un covenant est violé, les banques peuvent : exiger le remboursement immédiat, renégocier les conditions, prendre le contrôle de la société. En période de crise (COVID par exemple), les entreprises LBO négocient souvent des 'covenant holidays' (suspension temporaire). Les LBO récents incluent souvent des structures 'cov-lite' (covenant-light) avec moins de covenants financiers mais plus de covenants de type informatif.",
      explanationEn: "Covenants protect lenders: max leverage (Net Debt/EBITDA ≤ 5.5x), min interest coverage (EBITDA/Interest ≥ 2x), max capex. Breach = technical default → banks can demand repayment or renegotiate. Recent LBOs often use 'cov-lite' structures with fewer financial covenants.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Comment fonctionne un mécanisme d'earn-out dans une transaction M&A ?",
      textEn: "How does an earn-out mechanism work in an M&A transaction?",
      propositionsFr: [
        { text: "Une partie du prix est payée immédiatement au closing, l'autre partie est conditionnée aux performances futures de la société sur 2-3 ans selon des métriques prédéfinies", correct: true },
        { text: "Le prix est intégralement payé à la signature du LOI, la due diligence permettant uniquement de l'ajuster à la baisse", correct: false },
        { text: "Le prix est entièrement différé et payé en plusieurs tranches sur 5 ans sans condition de performance", correct: false },
        { text: "L'earn-out désigne le droit des vendeurs à racheter la société si l'acheteur ne respecte pas ses engagements", correct: false },
      ],
      propositionsEn: [
        { text: "Part of the price is paid at closing, the rest is contingent on future company performance over 2-3 years against predefined metrics", correct: true },
        { text: "The price is fully paid at LOI signing, with due diligence only allowing downward adjustments", correct: false },
        { text: "The price is entirely deferred and paid in installments over 5 years without performance conditions", correct: false },
        { text: "Earn-out refers to sellers' right to repurchase the company if the buyer doesn't meet commitments", correct: false },
      ],
      explanationFr: "L'earn-out résout le désaccord entre vendeur (optimiste sur les perspectives) et acheteur (prudent). Exemple : valorisation débattue entre 50 M€ (acheteur) et 70 M€ (vendeur). Solution earn-out : 50 M€ au closing + jusqu'à 20 M€ supplémentaires si l'EBITDA dépasse 10 M€ dans 3 ans. Les métriques d'earn-out peuvent être : EBITDA, CA, résultat net, nombre de clients, etc. Points de vigilance : qui contrôle les leviers de performance ? (souvent le vendeur reste manager post-acquisition). Conflits fréquents sur la comptabilisation des métriques. En pratique, les earn-outs dégénèrent souvent en litiges, d'où l'importance de les définir très précisément dans le SPA.",
      explanationEn: "Earn-out bridges valuation gap. Example: buyer offers €50M, seller wants €70M → €50M at closing + up to €20M if EBITDA exceeds €10M in 3 years. Key risks: seller retains management control post-closing (conflict of interest), metric definition disputes. Earn-outs frequently lead to litigation — requires very precise SPA drafting.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que le W&I Insurance (Warranty & Indemnity Insurance) en M&A ?",
      textEn: "What is W&I Insurance (Warranty & Indemnity Insurance) in M&A?",
      propositionsFr: [
        { text: "Une assurance qui couvre l'acheteur contre les violations des représentations et garanties du vendeur, permettant au vendeur de ne pas bloquer de fonds en garantie", correct: true },
        { text: "Une assurance vie souscrite par l'acheteur sur la tête des dirigeants clés de la société acquise", correct: false },
        { text: "Une garantie bancaire couvrant le risque de non-paiement du prix par l'acheteur", correct: false },
        { text: "Une assurance contre le risque de non-obtention des autorisations réglementaires antitrust", correct: false },
      ],
      propositionsEn: [
        { text: "Insurance covering the buyer against breaches of seller's representations and warranties, allowing sellers to walk away clean", correct: true },
        { text: "Life insurance taken by the buyer on key managers of the acquired company", correct: false },
        { text: "A bank guarantee covering buyer's non-payment risk", correct: false },
        { text: "Insurance against failure to obtain antitrust regulatory approvals", correct: false },
      ],
      explanationFr: "Le W&I Insurance a révolutionné les transactions M&A, notamment en Private Equity. Sans W&I : le vendeur doit conserver une partie du prix (10-20%) en séquestre (escrow) pendant 12-24 mois pour couvrir les réclamations de l'acheteur en cas de violation de garantie. Avec W&I : l'assureur (non une partie à la transaction) prend en charge les réclamations. Le vendeur récupère immédiatement 100% du prix. L'acheteur bénéficie d'une contrepartie solvable (l'assureur). La prime d'assurance est de 1-3% du montant assuré. Le W&I est désormais quasi-systématique dans les transactions PE en Europe, permettant des 'clean exits' aux fonds vendeurs.",
      explanationEn: "W&I Insurance revolutionized PE deal-making. Without it: sellers must hold 10-20% of price in escrow for 18-24 months. With W&I: insurer covers warranty claims, seller gets 100% of price at closing, buyer has solvent counterparty. Premium: 1-3% of insured amount. Now quasi-systematic in European PE.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que la capacité de désendettement (debt capacity) d'une cible LBO ?",
      textEn: "What is the debt capacity of an LBO target?",
      propositionsFr: [
        { text: "Le montant maximum de dette que la société peut supporter tout en générant suffisamment de cash pour rembourser les intérêts et le principal selon les covenants", correct: true },
        { text: "La notation de crédit attribuée par les agences Moody's et S&P à la dette de la société", correct: false },
        { text: "Le montant de dette que les banques sont légalement autorisées à accorder selon les réglementations Bâle III", correct: false },
        { text: "La part de la dette LBO qui peut être refinancée sur les marchés obligataires", correct: false },
      ],
      propositionsEn: [
        { text: "The maximum debt a company can bear while generating enough cash to service interest and principal under covenants", correct: true },
        { text: "The credit rating given by Moody's and S&P to the company's debt", correct: false },
        { text: "The debt amount banks are legally allowed to grant under Basel III regulations", correct: false },
        { text: "The portion of LBO debt that can be refinanced on bond markets", correct: false },
      ],
      explanationFr: "La dette capacity est calculée à partir du FCF. Règle générale en LBO : la dette = 4-6x l'EBITDA selon le secteur et le cycle. Secteurs à forte dette capacity : logiciels récurrents (SaaS), infrastructures, utilities → FCF prévisible et stable, jusqu'à 7-8x. Secteurs à faible dette capacity : industrie cyclique, retail, médias → FCF volatile, 3-4x max. La dette capacity est aussi contrainte par le coverage ratio : les intérêts annuels ne doivent pas dépasser 30-40% du FCF pour laisser de l'air. Exemple pratique : société SaaS avec 10 M€ d'EBITDA, FCF 8 M€ → dette capacity ≈ 60-70 M€ (6-7x EBITDA). La dette doit être refinancée avant l'échéance (bulletin repayment) donc la capacité de refinancement futur est aussi analysée.",
      explanationEn: "Debt capacity = maximum sustainable debt load. Generally 4-6x EBITDA in LBOs. High capacity sectors: recurring SaaS, infrastructure (stable FCF, up to 7-8x). Low capacity: cyclical industries, retail (volatile FCF, 3-4x max). Coverage constraint: annual interest < 30-40% of FCF.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'une analyse de sensibilité dans un modèle LBO ?",
      textEn: "What is a sensitivity analysis in an LBO model?",
      propositionsFr: [
        { text: "Un tableau croisé montrant l'IRR ou le MoM pour différentes combinaisons de multiple d'entrée/sortie et de croissance d'EBITDA", correct: true },
        { text: "Une analyse qui teste la résistance du modèle à une récession en appliquant des chocs macroéconomiques", correct: false },
        { text: "Un stress test sur la capacité de la société à honorer ses covenants en cas de baisse de l'EBITDA", correct: false },
        { text: "Une revue de la sensibilité du prix d'acquisition aux différentes méthodes de valorisation utilisées", correct: false },
      ],
      propositionsEn: [
        { text: "A cross-table showing IRR or MoM for various combinations of entry/exit multiple and EBITDA growth", correct: true },
        { text: "An analysis testing model resilience to a recession with macroeconomic shocks", correct: false },
        { text: "A stress test on the company's ability to meet covenants if EBITDA falls", correct: false },
        { text: "A review of price sensitivity to different valuation methods used", correct: false },
      ],
      explanationFr: "La table de sensibilité est indispensable dans tout modèle LBO. Exemple typique : on fait varier 2 paramètres clés sur une grille 5×5. Axe horizontal : multiple de sortie EV/EBITDA (8x, 9x, 10x, 11x, 12x). Axe vertical : croissance annuelle d'EBITDA (−2%, 0%, +3%, +6%, +10%). Pour chaque combinaison, on calcule l'IRR. Résultat : on voit immédiatement le cas de base (IRR 22%), le cas pessimiste (IRR 10%) et le cas optimiste (IRR 35%). Cela permet au comité d'investissement du fonds d'évaluer le risque/rendement. Une autre table cruciale : sensibilité de l'IRR au timing de sortie (sortie en année 3, 4, 5, 6).",
      explanationEn: "Sensitivity table: 5×5 grid varying two key drivers (e.g., exit multiple × EBITDA growth) showing IRR for each combination. Lets investment committees see base/bull/bear scenarios at a glance. Critical output of any LBO model.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que la Purchase Price Allocation (PPA) post-acquisition ?",
      textEn: "What is Purchase Price Allocation (PPA) post-acquisition?",
      propositionsFr: [
        { text: "L'exercice comptable obligatoire (IFRS 3) qui consiste à identifier et valoriser les actifs et passifs de la cible à leur juste valeur, le résidu étant le goodwill", correct: true },
        { text: "La répartition du prix d'acquisition entre les différentes couches de la structure de financement (dette senior, mezzanine, equity)", correct: false },
        { text: "La ventilation du prix d'acquisition payé entre le ou les actionnaires vendeurs", correct: false },
        { text: "L'allocation du budget d'intégration post-acquisition entre les différents chantiers (IT, RH, commercial)", correct: false },
      ],
      propositionsEn: [
        { text: "The mandatory accounting exercise (IFRS 3) identifying and valuing acquired assets and liabilities at fair value, with the residual being goodwill", correct: true },
        { text: "The allocation of purchase price across financing layers (senior debt, mezzanine, equity)", correct: false },
        { text: "The distribution of purchase price between selling shareholders", correct: false },
        { text: "The allocation of post-acquisition integration budget across workstreams", correct: false },
      ],
      explanationFr: "Après une acquisition, IFRS 3 impose un PPA : l'acquéreur doit identifier tous les actifs et passifs de la cible et les revaloriser à leur juste valeur. Actifs identifiables typiquement découverts dans un PPA : brevets et technologies (non inscrits au bilan de la cible mais valorisés en PPA), relations clients, marques, contrats en cours. Chacun est inscrit à l'actif du bilan consolidé avec sa durée d'utilisation et amorti. Le goodwill résiduel = Prix payé − Juste valeur des actifs nets identifiables. Impact sur les résultats : les amortissements liés au PPA ('PPA amortization') réduisent le résultat net consolidé, ce qui explique pourquoi les analystes retraitent souvent le résultat net pour l'épurer des PPA charges.",
      explanationEn: "IFRS 3 requires PPA post-acquisition: identify and fair-value all acquired assets/liabilities. Common newly recognized assets: patents, customer relationships, brands. Each amortized over its useful life. PPA amortization reduces consolidated net income — analysts often add it back for 'underlying' earnings.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que le management package (sweet equity) dans un LBO ?",
      textEn: "What is a management package (sweet equity) in an LBO?",
      propositionsFr: [
        { text: "Un mécanisme permettant aux managers de co-investir aux côtés du fonds PE à des conditions préférentielles, avec un ratchet si les objectifs de performance sont dépassés", correct: true },
        { text: "Le salaire fixe et variable versé aux dirigeants de la société acquise en LBO", correct: false },
        { text: "Une prime de fidélité versée aux managers qui restent dans la société pendant toute la durée du LBO", correct: false },
        { text: "Des stock-options classiques octroyées aux managers avec un prix d'exercice au prix du marché", correct: false },
      ],
      propositionsEn: [
        { text: "A mechanism allowing managers to co-invest alongside the PE fund at preferential terms, with a ratchet if performance targets are exceeded", correct: true },
        { text: "The fixed and variable salary paid to executives of the LBO-acquired company", correct: false },
        { text: "A loyalty bonus paid to managers who stay for the full LBO duration", correct: false },
        { text: "Standard stock options granted to managers at market price", correct: false },
      ],
      explanationFr: "Le management package aligne les intérêts des managers (qui dirigent la société) avec ceux du fonds PE (qui l'a acquise). Structure type : Le fonds PE prend 85-95% du capital, les managers 5-15% à un prix préférentiel ('sweet equity'). Ratchet : si l'IRR dépasse un seuil (ex: 20%), les managers reçoivent une part supplémentaire (les manager shares se 'convertissent' mieux). Exemple chiffré : le fonds investit 80 M€ pour 90% du capital. Les managers investissent 2 M€ (leur épargne personnelle) pour 10% mais avec un ratchet → si l'IRR dépasse 25%, ils obtiennent 20% (au lieu de 10%). Si le LBO sort à 200 M€, les managers récupèrent 40 M€ pour 2 M€ investis (MoM = 20x). C'est la carotte qui pousse les managers à maximiser la performance.",
      explanationEn: "Management package aligns manager and PE fund interests. Managers invest personally (5-15% at preferential price). Ratchet: if IRR exceeds threshold (e.g., 25%), managers' share increases. Example: managers invest €2M for 10%, ratchet to 20% if IRR>25% → exit at €200M gives managers €40M (20x return). The 'carrot' for managers.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Comment se calcule la valeur d'entreprise (EV) à partir des multiples de comparables ?",
      textEn: "How is Enterprise Value (EV) calculated using comparable multiples?",
      propositionsFr: [
        { text: "On identifie un groupe de sociétés comparables, on calcule leurs médianes de multiples EV/EBITDA (ou EV/EBIT), puis on les applique à l'EBITDA (ou EBIT) de la cible", correct: true },
        { text: "On calcule la moyenne des cours de Bourse des comparables et on l'applique au nombre d'actions de la cible", correct: false },
        { text: "On compare le chiffre d'affaires de la cible avec celui des comparables et on extrapole la valorisation", correct: false },
        { text: "On applique un multiple fixe de 8x l'EBITDA, standard dans l'industrie M&A", correct: false },
      ],
      propositionsEn: [
        { text: "Identify a peer group, calculate median EV/EBITDA (or EV/EBIT) multiples, apply to the target's EBITDA (or EBIT)", correct: true },
        { text: "Average peer stock prices and apply to the target's share count", correct: false },
        { text: "Compare target revenue to peers and extrapolate valuation", correct: false },
        { text: "Apply a fixed 8x EBITDA multiple, the industry M&A standard", correct: false },
      ],
      explanationFr: "Méthode étape par étape : 1) Sélectionner 5-10 comparables (même secteur, taille similaire, géographie proche). 2) Calculer leur EV = capitalisation boursière + dette nette − trésorerie. 3) Calculer les multiples : EV/EBITDA LTM (Last Twelve Months) et NTM (Next Twelve Months), EV/EBIT, EV/CA si non rentable. 4) Analyser la distribution (médiane, moyenne, quartiles). 5) Ajuster : la cible mérite-t-elle un premium ou une décote vs la médiane ? (croissance supérieure → premium, taille plus petite → décote). 6) Appliquer la fourchette de multiples retenue à l'EBITDA de la cible → fourchette de valorisation. Important : on utilise souvent les multiples NTM (anticipés) car ils reflètent mieux la valeur économique forward-looking.",
      explanationEn: "Step-by-step: 1) Select 5-10 comps. 2) Calculate each comp's EV = Market Cap + Net Debt. 3) Compute EV/EBITDA LTM and NTM multiples. 4) Analyze distribution (median, quartiles). 5) Adjust for target premium/discount vs peers. 6) Apply multiple range to target EBITDA → valuation range. Use NTM multiples for forward-looking perspective.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'un processus d'enchères en deux tours (two-round auction) en M&A ?",
      textEn: "What is a two-round auction process in M&A?",
      propositionsFr: [
        { text: "Un processus de vente compétitif avec un premier tour d'offres indicatives non engageantes, suivi d'un second tour d'offres engageantes soumises après due diligence approfondie", correct: true },
        { text: "Un processus où le vendeur approche successivement deux acheteurs potentiels, en séquentiel", correct: false },
        { text: "Une enchère à prix fermé où les acheteurs soumettent deux offres et la meilleure est retenue", correct: false },
        { text: "Un processus impliquant deux banques conseil côté vendeur pour maximiser la compétition", correct: false },
      ],
      propositionsEn: [
        { text: "A competitive sale process with a first round of non-binding indicative bids, followed by a second round of binding offers after full due diligence", correct: true },
        { text: "A process where the seller approaches two potential buyers sequentially", correct: false },
        { text: "A sealed-bid auction where buyers submit two bids and the best is selected", correct: false },
        { text: "A process involving two sell-side advisors to maximize competition", correct: false },
      ],
      explanationFr: "Le processus en deux tours est le standard pour les cessions M&A de taille significative. Tour 1 (2-3 semaines) : le banquier conseil du vendeur envoie le teaser à 20-50 acheteurs potentiels. Ceux intéressés signent un NDA et reçoivent l'Information Memorandum (IM). Ils soumettent des offres indicatives non engageantes. 5-10 acheteurs sont retenus pour le tour 2. Tour 2 (4-8 semaines) : les finalistes accèdent à une data room exhaustive, rencontrent le management (management presentations), réalisent leur due diligence complète, puis soumettent une offre engageante avec projet de SPA commenté. Le vendeur choisit le 'preferred bidder' et entre en négociation exclusive.",
      explanationEn: "Round 1 (2-3 weeks): teaser to 50 buyers → NDA → IM → indicative bids → shortlist to 5-10. Round 2 (4-8 weeks): data room access + management presentations + full due diligence → binding bids with SPA markup → select preferred bidder → exclusive negotiation.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que le PIK (Payment In Kind) dans la dette LBO ?",
      textEn: "What is PIK (Payment In Kind) in LBO debt?",
      propositionsFr: [
        { text: "Une modalité de paiement des intérêts où ceux-ci ne sont pas payés en cash mais capitalisés et ajoutés au principal de la dette, augmentant l'encours", correct: true },
        { text: "Un paiement en nature (actifs) effectué par la cible au lieu du paiement en cash à l'acquéreur", correct: false },
        { text: "Un mécanisme de remboursement progressif de la dette par tranches égales chaque année", correct: false },
        { text: "Un instrument de dette convertible en actions à l'initiative du prêteur", correct: false },
      ],
      propositionsEn: [
        { text: "An interest payment modality where interest is not paid in cash but capitalized and added to the principal, increasing outstanding debt", correct: true },
        { text: "Payment in kind (assets) made by the target instead of cash to the acquirer", correct: false },
        { text: "A progressive debt repayment mechanism in equal annual installments", correct: false },
        { text: "A debt instrument convertible into equity at lender's option", correct: false },
      ],
      explanationFr: "Le PIK est utilisé dans la dette la plus subordonnée (mezzanine, deuxième lien) pour économiser le cash dans les premières années du LBO où la trésorerie est tendue. Exemple : 20 M€ de dette mezzanine à 15% PIK. Année 1 : pas de paiement cash, les intérêts de 3 M€ sont ajoutés au principal → la dette devient 23 M€. Année 2 : intérêts = 15% × 23 M€ = 3,45 M€ → dette = 26,45 M€. L'effet boule de neige fait que la dette PIK croît exponentiellement. Lors de la sortie, le fonds PE doit rembourser ce montant plus élevé. Avantage : préserve le cash pendant la montée en puissance. Risque : si l'EBITDA ne croît pas comme prévu, la société se retrouve avec une dette PIK démesurée.",
      explanationEn: "PIK interest isn't paid in cash — it's added to principal. Example: €20M mezzanine at 15% PIK → Year 1: no cash payment, debt becomes €23M → Year 2: debt = €26.45M (snowball effect). Preserves cash early in LBO. Risk: debt grows exponentially if EBITDA underperforms.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que la règle des 50/50 et du test de dominance en droit de la concurrence M&A ?",
      textEn: "What is market dominance analysis in M&A competition law?",
      propositionsFr: [
        { text: "L'analyse par les régulateurs (AMF, Commission européenne, DOJ) de l'impact d'une fusion sur la concurrence, pouvant imposer des cessions d'actifs (remèdes) voire bloquer la transaction", correct: true },
        { text: "Une règle comptable imposant que l'actif circulant représente au moins 50% du total bilan après l'acquisition", correct: false },
        { text: "Un seuil de 50% de part de marché au-delà duquel une entreprise est automatiquement considérée en position dominante", correct: false },
        { text: "Une règle imposant que la dette ne dépasse pas 50% de la valeur d'entreprise dans un LBO", correct: false },
      ],
      propositionsEn: [
        { text: "Regulatory analysis (EU Commission, DOJ) of a merger's impact on competition, potentially requiring asset divestitures or blocking the deal", correct: true },
        { text: "An accounting rule requiring current assets to represent at least 50% of total assets post-acquisition", correct: false },
        { text: "A threshold of 50% market share above which a company is automatically deemed dominant", correct: false },
        { text: "A rule requiring debt not to exceed 50% of enterprise value in an LBO", correct: false },
      ],
      explanationFr: "Toute acquisition dépassant certains seuils (CA mondial > 5 Mds€ et CA européen > 250 M€ pour la Commission Européenne) doit être notifiée aux autorités de concurrence. Celles-ci analysent : impact sur les prix, l'innovation, le choix pour les consommateurs. Si l'opération crée ou renforce une position dominante, les régulateurs peuvent imposer des remèdes structurels (cession de marques, d'usines, de clientèle) ou comportementaux (engagement de prix, accès à des technologies). Exemple célèbre : la fusion AB InBev / SABMiller en 2016 a été approuvée mais avec la cession de nombreuses marques de bière dans différents pays. Le HSR Act (États-Unis) impose une notification préalable au DOJ/FTC au-dessus de certains seuils.",
      explanationEn: "Mergers above thresholds (EU: worldwide revenue >€5B + EU revenue >€250M) require regulatory notification. Authorities assess impact on prices, innovation, consumer choice. Remedies: structural (divest brands/plants) or behavioral (pricing commitments). Example: AB InBev/SABMiller approved with brand divestitures across multiple countries.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que le 'football field' en M&A et à quoi sert-il ?",
      textEn: "What is a 'football field' in M&A and what is it used for?",
      propositionsFr: [
        { text: "Un graphique récapitulatif présentant les fourchettes de valorisation obtenues par différentes méthodes (DCF, comparables, transactions) pour synthétiser le range de valeur d'une cible", correct: true },
        { text: "Un tableau de bord comparant les performances financières d'une entreprise avec celles de ses concurrents sectoriels", correct: false },
        { text: "Un schéma représentant la structure de financement d'un LBO avec les différentes couches de dette", correct: false },
        { text: "Un planning visuel du processus M&A indiquant les étapes et les délais de la transaction", correct: false },
      ],
      propositionsEn: [
        { text: "A summary chart presenting valuation ranges from different methods (DCF, comparables, transactions) to synthesize the value range of a target", correct: true },
        { text: "A dashboard comparing a company's performance to sector competitors", correct: false },
        { text: "A diagram showing the LBO financing structure with different debt layers", correct: false },
        { text: "A visual timeline of the M&A process showing steps and deadlines", correct: false },
      ],
      explanationFr: "Le football field (ou 'valuation bridge') est un graphique en barres horizontales empilées, très utilisé dans les fairness opinions et les pitchbooks. Pour chaque méthode de valorisation, on affiche une barre allant du minimum au maximum de la fourchette estimée. Méthodes typiquement représentées : DCF (fourchette de WACC et de taux de croissance), Comparables boursiers (1er quartile à 3ème quartile des multiples), Transactions comparables, Prix de Bourse sur 52 semaines (pour les sociétés cotées), Offres reçues (dans un processus de vente). Le football field permet au comité de direction ou aux actionnaires de voir d'un seul coup d'œil si une offre est raisonnable par rapport aux différentes approches de valorisation.",
      explanationEn: "The football field is a horizontal bar chart used in fairness opinions and pitchbooks. Each bar shows the min-max valuation range for one method (DCF, trading comps, deal comps, 52-week price). Lets management/shareholders instantly see whether an offer falls within or outside the fair value range.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que l'effet de levier financier dans un LBO et comment amplifie-t-il les rendements ?",
      textEn: "What is financial leverage in an LBO and how does it amplify returns?",
      propositionsFr: [
        { text: "L'utilisation de la dette pour financer l'acquisition amplifie les rendements sur les fonds propres : si l'EV augmente de 20%, le gain sur les fonds propres peut être de 50-100% grâce au levier", correct: true },
        { text: "Le levier financier réduit le risque en diversifiant les sources de financement de l'acquisition", correct: false },
        { text: "L'effet de levier permet à l'entreprise de payer moins d'impôts grâce à la déductibilité de la dette", correct: false },
        { text: "Le levier financier amplifie la croissance du chiffre d'affaires en donnant accès à plus de ressources pour investir", correct: false },
      ],
      propositionsEn: [
        { text: "Using debt to fund the acquisition amplifies equity returns: if EV grows 20%, equity gain can be 50-100% thanks to leverage", correct: true },
        { text: "Financial leverage reduces risk by diversifying funding sources", correct: false },
        { text: "Leverage allows the company to pay less tax through debt interest deductibility", correct: false },
        { text: "Financial leverage amplifies revenue growth by providing more resources to invest", correct: false },
      ],
      explanationFr: "Exemple chiffré de l'effet de levier. Sans LBO : achat à 100 M€ avec 100% de fonds propres. Revente à 120 M€ (EV +20%) → rendement = 20%. Avec LBO : achat à 100 M€ avec 60 M€ de dette + 40 M€ de fonds propres. Pendant 5 ans, la dette est remboursée à 40 M€ grâce aux FCF. Revente à 120 M€ → dette résiduelle 40 M€ → equity de sortie = 80 M€ pour 40 M€ investis → rendement = 100% (MoM = 2x). Le levier a doublé le rendement ! Mais l'effet est symétrique : si l'EV tombe à 80 M€ → equity = 40 M€ → perte sèche. Le levier amplifie les gains ET les pertes, d'où l'importance du choix de la cible et du prix d'entrée.",
      explanationEn: "Leverage amplifies returns symmetrically. Example: buy €100M with €60M debt + €40M equity. FCF repays debt to €40M. Sell at €120M → equity = €80M on €40M invested = 100% return (2x MoM). Without leverage: 20% return. But if EV falls to €80M → equity = €40M → breakeven. Leverage doubles gains AND losses.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'un Vendor Due Diligence (VDD) ?",
      textEn: "What is a Vendor Due Diligence (VDD)?",
      propositionsFr: [
        { text: "Une due diligence commandée par le vendeur lui-même avant la mise en vente, pour anticiper les questions des acheteurs et accélérer le processus", correct: true },
        { text: "Une due diligence réalisée par l'acheteur sur les fournisseurs clés de la société cible", correct: false },
        { text: "Un audit externe commandé par les banques prêteuses pour valider le business plan de l'acquisition", correct: false },
        { text: "Une revue du carnet de commandes et des contrats clients réalisée pendant la phase de due diligence", correct: false },
      ],
      propositionsEn: [
        { text: "A due diligence commissioned by the seller before the sale process, to anticipate buyer questions and accelerate the timeline", correct: true },
        { text: "A due diligence conducted by the buyer on the target's key suppliers", correct: false },
        { text: "An external audit commissioned by lending banks to validate the acquisition business plan", correct: false },
        { text: "A review of order book and customer contracts during due diligence", correct: false },
      ],
      explanationFr: "Le VDD est très courant dans les processus d'enchères compétitifs. Le vendeur mandate lui-même un cabinet de conseil (audit, strategy, environnement, informatique) pour réaliser une due diligence complète AVANT de lancer le processus de vente. Avantages pour le vendeur : accélère le processus (les acheteurs n'ont pas à refaire tout le travail), réduit l'intrusion dans l'entreprise, permet de présenter les informations sous l'angle le plus favorable, identifie les problèmes potentiels pour y remédier avant la vente. Avantages pour les acheteurs : accès rapide à une information structurée, réduction des coûts de due diligence. Limite : le VDD est commandé par le vendeur donc les acheteurs restent vigilants et font leur propre confirmatory due diligence.",
      explanationEn: "VDD: seller commissions full due diligence before launching the sale. Benefits: accelerates process, reduces company intrusion, frames information favorably, identifies issues early. Buyers appreciate the structured information but still run confirmatory DD since the VDD was vendor-commissioned.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce que la clause de limitation de responsabilité (cap) dans les garanties d'un SPA ?",
      textEn: "What is the liability cap in SPA warranties?",
      propositionsFr: [
        { text: "Le montant maximum que le vendeur sera tenu de payer à l'acheteur en cas de violation d'une garantie, souvent exprimé en pourcentage du prix d'acquisition", correct: true },
        { text: "Le montant minimum de préjudice que l'acheteur doit démontrer pour actionner les garanties (seuil de déclenchement)", correct: false },
        { text: "La durée pendant laquelle l'acheteur peut formuler une réclamation au titre des garanties", correct: false },
        { text: "Le taux d'intérêt de retard applicable en cas de non-paiement de l'indemnisation par le vendeur", correct: false },
      ],
      propositionsEn: [
        { text: "The maximum amount the seller must pay the buyer for warranty breaches, often expressed as a percentage of the purchase price", correct: true },
        { text: "The minimum damage threshold the buyer must show to trigger warranties", correct: false },
        { text: "The time period during which the buyer can file warranty claims", correct: false },
        { text: "The late interest rate applicable if the seller doesn't pay indemnification", correct: false },
      ],
      explanationFr: "Les garanties (reps & warranties) dans un SPA sont encadrées par plusieurs mécanismes de limitation : Le cap (plafond) : montant maximum de responsabilité du vendeur, souvent 20-30% du prix de cession (parfois 100% pour les garanties fondamentales comme le titre de propriété). Le basket (franchise) : seuil en dessous duquel les réclamations ne sont pas recevables (ex: 0,5% du prix). La durée : en général 12-24 mois pour les garanties courantes, 5-7 ans pour les garanties fiscales et sociales, sans limite pour les garanties fondamentales. Le W&I Insurance a changé la donne : le plafond de responsabilité du vendeur peut être réduit car c'est l'assureur qui couvre le gap.",
      explanationEn: "SPA warranty limitations: Cap (ceiling, typically 20-30% of price, 100% for fundamental warranties like title), Basket/Threshold (minimum claim amount, ~0.5% of price), Time limit (12-24 months general, 5-7 years tax, unlimited for fundamental). W&I insurance allows seller cap to be lower since the insurer covers claims.",
    },
    {
      domainId: maId, level: 2,
      textFr: "Qu'est-ce qu'un processus de restructuration opérationnelle post-acquisition (100 jours) ?",
      textEn: "What is a post-acquisition operational restructuring process (100-day plan)?",
      propositionsFr: [
        { text: "Un plan d'action structuré définissant les chantiers d'intégration prioritaires et les synergies à capturer dans les 100 premiers jours suivant le closing", correct: true },
        { text: "La période légale obligatoire pendant laquelle aucun changement ne peut être effectué dans la société acquise", correct: false },
        { text: "Un plan financier détaillant le calendrier de remboursement de la dette LBO sur 100 mois", correct: false },
        { text: "La période d'exclusivité accordée à l'acheteur après la LOI pour finaliser la due diligence", correct: false },
      ],
      propositionsEn: [
        { text: "A structured action plan defining priority integration workstreams and synergies to capture in the 100 days following closing", correct: true },
        { text: "The legally required period during which no changes can be made in the acquired company", correct: false },
        { text: "A financial plan detailing LBO debt repayment over 100 months", correct: false },
        { text: "The exclusivity period granted to the buyer after LOI to complete due diligence", correct: false },
      ],
      explanationFr: "Le plan 100 jours est crucial car la valeur d'une acquisition se crée (ou se détruit) dans les premiers mois. Les chantiers typiques : Gouvernance : nouvelle organisation, nouveaux reporting, KPIs. Synergies de coûts : rationalisation des fonctions support (comptabilité, IT, RH), renégociation des contrats fournisseurs. Synergies de revenus : cross-selling, accès aux canaux de distribution de l'acquéreur. Identité culturelle : intégration ou autonomie ? Rétention des talents clés. Statistiquement, 70% des acquisitions échouent à créer la valeur espérée, souvent à cause d'une intégration mal gérée. Les erreurs classiques : ne pas garder les talents, changer trop vite la culture, mal communiquer aux équipes.",
      explanationEn: "The 100-day plan is critical — value is created or destroyed in the first months. Key workstreams: governance (new org, KPIs), cost synergies (shared services, supplier renegotiation), revenue synergies (cross-selling), cultural integration. 70% of acquisitions fail to create expected value, mostly due to poor integration management.",
    },
  ];

  let inserted = 0, skipped = 0;
  for (const q of questions) {
    const exists = await client.query('SELECT id FROM question WHERE "textFr" = $1', [q.textFr]);
    if (exists.rows.length > 0) { skipped++; continue; }
    await client.query(
      `INSERT INTO question ("domainId", level, "textFr", "textEn", "propositionsFr", "propositionsEn", "explanationFr", "explanationEn", "isActive")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
      [q.domainId, q.level, q.textFr, q.textEn,
       JSON.stringify(q.propositionsFr), JSON.stringify(q.propositionsEn),
       q.explanationFr, q.explanationEn]
    );
    inserted++;
  }
  console.log(`✅ ${inserted} questions insérées, ${skipped} déjà existantes`);
  await client.end();
}
seed().catch(console.error);
