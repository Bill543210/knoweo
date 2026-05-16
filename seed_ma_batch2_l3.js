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
      domainId: maId, level: 3,
      textFr: "Dans un modèle LBO, comment calcule-t-on précisément l'IRR pour le fonds PE ?",
      textEn: "In an LBO model, how do you precisely calculate IRR for the PE fund?",
      propositionsFr: [
        { text: "L'IRR est le taux qui annule les flux nets : −Equity investi au T0 puis +Equity de sortie au Tn (et éventuellement dividendes intermédiaires), résolu numériquement", correct: true },
        { text: "IRR = (EBITDA sortie × multiple sortie) / (EBITDA entrée × multiple entrée) − 1, annualisé sur la durée", correct: false },
        { text: "IRR = (Equity sortie / Equity entré)^(1/durée) en années × 100", correct: false },
        { text: "IRR = (MoM − 1) / durée en années, où MoM est le multiple d'argent gagné", correct: false },
      ],
      propositionsEn: [
        { text: "IRR is the rate making net cash flows sum to zero: −equity invested at T0, +exit equity at Tn (plus any interim dividends), solved numerically", correct: true },
        { text: "IRR = (Exit EBITDA × exit multiple) / (Entry EBITDA × entry multiple) − 1, annualized", correct: false },
        { text: "IRR = (Exit equity / Entry equity)^(1/years) × 100", correct: false },
        { text: "IRR = (MoM − 1) / years, where MoM is money-on-money multiple", correct: false },
      ],
      explanationFr: "L'IRR se calcule en résolvant : 0 = −E₀ + Σ(Dt / (1+IRR)^t) + En / (1+IRR)^n. Où E₀ = equity investi initialement, Dt = dividendes intermédiaires éventuels (dividend recap), En = equity de sortie. Exemple complet : fonds investit 40 M€, encaisse un dividend recap de 10 M€ à l'année 3, et sort à 100 M€ (equity) à l'année 5. Flux : T0 = −40, T3 = +10, T5 = +100. IRR ≈ 28%. La formule MoM = 2,75x (150/40 non annualisé) mais IRR ≠ (MoM-1)/n. L'IRR est sensible au timing : 10 M€ à l'année 3 pèse plus qu'à l'année 5 dans le calcul de l'IRR. C'est pourquoi les fonds PE cherchent activement à faire des dividend recaps tôt pour booster l'IRR.",
      explanationEn: "IRR solves: 0 = −E₀ + Σ(Dividends_t / (1+IRR)^t) + Exit_Equity / (1+IRR)^n. Example: invest €40M at T0, €10M dividend recap at T3, exit at €100M equity at T5 → IRR ≈ 28%. Early cash returns (dividend recaps) significantly boost IRR due to time value.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment fonctionne un waterfall de distribution dans un fonds de Private Equity (carried interest) ?",
      textEn: "How does a distribution waterfall work in a PE fund (carried interest)?",
      propositionsFr: [
        { text: "Les distributions suivent l'ordre : 1) retour du capital aux LPs, 2) preferred return (hurdle rate ~8%) aux LPs, 3) catch-up du GP, 4) partage 80/20 (LPs/GP) du carried interest", correct: true },
        { text: "Le carried interest est calculé comme 20% de tous les gains bruts du fonds avant remboursement du capital", correct: false },
        { text: "Les LPs reçoivent d'abord 100% des profits jusqu'au hurdle rate, puis le GP prend 20% de tous les gains", correct: false },
        { text: "Le waterfall distribue 50% aux LPs et 50% au GP jusqu'au remboursement du capital, puis 100% au GP", correct: false },
      ],
      propositionsEn: [
        { text: "Distributions follow: 1) return of capital to LPs, 2) preferred return (hurdle ~8%) to LPs, 3) GP catch-up, 4) 80/20 split (LPs/GP) of carried interest", correct: true },
        { text: "Carried interest is 20% of all gross fund gains before capital return", correct: false },
        { text: "LPs receive 100% of profits up to hurdle rate, then GP takes 20% of all gains", correct: false },
        { text: "Waterfall distributes 50/50 LPs/GP until capital returned, then 100% to GP", correct: false },
      ],
      explanationFr: "Le waterfall d'un fonds PE typique (American waterfall deal-by-deal ou European waterfall fund-wide) fonctionne ainsi en version European (plus protectrice pour les LPs) : Étape 1 - Retour du capital : toutes les distributions vont d'abord aux LPs jusqu'à ce qu'ils aient récupéré 100% de leur mise (le capital appelé). Étape 2 - Preferred return (hurdle) : les LPs reçoivent ensuite 8% par an sur leur capital pendant toute la durée d'investissement. Étape 3 - Catch-up du GP : le GP reçoit 100% des distributions suivantes jusqu'à avoir reçu 20% du total des gains (la tranche 'catch-up' compense le fait qu'il n'a rien reçu dans les étapes 1-2). Étape 4 - Carried interest 80/20 : au-delà, les gains se partagent 80% aux LPs et 20% au GP. Exemple : fonds de 100 M€ qui retourne 250 M€ totaux. Étape 1 : 100 M€ aux LPs. Étape 2 : ~40 M€ aux LPs (8% sur 5 ans). Étape 3 : ~10 M€ au GP (catch-up). Étape 4 : 100 M€ restants → 80 M€ LPs + 20 M€ GP.",
      explanationEn: "European waterfall: Step 1) LPs get 100% of distributions until capital fully returned. Step 2) LPs get preferred return (~8%/year). Step 3) GP catch-up (100% to GP until GP has received 20% of total gains). Step 4) 80/20 split LPs/GP on remaining gains. Example: €100M fund returns €250M → €100M capital + ~€40M pref to LPs → ~€10M GP catch-up → remaining €100M split 80/20.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Qu'est-ce que le 'gun-jumping' en droit de la concurrence et quels sont ses risques ?",
      textEn: "What is 'gun-jumping' in competition law and what are its risks?",
      propositionsFr: [
        { text: "La mise en œuvre anticipée d'une opération de concentration avant l'obtention des autorisations réglementaires obligatoires, pouvant entraîner des amendes significatives", correct: true },
        { text: "Une stratégie d'acquisition agressive visant à prendre de vitesse un concurrent sur une cible commune", correct: false },
        { text: "La violation de la clause d'exclusivité d'un LOI en approchant d'autres acheteurs potentiels", correct: false },
        { text: "L'annonce prématurée d'une opération M&A avant la signature du SPA", correct: false },
      ],
      propositionsEn: [
        { text: "Implementing a concentration before obtaining mandatory regulatory clearances, potentially triggering significant fines", correct: true },
        { text: "An aggressive acquisition strategy to outpace a competitor on a shared target", correct: false },
        { text: "Violating LOI exclusivity by approaching other potential buyers", correct: false },
        { text: "Premature announcement of an M&A deal before SPA signing", correct: false },
      ],
      explanationFr: "Le gun-jumping est une violation grave du droit européen et américain de la concurrence. Avant l'autorisation des régulateurs (Commission européenne, AMF, DOJ/FTC), les parties ne peuvent pas : échanger des informations commerciales sensibles (prix, clients, stratégie), commencer à intégrer des opérations, modifier la structure concurrentielle. Exemple emblématique : Altice a été condamné à 80 M€ d'amende par l'Autorité de la Concurrence française en 2016 pour avoir exercé une influence déterminante sur SFR/Virgin Mobile avant l'autorisation. Les amendes UE peuvent atteindre 10% du chiffre d'affaires mondial. Bonne pratique : mettre en place des 'clean teams' (équipes séparées avec NDA interne) pour les échanges d'information nécessaires entre signing et closing.",
      explanationEn: "Gun-jumping: implementing a merger before regulatory clearance. Prohibited actions pre-clearance: exchanging sensitive commercial data, beginning integration, altering competitive dynamics. Major case: Altice fined €80M by French Competition Authority in 2016. EU fines can reach 10% of worldwide revenue. Best practice: use 'clean teams' for any necessary information exchanges between signing and closing.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment valoriser une entreprise en difficulté financière (distressed M&A) ?",
      textEn: "How do you value a financially distressed company (distressed M&A)?",
      propositionsFr: [
        { text: "On combine la valeur de liquidation (actifs à valeur de casse), la valeur de continuation (DCF avec redressement), et l'analyse des créanciers (qui contrôle les négociations via leur rang dans le waterfall)", correct: true },
        { text: "On applique une décote de 50% sur la valorisation standard par comparables boursiers", correct: false },
        { text: "On utilise uniquement l'actif net comptable car les méthodes de flux ne sont pas applicables en situation de détresse", correct: false },
        { text: "On valorise sur la base du dernier EBITDA avant la crise, en supposant un retour à la normale", correct: false },
      ],
      propositionsEn: [
        { text: "Combine liquidation value (distressed asset sales), going concern value (turnaround DCF), and creditor analysis (who controls negotiations based on waterfall ranking)", correct: true },
        { text: "Apply a 50% discount to standard trading comparable valuation", correct: false },
        { text: "Use book value only since cash flow methods don't apply to distressed situations", correct: false },
        { text: "Value based on last pre-crisis EBITDA, assuming a return to normal", correct: false },
      ],
      explanationFr: "Le distressed M&A requiert une approche radicalement différente. Trois angles d'analyse : 1) Valeur de liquidation : combien vaut chaque actif vendu séparément en urgence ? (décote de 30-50% sur la valeur comptable pour les actifs tangibles, proche de zéro pour les incorporels). C'est le plancher de valeur. 2) Valeur de continuation (going concern) : DCF avec hypothèses de redressement réalistes. Souvent très complexe car visibilité limitée. 3) Analyse de la structure de dette : dans une situation distressed, la valeur d'entreprise peut être inférieure à la dette totale. Les créanciers deviennent alors les vrais 'actionnaires économiques'. Ceux qui ont la dette la plus senior contrôlent les négociations. Un acheteur peut faire un 'credit bid' : racheter la dette décotée puis l'utiliser pour acquérir les actifs. Exemple : Toys'R'Us — les créanciers ont finalement liquidé malgré des offres de reprise.",
      explanationEn: "Distressed M&A requires three approaches: 1) Liquidation value (fire-sale prices, 30-50% discount on tangibles) — the floor. 2) Going concern DCF with turnaround assumptions. 3) Creditor analysis: if EV < total debt, creditors are the economic owners. Senior creditors control negotiations. Credit bid: buy distressed debt then use it to acquire assets. Key skill: knowing where value breaks in the capital stack.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Qu'est-ce qu'un 'secondary buyout' (SBO) et quels sont ses avantages et inconvénients ?",
      textEn: "What is a secondary buyout (SBO) and what are its pros and cons?",
      propositionsFr: [
        { text: "Un LBO où le vendeur est un autre fonds de Private Equity (et non un industriel ou des fondateurs), représentant aujourd'hui plus de 50% des transactions PE", correct: true },
        { text: "Un LBO réalisé par un fonds de deuxième génération sur une cible déjà cotée en Bourse", correct: false },
        { text: "La revente partielle des parts d'un fonds PE à des investisseurs secondaires avant la fin de la durée de vie du fonds", correct: false },
        { text: "Un rachat d'entreprise financé en second rang par des obligations à haut rendement après la dette senior", correct: false },
      ],
      propositionsEn: [
        { text: "An LBO where the seller is another PE fund (not a corporate or founder), now representing over 50% of PE transactions", correct: true },
        { text: "An LBO by a second-generation fund on an already-listed target", correct: false },
        { text: "A partial sale of a PE fund's shares to secondary investors before fund end", correct: false },
        { text: "A company buyout financed in second lien by high-yield bonds after senior debt", correct: false },
      ],
      explanationFr: "Le SBO est devenu dominant dans le marché PE. Avantages pour l'acheteur : entreprise déjà transformée par le premier fonds (processus optimisés, reporting financier, management pro), visibilité meilleure sur les performances. Avantages pour le vendeur (premier fonds) : liquidité rapide, valorisation premium possible si marché LBO chaud. Inconvénients : 'double leverage' (la société a déjà porté de la dette LBO pendant 4-5 ans), risque que les 'low-hanging fruits' opérationnels aient déjà été cueillis, prix d'entrée souvent élevé car le vendeur PE sait négocier. Questions posées en entretien : 'Quelles valeurs peut encore créer le deuxième fonds ?' (croissance externe, expansion internationale, amélioration de la marge, digital, nouvelle ligne de produits) vs 'Qu'est-ce qui justifie le prix élevé si les synergies évidentes sont déjà réalisées ?'",
      explanationEn: "SBO: PE sells to PE. Pros for buyer: already PE-optimized (processes, reporting, professionalized management). Pros for seller: quick liquidity, premium if LBO market hot. Cons: double leverage (company already carried LBO debt 4-5 years), easy wins already captured, high entry price (seller is sophisticated). Key interview question: 'What value can the second fund still create?'",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment fonctionne l'élection fiscale 338(h)(10) aux États-Unis et son équivalent en France ?",
      textEn: "How does the 338(h)(10) tax election work in the US and its French equivalent?",
      propositionsFr: [
        { text: "Permet à un acheteur de traiter fiscalement l'acquisition d'actions comme une acquisition d'actifs, obtenant un step-up de la base fiscale des actifs et des amortissements fiscaux supplémentaires", correct: true },
        { text: "Permet au vendeur d'exonérer complètement la plus-value de cession si les titres sont détenus depuis plus de 5 ans", correct: false },
        { text: "Permet à la holding LBO de consolider fiscalement la société acquise dès l'année de l'acquisition", correct: false },
        { text: "Permet de reporter indéfiniment la plus-value imposable en cas de réinvestissement dans un nouveau LBO", correct: false },
      ],
      propositionsEn: [
        { text: "Allows a buyer to treat a stock acquisition as an asset purchase for tax purposes, obtaining a step-up in asset tax basis and additional depreciation", correct: true },
        { text: "Allows the seller to fully exempt capital gains if shares held over 5 years", correct: false },
        { text: "Allows the LBO holding company to file a consolidated tax return with the acquired entity from year one", correct: false },
        { text: "Allows indefinite deferral of taxable gain if reinvested in a new LBO", correct: false },
      ],
      explanationFr: "La 338(h)(10) est un outil fiscal majeur en M&A américain. Dans un share deal classique, l'acheteur reprend la base fiscale historique des actifs (souvent très basse, car amortis). Avec la 338(h)(10) : les actifs sont traités comme acquis à leur juste valeur (prix de transaction), créant un 'step-up' fiscal. Les actifs peuvent ainsi être réamortis fiscalement → génère un bouclier fiscal additionnel. Le coût : le vendeur paie plus d'impôts (il est traité comme s'il avait vendu des actifs, plus imposé que la cession de titres). Solution : le vendeur exige une compensation ('gross-up') pour accepter l'élection 338(h)(10). En France, l'équivalent partiel est l'option pour l'intégration fiscale de groupe ou la déductibilité des charges financières d'acquisition via une holding.",
      explanationEn: "338(h)(10) lets buyer treat a stock deal as an asset deal for tax, stepping up asset tax basis to fair value → additional depreciation shield. Cost: seller faces higher taxes (treated as asset sale). Solution: seller demands a 'gross-up' payment. French equivalent: fiscal integration allowing interest deductibility at HoldCo level.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment analyser la qualité des revenus (Quality of Revenues) lors d'une due diligence financière approfondie ?",
      textEn: "How do you analyze revenue quality during an in-depth financial due diligence?",
      propositionsFr: [
        { text: "On analyse : récurrence (revenus contractuels vs spot), concentration client (top 5 clients = % du CA), visibilité (carnet de commandes), reconnaissance comptable, et signes de manipulation (canals stuffing, reconnaissance prématurée)", correct: true },
        { text: "On compare le chiffre d'affaires aux prévisions du budget annuel pour évaluer la fiabilité des projections du management", correct: false },
        { text: "On calcule la croissance organique en excluant les effets de change et d'acquisition pour isoler la performance intrinsèque", correct: false },
        { text: "On analyse l'évolution des marges brutes par ligne de produits pour identifier les segments les plus rentables", correct: false },
      ],
      propositionsEn: [
        { text: "Analyze: recurrence (contracted vs spot), customer concentration (top 5 = % revenue), visibility (order book), accounting recognition, manipulation signs (channel stuffing, premature recognition)", correct: true },
        { text: "Compare revenue to annual budget forecasts to assess management projection reliability", correct: false },
        { text: "Calculate organic growth excluding FX and acquisition effects to isolate intrinsic performance", correct: false },
        { text: "Analyze gross margin evolution by product line to identify most profitable segments", correct: false },
      ],
      explanationFr: "La QoR (Quality of Revenues) est au cœur de la due diligence financière. Les analystes vérifient : 1) Récurrence : SaaS à 90% de revenus récurrents (ARR) vs construction à 0% → profils de risque radicalement différents. NRR (Net Revenue Retention) : si >100%, les clients existants dépensent plus chaque année (signal fort). 2) Concentration : si le top 3 clients représente 60% du CA, risque majeur si l'un part. 3) Pricing power : les marges s'améliorent-elles malgré l'inflation ? Signe d'un vrai avantage compétitif. 4) Signes de manipulation : channel stuffing (on bourre les distributeurs avant la clôture), reconnaître un contrat pluriannuel en une seule fois, accords 'side-letter' modifiant les conditions après coup. 5) Backlog : carnet de commandes signé = visibilité sur les revenus futurs. Un backlog couvrant 12 mois de CA est rassurant.",
      explanationEn: "QoR analysis: 1) Recurrence: SaaS 90% ARR vs 0% in construction. NRR >100% = customers spend more each year. 2) Concentration: top 3 customers = 60% revenue → major risk. 3) Pricing power: margins improving despite inflation = genuine competitive advantage. 4) Manipulation signals: channel stuffing, premature multi-year contract recognition, side letters. 5) Backlog: 12+ months coverage = strong visibility.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Qu'est-ce qu'un 'staple financing' dans un processus de vente M&A ?",
      textEn: "What is 'staple financing' in an M&A sale process?",
      propositionsFr: [
        { text: "Un financement bancaire pré-arrangé par le vendeur et joint au mémorandum de vente, que les acheteurs peuvent utiliser pour financer l'acquisition, réduisant ainsi les incertitudes de financement", correct: true },
        { text: "Un financement relais (bridge) octroyé à court terme par les banques conseil pour permettre le closing rapide d'une acquisition", correct: false },
        { text: "Un mécanisme de financement où le vendeur accorde lui-même un prêt vendeur à l'acheteur pour faciliter la transaction", correct: false },
        { text: "Une ligne de crédit revolving mise en place par l'acquéreur auprès de ses banques habituelles pour financer une série d'acquisitions bolt-on", correct: false },
      ],
      propositionsEn: [
        { text: "Pre-arranged bank financing offered by the seller alongside the IM that buyers can use to fund the acquisition, reducing financing uncertainty", correct: true },
        { text: "A short-term bridge loan from advisor banks for rapid closing", correct: false },
        { text: "A vendor loan where the seller directly lends to the buyer to facilitate the deal", correct: false },
        { text: "A revolving credit facility the acquirer arranges with their usual banks for bolt-on acquisitions", correct: false },
      ],
      explanationFr: "Le staple financing est 'attaché' (stapled) au mémorandum d'information. Le vendeur mandate ses propres banques conseil pour pré-arranger un financement LBO que tout acheteur peut utiliser. Avantages pour le vendeur : accélère le processus (pas besoin d'attendre que chaque acheteur monte son propre financement), attire des acheteurs PE sans accès facile à la dette (émergents), réduit le risque de condition de financement. Controverse : les banques qui arrangent le staple conseil aussi le vendeur → conflit d'intérêt apparent (elles ont intérêt à une transaction rapide). En pratique, les grands fonds PE utilisent rarement le staple (ils ont leurs propres relations bancaires) mais les fonds mid-cap l'apprécient. Légalement, les banques doivent gérer soigneusement ce conflit avec des murailles de Chine.",
      explanationEn: "Staple financing is pre-arranged debt 'stapled' to the IM. Seller's banks structure an LBO financing any buyer can use. Benefits: speeds process, attracts PE buyers without strong banking relationships, reduces financing conditionality. Controversy: banks advising seller also arranging buyer financing → conflict of interest managed via information barriers.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment fonctionne une opération de 'carve-out' et quels sont ses défis spécifiques ?",
      textEn: "How does a carve-out work and what are its specific challenges?",
      propositionsFr: [
        { text: "Séparation d'une division d'un groupe en entité autonome (cession partielle, IPO de filiale ou spin-off), nécessitant de recréer toutes les fonctions support précédemment mutualisées avec le groupe", correct: true },
        { text: "La vente de l'ensemble du groupe à un seul acheteur, accompagnée d'un engagement de cession des actifs non stratégiques", correct: false },
        { text: "Un mécanisme de protection permettant à l'acheteur d'exclure certains actifs ou passifs de l'acquisition après signing", correct: false },
        { text: "Une opération d'introduction en Bourse d'une filiale tout en conservant 100% du capital", correct: false },
      ],
      propositionsEn: [
        { text: "Separating a division into an autonomous entity (partial sale, subsidiary IPO, or spin-off), requiring reconstruction of all support functions previously shared with the group", correct: true },
        { text: "Selling the entire group to one buyer with a commitment to divest non-core assets", correct: false },
        { text: "A protection mechanism allowing the buyer to exclude certain assets or liabilities after signing", correct: false },
        { text: "A stock market listing of a subsidiary while retaining 100% of capital", correct: false },
      ],
      explanationFr: "Le carve-out est l'une des opérations M&A les plus complexes. Défis spécifiques : 1) Séparation des systèmes IT : la division utilise les ERP du groupe (SAP, Oracle partagé) → coût de séparation élevé, Transition Service Agreements (TSA) nécessaires pendant 12-24 mois. 2) Fonctions support à recréer : comptabilité, RH, juridique, achats, trésorerie — coûts de standalone souvent sous-estimés. 3) Contrats partagés : rebadging des contrats clients/fournisseurs. 4) Marque : la division utilisait la marque du groupe → doit en développer une nouvelle ou payer une redevance. 5) Passifs alloués : comment allouer les retraites, litiges et dettes du groupe à la division ? Chaque point est négocié finement. Les acheteurs de carve-outs paient généralement un prix plus bas qu'un business équivalent standalone pour compenser ces complexités et risques.",
      explanationEn: "Carve-out specific challenges: 1) IT separation (shared ERP → TSAs needed 12-24 months). 2) Standalone cost of support functions underestimated. 3) Customer/vendor contract rebadging. 4) Brand transition (was using group brand). 5) Liability allocation (pensions, litigation, debt). Buyers price in a discount vs equivalent standalone business for these complexities.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment quantifier et modéliser les synergies de coûts dans un modèle M&A ?",
      textEn: "How do you quantify and model cost synergies in an M&A model?",
      propositionsFr: [
        { text: "On identifie les catégories de coûts redondants, on estime le potentiel de réduction pour chacune, on intègre les coûts de réalisation (restructuring) et on phase le déploiement dans le temps (montée en puissance sur 2-3 ans)", correct: true },
        { text: "On applique un taux de synergies standard de 15% des coûts combinés des deux sociétés, ajusté par le secteur", correct: false },
        { text: "On soustrait simplement les coûts du siège social de la cible dès le closing, en supposant une intégration immédiate", correct: false },
        { text: "On modélise les synergies comme un multiple de l'EBITDA combiné, sans distinction par catégorie de coût", correct: false },
      ],
      propositionsEn: [
        { text: "Identify redundant cost categories, estimate reduction potential for each, include restructuring costs, and phase deployment over time (ramp-up over 2-3 years)", correct: true },
        { text: "Apply a standard 15% synergy rate on combined costs, adjusted by sector", correct: false },
        { text: "Simply subtract target's HQ costs from day one, assuming immediate integration", correct: false },
        { text: "Model synergies as a multiple of combined EBITDA, without cost category distinction", correct: false },
      ],
      explanationFr: "La modélisation rigoureuse des synergies est un exercice clé dans tout modèle M&A. Étapes : 1) Cartographie des coûts : fonctions support (G&A : HR, Finance, Legal, IT), production (usines communes, achats groupés), commercial (forces de vente redondantes). 2) Estimation du potentiel brut par catégorie : G&A généralement 30-50% des coûts redondants éliminables, production 10-20%, commercial 15-25%. 3) Coûts de réalisation : chaque synergie a un coût (one-time) d'environ 1x le gain annuel (coûts de licenciement, fermeture d'usines, migration IT). 4) Phasage : les synergies ne sont pas immédiates. Courbe type : 20% en année 1, 60% en année 2, 100% en année 3. 5) Synergies nettes = synergies brutes − charges de restructuring amorties sur la période. Les fairness opinions testent si les synergies sont 'raisonnablement atteignables' vs 'optimistes'.",
      explanationEn: "Rigorous synergy modeling: 1) Map redundant cost areas (G&A, operations, commercial). 2) Estimate gross savings (G&A: 30-50% of overlapping costs). 3) Add implementation costs (~1x annual synergy as one-time charge). 4) Phase over time (20%/60%/100% over 3 years). 5) Net synergies = gross savings minus amortized restructuring charges.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Qu'est-ce qu'un 'continuation fund' (GP-led secondary) et pourquoi est-il devenu populaire ?",
      textEn: "What is a continuation fund (GP-led secondary) and why has it become popular?",
      propositionsFr: [
        { text: "Un nouveau fonds créé par le GP pour acquérir un ou plusieurs actifs de son fonds existant en fin de vie, permettant au GP de continuer à développer ces actifs au-delà du terme habituel du fonds", correct: true },
        { text: "Un fonds de fonds créé pour investir dans les parts secondaires de fonds PE arrivant à maturité", correct: false },
        { text: "Une extension automatique de la durée de vie d'un fonds PE approuvée unilatéralement par le GP sans accord des LPs", correct: false },
        { text: "Un mécanisme permettant à des LPs de racheter les parts d'autres LPs souhaitant sortir avant la fin du fonds", correct: false },
      ],
      propositionsEn: [
        { text: "A new fund created by the GP to acquire one or more assets from its existing end-of-life fund, allowing the GP to continue developing these assets beyond the usual fund term", correct: true },
        { text: "A fund of funds created to invest in secondary shares of maturing PE funds", correct: false },
        { text: "An automatic extension of a PE fund's life unilaterally approved by the GP without LP consent", correct: false },
        { text: "A mechanism allowing LPs to buy out other LPs wishing to exit before fund end", correct: false },
      ],
      explanationFr: "Les continuation funds ont explosé depuis 2018 pour plusieurs raisons. Contexte : un fonds PE approche de ses 10 ans. Il a un actif 'pépite' (company A) qui performe très bien mais n'est pas encore prêt pour une sortie optimale (croissance en cours, M&A build-up non terminé). Le GP crée un continuation fund qui rachète company A du fonds existant. Les anciens LPs ont le choix : soit ils vendent leurs parts au marché secondaire (liquidité), soit ils réinvestissent dans le continuation fund (continuité). Un nouveau pool d'investisseurs secondaires entre. Avantages pour le GP : conserver un actif qu'il connaît très bien, prendre du carried interest supplémentaire à la sortie finale. Controverses : conflit d'intérêt (GP fixe le prix de transfert), risque de 'evergreening' des mauvais actifs. Les LPs existants bénéficient d'un comité d'approbation indépendant et d'une fairness opinion.",
      explanationEn: "Continuation funds: GP transfers a star asset from a maturing fund into a new vehicle. Existing LPs choose: sell at secondary price (liquidity) or roll into the new fund (continuity). New secondary investors enter. Benefits: GP retains a high-quality asset it knows well, earns additional carry at final exit. Controversy: GP sets transfer price (conflict of interest) → requires independent advisory committee and fairness opinion.",
    },
    {
      domainId: maId, level: 3,
      textFr: "Comment fonctionne un 'credit bid' dans une procédure de faillite (redressement judiciaire) ?",
      textEn: "How does a credit bid work in a bankruptcy/restructuring proceeding?",
      propositionsFr: [
        { text: "Un créancier utilise sa créance (dette) comme monnaie d'échange pour acquérir les actifs du débiteur en faillite, sans apporter de cash, à hauteur de la valeur nominale de sa créance", correct: true },
        { text: "Un fonds de dette distressed achète la dette d'une société en faillite sur le marché secondaire avec une décote, puis la revend au pair après redressement", correct: false },
        { text: "Un créancier accorde un nouveau prêt (DIP financing) à la société en faillite pour financer sa restructuration", correct: false },
        { text: "Un mécanisme où les créanciers votent pour décider si la société doit être liquidée ou restructurée", correct: false },
      ],
      propositionsEn: [
        { text: "A creditor uses their claim (debt) as currency to acquire the debtor's assets in bankruptcy, without providing cash, up to the face value of their claim", correct: true },
        { text: "A distressed debt fund buys bankruptcy debt at a discount on the secondary market, then sells at par after turnaround", correct: false },
        { text: "A creditor provides new financing (DIP) to the bankrupt company to fund its restructuring", correct: false },
        { text: "A mechanism where creditors vote to decide between liquidation and restructuring", correct: false },
      ],
      explanationFr: "Le credit bid est une stratégie utilisée par les fonds de dette distressed (Oaktree, Apollo, etc.). Étape 1 : le fonds achète la dette senior d'une société en difficulté sur le marché secondaire à 60 centimes pour 1€ (soit 40% de décote). Étape 2 : la société dépose le bilan. Étape 3 : lors de la procédure de vente des actifs, le fonds 'soumissionne' avec sa créance (credit bid) pour 100% de sa valeur nominale — sans sortir de cash. Si sa créance vaut 100 M€ en nominal, il peut acquérir les actifs jusqu'à 100 M€. Mais il n'a payé que 60 M€ pour cette créance. Résultat : il acquiert les actifs à 60% de leur valeur nominale de dette. En France, cette technique est plus limitée car la procédure de sauvegarde/redressement judiciaire donne plus de pouvoir aux juges et au débiteur.",
      explanationEn: "Credit bid strategy: 1) Fund buys senior debt at 60 cents on the dollar. 2) Company files for bankruptcy. 3) Fund bids its full-face-value claim in the asset sale without additional cash. 4) If claim = €100M nominal, fund wins assets worth up to €100M but only paid €60M. Effective cost = 60% of asset value. More limited in France (sauvegarde procedure gives courts and debtor more power).",
    },
    {
      domainId: maId, level: 3,
      textFr: "Qu'est-ce que l'analyse LBO inversée (reverse LBO) et à quoi sert-elle ?",
      textEn: "What is a reverse LBO analysis and what is it used for?",
      propositionsFr: [
        { text: "Une méthode qui détermine le prix maximum qu'un fonds PE peut payer pour une cible en partant du rendement cible (IRR de 20-25%) et des hypothèses de sortie, et en remontant jusqu'au prix d'entrée", correct: true },
        { text: "L'analyse financière réalisée lors du rachat d'une entreprise précédemment cotée en Bourse qui avait fait l'objet d'un LBO", correct: false },
        { text: "Un modèle qui évalue la capacité d'une entreprise à rembourser sa dette LBO en cas de scénario adverse", correct: false },
        { text: "La transformation d'un modèle DCF en modèle LBO en remplaçant le WACC par le taux de rendement des fonds propres", correct: false },
      ],
      propositionsEn: [
        { text: "A method determining the maximum price a PE fund can pay for a target by starting from the target return (20-25% IRR) and exit assumptions, working back to the entry price", correct: true },
        { text: "The financial analysis during the re-acquisition of a previously-listed company that had undergone an LBO", correct: false },
        { text: "A model assessing a company's debt repayment ability under adverse scenarios", correct: false },
        { text: "Transforming a DCF model into an LBO model by replacing WACC with equity return rate", correct: false },
      ],
      explanationFr: "L'analyse LBO inversée est un outil de calibration du prix très utilisé par les fonds PE. Logique : au lieu de partir d'un prix et de calculer l'IRR, on part de l'IRR cible et on calcule le prix maximum payable. Exemple : le fonds cible 20% d'IRR minimum sur 5 ans. Sortie estimée à 8x EBITDA (= 80 M€ pour un EBITDA de sortie de 10 M€). FCF cumulé de 20 M€ sur 5 ans (rembourse la dette). Equity de sortie ≈ 80 − 30 (dette résiduelle) = 50 M€. Pour avoir 20% d'IRR : Equity entrée = 50 / (1+0,20)^5 = 50 / 2,49 = 20 M€. Donc le prix max avec levier total (20 M€ equity + 50 M€ dette) = 70 M€ d'EV. Si le marché demande 90 M€, le fonds doit soit renoncer soit trouver plus d'EBITDA (synergies) pour justifier le prix. L'analyse LBO inversée permet aussi de détecter les surévaluations : si le prix implicite pour atteindre l'IRR cible est significativement inférieur au prix demandé, la transaction n'est pas créatrice de valeur aux conditions actuelles.",
      explanationEn: "Reverse LBO works backwards from a target IRR to find maximum entry price. Example targeting 20% IRR over 5 years: exit equity = €50M → entry equity = €50M / (1.20)^5 = €20M → max EV = €20M equity + €50M debt = €70M. If market asks €90M, fund either passes or needs more EBITDA (synergies) to bridge the gap. Powerful tool for identifying overvaluation.",
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
