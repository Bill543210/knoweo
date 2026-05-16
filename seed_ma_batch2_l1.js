const { Client } = require('pg');

const client = new Client({
  host: 'localhost', port: 5432, user: 'postgres',
  password: '$Language1', database: 'knoweo',
});

async function seed() {
  await client.connect();
  const domains = await client.query('SELECT id, slug FROM domain');
  const domainMap = {};
  domains.rows.forEach(d => domainMap[d.slug] = d.id);
  const maId = domainMap['ma'];
  if (!maId) { console.error('Domaine ma introuvable'); process.exit(1); }

  const questions = [
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que la valeur des fonds propres (Equity Value) d'une entreprise ?",
      textEn: "What is the Equity Value of a company?",
      propositionsFr: [
        { text: "La valeur totale revenant aux actionnaires, calculée comme Valeur d'Entreprise moins la dette nette", correct: true },
        { text: "Le total des actifs inscrits au bilan", correct: false },
        { text: "Le chiffre d'affaires multiplié par un multiple sectoriel", correct: false },
        { text: "Le montant des dividendes versés sur les 12 derniers mois", correct: false },
      ],
      propositionsEn: [
        { text: "The total value belonging to shareholders, calculated as Enterprise Value minus net debt", correct: true },
        { text: "The total assets on the balance sheet", correct: false },
        { text: "Revenue multiplied by a sector multiple", correct: false },
        { text: "Dividends paid over the last 12 months", correct: false },
      ],
      explanationFr: "L'Equity Value (valeur des fonds propres) est la part de valeur qui revient aux actionnaires après remboursement de toutes les dettes. Formule : Equity Value = Enterprise Value − Dette Nette. Exemple concret : si une entreprise vaut 100 M€ (EV) et a 30 M€ de dette nette, l'Equity Value est 70 M€. C'est le prix qu'un acheteur paierait pour 100% des actions. En Bourse, l'Equity Value s'appelle la capitalisation boursière (cours × nombre d'actions).",
      explanationEn: "Equity Value is the value belonging to shareholders after repaying all debt. Formula: Equity Value = Enterprise Value − Net Debt.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que les synergies dans une opération M&A ?",
      textEn: "What are synergies in an M&A transaction?",
      propositionsFr: [
        { text: "Les gains de valeur supplémentaires créés par la combinaison de deux entreprises, impossibles à obtenir séparément", correct: true },
        { text: "Les frais de conseil et d'avocat payés lors de la transaction", correct: false },
        { text: "La prime payée au-dessus du cours de Bourse pour acquérir une société cotée", correct: false },
        { text: "Les intérêts payés sur la dette d'acquisition", correct: false },
      ],
      propositionsEn: [
        { text: "Value gains created by combining two companies that couldn't be achieved separately", correct: true },
        { text: "Advisory and legal fees paid during the transaction", correct: false },
        { text: "The premium paid above market price to acquire a listed company", correct: false },
        { text: "Interest paid on acquisition debt", correct: false },
      ],
      explanationFr: "Les synergies sont la raison principale de la plupart des acquisitions : 1+1 = 3. Il en existe deux types. Les synergies de coûts : réduction des charges via la mutualisation (ex: fermer des sièges sociaux redondants, réduire les fonctions support). Les synergies de revenus : nouvelles ventes grâce à la combinaison (ex: vendre les produits de l'acquéreur à la clientèle de la cible). Exemple : quand Carrefour acquiert un concurrent régional, il peut fermer des entrepôts communs (synergie de coûts) et référencer ses marques propres dans les magasins rachetés (synergie de revenus). Les acheteurs paient souvent une prime en anticipant ces synergies.",
      explanationEn: "Synergies are the main reason for most acquisitions: 1+1=3. Cost synergies reduce expenses (shared functions), revenue synergies increase sales (cross-selling). Buyers often pay a premium anticipating these gains.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une acquisition 'relutive' (accretive) par opposition à 'dilutive' ?",
      textEn: "What is an accretive vs dilutive acquisition?",
      propositionsFr: [
        { text: "Une acquisition est relutive si elle augmente le bénéfice par action (BPA) de l'acquéreur, dilutive si elle le diminue", correct: true },
        { text: "Une acquisition est relutive si le prix payé est supérieur à la valeur comptable de la cible", correct: false },
        { text: "Une acquisition est relutive si elle est financée entièrement par dette, dilutive si elle est financée par actions", correct: false },
        { text: "Une acquisition est relutive si elle génère des synergies de revenus, dilutive si elle génère seulement des synergies de coûts", correct: false },
      ],
      propositionsEn: [
        { text: "Accretive if it increases the acquirer's EPS, dilutive if it decreases EPS", correct: true },
        { text: "Accretive if the price paid exceeds the book value of the target", correct: false },
        { text: "Accretive if financed entirely by debt, dilutive if financed by shares", correct: false },
        { text: "Accretive if it generates revenue synergies, dilutive if only cost synergies", correct: false },
      ],
      explanationFr: "L'analyse relution/dilution est une question classique d'entretien M&A. Si l'acquéreur A a un BPA de 2€ et qu'après l'acquisition son BPA monte à 2,20€, l'acquisition est relutive (+10%). Si le BPA tombe à 1,80€, elle est dilutive. Les acquisitions payées en actions sont souvent dilutives car on émet des actions nouvelles. Les acquisitions payées en cash (avec de la dette bon marché) peuvent être relutives si le rendement des bénéfices de la cible dépasse le coût de la dette. Un acquéreur avec un PER élevé achetant une cible à PER faible sera typiquement relutif.",
      explanationEn: "Accretive if EPS increases post-acquisition, dilutive if EPS decreases. Classic M&A interview question. Cash acquisitions (cheap debt) tend to be accretive; share-financed ones often dilutive.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le goodwill (écart d'acquisition) dans un bilan post-acquisition ?",
      textEn: "What is goodwill (acquisition premium) on a post-acquisition balance sheet?",
      propositionsFr: [
        { text: "La différence entre le prix payé pour acquérir une société et la juste valeur de ses actifs nets identifiables", correct: true },
        { text: "La valeur des brevets et marques déposées de la société acquise", correct: false },
        { text: "Le montant de la dette reprise lors de l'acquisition", correct: false },
        { text: "La réserve légale constituée pour couvrir les pertes futures éventuelles", correct: false },
      ],
      propositionsEn: [
        { text: "The difference between the price paid and the fair value of net identifiable assets acquired", correct: true },
        { text: "The value of patents and trademarks of the acquired company", correct: false },
        { text: "The debt assumed in the acquisition", correct: false },
        { text: "A legal reserve set aside for future potential losses", correct: false },
      ],
      explanationFr: "Le goodwill apparaît automatiquement au bilan de l'acquéreur après une acquisition. Exemple chiffré : tu achètes une PME 10 M€. Ses actifs nets (actifs − passifs) valent 6 M€ à leur juste valeur. Le goodwill = 10 − 6 = 4 M€. Ce goodwill représente ce que tu as payé pour des éléments non quantifiables : la marque, les équipes, les relations clients, la position concurrentielle. En normes IFRS, le goodwill n'est pas amorti mais fait l'objet d'un test de dépréciation annuel (impairment test). Si la valeur se dégrade, on enregistre une dépréciation qui impacte le résultat.",
      explanationEn: "Goodwill = Price paid − Fair value of net identifiable assets. Example: pay €10M for a company with €6M net assets → €4M goodwill. Represents brand, teams, customer relationships. Under IFRS, tested annually for impairment.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Quelle est la différence entre une acquisition d'actions (share deal) et une acquisition d'actifs (asset deal) ?",
      textEn: "What is the difference between a share deal and an asset deal?",
      propositionsFr: [
        { text: "Dans un share deal, l'acheteur acquiert les titres de la société (et reprend tous ses passifs) ; dans un asset deal, il n'achète que les actifs sélectionnés", correct: true },
        { text: "Un share deal concerne uniquement les sociétés cotées en Bourse, un asset deal les sociétés privées", correct: false },
        { text: "Dans un share deal, la cible garde son autonomie ; dans un asset deal, elle est fusionnée immédiatement", correct: false },
        { text: "Un asset deal est toujours plus cher qu'un share deal car il inclut une prime de contrôle", correct: false },
      ],
      propositionsEn: [
        { text: "In a share deal, the buyer acquires shares (and inherits all liabilities); in an asset deal, only selected assets are purchased", correct: true },
        { text: "A share deal only applies to listed companies; an asset deal to private ones", correct: false },
        { text: "In a share deal the target stays independent; in an asset deal it merges immediately", correct: false },
        { text: "An asset deal is always more expensive because it includes a control premium", correct: false },
      ],
      explanationFr: "C'est un choix structurel fondamental. Share deal : l'acheteur achète 100% des actions → il hérite de TOUT, y compris les passifs cachés, litiges, dettes fiscales. Avantage pour le vendeur : souvent plus simple fiscalement. Asset deal : l'acheteur choisit quels actifs il reprend (machines, clients, contrats) et quels passifs il exclut. Avantage pour l'acheteur : il ne reprend pas les squelettes dans le placard. En pratique, les acheteurs préfèrent souvent les asset deals pour se protéger, mais les vendeurs résistent car les plus-values sur cession d'actifs sont plus imposées que la cession de titres.",
      explanationEn: "Share deal: buyer buys all shares and inherits everything (including hidden liabilities). Asset deal: buyer cherry-picks assets and excludes unwanted liabilities. Buyers prefer asset deals for protection; sellers prefer share deals for tax efficiency.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une OPA hostile (takeover hostile) ?",
      textEn: "What is a hostile takeover?",
      propositionsFr: [
        { text: "Une tentative d'acquisition d'une société cotée directement auprès des actionnaires, contre l'avis du conseil d'administration de la cible", correct: true },
        { text: "Une acquisition réalisée à un prix très inférieur à la valeur de marché de la cible", correct: false },
        { text: "Une fusion forcée ordonnée par le régulateur en cas de monopole", correct: false },
        { text: "Un rachat de dette d'une entreprise en difficultés financières", correct: false },
      ],
      propositionsEn: [
        { text: "An attempt to acquire a listed company directly from shareholders, against the target board's wishes", correct: true },
        { text: "An acquisition at a price far below the target's market value", correct: false },
        { text: "A regulator-mandated forced merger to prevent monopoly", correct: false },
        { text: "A debt buyback of a financially distressed company", correct: false },
      ],
      explanationFr: "Dans une OPA hostile, l'acquéreur court-circuite le management en s'adressant directement aux actionnaires avec une offre d'achat attractive (toujours à prime par rapport au cours). Le conseil d'administration de la cible s'y oppose mais les actionnaires peuvent vendre leurs titres s'ils trouvent le prix intéressant. Exemple célèbre : la tentative de rachat de Danone par PepsiCo en 2005 (finalement avortée sous pression politique). Les défenses anti-OPA incluent la pilule empoisonnée, le chevalier blanc, les bons de souscription d'actions (BSA), ou encore des clauses d'agrément dans les statuts.",
      explanationEn: "In a hostile takeover, the acquirer bypasses management by offering shareholders a premium directly. The board opposes it but shareholders can accept. Classic defenses: poison pill, white knight, staggered board.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'un 'chevalier blanc' (white knight) en M&A ?",
      textEn: "What is a white knight in M&A?",
      propositionsFr: [
        { text: "Un acquéreur alternatif et amical sollicité par la direction de la cible pour contrer une OPA hostile", correct: true },
        { text: "Un conseiller juridique spécialisé dans la défense des sociétés face aux OPA", correct: false },
        { text: "Un actionnaire de référence qui détient une participation protectrice dans la cible", correct: false },
        { text: "Un régulateur qui bloque une acquisition jugée contraire à l'intérêt national", correct: false },
      ],
      propositionsEn: [
        { text: "A friendly alternative acquirer solicited by the target's management to counter a hostile bid", correct: true },
        { text: "A legal advisor specializing in takeover defense", correct: false },
        { text: "A reference shareholder holding a protective stake in the target", correct: false },
        { text: "A regulator that blocks an acquisition deemed against national interest", correct: false },
      ],
      explanationFr: "Quand une société fait l'objet d'une OPA hostile, son management peut chercher activement un 'chevalier blanc' : un acquéreur amical qui fera une offre alternative plus favorable aux dirigeants et aux salariés, ou mieux payée pour les actionnaires. Exemple : lors de la tentative de rachat hostile de Yahoo par Microsoft en 2008, Yahoo a cherché un chevalier blanc (des discussions ont eu lieu avec Time Warner et AOL). Le chevalier blanc paie généralement une prime car il est en compétition avec l'acquéreur hostile.",
      explanationEn: "When facing a hostile bid, the target's management seeks a friendly alternative acquirer (white knight) who makes a competing offer more favorable to management or shareholders. Example: Yahoo sought a white knight during Microsoft's hostile bid in 2008.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une 'pilule empoisonnée' (poison pill) en M&A ?",
      textEn: "What is a poison pill in M&A?",
      propositionsFr: [
        { text: "Un mécanisme de défense anti-OPA qui dilue massivement les actions si un acquéreur dépasse un seuil de détention, rendant l'acquisition très coûteuse", correct: true },
        { text: "Une clause contractuelle obligeant l'acquéreur à payer une indemnité si la transaction échoue", correct: false },
        { text: "Une dette toxique que la société cible contracte pour se rendre moins attractive", correct: false },
        { text: "Un accord de non-agression entre deux concurrents pour éviter les acquisitions mutuelles", correct: false },
      ],
      propositionsEn: [
        { text: "An anti-takeover defense that massively dilutes shares if an acquirer exceeds a threshold, making the acquisition very expensive", correct: true },
        { text: "A clause requiring the acquirer to pay a break-up fee if the deal fails", correct: false },
        { text: "Toxic debt the target takes on to become less attractive", correct: false },
        { text: "A non-aggression pact between competitors to avoid mutual acquisitions", correct: false },
      ],
      explanationFr: "La pilule empoisonnée (Rights Plan) est la défense anti-OPA la plus répandue aux États-Unis. Elle fonctionne ainsi : les statuts prévoient que si un acquéreur dépasse un seuil (souvent 15-20% du capital), tous les autres actionnaires peuvent acheter des actions nouvelles à moitié prix, diluant massivement l'acquéreur hostile. Résultat : l'acquisition devient extrêmement coûteuse. En France, les BSA défensifs jouent un rôle similaire. Les pilules empoisonnées ne bloquent pas définitivement une OPA mais obligent l'acquéreur à négocier avec le conseil d'administration.",
      explanationEn: "A Rights Plan triggers when an acquirer crosses a threshold (typically 15-20%), allowing all other shareholders to buy new shares at half price, massively diluting the hostile acquirer. Forces negotiation with the board.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le free cash flow (flux de trésorerie libre) d'une entreprise ?",
      textEn: "What is the free cash flow of a company?",
      propositionsFr: [
        { text: "Le cash généré par l'activité après paiement des investissements (capex), disponible pour rembourser les dettes ou rémunérer les actionnaires", correct: true },
        { text: "Le solde du compte bancaire de l'entreprise à la fin de l'exercice", correct: false },
        { text: "Le résultat net après déduction des impôts et des amortissements", correct: false },
        { text: "La différence entre le chiffre d'affaires et les charges variables", correct: false },
      ],
      propositionsEn: [
        { text: "Cash generated from operations after capex, available to repay debt or reward shareholders", correct: true },
        { text: "The bank account balance at year-end", correct: false },
        { text: "Net income after taxes and depreciation", correct: false },
        { text: "The difference between revenue and variable costs", correct: false },
      ],
      explanationFr: "Le Free Cash Flow (FCF) est le vrai cash que l'entreprise génère et peut utiliser librement. Formule simplifiée : FCF = EBITDA − Impôts − Variation de BFR − Capex. Exemple : une entreprise a un EBITDA de 20 M€, paie 5 M€ d'impôts, investit 8 M€ en capex et sa variation de BFR est nulle → FCF = 20 − 5 − 8 = 7 M€. C'est ce cash de 7 M€ qui peut rembourser la dette LBO ou être distribué en dividendes. Les modèles DCF se basent entièrement sur la projection des FCF futurs.",
      explanationEn: "FCF = EBITDA − Taxes − Change in Working Capital − Capex. The real cash a business generates to repay debt or reward shareholders. DCF models are built on projected FCFs.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le WACC (coût moyen pondéré du capital) ?",
      textEn: "What is WACC (Weighted Average Cost of Capital)?",
      propositionsFr: [
        { text: "Le taux de rendement minimum exigé par l'ensemble des pourvoyeurs de fonds (actionnaires et créanciers), pondéré par leur part respective dans le financement", correct: true },
        { text: "Le taux d'intérêt moyen payé sur l'ensemble des dettes de l'entreprise", correct: false },
        { text: "Le rendement moyen des investissements réalisés par l'entreprise sur les 5 dernières années", correct: false },
        { text: "Le coût comptable des fonds propres inscrit au bilan", correct: false },
      ],
      propositionsEn: [
        { text: "The minimum return required by all capital providers (equity and debt), weighted by their respective share of financing", correct: true },
        { text: "The average interest rate paid on all company debt", correct: false },
        { text: "The average return on investments made over the last 5 years", correct: false },
        { text: "The book cost of equity on the balance sheet", correct: false },
      ],
      explanationFr: "Le WACC est le taux d'actualisation utilisé dans les modèles DCF. Formule : WACC = (E/V × Ke) + (D/V × Kd × (1−T)), où E = fonds propres, D = dette, V = E+D, Ke = coût des fonds propres, Kd = coût de la dette, T = taux d'imposition. Exemple : si 60% du financement est en fonds propres (coût 12%) et 40% en dette (coût 5%, taux IS 25%) → WACC = 60%×12% + 40%×5%×75% = 7,2% + 1,5% = 8,7%. Le WACC diminue avec l'endettement (la dette coûte moins cher et génère un bouclier fiscal) jusqu'à un point où le risque de faillite l'emporte.",
      explanationEn: "WACC = (E/V × Cost of Equity) + (D/V × Cost of Debt × (1−Tax Rate)). The discount rate used in DCF models. Reflects the blended return required by all capital providers.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'un multiple EV/Revenus (Price-to-Sales) et quand est-il utilisé ?",
      textEn: "What is an EV/Revenue multiple and when is it used?",
      propositionsFr: [
        { text: "La Valeur d'Entreprise divisée par le chiffre d'affaires ; utilisé pour les sociétés non rentables ou à forte croissance", correct: true },
        { text: "Le cours de l'action divisé par le chiffre d'affaires par action ; utilisé uniquement pour les sociétés cotées", correct: false },
        { text: "L'EBITDA divisé par le chiffre d'affaires ; mesure la profitabilité opérationnelle", correct: false },
        { text: "La valeur comptable des actifs divisée par le chiffre d'affaires annuel", correct: false },
      ],
      propositionsEn: [
        { text: "Enterprise Value divided by revenue; used for unprofitable or high-growth companies", correct: true },
        { text: "Share price divided by revenue per share; used only for listed companies", correct: false },
        { text: "EBITDA divided by revenue; measures operational profitability", correct: false },
        { text: "Book value of assets divided by annual revenue", correct: false },
      ],
      explanationFr: "Le multiple EV/Revenus est utilisé quand l'EBITDA est négatif ou non significatif : startups, scale-ups, sociétés en phase d'investissement. Exemple : une startup SaaS avec 10 M€ de revenus et un EBITDA négatif se valorise 50 M€ → multiple EV/Revenus = 5x. En 2021, des sociétés SaaS se traitaient à 20-40x les revenus ! Il faut combiner ce multiple avec le taux de croissance : un 5x revenus pour une société qui croît à 50%/an est très différent d'un 5x pour une société stable.",
      explanationEn: "EV/Revenue is used when EBITDA is negative or not meaningful: startups, SaaS, high-growth companies. Example: SaaS startup with €10M revenue at €50M valuation = 5x EV/Revenue. Must be combined with growth rate context.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'un 'golden parachute' (parachute doré) ?",
      textEn: "What is a golden parachute?",
      propositionsFr: [
        { text: "Des indemnités de départ très élevées garanties contractuellement aux dirigeants en cas de changement de contrôle", correct: true },
        { text: "Une participation au capital offerte aux dirigeants lors d'un LBO pour aligner leurs intérêts avec ceux des investisseurs", correct: false },
        { text: "Une clause permettant aux fondateurs de conserver le contrôle malgré une faible participation au capital", correct: false },
        { text: "Un plan de retraite complémentaire réservé aux cadres dirigeants", correct: false },
      ],
      propositionsEn: [
        { text: "Very large severance packages contractually guaranteed to executives upon a change of control", correct: true },
        { text: "Equity participation offered to executives in an LBO to align their interests with investors", correct: false },
        { text: "A clause allowing founders to retain control despite a low equity stake", correct: false },
        { text: "A supplementary pension plan reserved for senior executives", correct: false },
      ],
      explanationFr: "Les golden parachutes sont des clauses dans les contrats des dirigeants prévoyant des indemnités massives (souvent 2-3 ans de rémunération totale) si le dirigeant est évincé suite à une OPA. Double effet : pour le dirigeant, c'est une protection personnelle. Pour l'acquéreur, c'est un coût à intégrer dans la transaction. Certains voient aussi dans les golden parachutes un mécanisme anti-OPA car ils renchérissent le coût d'acquisition. Légalement, en France, leur montant est plafonné à 2 ans de rémunération et soumis à l'approbation des actionnaires.",
      explanationEn: "Large severance packages guaranteed to executives upon a change of control, often 2-3 years of total compensation. Adds cost to acquisitions. In France, capped at 2 years of compensation and require shareholder approval.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que la prime de contrôle dans une acquisition ?",
      textEn: "What is a control premium in an acquisition?",
      propositionsFr: [
        { text: "Le supplément de prix payé au-dessus de la valeur de marché d'une action pour obtenir le contrôle d'une société", correct: true },
        { text: "La commission versée à la banque conseil pour avoir trouvé la transaction", correct: false },
        { text: "La différence entre la valeur comptable et la valeur de marché des actifs", correct: false },
        { text: "Le surcoût lié aux contraintes réglementaires lors d'une acquisition transfrontalière", correct: false },
      ],
      propositionsEn: [
        { text: "The additional price paid above market value to obtain control of a company", correct: true },
        { text: "The fee paid to the advisor for finding the deal", correct: false },
        { text: "The difference between book value and market value of assets", correct: false },
        { text: "The additional cost from regulatory constraints in cross-border deals", correct: false },
      ],
      explanationFr: "Sur le marché, une action de Total vaut 60€. Mais si tu veux racheter 100% de Total, tu devras offrir 80€ par action (prime de contrôle de 33%) car les actionnaires n'accepteront de vendre que si le prix est attractif. Cette prime de contrôle historiquement tourne autour de 20-40% dans les OPA. Elle se justifie par la valeur du contrôle : décider de la stratégie, des dividendes, de la direction. En M&A privé, la prime de contrôle est souvent implicite dans le multiple de valorisation retenu.",
      explanationEn: "The premium above market value paid to obtain control. Historically 20-40% in public takeovers. Justified by the value of control: strategic decisions, dividends, management. Example: stock at €60 → acquisition offer at €80 = 33% premium.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que la méthode des DCF (Discounted Cash Flows) en valorisation ?",
      textEn: "What is the DCF (Discounted Cash Flows) valuation method?",
      propositionsFr: [
        { text: "Une méthode qui valorise une entreprise en actualisant ses flux de trésorerie futurs au coût moyen pondéré du capital", correct: true },
        { text: "Une méthode qui compare le cours de Bourse de l'entreprise à celui de ses concurrents cotés", correct: false },
        { text: "Une méthode qui valorise l'entreprise à la valeur de remplacement de ses actifs", correct: false },
        { text: "Une méthode qui calcule la valeur liquidative de l'entreprise en cas de faillite", correct: false },
      ],
      propositionsEn: [
        { text: "A method that values a company by discounting future cash flows at the WACC", correct: true },
        { text: "A method comparing the company's stock price to listed peers", correct: false },
        { text: "A method valuing the company at the replacement cost of its assets", correct: false },
        { text: "A method calculating liquidation value in case of bankruptcy", correct: false },
      ],
      explanationFr: "Le DCF est la méthode de valorisation fondamentale : la valeur d'une entreprise = la valeur actuelle de tous ses cash flows futurs. Étapes : 1) Projeter les FCF sur 5-10 ans. 2) Calculer une valeur terminale (ce que vaut l'entreprise au-delà). 3) Actualiser tout au WACC. Exemple simplifié : une entreprise génère 10 M€/an de FCF à l'infini avec un WACC de 10% → valeur = 10/10% = 100 M€. Le DCF est très sensible aux hypothèses (taux de croissance, WACC). C'est pourquoi on dit souvent qu'il 'prouve' n'importe quelle valorisation si on choisit les bonnes hypothèses.",
      explanationEn: "DCF values a company by projecting future FCFs and discounting them at the WACC. Highly sensitive to assumptions. Simple example: €10M annual FCF in perpetuity at 10% WACC = €100M value.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le BFR (Besoin en Fonds de Roulement) ?",
      textEn: "What is Working Capital (BFR)?",
      propositionsFr: [
        { text: "Le capital nécessaire pour financer le décalage entre encaissements et décaissements dans le cycle d'exploitation", correct: true },
        { text: "Le montant minimum de fonds propres exigé par les banques pour accorder un prêt", correct: false },
        { text: "La réserve de cash maintenue pour faire face aux imprévus opérationnels", correct: false },
        { text: "La différence entre les investissements réalisés et les amortissements comptabilisés", correct: false },
      ],
      propositionsEn: [
        { text: "Capital needed to finance the gap between cash inflows and outflows in the operating cycle", correct: true },
        { text: "Minimum equity required by banks to grant a loan", correct: false },
        { text: "Cash reserve maintained for operational emergencies", correct: false },
        { text: "The difference between investments made and depreciation recorded", correct: false },
      ],
      explanationFr: "Le BFR = Stocks + Créances clients − Dettes fournisseurs. Exemple : une entreprise achète des matières premières à ses fournisseurs (qu'elle paie à 30 jours), les transforme (stocks), puis vend à ses clients (qui paient à 60 jours). Pendant ces 90 jours, elle doit financer le cycle seule. Si BFR = 5 M€, l'entreprise a besoin de 5 M€ de cash 'bloqué' en permanence dans son cycle. En M&A, la variation de BFR est cruciale : une entreprise en forte croissance consomme du cash même si elle est rentable (son BFR augmente). C'est pourquoi on distingue rentabilité et génération de cash.",
      explanationEn: "Working Capital = Receivables + Inventory − Payables. Finances the gap between paying suppliers and collecting from customers. Growing companies often consume cash despite being profitable because working capital increases.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'un SPAC (Special Purpose Acquisition Company) ?",
      textEn: "What is a SPAC (Special Purpose Acquisition Company)?",
      propositionsFr: [
        { text: "Une société 'chèque en blanc' sans activité qui lève des fonds en Bourse dans le seul but d'acquérir une société privée dans un délai de 2 ans", correct: true },
        { text: "Un fonds de Private Equity spécialisé dans les acquisitions dans un secteur spécifique", correct: false },
        { text: "Un véhicule juridique utilisé pour regrouper plusieurs petites acquisitions en une seule entité", correct: false },
        { text: "Une société holding créée spécifiquement pour les opérations de LBO en Europe", correct: false },
      ],
      propositionsEn: [
        { text: "A blank-check company with no operations that raises money on the stock market solely to acquire a private company within 2 years", correct: true },
        { text: "A private equity fund specializing in acquisitions in a specific sector", correct: false },
        { text: "A legal vehicle used to group several small acquisitions into one entity", correct: false },
        { text: "A holding company specifically created for LBO transactions in Europe", correct: false },
      ],
      explanationFr: "Le SPAC est une alternative à l'IPO classique. Fonctionnement : un sponsor (souvent un ancien CEO ou un investisseur connu) crée une coquille vide, l'introduit en Bourse, lève 200 M€ par exemple, puis a 18-24 mois pour trouver et acquérir une société privée. Pour la cible, c'est une façon de devenir cotée sans IPO classique (plus rapide, moins d'incertitude sur le prix). Les SPAC ont explosé en 2020-2021 (plus de 600 aux États-Unis) puis se sont effondrés en 2022 face aux piètres performances post-fusion. Les investisseurs dans le SPAC peuvent récupérer leur mise si aucune acquisition n'est réalisée.",
      explanationEn: "A SPAC is a blank-check shell company that IPOs to raise funds, then hunts for a private company to acquire within 18-24 months. Gives private companies a faster, more certain path to public markets. Boomed in 2020-21, collapsed in 2022.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que la valeur terminale (terminal value) dans un modèle DCF ?",
      textEn: "What is the terminal value in a DCF model?",
      propositionsFr: [
        { text: "La valeur de l'entreprise au-delà de la période de projection explicite, calculée comme une rente perpétuelle ou un multiple de sortie", correct: true },
        { text: "La valeur de liquidation des actifs à la fin de la durée de vie prévue de l'entreprise", correct: false },
        { text: "La valeur résiduelle du goodwill après amortissement sur la durée du modèle", correct: false },
        { text: "Le dernier flux de trésorerie modélisé explicitement dans le business plan", correct: false },
      ],
      propositionsEn: [
        { text: "The value of the company beyond the explicit projection period, calculated as a perpetuity or exit multiple", correct: true },
        { text: "The liquidation value of assets at the end of the company's projected lifespan", correct: false },
        { text: "Residual goodwill value after amortization over the model period", correct: false },
        { text: "The last cash flow explicitly modeled in the business plan", correct: false },
      ],
      explanationFr: "Dans un DCF, on projette explicitement les FCF sur 5-10 ans. Mais l'entreprise continuera à exister au-delà. La valeur terminale capte cette valeur résiduelle. Deux méthodes : 1) Gordon Growth Model : TV = FCF_n × (1+g) / (WACC − g), où g est le taux de croissance perpétuelle (souvent 2-3%). 2) Multiple de sortie : TV = EBITDA_n × multiple. Attention : la valeur terminale représente souvent 60-80% de la valeur totale du DCF ! C'est le paramètre le plus sensible. Un changement de 0,5% du taux de croissance perpétuelle peut modifier la valorisation de 20-30%.",
      explanationEn: "Terminal value captures value beyond the explicit projection period. Two methods: Gordon Growth (FCF × (1+g)/(WACC−g)) or exit multiple. Critical: often 60-80% of total DCF value. Extremely sensitive to assumptions.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une lettre d'intention (LOI - Letter of Intent) en M&A ?",
      textEn: "What is a Letter of Intent (LOI) in M&A?",
      propositionsFr: [
        { text: "Un document non contraignant qui formalise l'accord de principe entre acheteur et vendeur sur les grandes lignes de la transaction avant la due diligence", correct: true },
        { text: "Le contrat définitif et juridiquement contraignant qui conclut la transaction M&A", correct: false },
        { text: "Un mandat donné à une banque d'affaires pour trouver des acquéreurs potentiels", correct: false },
        { text: "Une lettre d'exclusivité signée par l'acheteur s'engageant à ne pas approcher d'autres cibles", correct: false },
      ],
      propositionsEn: [
        { text: "A non-binding document formalizing the buyer-seller agreement on deal terms before due diligence", correct: true },
        { text: "The definitive and legally binding contract that closes the M&A transaction", correct: false },
        { text: "A mandate given to an investment bank to find potential acquirers", correct: false },
        { text: "An exclusivity letter signed by the buyer committing not to approach other targets", correct: false },
      ],
      explanationFr: "La LOI (aussi appelée Mémorandum of Understanding ou Term Sheet) est signée après les premières négociations et AVANT la due diligence approfondie. Elle précise : le prix indicatif ou la fourchette de valorisation, la structure de la transaction (cash, actions, earn-out), les conditions suspensives principales, la durée d'exclusivité accordée à l'acheteur (souvent 4-8 semaines), le planning envisagé. Bien qu'elle soit généralement non contraignante sur le prix, certaines clauses sont juridiquement opposables : la confidentialité, l'exclusivité et les frais en cas de rupture (break-up fees).",
      explanationEn: "A LOI is signed after initial negotiations but before due diligence. Sets indicative price, deal structure, exclusivity period (4-8 weeks), and key conditions. Generally non-binding on price but exclusivity and confidentiality clauses are legally binding.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le ratio P/E (Price-to-Earnings) ?",
      textEn: "What is the P/E ratio (Price-to-Earnings)?",
      propositionsFr: [
        { text: "Le cours de l'action divisé par le bénéfice par action ; indique combien les investisseurs paient pour 1€ de bénéfice", correct: true },
        { text: "La valeur d'entreprise divisée par l'EBITDA ; le multiple de valorisation le plus courant en M&A", correct: false },
        { text: "Le résultat net divisé par le chiffre d'affaires ; mesure la marge nette de l'entreprise", correct: false },
        { text: "Le cours de l'action divisé par la valeur comptable des fonds propres par action", correct: false },
      ],
      propositionsEn: [
        { text: "Share price divided by earnings per share; shows how much investors pay for €1 of earnings", correct: true },
        { text: "Enterprise Value divided by EBITDA; the most common M&A valuation multiple", correct: false },
        { text: "Net income divided by revenue; measures net profit margin", correct: false },
        { text: "Share price divided by book value of equity per share", correct: false },
      ],
      explanationFr: "Le P/E (ou PER en français) est le multiple le plus connu en Bourse. Exemple : si une action vaut 40€ et que le BPA est 2€, le P/E = 20x. Cela signifie que les investisseurs paient 20 ans de bénéfices. Un P/E élevé (>25x) indique des attentes de croissance forte. Un P/E faible (<10x) indique soit une décote soit une entreprise mature à faible croissance. En M&A, on préfère l'EV/EBITDA qui est indépendant de la structure financière (le P/E est affecté par l'endettement). Le P/E est utile pour comparer des sociétés du même secteur avec des structures financières similaires.",
      explanationEn: "P/E = Share Price / EPS. Shows how many years of earnings investors are paying. High P/E = growth expectations. Low P/E = mature or undervalued company. M&A practitioners prefer EV/EBITDA as it's capital-structure neutral.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le taux de rendement interne (TRI ou IRR) ?",
      textEn: "What is the Internal Rate of Return (IRR)?",
      propositionsFr: [
        { text: "Le taux d'actualisation qui rend la valeur actuelle nette (VAN) d'un investissement égale à zéro, représentant le rendement annualisé de l'investissement", correct: true },
        { text: "Le taux d'intérêt maximum que l'entreprise peut payer sur sa dette sans compromettre sa solvabilité", correct: false },
        { text: "Le taux de croissance annuel composé du chiffre d'affaires sur la période d'analyse", correct: false },
        { text: "Le rendement moyen de dividendes versés aux actionnaires sur les 5 dernières années", correct: false },
      ],
      propositionsEn: [
        { text: "The discount rate that makes the Net Present Value of an investment equal to zero, representing the annualized return", correct: true },
        { text: "The maximum interest rate a company can pay on debt without compromising solvency", correct: false },
        { text: "The compound annual growth rate of revenue over the analysis period", correct: false },
        { text: "The average dividend yield paid to shareholders over the last 5 years", correct: false },
      ],
      explanationFr: "L'IRR est LA métrique de rendement en Private Equity et M&A. Exemple : un fonds PE investit 100 M€ et récupère 200 M€ après 5 ans → IRR ≈ 15%. Interprétation : c'est comme si l'argent avait rapporté 15% par an. En LBO, les fonds PE visent généralement 20-25% d'IRR. Plus la sortie est rapide, plus l'IRR est élevé (même avec le même multiple de cash). C'est pourquoi les investisseurs PE suivent aussi le Multiple of Money (MoM = cash reçu / cash investi) pour comparer des investissements de durées différentes : 2x en 2 ans ou 2x en 5 ans ont des IRR très différents (41% vs 15%).",
      explanationEn: "IRR is THE return metric in PE/M&A. The discount rate making NPV = 0. PE funds target 20-25% IRR in LBOs. Quick exits generate higher IRR. Always pair IRR with Money-on-Money (MoM) to account for investment duration.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'un dividend recap (recapitalisation par dividende) dans un LBO ?",
      textEn: "What is a dividend recapitalization in an LBO?",
      propositionsFr: [
        { text: "Une opération où la société rachetée en LBO contracte une dette supplémentaire pour verser un dividende exceptionnel aux actionnaires (le fonds PE)", correct: true },
        { text: "Le versement régulier de dividendes trimestriels aux actionnaires de la société acquise", correct: false },
        { text: "La recapitalisation des fonds propres par émission d'actions nouvelles pour rembourser la dette LBO", correct: false },
        { text: "Un ajustement comptable du capital social lors de la fusion post-LBO", correct: false },
      ],
      propositionsEn: [
        { text: "An operation where the LBO company takes on additional debt to pay a special dividend to shareholders (the PE fund)", correct: true },
        { text: "Regular quarterly dividend payments to shareholders of the acquired company", correct: false },
        { text: "Equity recapitalization through new share issuance to repay LBO debt", correct: false },
        { text: "An accounting adjustment of share capital during the post-LBO merger", correct: false },
      ],
      explanationFr: "Le dividend recap est un outil qu'utilisent les fonds PE pour 'monétiser' partiellement leur investissement avant la sortie. Exemple : un fonds PE a investi 100 M€ dans une société en LBO. Après 2 ans, la société se porte bien. Le fonds fait lever 50 M€ de dette supplémentaire par la société et se verse 50 M€ de dividende exceptionnel. Son IRR monte car il récupère du cash tôt. Avantage : améliore l'IRR. Risque : alourdit la structure financière de la société, laissant moins de marge si la conjoncture se dégrade. Le dividend recap est parfois critiqué car le fonds s'enrichit au détriment de la solidité financière de l'entreprise.",
      explanationEn: "A PE fund causes its LBO company to take on additional debt to pay a special dividend to the fund. Improves IRR by returning cash early. Criticized for loading more debt onto the company, reducing financial headroom.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une clause de drag-along (entraînement) dans un pacte d'actionnaires ?",
      textEn: "What is a drag-along clause in a shareholders' agreement?",
      propositionsFr: [
        { text: "Une clause qui permet aux actionnaires majoritaires d'obliger les minoritaires à vendre leurs titres aux mêmes conditions lors d'une cession de contrôle", correct: true },
        { text: "Une clause qui oblige l'acquéreur à acheter également les titres des actionnaires minoritaires s'il dépasse un seuil de détention", correct: false },
        { text: "Une clause qui empêche un actionnaire de céder ses titres pendant une période déterminée", correct: false },
        { text: "Une clause qui impose une décote sur le prix de cession des titres des actionnaires minoritaires", correct: false },
      ],
      propositionsEn: [
        { text: "A clause allowing majority shareholders to force minorities to sell their shares under the same conditions in a control sale", correct: true },
        { text: "A clause obliging a buyer to also acquire minority shares above a certain ownership threshold", correct: false },
        { text: "A clause preventing a shareholder from selling their shares for a defined period", correct: false },
        { text: "A clause imposing a discount on the sale price of minority shareholders' shares", correct: false },
      ],
      explanationFr: "Le drag-along protège les majoritaires (souvent les fonds PE). Sans lui, des minoritaires récalcitrants pourraient bloquer la vente de l'entreprise. Exemple : un fonds PE détient 70% d'une société et trouve un acheteur à 100 M€ pour 100% des titres. Les 3 managers minoritaires (30%) refusent de vendre. Avec la clause drag-along, le fonds peut les forcer à vendre aux mêmes conditions (même prix par action, même closing). À ne pas confondre avec le tag-along : c'est la situation inverse, il protège les minoritaires en leur donnant le droit de vendre aux mêmes conditions si le majoritaire vend.",
      explanationEn: "Drag-along: majority forces minorities to sell at the same terms. Protects PE funds from minority blockers. Tag-along is the opposite: minorities have the right to join a majority sale at the same terms, protecting them from being left behind.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une due diligence financière ?",
      textEn: "What is a financial due diligence?",
      propositionsFr: [
        { text: "Un audit approfondi des états financiers historiques de la cible pour valider la qualité des résultats, normaliser l'EBITDA et identifier les risques financiers", correct: true },
        { text: "Une analyse de la solidité financière de l'acquéreur pour financer la transaction", correct: false },
        { text: "Un audit des états financiers prévisionnels pour valider le business plan de la cible", correct: false },
        { text: "Une revue de la notation de crédit de la société par les agences Moody's et S&P", correct: false },
      ],
      propositionsEn: [
        { text: "A deep audit of the target's historical financials to validate earnings quality, normalize EBITDA, and identify financial risks", correct: true },
        { text: "An analysis of the acquirer's financial strength to fund the transaction", correct: false },
        { text: "An audit of forward-looking financials to validate the target's business plan", correct: false },
        { text: "A review of the company's credit rating by Moody's and S&P agencies", correct: false },
      ],
      explanationFr: "La due diligence financière (souvent réalisée par un cabinet d'audit) analyse les 3-5 dernières années de comptes pour : 1) Valider et normaliser l'EBITDA (éliminer les éléments non récurrents : ventes d'actifs, provisions exceptionnelles, rémunérations anormales des dirigeants). 2) Analyser la qualité des revenus (concentration client, récurrence, reconnaissance). 3) Comprendre les variations de BFR. 4) Identifier les passifs cachés (contentieux, engagements hors bilan). 5) Valider la dette nette. Le résultat est un rapport de QoE (Quality of Earnings) qui est la base du SPA et de la négociation finale.",
      explanationEn: "Financial DD audits 3-5 years of historical accounts to normalize EBITDA, analyze revenue quality, understand working capital movements, identify hidden liabilities, and validate net debt. Results in a Quality of Earnings (QoE) report.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que le SPA (Share Purchase Agreement) ?",
      textEn: "What is a Share Purchase Agreement (SPA)?",
      propositionsFr: [
        { text: "Le contrat définitif et juridiquement contraignant qui formalise la vente des titres d'une société entre acheteur et vendeur", correct: true },
        { text: "Le document préliminaire et non contraignant signé au début des négociations", correct: false },
        { text: "Le rapport de due diligence financière remis par l'auditeur à l'acheteur", correct: false },
        { text: "L'accord de confidentialité signé avant le partage des informations sur la cible", correct: false },
      ],
      propositionsEn: [
        { text: "The definitive and legally binding contract formalizing the sale of a company's shares between buyer and seller", correct: true },
        { text: "The preliminary non-binding document signed at the start of negotiations", correct: false },
        { text: "The financial due diligence report provided by the auditor to the buyer", correct: false },
        { text: "The confidentiality agreement signed before sharing target information", correct: false },
      ],
      explanationFr: "Le SPA est 'la' bible de la transaction M&A. Il contient : le prix et les mécanismes d'ajustement (locked-box ou completion accounts), les représentations et garanties du vendeur (reps & warranties), les clauses d'indemnisation, les conditions suspensives (antitrust, financement), les engagements entre signing et closing, et les clauses post-closing (earn-out, non-concurrence). Un SPA peut faire 200-400 pages avec ses annexes. Sa négociation prend en général 2-4 semaines avec les équipes juridiques des deux côtés. Le moment de la signature s'appelle le 'signing', le transfert effectif des titres s'appelle le 'closing'.",
      explanationEn: "The SPA is the definitive legal contract for an M&A transaction. Contains: price and adjustment mechanisms, representations & warranties, indemnification, conditions precedent (antitrust, financing), and post-closing clauses. Signing = contract executed; Closing = shares actually transferred.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que l'EBIT et en quoi diffère-t-il de l'EBITDA ?",
      textEn: "What is EBIT and how does it differ from EBITDA?",
      propositionsFr: [
        { text: "L'EBIT est le résultat opérationnel après amortissements (DA), tandis que l'EBITDA l'exclut ; l'EBITDA mesure mieux la capacité à générer du cash", correct: true },
        { text: "L'EBIT inclut les éléments exceptionnels alors que l'EBITDA les exclut", correct: false },
        { text: "L'EBIT intègre les charges financières, contrairement à l'EBITDA qui les exclut", correct: false },
        { text: "L'EBITDA est un indicateur comptable réglementé, contrairement à l'EBIT qui est libre", correct: false },
      ],
      propositionsEn: [
        { text: "EBIT is operating profit after depreciation & amortization; EBITDA excludes them — EBITDA better reflects cash generation", correct: true },
        { text: "EBIT includes exceptional items while EBITDA excludes them", correct: false },
        { text: "EBIT includes financial charges while EBITDA excludes them", correct: false },
        { text: "EBITDA is a regulated accounting metric, unlike EBIT which is freely defined", correct: false },
      ],
      explanationFr: "EBITDA = Résultat avant Intérêts, Impôts, Dépréciations et Amortissements. EBIT = Résultat avant Intérêts et Impôts (= EBITDA − D&A). Exemple : EBITDA 20 M€, Amortissements 5 M€ → EBIT = 15 M€. L'EBITDA est préféré en M&A car il neutralise les politiques d'amortissement (qui varient selon les pays et les choix comptables) et s'approche mieux du cash généré. Attention : l'EBITDA n'est PAS le free cash flow car il ne tient pas compte des investissements (capex), de la variation de BFR et des impôts. Des entreprises très capitalistiques (industrie lourde) peuvent avoir un EBITDA fort mais un FCF faible à cause du capex.",
      explanationEn: "EBITDA excludes Depreciation & Amortization; EBIT includes them. EBITDA preferred in M&A because it neutralizes accounting depreciation policies and better approximates cash generation. But EBITDA ≠ FCF (ignores capex, working capital, taxes).",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une offre publique d'achat (OPA) en Bourse ?",
      textEn: "What is a public takeover bid (OPA/TOB) on the stock market?",
      propositionsFr: [
        { text: "Une offre formelle faite par un acquéreur à l'ensemble des actionnaires d'une société cotée pour acheter leurs titres à un prix déterminé, en vue d'en prendre le contrôle", correct: true },
        { text: "Une émission d'actions nouvelles par une société cotée pour lever des fonds supplémentaires", correct: false },
        { text: "Un programme de rachat d'actions propres par une société cotée pour soutenir son cours", correct: false },
        { text: "Une offre de fusion entre deux sociétés cotées impliquant un échange de titres", correct: false },
      ],
      propositionsEn: [
        { text: "A formal offer by an acquirer to all shareholders of a listed company to buy their shares at a set price, to gain control", correct: true },
        { text: "A new share issuance by a listed company to raise additional funds", correct: false },
        { text: "A share buyback program by a listed company to support its stock price", correct: false },
        { text: "A merger offer between two listed companies involving a share exchange", correct: false },
      ],
      explanationFr: "L'OPA est la façon réglementée d'acquérir une société cotée. L'acquéreur dépose une offre auprès de l'AMF (en France) qui la valide. Il s'engage à acheter tous les titres à un prix fixé (toujours avec une prime). Les actionnaires ont plusieurs semaines pour apporter ou non leurs titres. Si l'acquéreur dépasse 95%, il peut forcer les minoritaires restants à vendre via un retrait obligatoire (squeeze-out). En France, au-dessus de 30% du capital, l'actionnaire est obligé de lancer une OPA sur 100% des titres. L'OPA peut être amicale (management favorable) ou hostile (management opposé).",
      explanationEn: "A TOB is the regulated way to acquire a listed company. Acquirer announces a price (always with a premium), regulators approve it, and shareholders have weeks to tender. Above 95% ownership, remaining minorities can be forced out (squeeze-out). In France, crossing 30% triggers a mandatory bid.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce que la marge d'EBIT (ou marge opérationnelle) ?",
      textEn: "What is the EBIT margin (or operating margin)?",
      propositionsFr: [
        { text: "L'EBIT divisé par le chiffre d'affaires, exprimé en pourcentage ; mesure la rentabilité opérationnelle après amortissements", correct: true },
        { text: "Le résultat net divisé par les fonds propres ; mesure le rendement pour les actionnaires", correct: false },
        { text: "L'EBITDA divisé par les actifs totaux ; mesure l'efficacité d'utilisation des actifs", correct: false },
        { text: "La différence entre le prix de vente et le coût de revient unitaire d'un produit", correct: false },
      ],
      propositionsEn: [
        { text: "EBIT divided by revenue, expressed as a percentage; measures operational profitability after depreciation", correct: true },
        { text: "Net income divided by equity; measures return to shareholders", correct: false },
        { text: "EBITDA divided by total assets; measures asset utilization efficiency", correct: false },
        { text: "The difference between selling price and unit cost of a product", correct: false },
      ],
      explanationFr: "Marge EBIT = EBIT / CA. Exemple : CA = 100 M€, EBIT = 15 M€ → Marge EBIT = 15%. C'est un indicateur clé de la profitabilité opérationnelle. Les marges varient beaucoup par secteur : distribution alimentaire (2-4%), logiciels (20-40%), luxe (25-35%), industrie lourde (8-15%). En M&A, la marge EBIT permet de comparer des entreprises de tailles différentes et d'analyser les perspectives d'amélioration post-acquisition (levier opérationnel). Une cible avec une marge EBIT inférieure à ses pairs peut représenter une opportunité d'amélioration opérationnelle.",
      explanationEn: "EBIT Margin = EBIT / Revenue. Measures operational profitability after D&A. Varies by sector: grocery retail (2-4%), software (20-40%), luxury goods (25-35%). Key M&A indicator for comparing peers and identifying operational improvement opportunities.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une valorisation par somme des parties (Sum-of-the-Parts) ?",
      textEn: "What is a Sum-of-the-Parts (SOTP) valuation?",
      propositionsFr: [
        { text: "Une méthode qui valorise séparément chaque division ou filiale d'un conglomérat, puis additionne ces valeurs pour obtenir la valeur totale du groupe", correct: true },
        { text: "Une méthode qui additionne la valeur comptable des actifs et la valeur de marché des passifs", correct: false },
        { text: "Une méthode qui calcule la valeur de l'entreprise comme la somme de ses cash flows passés et futurs", correct: false },
        { text: "Une méthode qui valorise l'entreprise en additionnant les valorisations obtenues par DCF et par comparables", correct: false },
      ],
      propositionsEn: [
        { text: "A method that values each division or subsidiary of a conglomerate separately, then sums them up to get total group value", correct: true },
        { text: "A method adding book value of assets and market value of liabilities", correct: false },
        { text: "A method calculating firm value as the sum of past and future cash flows", correct: false },
        { text: "A method valuing the firm by averaging DCF and comparable valuations", correct: false },
      ],
      explanationFr: "La méthode SOTP est utilisée pour les groupes diversifiés (conglomérats) qui ne peuvent pas être comparés à un seul secteur. Exemple : Bouygues a 3 divisions (Construction, Télécoms, Médias) aux profils très différents. On valorise chaque division séparément avec ses comparables propres (ex: Bouygues Telecom comparé à Orange et SFR), puis on additionne. On déduit ensuite la dette nette du groupe et les coûts de holding. Souvent, la somme des parties est supérieure à la valeur de marché du groupe : c'est la 'décote de conglomérat'. Certains investisseurs activistes poussent alors à un démantèlement pour libérer cette valeur.",
      explanationEn: "SOTP is used for diversified conglomerates. Value each division with its own comparable peers, then sum them. Subtract net debt and holding costs. Often reveals a 'conglomerate discount' — the market values the whole less than the sum of parts, which activists exploit.",
    },
    {
      domainId: maId, level: 1,
      textFr: "Qu'est-ce qu'une transaction de croissance externe ?",
      textEn: "What is a bolt-on acquisition (external growth)?",
      propositionsFr: [
        { text: "L'acquisition d'une société complémentaire par une plateforme existante pour accélérer sa croissance, par opposition à la croissance organique", correct: true },
        { text: "Un investissement dans de nouvelles capacités de production pour croître sans acquisition", correct: false },
        { text: "La création d'une joint-venture entre deux sociétés pour accéder à un nouveau marché", correct: false },
        { text: "Un programme d'embauche massif pour développer rapidement les équipes commerciales", correct: false },
      ],
      propositionsEn: [
        { text: "The acquisition of a complementary company by an existing platform to accelerate growth, as opposed to organic growth", correct: true },
        { text: "Investment in new production capacity to grow without acquisition", correct: false },
        { text: "Creation of a joint venture between two companies to enter a new market", correct: false },
        { text: "A massive hiring program to rapidly develop sales teams", correct: false },
      ],
      explanationFr: "En Private Equity, la stratégie 'buy-and-build' consiste à acquérir une plateforme (société de taille significative) puis à lui faire réaliser des bolt-on acquisitions (petites acquisitions complémentaires). Exemple : un fonds PE acquiert un cabinet de conseil en management (plateforme). Il achète ensuite 5-6 petits cabinets régionaux à 6x EBITDA et les valorise ensemble à 10x EBITDA grâce à la taille. Cette 'arbitrage de multiple' crée de la valeur. Les bolt-ons sont souvent moins chers que la plateforme car les petites sociétés ont moins de pouvoir de négociation et se traitent à des multiples inférieurs.",
      explanationEn: "In PE, 'buy-and-build': acquire a platform then add bolt-on acquisitions. Small targets trade at lower multiples (6x) than the combined group (10x), creating value through multiple arbitrage. Classic PE value creation lever.",
    },
  ];

  let inserted = 0;
  let skipped = 0;
  for (const q of questions) {
    const exists = await client.query('SELECT id FROM question WHERE "textFr" = $1', [q.textFr]);
    if (exists.rows.length > 0) { skipped++; continue; }
    await client.query(
      `INSERT INTO question ("domainId", level, "textFr", "textEn", "propositionsFr", "propositionsEn", "explanationFr", "explanationEn", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
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
