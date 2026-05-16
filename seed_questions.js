const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '$Language1',
  database: 'knoweo',
});

async function seed() {
  await client.connect();
  console.log('Connected to database');

  // Récupère les IDs des domaines
  const domains = await client.query('SELECT id, slug FROM domain');
  const domainMap = {};
  domains.rows.forEach(d => domainMap[d.slug] = d.id);
  console.log('Domains:', domainMap);

const questions = [

  // ── NIVEAU 1 ─────────────────────────────────────────────

  {
    domainId: domainMap['ma'],
    level: 1,
    textFr: "Qu'est-ce qu'une 'fusion par absorption' ?",
    textEn: "What is a 'merger by absorption'?",
    propositionsFr: [
      { text: "Une opération par laquelle une société absorbante intègre totalement une société absorbée qui disparaît juridiquement, ses actifs et passifs étant transmis à l'absorbante", correct: true },
      { text: "Une fusion dans laquelle les deux sociétés disparaissent pour créer une entité entièrement nouvelle", correct: false },
      { text: "Le rachat progressif des actions d'une société sur le marché jusqu'à détenir 100% du capital", correct: false },
      { text: "Une opération par laquelle une filiale absorbe sa société mère pour simplifier le groupe", correct: false },
    ],
    propositionsEn: [
      { text: "An operation whereby an absorbing company fully integrates an absorbed company that ceases to exist legally, with its assets and liabilities transferred to the absorbing entity", correct: true },
      { text: "A merger where both companies disappear to create an entirely new entity", correct: false },
      { text: "The gradual buyout of a company's shares on the market until holding 100% of capital", correct: false },
      { text: "An operation whereby a subsidiary absorbs its parent company to simplify the group", correct: false },
    ],
    explanationFr: "La fusion par absorption, c'est quand une grande rivière avale un affluent : l'affluent (société absorbée) cesse d'exister, ses eaux (actifs, dettes, contrats, salariés) rejoignent le grand fleuve (société absorbante). Les actionnaires de l'absorbée reçoivent des actions de l'absorbante en échange. C'est la forme de fusion la plus courante en France — la TUP (Transmission Universelle de Patrimoine) en est la version simplifiée pour les filiales à 100%.",
    explanationEn: "Merger by absorption is like a large river swallowing a tributary: the tributary (absorbed company) ceases to exist, its waters (assets, debts, contracts, employees) join the main river (absorbing company). Shareholders of the absorbed company receive shares in the absorbing company in exchange. It's the most common form of merger in France — the TUP (Universal Transfer of Assets) is the simplified version for 100% subsidiaries.",
  },

  {
    domainId: domainMap['ma'],
    level: 1,
    textFr: "Qu'est-ce qu'un 'pacte d'actionnaires' ?",
    textEn: "What is a 'shareholders agreement'?",
    propositionsFr: [
      { text: "Un contrat privé entre actionnaires définissant leurs droits et obligations mutuels, notamment les règles de cession des titres, de gouvernance et de sortie", correct: true },
      { text: "Le règlement intérieur de l'assemblée générale des actionnaires d'une société cotée", correct: false },
      { text: "L'accord signé entre l'acquéreur et le vendeur sur le prix et les conditions de la transaction", correct: false },
      { text: "Le document statutaire obligatoire définissant l'objet social et les règles de fonctionnement de la société", correct: false },
    ],
    propositionsEn: [
      { text: "A private contract between shareholders defining their mutual rights and obligations, notably share transfer rules, governance and exit mechanisms", correct: true },
      { text: "The internal rules of the general shareholders meeting of a listed company", correct: false },
      { text: "The agreement signed between acquirer and seller on price and deal terms", correct: false },
      { text: "The mandatory constitutional document defining the company's purpose and operating rules", correct: false },
    ],
    explanationFr: "Le pacte d'actionnaires, c'est la 'loi privée' entre associés. Les statuts de la société sont publics ; le pacte est confidentiel. Il règle les questions que les statuts ne peuvent pas ou ne veulent pas traiter : 'Si tu veux vendre tes parts, tu me les proposes en premier (préemption)', 'On ne peut pas prendre de décision stratégique sans l'accord unanime des fondateurs', 'Si on lève des fonds, tu peux maintenir ta part (anti-dilution)'.",
    explanationEn: "A shareholders agreement is the 'private law' between partners. Company articles are public; the SHA is confidential. It governs issues that articles cannot or don't want to address: 'If you want to sell your shares, you offer them to me first (pre-emption)', 'No strategic decision without unanimous founder approval', 'If we raise funds, you can maintain your stake (anti-dilution)'.",
  },

  {
    domainId: domainMap['ma'],
    level: 1,
    textFr: "Qu'est-ce que la 'capitalisation boursière' d'une entreprise cotée ?",
    textEn: "What is the 'market capitalisation' of a listed company?",
    propositionsFr: [
      { text: "Le nombre total d'actions en circulation multiplié par le cours de l'action en bourse, représentant la valeur de marché des capitaux propres", correct: true },
      { text: "La valeur totale des actifs de l'entreprise telle qu'inscrite dans son bilan", correct: false },
      { text: "Le montant total levé par l'entreprise lors de son introduction en bourse", correct: false },
      { text: "La valeur d'entreprise diminuée de la trésorerie nette disponible", correct: false },
    ],
    propositionsEn: [
      { text: "The total number of shares outstanding multiplied by the share price, representing the market value of equity", correct: true },
      { text: "The total value of the company's assets as recorded on its balance sheet", correct: false },
      { text: "The total amount raised by the company at its IPO", correct: false },
      { text: "Enterprise value minus available net cash", correct: false },
    ],
    explanationFr: "Si Apple a 15 milliards d'actions et que le cours est 200$, sa capitalisation boursière est 3 000 milliards de dollars. C'est ce que le marché pense valoir l'ensemble des actions — pas ce que vaut l'entreprise dans sa totalité (l'Enterprise Value inclut aussi la dette). Une capi boursière peut changer de 5% en une journée selon les résultats trimestriels ou les rumeurs d'acquisition.",
    explanationEn: "If Apple has 15 billion shares and the price is $200, its market cap is $3 trillion. That's what the market thinks all the shares are worth — not what the entire company is worth (Enterprise Value also includes debt). A market cap can change by 5% in a day based on quarterly results or acquisition rumours.",
  },

  {
    domainId: domainMap['ma'],
    level: 1,
    textFr: "Qu'est-ce qu'un 'IPO' (Initial Public Offering) et quel est son lien avec le M&A ?",
    textEn: "What is an 'IPO' (Initial Public Offering) and what is its link to M&A?",
    propositionsFr: [
      { text: "L'introduction en bourse d'une société, qui peut être une alternative à une cession M&A et donne une valorisation de référence utilisée dans les transactions ultérieures", correct: true },
      { text: "Une offre publique d'achat lancée par un investisseur institutionnel sur une société cotée", correct: false },
      { text: "La première émission obligataire réalisée par une entreprise sur les marchés de capitaux", correct: false },
      { text: "Le processus d'approbation réglementaire d'une fusion par les autorités boursières", correct: false },
    ],
    propositionsEn: [
      { text: "The stock market listing of a company, which can be an alternative to an M&A sale and provides a reference valuation used in subsequent transactions", correct: true },
      { text: "A public takeover bid launched by an institutional investor on a listed company", correct: false },
      { text: "A company's first bond issuance on capital markets", correct: false },
      { text: "The regulatory approval process for a merger by stock market authorities", correct: false },
    ],
    explanationFr: "L'IPO, c'est quand une entreprise privée ouvre son capital au grand public en se faisant coter en bourse. Son lien avec le M&A : c'est souvent la stratégie de sortie des fonds PE (vendre via l'IPO plutôt qu'à un industriel), et la capitalisation boursière post-IPO devient la référence pour toute OPA future. Une société cotée est aussi plus facile à utiliser comme 'monnaie d'échange' dans une acquisition payée en actions.",
    explanationEn: "An IPO is when a private company opens its capital to the public by listing on the stock market. Its M&A link: it's often the exit strategy for PE funds (selling via IPO rather than to an industrial), and the post-IPO market cap becomes the reference for any future takeover. A listed company is also easier to use as 'currency' in a stock-financed acquisition.",
  },

  {
    domainId: domainMap['ma'],
    level: 1,
    textFr: "Qu'est-ce qu'un 'bolt-on' dans le contexte du Private Equity ?",
    textEn: "What is a 'bolt-on' in a Private Equity context?",
    propositionsFr: [
      { text: "Une acquisition complémentaire réalisée par une société déjà en portefeuille d'un fonds PE (la plateforme) pour accélérer sa croissance par consolidation sectorielle", correct: true },
      { text: "Un investissement minoritaire réalisé en complément d'un LBO majoritaire", correct: false },
      { text: "Une clause contractuelle permettant au fonds d'investir davantage dans une participation existante", correct: false },
      { text: "Le refinancement de la dette senior par émission d'obligations après un LBO", correct: false },
    ],
    propositionsEn: [
      { text: "A complementary acquisition made by a company already in a PE fund's portfolio (the platform) to accelerate growth through sector consolidation", correct: true },
      { text: "A minority investment made alongside a majority LBO", correct: false },
      { text: "A contractual clause allowing the fund to invest more in an existing holding", correct: false },
      { text: "The refinancing of senior debt through bond issuance after an LBO", correct: false },
    ],
    explanationFr: "La stratégie bolt-on, c'est 'buy and build' : le fonds achète une plateforme (disons un groupe de cliniques vétérinaires), puis lui fait racheter 5-10 petits cabinets vétérinaires régionaux. Chaque acquisition est un bolt-on. Résultat : la plateforme grossit vite, réalise des économies d'échelle, et se revend à un multiple plus élevé (les grandes structures se vendent plus cher que les petites). C'est la stratégie dominante du PE européen aujourd'hui.",
    explanationEn: "The bolt-on strategy is 'buy and build': the fund buys a platform (say a veterinary clinic group), then has it acquire 5-10 small regional vet practices. Each acquisition is a bolt-on. Result: the platform grows quickly, achieves economies of scale, and sells at a higher multiple (larger structures command higher multiples than small ones). This is the dominant PE strategy in Europe today.",
  },

  // ── NIVEAU 2 ─────────────────────────────────────────────

  {
    domainId: domainMap['ma'],
    level: 2,
    textFr: "Comment l'ESG influence-t-il les transactions M&A aujourd'hui ?",
    textEn: "How does ESG influence M&A transactions today?",
    propositionsFr: [
      { text: "L'ESG est devenu un critère de due diligence à part entière : les risques climatiques, sociaux et de gouvernance sont évalués et peuvent influencer le prix, les conditions du SPA et la décision d'acquérir", correct: true },
      { text: "L'ESG n'est pertinent qu'en M&A pour les entreprises cotées soumises aux obligations de reporting extra-financier", correct: false },
      { text: "L'ESG influence uniquement le financement bancaire de l'acquisition, pas la valorisation de la cible", correct: false },
      { text: "L'ESG est pris en compte uniquement pour les acquisitions dans les secteurs polluants comme l'énergie ou l'industrie lourde", correct: false },
    ],
    propositionsEn: [
      { text: "ESG has become a full due diligence criterion: climate, social and governance risks are assessed and can influence price, SPA terms and the acquisition decision", correct: true },
      { text: "ESG is only relevant in M&A for listed companies subject to extra-financial reporting obligations", correct: false },
      { text: "ESG only influences the bank financing of the acquisition, not the target's valuation", correct: false },
      { text: "ESG is only considered for acquisitions in polluting sectors like energy or heavy industry", correct: false },
    ],
    explanationFr: "Aujourd'hui, les grands fonds PE et corporate ont des équipes ESG dédiées à la due diligence. Un site industriel pollué peut entraîner des provisions massives post-acquisition. Une gouvernance défaillante (fraude, conflits d'intérêts) peut justifier une décote de prix ou une clause de garantie spécifique. Et depuis la taxonomie européenne, les banques intègrent l'ESG dans leurs conditions de financement — une cible 'brune' coûtera plus cher à financer.",
    explanationEn: "Today, major PE funds and corporates have dedicated ESG due diligence teams. A polluted industrial site can trigger massive post-acquisition provisions. Poor governance (fraud, conflicts of interest) can justify a price discount or specific warranty clause. And since the EU taxonomy, banks integrate ESG into financing terms — a 'brown' target will cost more to finance.",
  },

  {
    domainId: domainMap['ma'],
    level: 2,
    textFr: "Qu'est-ce qu'une valorisation par 'somme des parties' (Sum of the Parts) ?",
    textEn: "What is a 'Sum of the Parts' (SOTP) valuation?",
    propositionsFr: [
      { text: "Une méthode qui valorise séparément chaque division ou activité d'un groupe diversifié avec la méthode la plus appropriée à chacune, puis additionne les résultats pour obtenir la valeur totale du groupe", correct: true },
      { text: "Une méthode qui additionne la valeur comptable de tous les actifs d'un groupe pour obtenir sa valeur de liquidation", correct: false },
      { text: "Une méthode qui calcule la valeur d'un groupe en additionnant les capitalisations boursières de toutes ses filiales cotées", correct: false },
      { text: "Une approche qui somme les multiples EBITDA de chaque division pour obtenir un multiple consolidé", correct: false },
    ],
    propositionsEn: [
      { text: "A method that values each division or business of a diversified group separately using the most appropriate method for each, then sums the results to get the group's total value", correct: true },
      { text: "A method that adds up the book value of all a group's assets to get its liquidation value", correct: false },
      { text: "A method that calculates a group's value by adding the market caps of all its listed subsidiaries", correct: false },
      { text: "An approach that sums the EBITDA multiples of each division to get a consolidated multiple", correct: false },
    ],
    explanationFr: "Impossible de valoriser Bouygues avec un seul multiple : construction, télécoms et médias n'ont pas les mêmes ratios. La SOTP valorise séparément Bouygues Construction (EV/EBIT BTP), Bouygues Telecom (EV/EBITDA télécom), TF1 (EV/EBITDA média), puis additionne. On déduit ensuite la 'holding discount' (5-20%) car gérer un conglomérat est complexe. Résultat : souvent une décote par rapport à la somme des parties — argument classique des activistes pour démanteler des groupes.",
    explanationEn: "You can't value Bouygues with a single multiple: construction, telecoms and media don't have the same ratios. SOTP separately values Bouygues Construction (EV/EBIT construction), Bouygues Telecom (EV/EBITDA telecom), TF1 (EV/EBITDA media), then adds them up. You then deduct a 'holding discount' (5-20%) because managing a conglomerate is complex. Result: often a discount vs sum of parts — the classic activist argument for breaking up groups.",
  },

  {
    domainId: domainMap['ma'],
    level: 2,
    textFr: "Qu'est-ce qu'un 'indice de confiance M&A' et quels facteurs influencent le cycle M&A ?",
    textEn: "What drives M&A cycles and what are the main macro factors influencing deal activity?",
    propositionsFr: [
      { text: "Les taux d'intérêt, la croissance économique, la confiance des dirigeants, les marchés boursiers et la liquidité disponible chez les fonds sont les principaux moteurs des cycles M&A", correct: true },
      { text: "L'activité M&A est principalement dictée par les changements réglementaires et les décisions des autorités de la concurrence", correct: false },
      { text: "Les cycles M&A dépendent avant tout du niveau des valorisations boursières et du PER moyen du marché", correct: false },
      { text: "L'activité M&A est contracyclique : elle augmente en période de récession quand les cibles sont bon marché", correct: false },
    ],
    propositionsEn: [
      { text: "Interest rates, economic growth, CEO confidence, equity markets and available fund liquidity are the main drivers of M&A cycles", correct: true },
      { text: "M&A activity is primarily driven by regulatory changes and competition authority decisions", correct: false },
      { text: "M&A cycles depend mainly on equity market valuations and average market P/E", correct: false },
      { text: "M&A activity is countercyclical: it increases during recessions when targets are cheap", correct: false },
    ],
    explanationFr: "Le M&A est profondément cyclique et procyclique (il suit l'économie). Quand tout va bien : taux bas → dette pas chère → LBO faciles ; marchés hauts → acquéreurs riches en actions → paiement en titres attractif ; CEOs confiants → appétit pour les grandes acquisitions. Quand ça se gâte : tout s'inverse. Le volume M&A mondial a chuté de ~40% en 2022-2023 avec la remontée des taux. Il repart toujours quand les taux baissent.",
    explanationEn: "M&A is deeply cyclical and pro-cyclical (it follows the economy). When things are good: low rates → cheap debt → easy LBOs; high markets → asset-rich acquirers → attractive stock payment; confident CEOs → appetite for large deals. When things sour: everything reverses. Global M&A volume fell ~40% in 2022-2023 with rising rates. It always rebounds when rates fall.",
  },

  {
    domainId: domainMap['ma'],
    level: 2,
    textFr: "Qu'est-ce qu'une 'offre publique d'échange' (OPE) ?",
    textEn: "What is a 'share exchange offer' (SEO)?",
    propositionsFr: [
      { text: "Une offre publique où l'acquéreur propose aux actionnaires de la cible d'échanger leurs actions contre des actions de l'acquéreur, plutôt que de les payer en cash", correct: true },
      { text: "Une offre permettant aux actionnaires d'une société de convertir leurs actions ordinaires en actions préférentielles", correct: false },
      { text: "Un mécanisme de rachat d'actions propres proposé par une société à ses propres actionnaires", correct: false },
      { text: "Une offre simultanée sur deux sociétés cotées visant à les fusionner en bourse", correct: false },
    ],
    propositionsEn: [
      { text: "A public offer where the acquirer proposes to target shareholders to exchange their shares for acquirer shares, rather than paying in cash", correct: true },
      { text: "An offer allowing shareholders of a company to convert ordinary shares into preference shares", correct: false },
      { text: "A share buyback mechanism offered by a company to its own shareholders", correct: false },
      { text: "A simultaneous offer on two listed companies aimed at merging them on the stock market", correct: false },
    ],
    explanationFr: "Dans une OPE, l'acquéreur dit : 'Pour chaque action XYZ que tu me donnes, je te donne 0,8 action de mon groupe.' Pas de cash — on échange du papier contre du papier. Avantage acquéreur : pas de décaissement. Avantage vendeur : peut bénéficier de la hausse future de l'acquéreur. Risque : si l'action de l'acquéreur chute après l'annonce, les actionnaires cibles reçoivent moins que prévu. La fusion Mittal/Arcelor en 2006 s'est faite en OPE mixte (cash + actions).",
    explanationEn: "In a share exchange offer, the acquirer says: 'For every XYZ share you give me, I'll give you 0.8 of my group's shares.' No cash — paper for paper. Acquirer benefit: no cash outlay. Seller benefit: can gain from the acquirer's future share rise. Risk: if the acquirer's stock falls after announcement, target shareholders receive less than expected. The Mittal/Arcelor merger in 2006 was done as a mixed offer (cash + shares).",
  },

  {
    domainId: domainMap['ma'],
    level: 2,
    textFr: "❓ Question d'entretien M&A — Comment valorise-t-on une start-up non rentable en M&A ?",
    textEn: "❓ M&A interview — How do you value an unprofitable start-up in M&A?",
    propositionsFr: [
      { text: "On utilise des multiples de revenus (EV/Revenue), des métriques opérationnelles (coût d'acquisition client, LTV), des comparables de transactions récentes dans le secteur, et parfois un DCF avec scénarios de probabilité", correct: true },
      { text: "On ne peut pas valoriser une start-up non rentable — toute acquisition est spéculative par définition", correct: false },
      { text: "On utilise exclusivement la valeur des actifs technologiques (brevets, code source) au bilan", correct: false },
      { text: "On applique un multiple d'EBITDA négatif inversé pour refléter les pertes actuelles", correct: false },
    ],
    propositionsEn: [
      { text: "You use revenue multiples (EV/Revenue), operational metrics (CAC, LTV), recent transaction comparables in the sector, and sometimes a DCF with probability-weighted scenarios", correct: true },
      { text: "You can't value an unprofitable start-up — any acquisition is speculative by definition", correct: false },
      { text: "You use exclusively the value of technology assets (patents, source code) on the balance sheet", correct: false },
      { text: "You apply an inverted negative EBITDA multiple to reflect current losses", correct: false },
    ],
    explanationFr: "Quand Salesforce rachète une SaaS à 20x les revenus sans profit, c'est cohérent : le marché SaaS valorise la croissance récurrente, pas les bénéfices d'aujourd'hui. Les métriques clés : ARR (revenus récurrents annuels), churn (taux d'attrition), NRR (net revenue retention), CAC/LTV. Les comparables de transactions récentes dans le secteur sont déterminants. Et le DCF avec trois scénarios (bull/base/bear) pondérés par des probabilités peut donner une fourchette défendable.",
    explanationEn: "When Salesforce buys a SaaS company at 20x revenue with no profit, it's coherent: the SaaS market values recurring growth, not today's profits. Key metrics: ARR (annual recurring revenue), churn, NRR (net revenue retention), CAC/LTV. Recent transaction comparables in the sector are decisive. And a DCF with three probability-weighted scenarios (bull/base/bear) can give a defensible range.",
  },

  // ── NIVEAU 3 ─────────────────────────────────────────────

  {
    domainId: domainMap['ma'],
    level: 3,
    textFr: "Qu'est-ce qu'un 'reverse merger' (fusion inversée) et pourquoi est-il utilisé ?",
    textEn: "What is a 'reverse merger' and why is it used?",
    propositionsFr: [
      { text: "Une opération où une société privée acquiert une société cotée (souvent une 'coquille vide') pour obtenir une cotation boursière sans passer par le processus coûteux et long d'une IPO classique", correct: true },
      { text: "Une fusion où la société cible acquiert finalement l'acquéreur initial après retournement de situation", correct: false },
      { text: "Un LBO dans lequel le management de la cible finance l'acquisition de son propre groupe mère", correct: false },
      { text: "Une opération permettant à une société étrangère d'acquérir une société locale en contournant les restrictions réglementaires", correct: false },
    ],
    propositionsEn: [
      { text: "An operation where a private company acquires a listed company (often a 'shell') to obtain a stock listing without going through the costly and lengthy traditional IPO process", correct: true },
      { text: "A merger where the target company ultimately acquires the original acquirer after a reversal", correct: false },
      { text: "An LBO where the target's management finances the acquisition of its own parent group", correct: false },
      { text: "An operation allowing a foreign company to acquire a local company by bypassing regulatory restrictions", correct: false },
    ],
    explanationFr: "La fusion inversée, c'est le raccourci vers la bourse. Une startup achète une société cotée qui ne fait plus grand chose (la 'coquille') et hérite de sa cotation. Résultat : elle est cotée sans IPO, en quelques semaines. C'est ce qu'on appelle aussi un SPAC (Special Purpose Acquisition Company) dans sa version moderne. Risque : la coquille peut avoir des passifs cachés, et les investisseurs institutionnels regardent ces véhicules avec méfiance.",
    explanationEn: "A reverse merger is the shortcut to the stock market. A startup buys a listed company that no longer does much (the 'shell') and inherits its listing. Result: it's listed without an IPO, within weeks. This is also what's called a SPAC (Special Purpose Acquisition Company) in its modern version. Risk: the shell may have hidden liabilities, and institutional investors view these vehicles with suspicion.",
  },

  {
    domainId: domainMap['ma'],
    level: 3,
    textFr: "❓ Question d'entretien M&A — Qu'est-ce qu'un 'LBO secondaire' et pourquoi est-il controversé ?",
    textEn: "❓ M&A interview — What is a 'secondary LBO' and why is it controversial?",
    propositionsFr: [
      { text: "Un LBO secondaire est la revente d'une société d'un fonds PE à un autre fonds PE ; il est controversé car il soulève la question de la création de valeur réelle si l'entreprise 'tourne' entre fonds sans transformation industrielle", correct: true },
      { text: "Un LBO réalisé sur une entreprise qui a déjà fait faillite une première fois", correct: false },
      { text: "Un financement LBO en deux tranches successives auprès de deux banques différentes", correct: false },
      { text: "Le rachat des parts du fonds PE par les dirigeants de la société après la période de détention", correct: false },
    ],
    propositionsEn: [
      { text: "A secondary LBO is the sale of a PE-backed company from one PE fund to another; it's controversial because it raises the question of real value creation if the company 'rotates' between funds without industrial transformation", correct: true },
      { text: "An LBO carried out on a company that has already gone bankrupt once", correct: false },
      { text: "LBO financing in two successive tranches from two different banks", correct: false },
      { text: "The buyout of the PE fund's stake by company managers after the holding period", correct: false },
    ],
    explanationFr: "Le LBO secondaire (et tertiaire, quaternaire...) : le fonds A achète, restructure, revend au fonds B, qui revend au fonds C. À chaque tour, l'entreprise est rechargée en dette. La controverse : est-ce vraiment de la création de valeur ou juste de l'ingénierie financière ? Les défenseurs disent que chaque fonds apporte une expertise différente. Les critiques pointent le risque de surendettement progressif et l'absence de transformation opérationnelle réelle.",
    explanationEn: "Secondary (and tertiary, quaternary...) LBO: fund A buys, restructures, sells to fund B, which sells to fund C. Each time, the company is reloaded with debt. The controversy: is this genuine value creation or just financial engineering? Defenders say each fund brings different expertise. Critics point to the risk of progressive over-leverage and absence of real operational transformation.",
  },

  {
    domainId: domainMap['ma'],
    level: 3,
    textFr: "Qu'est-ce qu'un 'cross-border M&A' et quels en sont les défis spécifiques ?",
    textEn: "What is 'cross-border M&A' and what are its specific challenges?",
    propositionsFr: [
      { text: "Une acquisition impliquant des entreprises de pays différents, avec des défis spécifiques : différences culturelles, réglementations multiples, risques de change, systèmes comptables hétérogènes et enjeux politiques potentiels", correct: true },
      { text: "Une acquisition impliquant plusieurs acquéreurs de nationalités différentes formant un consortium", correct: false },
      { text: "Une transaction M&A soumise simultanément à l'approbation de plusieurs autorités boursières nationales", correct: false },
      { text: "Une acquisition financée en devises étrangères pour bénéficier de taux d'intérêt plus favorables", correct: false },
    ],
    propositionsEn: [
      { text: "An acquisition involving companies from different countries, with specific challenges: cultural differences, multiple regulations, currency risks, heterogeneous accounting systems and potential political issues", correct: true },
      { text: "An acquisition involving multiple acquirers of different nationalities forming a consortium", correct: false },
      { text: "An M&A transaction simultaneously subject to approval from multiple national stock market authorities", correct: false },
      { text: "An acquisition financed in foreign currencies to benefit from more favourable interest rates", correct: false },
    ],
    explanationFr: "Le cross-border M&A est un sport de haut niveau. Exemple : un groupe français qui achète une PME allemande doit gérer le droit du travail allemand (co-détermination, Betriebsrat), les GAAP vs IFRS, le risque EUR/USD si la cible facture en dollars, la culture d'entreprise différente, et parfois le filtrage des investissements étrangers (décret Montaigne en France, CFIUS aux États-Unis). Les échecs d'intégration cross-border sont encore plus fréquents que les échecs domestiques.",
    explanationEn: "Cross-border M&A is high-level sport. Example: a French group buying a German SME must manage German labour law (co-determination, Betriebsrat), GAAP vs IFRS differences, EUR/USD risk if the target invoices in dollars, different corporate culture, and sometimes foreign investment screening (Montaigne decree in France, CFIUS in the US). Cross-border integration failures are even more frequent than domestic ones.",
  },

  {
    domainId: domainMap['ma'],
    level: 3,
    textFr: "Qu'est-ce que le 'winner's curse' en M&A et comment l'éviter ?",
    textEn: "What is the 'winner's curse' in M&A and how can it be avoided?",
    propositionsFr: [
      { text: "Le phénomène par lequel le vainqueur d'une enchère compétitive tend à surpayer car la pression concurrentielle pousse à enchérir au-delà de la valeur fondamentale ; on l'évite par une discipline de valorisation stricte et un prix de réserve prédéfini", correct: true },
      { text: "La malédiction statistique selon laquelle les grandes acquisitions échouent systématiquement à créer de la valeur pour l'acquéreur", correct: false },
      { text: "Le risque que l'équipe dirigeante de la cible parte après l'acquisition, emportant avec elle la valeur payée", correct: false },
      { text: "La tendance des marchés boursiers à pénaliser le cours de l'acquéreur le jour de l'annonce d'une acquisition", correct: false },
    ],
    propositionsEn: [
      { text: "The phenomenon whereby the winner of a competitive auction tends to overpay because competitive pressure drives bidding beyond fundamental value; avoided through strict valuation discipline and a pre-defined reserve price", correct: true },
      { text: "The statistical curse whereby large acquisitions systematically fail to create value for the acquirer", correct: false },
      { text: "The risk that the target's management team leaves after the acquisition, taking the paid-for value with them", correct: false },
      { text: "The tendency of stock markets to penalise the acquirer's share price on acquisition announcement day", correct: false },
    ],
    explanationFr: "Dans un processus compétitif à 5 acheteurs, celui qui gagne est souvent celui qui a le plus surestimé la valeur — d'où la 'malédiction'. Pour l'éviter : fixer un prix maximum avant le processus et ne jamais le dépasser (discipline d'enchère), valoriser indépendamment des synergies (ne pas les surpayer), et avoir le courage de se retirer quand le prix dépasse la valeur fondamentale. Les meilleurs acquéreurs sont ceux qui savent perdre des enchères.",
    explanationEn: "In a competitive process with 5 buyers, the winner is often the one who most overestimated value — hence the 'curse'. To avoid it: set a maximum price before the process and never exceed it (bidding discipline), value independently of synergies (don't overpay for them), and have the courage to walk away when price exceeds fundamental value. The best acquirers are those who know how to lose auctions.",
  },

  {
    domainId: domainMap['ma'],
    level: 3,
    textFr: "❓ Question d'entretien M&A — Qu'est-ce que le 'net debt bridge' et le 'equity bridge' dans une transaction M&A ?",
    textEn: "❓ M&A interview — What are the 'net debt bridge' and 'equity bridge' in an M&A transaction?",
    propositionsFr: [
      { text: "Le net debt bridge ajuste la valeur d'entreprise théorique pour tenir compte de la dette nette réelle au closing ; l'equity bridge calcule le flux de trésorerie exact reçu par chaque catégorie d'actionnaires vendeurs", correct: true },
      { text: "Ce sont deux tableaux de financement montrant comment l'acquéreur va financer respectivement la dette et les fonds propres de l'acquisition", correct: false },
      { text: "Ce sont deux méthodes concurrentes pour passer de la valeur des capitaux propres à la valeur d'entreprise", correct: false },
      { text: "Des clauses contractuelles ajustant le prix en fonction de l'évolution de la trésorerie entre signing et closing", correct: false },
    ],
    propositionsEn: [
      { text: "The net debt bridge adjusts the theoretical enterprise value to account for actual net debt at closing; the equity bridge calculates the exact cash flow received by each category of selling shareholders", correct: true },
      { text: "They are two financing tables showing how the acquirer will finance the debt and equity of the acquisition respectively", correct: false },
      { text: "They are two competing methods for moving from equity value to enterprise value", correct: false },
      { text: "Contractual clauses adjusting price based on cash movements between signing and closing", correct: false },
    ],
    explanationFr: "Le net debt bridge, c'est le calcul précis : EV théorique − dette financière nette réelle au closing − dette-like items (engagements retraite, earn-out dus...) + cash-like items = Equity Value effective. L'equity bridge répartit ensuite cette Equity Value entre les différentes poches d'actionnaires (ordinaires, préférentiels, management package, BSA...). C'est le calcul qui dit concrètement 'qui reçoit combien' le jour du closing. Indispensable à maîtriser en entretien senior.",
    explanationEn: "The net debt bridge is the precise calculation: theoretical EV − actual net financial debt at closing − debt-like items (pension commitments, due earn-outs...) + cash-like items = effective Equity Value. The equity bridge then distributes this Equity Value among different shareholder pools (ordinary, preference, management package, warrants...). This is the calculation that concretely answers 'who receives what' on closing day. Essential to master for senior interviews.",
  },

];

  for (const q of questions) {
    if (!q.domainId) {
      console.log('Skipping question - domain not found');
      continue;
    }
    await client.query(
      `INSERT INTO question ("domainId", level, "textFr", "textEn", "propositionsFr", "propositionsEn", "explanationFr", "explanationEn", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       ON CONFLICT DO NOTHING`,
      [
        q.domainId, q.level, q.textFr, q.textEn,
        JSON.stringify(q.propositionsFr), JSON.stringify(q.propositionsEn),
        q.explanationFr, q.explanationEn
      ]
    );
  }

  console.log(`✅ ${questions.length} questions inserted`);
  await client.end();
}

seed().catch(console.error);