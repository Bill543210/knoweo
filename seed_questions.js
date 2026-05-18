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

  const domains = await client.query('SELECT id, slug FROM domain');
  const domainMap = {};
  domains.rows.forEach(d => domainMap[d.slug] = d.id);
  console.log('Domains:', domainMap);

const questions = [

  // ── NIVEAU 1 — Fondamentaux techniques ─────────────────────────

  {
    domainId: domainMap['accounting'],
    level: 1,
    subDomain: 'accounting-basics',
    textFr: "Concrètement, que signifie 'passer une écriture comptable' ?",
    textEn: "In concrete terms, what does 'posting a journal entry' mean?",
    propositionsFr: [
      { text: "Enregistrer une opération dans le livre journal en indiquant au moins un compte débité et un compte crédité pour un même montant", correct: true },
      { text: "Imprimer un document pour le classer dans un classeur", correct: false },
      { text: "Calculer l'impôt sur les sociétés à payer", correct: false },
      { text: "Envoyer une facture par email au client", correct: false },
    ],
    propositionsEn: [
      { text: "Recording a transaction in the journal by indicating at least one debited account and one credited account for the same amount", correct: true },
      { text: "Printing a document to file in a binder", correct: false },
      { text: "Calculating corporate tax to pay", correct: false },
      { text: "Sending an invoice by email to the customer", correct: false },
    ],
    explanationFr: "Passer une écriture, c'est comme noter une opération dans ton carnet de comptes personnel, mais avec une règle d'or : la partie double. Imagine une balançoire à bascule : quand tu descends d'un côté (tu crédites un compte), tu dois monter de l'autre du même montant (tu débites un autre compte). Si tu achètes une machine 10 000€, tu ne peux pas juste dire 'j'ai 10 000€ de moins'. Tu dois dire : 'Je débite le compte Machine de 10 000€ (j'enrichis mon actif) ET je crédite le compte Banque de 10 000€ (j'appauvris ma trésorerie)'. Les deux mouvements s'équilibrent toujours. C'est ce principe qui fait que le bilan est toujours équilibré : Actif = Passif. Même l'écriture la plus complexe du monde repose sur cette idée simple de balançoire.",
    explanationEn: "Posting a journal entry is like noting a transaction in your personal ledger, but with a golden rule: double entry. Picture a seesaw: when you go down on one side (you credit an account), you must go up by the same amount on the other (you debit another account). If you buy a machine for €10,000, you can't just say 'I have €10,000 less'. You must say: 'I debit the Machine account by €10,000 (I enrich my assets) AND I credit the Bank account by €10,000 (I deplete my cash)'. Both movements always balance. This principle is why the balance sheet always balances: Assets = Liabilities. Even the most complex entry in the world rests on this simple seesaw idea.",
  },

  {
    domainId: domainMap['accounting'],
    level: 1,
    subDomain: 'accounting-basics',
    textFr: "Dans un journal comptable, que signifie 'débiter' un compte ?",
    textEn: "In an accounting journal, what does 'debiting' an account mean?",
    propositionsFr: [
      { text: "Inscrire un montant dans la colonne de gauche du compte, ce qui augmente un actif ou une charge, et diminue un passif ou un produit", correct: true },
      { text: "Retirer de l'argent du compte bancaire de l'entreprise", correct: false },
      { text: "Effacer une dette fournisseur", correct: false },
      { text: "Toujours augmenter la valeur d'un compte, quel qu'il soit", correct: false },
    ],
    propositionsEn: [
      { text: "Entering an amount in the left column of the account, which increases an asset or expense, and decreases a liability or revenue", correct: true },
      { text: "Withdrawing money from the company's bank account", correct: false },
      { text: "Erasing a supplier debt", correct: false },
      { text: "Always increasing the value of an account, whatever it is", correct: false },
    ],
    explanationFr: "Le mot 'débiter' fait peur parce que dans la vie courante, ta banque te dit 'votre compte est débité' quand tu as moins d'argent. En comptabilité, c'est plus large. Imagine un tableau à deux colonnes par compte : gauche = débit, droite = crédit. Selon la nature du compte, débiter ne veut pas dire la même chose. Si c'est un compte d'actif (ce que tu possèdes), débiter = augmenter (exactement comme remplir ton frigo : plus tu débites le compte 'Frigo', plus il est plein). Si c'est un compte de passif (ce que tu dois), débiter = diminuer (rembourser une dette, c'est la débiter, donc la réduire). La clé, c'est de retenir que débit et crédit ne sont que des directions, pas des jugements. C'est comme dire 'à gauche' ou 'à droite' : ça dépend d'où tu regardes.",
    explanationEn: "The word 'debit' is scary because in everyday life your bank tells you 'your account has been debited' when you have less money. In accounting, it's broader. Picture a two-column table per account: left = debit, right = credit. Depending on the account's nature, debiting doesn't mean the same thing. If it's an asset account (what you own), debiting = increasing (exactly like stocking your fridge: the more you debit the 'Fridge' account, the fuller it is). If it's a liability account (what you owe), debiting = decreasing (repaying a debt means debiting it, hence reducing it). The key is to remember that debit and credit are only directions, not judgements. It's like saying 'left' or 'right': it depends where you're looking from.",
  },

  {
    domainId: domainMap['accounting'],
    level: 1,
    subDomain: 'accounting-basics',
    textFr: "Qu'est-ce qu'un plan comptable ?",
    textEn: "What is a chart of accounts?",
    propositionsFr: [
      { text: "Une liste structurée de tous les comptes que l'entreprise peut utiliser, classés par catégories numérotées", correct: true },
      { text: "Un planning des dates de clôture des comptes annuels", correct: false },
      { text: "Un document stratégique listant les investissements futurs", correct: false },
      { text: "Un tableur Excel listant les clients de l'entreprise", correct: false },
    ],
    propositionsEn: [
      { text: "A structured list of all accounts the company can use, classified by numbered categories", correct: true },
      { text: "A schedule of annual account closing dates", correct: false },
      { text: "A strategic document listing future investments", correct: false },
      { text: "An Excel spreadsheet listing the company's customers", correct: false },
    ],
    explanationFr: "Le plan comptable, c'est l'armoire de rangement de la comptabilité. Imagine une immense bibliothèque avec des étagères numérotées. La classe 1, c'est l'étagère 'Capital' (les comptes de capitaux propres). La classe 2, 'Immobilisations' (ce qui dure longtemps). La classe 3, 'Stocks'. La classe 4, 'Tiers' (clients, fournisseurs). La classe 5, 'Banque et cash'. La classe 6, 'Charges' (ce qu'on dépense). La classe 7, 'Produits' (ce qu'on gagne). Chaque étagère a des sous-étagères : 601 c'est 'Achats de matières premières', 701 c'est 'Ventes de produits finis'. Ce système permet à n'importe quel comptable en France de retrouver exactement la même chose au même endroit. C'est le code de la route comptable : tout le monde sait que le 607, c'est 'Achats de marchandises', comme tout le monde sait qu'un feu rouge veut dire stop.",
    explanationEn: "The chart of accounts is the storage cabinet of accounting. Imagine a huge library with numbered shelves. Class 1 is the 'Capital' shelf (equity accounts). Class 2, 'Fixed Assets' (things that last a long time). Class 3, 'Inventory'. Class 4, 'Third Parties' (customers, suppliers). Class 5, 'Bank and Cash'. Class 6, 'Expenses' (what you spend). Class 7, 'Revenue' (what you earn). Each shelf has sub-shelves: 601 is 'Raw Material Purchases', 701 is 'Finished Goods Sales'. This system allows any accountant in France to find exactly the same thing in the same place. It's the accounting highway code: everyone knows 607 is 'Merchandise Purchases', just like everyone knows a red light means stop.",
  },

  {
    domainId: domainMap['accounting'],
    level: 1,
    subDomain: 'accounting-basics',
    textFr: "Qu'est-ce qu'une balance comptable ?",
    textEn: "What is a trial balance?",
    propositionsFr: [
      { text: "Un tableau récapitulatif qui liste tous les comptes avec leur total débit et crédit pour vérifier que l'ensemble est équilibré", correct: true },
      { text: "Un document qui mesure le poids financier de chaque service de l'entreprise", correct: false },
      { text: "Un rapport qui compare les résultats de l'entreprise à ceux de ses concurrents", correct: false },
      { text: "Un document que la banque envoie pour confirmer le solde du compte", correct: false },
    ],
    propositionsEn: [
      { text: "A summary table listing all accounts with their debit and credit totals to verify everything balances", correct: true },
      { text: "A document measuring the financial weight of each company department", correct: false },
      { text: "A report comparing the company's results to its competitors", correct: false },
      { text: "A document sent by the bank to confirm the account balance", correct: false },
    ],
    explanationFr: "La balance, c'est la pesée de fin de journée du boulanger. Avant de fermer boutique, il vérifie que tout ce qu'il a vendu + ce qui reste en caisse correspond bien à ce qu'il avait au départ + ce qu'il a produit. La balance comptable fait pareil : elle prend chaque compte, additionne tous les débits, tous les crédits, et vérifie que le total général des débits égale le total général des crédits. Si ça ne tombe pas juste, c'est qu'il y a une erreur quelque part — comme le boulanger qui trouve 50€ en trop ou en moins dans sa caisse. La balance est l'outil de diagnostic avant de passer aux états financiers : si elle est bancale, le bilan et le compte de résultat le seront aussi.",
    explanationEn: "The trial balance is the baker's end-of-day weigh-in. Before closing shop, they check that everything sold + what's left in the till matches what they had at the start + what they produced. The trial balance does the same: it takes each account, adds up all debits, all credits, and checks that the grand total of debits equals the grand total of credits. If it doesn't add up, there's an error somewhere — like the baker finding €50 too much or too little in their till. The trial balance is the diagnostic tool before moving on to financial statements: if it's wobbly, the balance sheet and income statement will be too.",
  },

  {
    domainId: domainMap['accounting'],
    level: 1,
    subDomain: 'accounting-basics',
    textFr: "Que signifie 'lettrer' un compte en comptabilité ?",
    textEn: "What does 'reconciling' (matching) an account mean in accounting?",
    propositionsFr: [
      { text: "Rapprocher et associer une facture avec son règlement pour identifier ce qui reste dû ou ce qui est soldé", correct: true },
      { text: "Envoyer un courrier recommandé au fournisseur", correct: false },
      { text: "Classer les factures par ordre alphabétique", correct: false },
      { text: "Attribuer une note de crédit à un client mécontent", correct: false },
    ],
    propositionsEn: [
      { text: "Matching and linking an invoice with its payment to identify what remains owed or has been settled", correct: true },
      { text: "Sending a registered letter to the supplier", correct: false },
      { text: "Filing invoices in alphabetical order", correct: false },
      { text: "Issuing a credit note to an unhappy customer", correct: false },
    ],
    explanationFr: "Lettrer, c'est faire le ménage dans ses comptes. Imagine que tu as une pile de factures impayées et une pile de relevés bancaires. Tu prends une facture de 500€, tu cherches le paiement de 500€ sur ton relevé, et tu les mets ensemble avec un trombone. Tu écris la même lettre (A, B, C...) sur les deux documents pour montrer qu'ils vont ensemble. C'est exactement ça, le lettrage. Ça permet de faire émerger ce qui n'a pas encore de trombone : les factures sans paiement (impayés) et les paiements sans facture (acomptes ou erreurs). Sans lettrage, un compte client ou fournisseur est une jungle où on ne distingue plus ce qui est réglé de ce qui ne l'est pas.",
    explanationEn: "Matching accounts is like tidying up. Imagine you have a pile of unpaid invoices and a pile of bank statements. You take a €500 invoice, find the €500 payment on your statement, and clip them together. You write the same letter (A, B, C...) on both documents to show they go together. That's exactly what matching is. It highlights what doesn't yet have a paperclip: invoices without payment (unpaid) and payments without an invoice (advances or errors). Without matching, a customer or supplier account is a jungle where you can no longer tell what's settled from what isn't.",
  },

  // ── NIVEAU 2 — Techniques intermédiaires ─────────────────────────

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-basics',
    textFr: "Qu'est-ce qu'une écriture d'inventaire et à quel moment la passe-t-on ?",
    textEn: "What is an adjusting entry and when is it posted?",
    propositionsFr: [
      { text: "Une écriture passée en fin d'exercice pour ajuster les comptes à la réalité (stocks, amortissements, provisions, charges à payer)", correct: true },
      { text: "Une écriture qu'on passe à chaque fois qu'on reçoit une facture fournisseur", correct: false },
      { text: "Une écriture qui sert à corriger une erreur de saisie en cours d'année", correct: false },
      { text: "Une écriture qu'on passe uniquement lors d'un contrôle fiscal", correct: false },
    ],
    propositionsEn: [
      { text: "An entry posted at year-end to adjust accounts to reality (inventory, depreciation, provisions, accrued expenses)", correct: true },
      { text: "An entry posted each time a supplier invoice is received", correct: false },
      { text: "An entry used to correct a data entry error during the year", correct: false },
      { text: "An entry posted only during a tax audit", correct: false },
    ],
    explanationFr: "Pendant l'année, la comptabilité enregistre les factures et les relevés bancaires au jour le jour. Mais à la fin de l'exercice, il faut faire le ménage pour que les comptes reflètent la réalité. Imagine que tu fais tes comptes perso au 31 décembre. Tu as reçu une facture d'électricité qui couvre novembre-décembre, mais tu ne la paieras qu'en janvier. Si tu ne fais rien, ton compte de résultat de l'année écoulée ne montrera pas cette charge — comme si tu avais été chauffé gratuitement en décembre. L'écriture d'inventaire corrige ça : elle crée une charge sur l'exercice et une dette au bilan. Autre exemple : tu as un stock de marchandises. Il faut le compter, le valoriser, et ajuster les comptes pour que le stock théorique devienne le stock réel. Sans ces écritures de fin d'année, les comptes seraient comme une photo floue.",
    explanationEn: "During the year, accounting records invoices and bank statements day by day. But at year-end, you need to clean up so accounts reflect reality. Imagine doing your personal accounts on December 31st. You received an electricity bill covering November-December, but you'll only pay it in January. If you do nothing, your income statement for the past year won't show this expense — as if you'd been heated for free in December. The adjusting entry corrects this: it creates an expense for the year and a liability on the balance sheet. Another example: you have inventory. You need to count it, value it, and adjust accounts so theoretical stock becomes real stock. Without these year-end entries, accounts would be like a blurry photo.",
  },

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-basics',
    textFr: "Quelle est la différence entre une comptabilité d'engagement et une comptabilité de trésorerie ?",
    textEn: "What is the difference between accrual accounting and cash accounting?",
    propositionsFr: [
      { text: "En comptabilité d'engagement, on enregistre les opérations dès qu'elles sont réalisées (facture émise ou reçue) ; en comptabilité de trésorerie, uniquement quand l'argent entre ou sort", correct: true },
      { text: "La comptabilité d'engagement est pour les grandes entreprises ; la comptabilité de trésorerie est pour les particuliers exclusivement", correct: false },
      { text: "Il n'y a pas de différence : les deux termes désignent la même chose", correct: false },
      { text: "La comptabilité d'engagement ne concerne que les salaires ; celle de trésorerie que les ventes", correct: false },
    ],
    propositionsEn: [
      { text: "In accrual accounting, transactions are recorded as soon as they occur (invoice issued or received); in cash accounting, only when money comes in or goes out", correct: true },
      { text: "Accrual accounting is for large companies; cash accounting is for individuals exclusively", correct: false },
      { text: "There is no difference: both terms mean the same thing", correct: false },
      { text: "Accrual accounting only concerns salaries; cash accounting only concerns sales", correct: false },
    ],
    explanationFr: "C'est la différence entre noter que tu DOIS 50€ à un ami et noter que tu lui as DONNÉ 50€. En comptabilité de trésorerie, rien n'est enregistré tant que le billet n'a pas changé de main. Tu vends une voiture en décembre, le client paie en janvier : le chiffre d'affaires est en janvier. En comptabilité d'engagement (la norme pour toutes les entreprises), la vente est enregistrée en décembre, dès que la facture est émise, même si l'argent n'est pas encore là. C'est plus fidèle à la réalité économique — la voiture est bien partie en décembre. D'ailleurs, c'est obligatoire en France pour toutes les sociétés commerciales. La comptabilité de trésorerie, c'est juste ton carnet de chèques personnel : tu notes quand l'argent bouge, pas quand tu t'engages.",
    explanationEn: "It's the difference between noting you OWE a friend €50 and noting you GAVE them €50. In cash accounting, nothing is recorded until the banknote has changed hands. You sell a car in December, the customer pays in January: the revenue is in January. In accrual accounting (the standard for all companies), the sale is recorded in December, as soon as the invoice is issued, even if the money isn't there yet. It's more faithful to economic reality — the car did leave in December. In fact, it's mandatory in France for all commercial companies. Cash accounting is just your personal chequebook: you note when money moves, not when you commit.",
  },

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-analysis',
    textFr: "Qu'est-ce qu'un retraitement en analyse financière ?",
    textEn: "What is a restatement in financial analysis?",
    propositionsFr: [
      { text: "Une correction des comptes publiés pour les rendre plus proches de la réalité économique et permettre des comparaisons pertinentes", correct: true },
      { text: "Une correction des erreurs comptables détectées par l'auditeur", correct: false },
      { text: "Un changement de méthode comptable imposé par l'administration fiscale", correct: false },
      { text: "Une réduction des charges pour améliorer artificiellement le résultat", correct: false },
    ],
    propositionsEn: [
      { text: "A correction of published accounts to bring them closer to economic reality and enable meaningful comparisons", correct: true },
      { text: "A correction of accounting errors detected by the auditor", correct: false },
      { text: "A change in accounting method imposed by tax authorities", correct: false },
      { text: "A reduction in expenses to artificially improve profit", correct: false },
    ],
    explanationFr: "Les comptes officiels sont parfois comme une photo prise avec un filtre Instagram : la réalité est un peu déformée. Le retraitement, c'est enlever le filtre. Exemple concret : une entreprise a un gros procès en cours. Elle a constitué une provision énorme par prudence (le PCG français adore la prudence). Mais en réalité, elle a 90% de chances de gagner ce procès. L'analyste va retraiter les comptes en réduisant cette provision pour refléter la probabilité réelle. Autre exemple classique : le crédit-bail. Comptablement, la machine en crédit-bail n'apparaît pas au bilan (elle appartient au loueur). Mais économiquement, l'entreprise l'utilise comme si c'était la sienne. L'analyste la réintègre au bilan et aux dettes. Le but ? Comparer des pommes avec des pommes, pas avec des poires déguisées.",
    explanationEn: "Published accounts are sometimes like a photo taken with an Instagram filter: reality is slightly distorted. Restating is removing the filter. Concrete example: a company has a major ongoing lawsuit. It created a huge provision out of prudence (French GAAP loves prudence). But in reality, it has a 90% chance of winning. The analyst will restate the accounts by reducing this provision to reflect the real probability. Another classic example: leasing. In accounting terms, a leased machine doesn't appear on the balance sheet (it belongs to the lessor). But economically, the company uses it as if it were its own. The analyst reintegrates it into assets and debt. The goal? Comparing apples with apples, not with disguised pears.",
  },

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-analysis',
    textFr: "À quoi sert l'EBE (Excédent Brut d'Exploitation) et comment le calcule-t-on rapidement ?",
    textEn: "What is the purpose of EBITDA (in French: EBE) and how is it calculated quickly?",
    propositionsFr: [
      { text: "L'EBE mesure la performance économique avant les décisions de financement et d'investissement ; EBE = Valeur Ajoutée + Subventions d'exploitation − Impôts et taxes − Charges de personnel", correct: true },
      { text: "L'EBE est le bénéfice net avant impôt, c'est-à-dire le résultat fiscal", correct: false },
      { text: "L'EBE se calcule en prenant le chiffre d'affaires moins les achats de marchandises", correct: false },
      { text: "L'EBE est un indicateur qui mesure uniquement la trésorerie disponible en fin d'année", correct: false },
    ],
    propositionsEn: [
      { text: "EBITDA measures economic performance before financing and investment decisions; EBITDA = Value Added + Operating Subsidies − Taxes − Personnel Costs", correct: true },
      { text: "EBITDA is net profit before tax, i.e. the fiscal result", correct: false },
      { text: "EBITDA is calculated by taking revenue minus merchandise purchases", correct: false },
      { text: "EBITDA is an indicator measuring only year-end available cash", correct: false },
    ],
    explanationFr: "L'EBE, c'est le 'cash brut' généré par le métier de l'entreprise avant de payer les banquiers (intérêts), l'État (impôt sur les sociétés) et avant d'investir. Imagine que tu es artisan boulanger. Tu vends du pain (chiffre d'affaires). Tu achètes de la farine (consommations). Tu paies ton loyer, ton électricité, tes impôts locaux, et ton apprenti. Ce qui reste, c'est ton EBE : ce que ton fournil génère comme richesse brute, indépendamment du fait que ton emprunt bancaire te coûte cher ou pas, et indépendamment de tes investissements dans un nouveau pétrin. L'EBE est très utilisé pour comparer des entreprises d'un même secteur car il neutralise les différences de structure financière. Deux boulangeries peuvent avoir le même EBE, mais l'une sera moins bénéficiaire car elle a plus de dettes — et ça, l'EBE ne le pénalise pas, exprès.",
    explanationEn: "EBITDA is the 'gross cash' generated by the company's core business before paying bankers (interest), the State (corporate tax), and before investing. Imagine you're an artisan baker. You sell bread (revenue). You buy flour (consumables). You pay rent, electricity, local taxes, and your apprentice. What's left is your EBITDA: what your bakery generates as raw wealth, regardless of whether your bank loan is expensive or not, and regardless of your investments in a new kneading machine. EBITDA is widely used to compare companies in the same sector because it neutralises differences in financial structure. Two bakeries may have the same EBITDA, but one will be less profitable because it has more debt — and EBITDA deliberately doesn't penalise that.",
  },

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-ratios',
    textFr: "Un ratio de liquidité générale de 2,5 signifie-t-il que l'entreprise est en excellente santé ?",
    textEn: "Does a current ratio of 2.5 mean the company is in excellent health?",
    propositionsFr: [
      { text: "Pas nécessairement : un ratio trop élevé peut aussi indiquer une gestion inefficace des actifs (stocks dormants, créances qui traînent, cash qui dort)", correct: true },
      { text: "Oui, plus le ratio est élevé, meilleure est la santé de l'entreprise, sans limite", correct: false },
      { text: "Non, cela signifie que l'entreprise est en difficulté car elle a trop de dettes", correct: false },
      { text: "Oui, car cela prouve que l'entreprise peut rembourser deux fois et demie ses dettes immédiatement", correct: false },
    ],
    propositionsEn: [
      { text: "Not necessarily: a ratio that is too high may also indicate inefficient asset management (dormant stock, slow receivables, idle cash)", correct: true },
      { text: "Yes, the higher the ratio, the better the company's health, with no limit", correct: false },
      { text: "No, it means the company is in difficulty because it has too much debt", correct: false },
      { text: "Yes, because it proves the company can repay two and a half times its debts immediately", correct: false },
    ],
    explanationFr: "Un ratio de liquidité de 2,5, c'est comme avoir 2 500€ sur son compte courant pour 1 000€ de factures à payer ce mois-ci. Sur le papier, c'est rassurant — beaucoup de marge de sécurité. Mais regardons de plus près. Ces 2 500€, d'où viennent-ils ? Peut-être que 2 000€ sont des créances clients qui mettent 6 mois à être payées, ou pire, des stocks de produits qui ne se vendent plus. Dans ce cas, le ratio est un mirage. À l'inverse, une entreprise de grande distribution a souvent un ratio inférieur à 1 (elle encaisse les clients au comptant et paie ses fournisseurs à 60 jours) et c'est parfaitement sain. Le ratio idéal dépend du métier. Un ratio trop élevé peut même signifier que l'entreprise 'dort sur un tas d'or' inutilement, au lieu d'investir ce cash pour grandir. Il n'y a pas de chiffre magique universel.",
    explanationEn: "A current ratio of 2.5 is like having €2,500 in your current account for €1,000 in bills to pay this month. On paper, it's reassuring — lots of safety margin. But let's look closer. That €2,500 — where does it come from? Maybe €2,000 are customer receivables taking 6 months to be paid, or worse, stock of products that no longer sell. In that case, the ratio is a mirage. Conversely, a retail company often has a ratio below 1 (it collects cash from customers and pays suppliers at 60 days) and it's perfectly healthy. The ideal ratio depends on the business. A ratio that's too high can even mean the company is 'sleeping on a pile of gold' needlessly, instead of investing that cash to grow. There is no universal magic number.",
  },

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-ratios',
    textFr: "Qu'est-ce que l'effet de levier financier ?",
    textEn: "What is financial leverage?",
    propositionsFr: [
      { text: "Le mécanisme par lequel l'endettement amplifie la rentabilité des capitaux propres, à condition que le rendement des investissements dépasse le coût de la dette", correct: true },
      { text: "Le fait d'utiliser ses bénéfices non distribués pour autofinancer sa croissance", correct: false },
      { text: "L'augmentation mécanique du chiffre d'affaires grâce à une campagne de publicité", correct: false },
      { text: "La capacité à négocier des délais de paiement plus longs avec ses fournisseurs", correct: false },
    ],
    propositionsEn: [
      { text: "The mechanism by which debt amplifies the return on equity, provided the return on investments exceeds the cost of debt", correct: true },
      { text: "Using retained earnings to self-finance growth", correct: false },
      { text: "The mechanical increase in revenue thanks to an advertising campaign", correct: false },
      { text: "The ability to negotiate longer payment terms with suppliers", correct: false },
    ],
    explanationFr: "L'effet de levier, c'est comme acheter un appartement à crédit pour le louer. Tu mets 20 000€ de ta poche (capitaux propres) et tu empruntes 80 000€ à la banque à 3% d'intérêt. L'appartement te rapporte 6 000€ de loyer par an (soit 6% de rendement sur les 100 000€). Tu paies 2 400€ d'intérêts (3% × 80 000€). Il te reste 3 600€. Rapporté à tes 20 000€ d'apport, ça fait 18% de rentabilité (3 600 / 20 000). Magique : ton rendement passe de 6% à 18% grâce au levier de la dette. Mais attention, l'effet levier fonctionne dans les deux sens. Si le loyer chute à 4 000€ (4% de rendement), après intérêts il te reste 1 600€, soit 8% de rentabilité. Le levier amplifie les gains, mais il amplifie aussi les pertes. C'est un outil puissant mais dangereux, comme un couteau de cuisine : entre les mains d'un chef, il fait des merveilles ; entre de mauvaises mains, il coupe les doigts.",
    explanationEn: "Leverage is like buying a flat with a mortgage to rent it out. You put in €20,000 of your own money (equity) and borrow €80,000 from the bank at 3% interest. The flat earns you €6,000 in rent per year (6% return on the €100,000). You pay €2,400 in interest (3% × €80,000). You're left with €3,600. Compared to your €20,000 down payment, that's an 18% return (3,600 / 20,000). Magic: your return goes from 6% to 18% thanks to debt leverage. But beware — leverage works both ways. If rent drops to €4,000 (4% return), after interest you're left with €1,600, an 8% return. Leverage amplifies gains, but it also amplifies losses. It's a powerful but dangerous tool, like a kitchen knife: in a chef's hands, it works wonders; in the wrong hands, it cuts fingers.",
  },

  {
    domainId: domainMap['accounting'],
    level: 2,
    subDomain: 'accounting-analysis',
    textFr: "Comment calcule-t-on le Besoin en Fonds de Roulement (BFR) et que signifie un BFR négatif ?",
    textEn: "How is Working Capital Requirement (WCR) calculated and what does a negative WCR mean?",
    propositionsFr: [
      { text: "BFR = Stocks + Créances clients − Dettes fournisseurs. Un BFR négatif signifie que les fournisseurs financent une partie du cycle d'exploitation", correct: true },
      { text: "BFR = Capitaux propres − Dettes financières. Un BFR négatif signifie que l'entreprise est en faillite", correct: false },
      { text: "BFR = Chiffre d'affaires − Charges d'exploitation. Un BFR négatif signifie que l'entreprise est déficitaire", correct: false },
      { text: "BFR = Actif total − Passif total. Un BFR négatif signifie que le bilan est déséquilibré", correct: false },
    ],
    propositionsEn: [
      { text: "WCR = Inventory + Customer receivables − Supplier payables. Negative WCR means suppliers finance part of the operating cycle", correct: true },
      { text: "WCR = Equity − Financial debt. Negative WCR means the company is bankrupt", correct: false },
      { text: "WCR = Revenue − Operating expenses. Negative WCR means the company is loss-making", correct: false },
      { text: "WCR = Total assets − Total liabilities. Negative WCR means the balance sheet is unbalanced", correct: false },
    ],
    explanationFr: "Le BFR, c'est le 'trou dans la trésorerie' créé par le décalage entre le moment où tu paies et le moment où tu es payé. Formule simple : BFR = (Stocks + Créances clients) − Dettes fournisseurs. Si ton BFR est de +50 000€, ça signifie que tu as 50 000€ 'immobilisés' dans ton cycle d'exploitation — comme une avance de trésorerie que tu fais à tes clients. Un BFR négatif, c'est le Graal de la gestion de trésorerie. Imagine un supermarché : les clients paient en caisse immédiatement, mais le supermarché paie ses fournisseurs 60 jours plus tard. Résultat : il encaisse avant de décaisser. Son BFR est négatif : ce sont les fournisseurs qui font l'avance de trésorerie. Plus le supermarché grandit, plus il génère du cash — c'est le modèle d'Amazon ou de Carrefour. Un BFR négatif, c'est comme si tes voisins te prêtaient gratuitement de l'argent pour faire tourner ton commerce.",
    explanationEn: "WCR is the 'cash gap' created by the timing difference between when you pay and when you get paid. Simple formula: WCR = (Inventory + Customer receivables) − Supplier payables. If your WCR is +€50,000, it means you have €50,000 'tied up' in your operating cycle — like a cash advance you're giving your customers. Negative WCR is the Holy Grail of cash management. Imagine a supermarket: customers pay at the checkout immediately, but the supermarket pays its suppliers 60 days later. Result: it collects before it pays out. Its WCR is negative: suppliers are providing the cash advance. The more the supermarket grows, the more cash it generates — this is the Amazon or Carrefour model. Negative WCR is like your neighbours lending you free money to run your business.",
  },

  // ── NIVEAU 3 — Techniques avancées & questions d'entretien ─────────────────────────

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-analysis',
    textFr: "❓ Question d'entretien — Expliquez-moi le passage du résultat net à la CAF (Capacité d'Autofinancement) et pourquoi c'est important",
    textEn: "❓ Interview question — Explain the bridge from net income to operating cash flow and why it matters",
    propositionsFr: [
      { text: "Résultat net + Dotations aux amortissements − Reprises sur amortissements + Dotations aux provisions − Reprises sur provisions − Produits de cession + Valeur nette comptable des actifs cédés", correct: true },
      { text: "Résultat net + Chiffre d'affaires − Charges de personnel", correct: false },
      { text: "Résultat net × (1 − Taux d'IS) + Dividendes versés aux actionnaires", correct: false },
      { text: "Résultat net + Variation de trésorerie − Investissements de l'exercice", correct: false },
    ],
    propositionsEn: [
      { text: "Net income + Depreciation charges − Depreciation reversals + Provision charges − Provision reversals − Disposal gains + Net book value of disposed assets", correct: true },
      { text: "Net income + Revenue − Personnel costs", correct: false },
      { text: "Net income × (1 − Tax rate) + Dividends paid to shareholders", correct: false },
      { text: "Net income + Change in cash − Capital expenditure for the year", correct: false },
    ],
    explanationFr: "La CAF, c'est le cash potentiel généré par l'activité, et le calcul est un véritable parcours de santé. On part du résultat net, mais il contient des éléments qui n'ont jamais vu la couleur de l'argent liquide. Imagine que ton résultat net est comme une valise. Dedans, il y a des vrais billets (le cash) et des reconnaissances de dette (les charges non décaissées). Pour retrouver les vrais billets, tu dois enlever tout ce qui n'est pas du cash. Étape 1 : rajouter les amortissements (une charge comptable qui représente l'usure d'une machine, mais aucun euro n'est sorti de ta poche). Étape 2 : rajouter les provisions (même logique, de l'argent mis de côté 'au cas où', mais pas dépensé). Étape 3 : enlever les reprises d'amortissements et de provisions (du 'non-cash positif' qui gonfle artificiellement le résultat). Étape 4 : corriger les cessions d'actifs — si tu vends une machine, le résultat inclut la plus-value, mais le cash reçu est le prix de vente, pas seulement la plus-value. Au final, la CAF est un bien meilleur indicateur de la capacité à rembourser des dettes ou à investir que le simple résultat net.",
    explanationEn: "Operating cash flow is the potential cash generated by the business, and the calculation is a real obstacle course. We start with net income, but it contains items that have never seen the colour of liquid money. Imagine your net income is like a suitcase. Inside, there are real notes (cash) and IOUs (non-cash charges). To find the real notes, you must remove everything that isn't cash. Step 1: add back depreciation (an accounting charge representing machine wear and tear, but no euro left your pocket). Step 2: add back provisions (same logic — money set aside 'just in case', but not spent). Step 3: remove reversals of depreciation and provisions ('positive non-cash' that artificially inflates profit). Step 4: correct asset disposals — if you sell a machine, profit includes the capital gain, but the cash received is the sale price, not just the gain. In the end, operating cash flow is a far better indicator of the ability to repay debt or invest than simple net income.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-analysis',
    textFr: "❓ Question d'entretien — Quelle est la différence entre la CAF et le Free Cash Flow (FCF) ?",
    textEn: "❓ Interview question — What is the difference between operating cash flow and free cash flow?",
    propositionsFr: [
      { text: "La CAF mesure le cash généré par l'activité avant variation du BFR et investissements ; le FCF est le cash réellement disponible après variation du BFR et investissements de maintien/développement", correct: true },
      { text: "La CAF inclut les dividendes versés ; le FCF les exclut", correct: false },
      { text: "La CAF et le FCF sont deux noms différents pour exactement la même chose", correct: false },
      { text: "La CAF est un concept français ; le FCF est sa traduction anglaise littérale", correct: false },
    ],
    propositionsEn: [
      { text: "Operating cash flow measures cash from operations before changes in working capital and capex; FCF is the cash actually available after changes in working capital and maintenance/development capex", correct: true },
      { text: "Operating cash flow includes dividends paid; FCF excludes them", correct: false },
      { text: "Operating cash flow and FCF are two different names for exactly the same thing", correct: false },
      { text: "Operating cash flow is a French concept; FCF is its literal English translation", correct: false },
    ],
    explanationFr: "La CAF, c'est comme ton salaire brut annoncé sur ta fiche de paie. Le Free Cash Flow, c'est ce qui reste sur ton compte en banque à la fin du mois après avoir payé le loyer, les courses, et remplacé ta machine à laver en panne. La CAF ignore deux choses cruciales : la variation du BFR et les investissements. Si tes clients mettent plus de temps à payer cette année (le BFR augmente), la CAF ne le voit pas — pourtant, ton compte en banque le sent. Si tu dois absolument changer une machine pour continuer à produire (investissement de maintien), la CAF ne le voit pas non plus — elle considère que cet argent est encore disponible. Le FCF, lui, enlève ces deux postes. Résultat : une entreprise peut avoir une CAF magnifique et un FCF négatif — elle génère du cash sur le papier, mais dans la réalité, elle s'appauvrit. C'est pour ça qu'en M&A, on valorise les entreprises sur le FCF, pas sur la CAF.",
    explanationEn: "Operating cash flow is like your gross salary shown on your payslip. Free Cash Flow is what's left in your bank account at the end of the month after paying rent, shopping, and replacing your broken washing machine. Operating cash flow ignores two crucial things: the change in working capital and capital expenditure. If your customers take longer to pay this year (working capital increases), operating cash flow doesn't see it — yet your bank account feels it. If you absolutely must replace a machine to keep producing (maintenance capex), operating cash flow doesn't see that either — it considers that money still available. FCF removes both these items. Result: a company can have magnificent operating cash flow and negative FCF — it generates cash on paper, but in reality, it's getting poorer. That's why in M&A, companies are valued on FCF, not operating cash flow.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-consolidation',
    textFr: "❓ Question d'entretien — Quelle est la différence entre une provision et une dette en comptabilité ?",
    textEn: "❓ Interview question — What is the difference between a provision and a liability in accounting?",
    propositionsFr: [
      { text: "Une dette est certaine dans son montant et son échéance ; une provision couvre une charge probable mais dont le montant ou l'échéance reste incertain", correct: true },
      { text: "Il n'y a pas de différence : les deux représentent de l'argent que l'entreprise doit", correct: false },
      { text: "Une provision est une dette à long terme ; une dette est une provision à court terme", correct: false },
      { text: "Une provision est une réserve de cash ; une dette est une obligation de payer", correct: false },
    ],
    propositionsEn: [
      { text: "A liability is certain in its amount and due date; a provision covers a probable charge whose amount or timing remains uncertain", correct: true },
      { text: "There is no difference: both represent money the company owes", correct: false },
      { text: "A provision is a long-term liability; a liability is a short-term provision", correct: false },
      { text: "A provision is a cash reserve; a liability is an obligation to pay", correct: false },
    ],
    explanationFr: "Imagine que tu reçois deux courriers. Le premier est une facture d'électricité de 150€ à payer avant le 15 du mois prochain. Montant connu, date connue : c'est une dette. Le deuxième courrier est une mise en demeure d'un voisin qui t'accuse d'avoir abîmé sa clôture et réclame 5 000€ de dommages. Tu ne sais pas encore si tu vas perdre le procès, ni combien tu devras exactement — mais il y a une vraie probabilité que ça te coûte quelque chose. Tu décides prudemment de provisionner 3 000€. Cette provision dit à quiconque lit tes comptes : 'Attention, il y a un risque, j'ai estimé son impact probable'. La nuance est cruciale en analyse financière. Une dette, on sait à quoi s'en tenir. Une provision, c'est une boule de cristal : elle dépend du jugement de la direction. Une provision trop faible, et l'entreprise se croit plus riche qu'elle n'est. Une provision trop grosse, et elle cache du bénéfice pour les jours de pluie (on appelle ça 'lisser' les résultats). En M&A, l'acheteur scrute les provisions comme un détective : il sait que c'est là que se cachent les bonnes et les mauvaises surprises.",
    explanationEn: "Imagine you receive two letters. The first is an electricity bill for €150, payable by the 15th of next month. Known amount, known date: it's a liability. The second is a formal notice from a neighbour accusing you of damaging their fence and claiming €5,000 in damages. You don't yet know if you'll lose the case, nor exactly how much you'll owe — but there's a real probability it'll cost you something. Prudently, you decide to provision €3,000. This provision tells anyone reading your accounts: 'Warning, there's a risk here, I've estimated its likely impact'. The nuance is crucial in financial analysis. A liability, you know where you stand. A provision is a crystal ball: it depends on management's judgement. A provision that's too low, and the company thinks it's richer than it is. A provision that's too high, and it's hiding profit for a rainy day (this is called 'smoothing' earnings). In M&A, buyers scrutinise provisions like a detective: they know that's where good and bad surprises are hidden.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-consolidation',
    textFr: "Qu'est-ce que l'écart d'acquisition (goodwill) et comment le calcule-t-on simplement ?",
    textEn: "What is goodwill and how is it simply calculated?",
    propositionsFr: [
      { text: "L'écart entre le prix payé pour acquérir une entreprise et la juste valeur de ses actifs nets identifiables ; Goodwill = Prix d'acquisition − Juste valeur des actifs nets repris", correct: true },
      { text: "La différence entre le chiffre d'affaires de l'acquéreur et celui de la cible", correct: false },
      { text: "La valeur de la marque de l'entreprise acquise, estimée par un expert indépendant", correct: false },
      { text: "Le coût total de l'acquisition, incluant les frais d'avocats et de banques d'affaires", correct: false },
    ],
    propositionsEn: [
      { text: "The gap between the price paid to acquire a company and the fair value of its identifiable net assets; Goodwill = Purchase price − Fair value of net assets acquired", correct: true },
      { text: "The difference between the acquirer's revenue and the target's revenue", correct: false },
      { text: "The value of the acquired company's brand, estimated by an independent expert", correct: false },
      { text: "The total acquisition cost, including lawyers' and investment banks' fees", correct: false },
    ],
    explanationFr: "Imagine que tu achètes une boulangerie 200 000€. Le boulanger te montre ses comptes : le four vaut 30 000€, le stock de farine 5 000€, le compte en banque 10 000€, et il a une dette de 15 000€. La juste valeur de l'actif net est donc 30 + 5 + 10 − 15 = 30 000€. Tu as payé 200 000€ pour quelque chose qui en vaut comptablement 30 000€. Les 170 000€ de différence, c'est le goodwill. Qu'est-ce que tu as acheté avec ces 170 000€ ? L'emplacement, la réputation, la clientèle fidèle, la recette secrète de la baguette, le savoir-faire du personnel... Tout ce qui fait que la boulangerie vaut plus que la somme de ses machines et de sa farine. Le goodwill, c'est la valeur de l'écosystème invisible. En comptabilité française, on l'amortit. En IFRS, on le teste chaque année : si la boulangerie perd sa clientèle, on le déprécie. C'est un actif très sensible, un baromètre de la réussite ou de l'échec d'une acquisition.",
    explanationEn: "Imagine you buy a bakery for €200,000. The baker shows you their accounts: the oven is worth €30,000, flour stock €5,000, bank account €10,000, and there's a €15,000 debt. The fair value of net assets is therefore 30 + 5 + 10 − 15 = €30,000. You paid €200,000 for something worth €30,000 on paper. The €170,000 difference is goodwill. What did you buy with that €170,000? The location, the reputation, the loyal customers, the secret baguette recipe, the staff know-how... Everything that makes the bakery worth more than the sum of its machines and flour. Goodwill is the value of the invisible ecosystem. Under French GAAP, it's amortised. Under IFRS, it's tested annually: if the bakery loses its customers, it's written down. It's a very sensitive asset — a barometer of the success or failure of an acquisition.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-analysis',
    textFr: "Comment calcule-t-on la Valeur Ajoutée d'une entreprise et pourquoi est-ce un indicateur clé ?",
    textEn: "How is Value Added calculated and why is it a key indicator?",
    propositionsFr: [
      { text: "Valeur Ajoutée = Marge commerciale + Production de l'exercice − Consommations de l'exercice en provenance de tiers. Elle mesure la richesse créée par l'entreprise avant répartition entre les parties prenantes", correct: true },
      { text: "Valeur Ajoutée = Chiffre d'affaires − Bénéfice net. Elle mesure ce qui a été distribué aux actionnaires", correct: false },
      { text: "Valeur Ajoutée = Actif total − Dettes totales. Elle mesure la valeur patrimoniale de l'entreprise", correct: false },
      { text: "Valeur Ajoutée = Résultat d'exploitation + Impôts. Elle mesure le revenu avant impôt", correct: false },
    ],
    propositionsEn: [
      { text: "Value Added = Gross margin + Production for the year − External consumption for the year. It measures the wealth created by the company before distribution among stakeholders", correct: true },
      { text: "Value Added = Revenue − Net profit. It measures what was distributed to shareholders", correct: false },
      { text: "Value Added = Total assets − Total liabilities. It measures the company's net worth", correct: false },
      { text: "Value Added = Operating profit + Taxes. It measures pre-tax income", correct: false },
    ],
    explanationFr: "La Valeur Ajoutée, c'est le 'gâteau' que l'entreprise a fabriqué avec son travail. Avant de savoir comment on va partager ce gâteau, il faut savoir quelle taille il fait. Pour le mesurer, on part de ce que l'entreprise a produit (ses ventes, sa production stockée) et on enlève ce qu'elle a acheté à l'extérieur (la farine pour le boulanger, l'électricité, les matières premières). Ce qui reste, c'est la valeur AJOUTÉE par le travail de l'entreprise. Ensuite, ce gâteau est partagé entre les salariés (salaires), l'État (impôts et cotisations), les banquiers (intérêts), les actionnaires (dividendes) et l'entreprise elle-même (autofinancement). La Valeur Ajoutée est un indicateur clé car elle évite un piège : une entreprise peut avoir un chiffre d'affaires énorme mais une valeur ajoutée minuscule si elle ne fait que revendre ce qu'elle achète (c'est le cas des purs intermédiaires). Le ratio Valeur Ajoutée / Chiffre d'affaires mesure le degré d'intégration de l'entreprise.",
    explanationEn: "Value Added is the 'cake' the company has baked with its work. Before deciding how to share this cake, you need to know its size. To measure it, you start with what the company produced (its sales, its stored production) and remove what it bought externally (flour for the baker, electricity, raw materials). What's left is the value ADDED by the company's work. This cake is then shared between employees (wages), the State (taxes and contributions), bankers (interest), shareholders (dividends), and the company itself (self-financing). Value Added is a key indicator because it avoids a trap: a company can have huge revenue but tiny value added if it merely resells what it buys (this is the case for pure intermediaries). The Value Added / Revenue ratio measures the company's degree of integration.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-analysis',
    textFr: "❓ Question d'entretien — Qu'est-ce que le tableau de financement et en quoi diffère-t-il du tableau de flux de trésorerie ?",
    textEn: "❓ Interview question — What is the funds flow statement and how does it differ from the cash flow statement?",
    propositionsFr: [
      { text: "Le tableau de financement raisonne en 'ressources et emplois' (vision patrimoniale large) ; le tableau de flux de trésorerie se concentre exclusivement sur les mouvements de cash", correct: true },
      { text: "Le tableau de financement est obligatoire en France ; le tableau de flux de trésorerie est obligatoire aux États-Unis exclusivement", correct: false },
      { text: "Les deux documents sont identiques : seul le nom change selon le pays", correct: false },
      { text: "Le tableau de financement est un document fiscal ; le tableau de flux de trésorerie est un document comptable", correct: false },
    ],
    propositionsEn: [
      { text: "The funds flow statement works in 'sources and uses' (broad asset-based view); the cash flow statement focuses exclusively on cash movements", correct: true },
      { text: "The funds flow statement is mandatory in France; the cash flow statement is mandatory only in the United States", correct: false },
      { text: "Both documents are identical: only the name changes between countries", correct: false },
      { text: "The funds flow statement is a tax document; the cash flow statement is an accounting document", correct: false },
    ],
    explanationFr: "Le tableau de financement, c'est la version 'ancienne école' française de l'analyse des flux. Il classe les mouvements en deux grandes colonnes : les ressources (d'où vient l'argent ? bénéfice, emprunts, cessions d'actifs) et les emplois (où va l'argent ? investissements, remboursement de dettes, dividendes). Il raisonne en termes de 'fonds de roulement' — une notion plus large que le simple cash, qui inclut toutes les ressources stables. Le tableau de flux de trésorerie, lui, est chirurgical : il ne regarde que le cash, strictement. Une augmentation de stock, pour le tableau de financement, c'est un emploi parmi d'autres. Pour le cash flow, c'est une sortie de cash identifiée précisément. Aujourd'hui, le tableau de flux de trésorerie a largement supplanté le tableau de financement dans l'analyse financière moderne, notamment sous l'influence des normes IFRS. Mais le tableau de financement reste obligatoire dans les comptes sociaux français de certaines entreprises — c'est un dinosaure administratif qui survit, un peu comme le fax à l'heure d'Internet.",
    explanationEn: "The funds flow statement is the French 'old school' version of flow analysis. It classifies movements into two main columns: sources (where does the money come from? profit, loans, asset disposals) and uses (where does the money go? investments, debt repayments, dividends). It works in terms of 'working capital' — a broader notion than simple cash, including all stable resources. The cash flow statement is surgical: it only looks at cash, strictly. An increase in inventory, for the funds flow statement, is just one use among others. For the cash flow, it's a precisely identified cash outflow. Today, the cash flow statement has largely supplanted the funds flow statement in modern financial analysis, notably under IFRS influence. But the funds flow statement remains mandatory in the French statutory accounts of certain companies — it's an administrative dinosaur that survives, a bit like the fax machine in the Internet age.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-ratios',
    textFr: "❓ Question d'entretien — Comment calcule-t-on le WACC (Coût Moyen Pondéré du Capital) et à quoi sert-il ?",
    textEn: "❓ Interview question — How is WACC calculated and what is its purpose?",
    propositionsFr: [
      { text: "WACC = (Capitaux propres / Capital total × Coût des capitaux propres) + (Dette / Capital total × Coût de la dette × (1 − Taux d'IS)). Il sert de taux d'actualisation pour valoriser l'entreprise", correct: true },
      { text: "WACC = Résultat d'exploitation / Actif total. Il mesure la rentabilité des actifs", correct: false },
      { text: "WACC = Bénéfice net / Capitaux propres. Il mesure le rendement pour les actionnaires", correct: false },
      { text: "WACC = (Chiffre d'affaires − Charges variables) / Charges fixes. Il mesure le point mort", correct: false },
    ],
    propositionsEn: [
      { text: "WACC = (Equity / Total capital × Cost of equity) + (Debt / Total capital × Cost of debt × (1 − Tax rate)). It serves as the discount rate for valuing the company", correct: true },
      { text: "WACC = Operating profit / Total assets. It measures return on assets", correct: false },
      { text: "WACC = Net profit / Equity. It measures shareholder return", correct: false },
      { text: "WACC = (Revenue − Variable costs) / Fixed costs. It measures the breakeven point", correct: false },
    ],
    explanationFr: "Le WACC, c'est le 'prix de l'argent' pour l'entreprise. Imagine que tu finances l'achat d'une maison avec deux sources : 30 000€ de tes économies (capitaux propres) et 70 000€ empruntés à la banque à 3%. Tes économies, tu aurais pu les placer en bourse à 7% — c'est le 'coût d'opportunité', ce à quoi tu renonces. Le coût de ton capital total est une moyenne pondérée : (30% × 7%) + (70% × 3%). Mais attention, les intérêts d'emprunt sont déductibles d'impôts : si tu paies 30% d'impôts, le coût réel de la dette n'est pas 3% mais 3% × (1 − 30%) = 2,1%. Le WACC final est donc (30% × 7%) + (70% × 2,1%) = 3,57%. À quoi ça sert ? C'est le taux minimum de rentabilité que l'entreprise doit générer sur ses investissements. Si un projet rapporte 5% et que ton WACC est 3,57%, tu crées de la valeur. Si le projet rapporte 2%, tu en détruis — autant ne pas le faire. C'est l'étalon-or de la finance d'entreprise.",
    explanationEn: "WACC is the 'price of money' for the company. Imagine you finance buying a house with two sources: €30,000 of your savings (equity) and €70,000 borrowed from the bank at 3%. Your savings could have been invested in the stock market at 7% — that's the 'opportunity cost', what you're giving up. The cost of your total capital is a weighted average: (30% × 7%) + (70% × 3%). But watch out: loan interest is tax-deductible: if you pay 30% tax, the real cost of debt isn't 3% but 3% × (1 − 30%) = 2.1%. The final WACC is therefore (30% × 7%) + (70% × 2.1%) = 3.57%. What's it for? It's the minimum rate of return the company must generate on its investments. If a project yields 5% and your WACC is 3.57%, you create value. If the project yields 2%, you destroy it — might as well not do it. It's the gold standard of corporate finance.",
  },

  {
    domainId: domainMap['accounting'],
    level: 3,
    subDomain: 'accounting-ratios',
    textFr: "Qu'est-ce que l'analyse par les ratios de rotation et que révèle-t-elle ?",
    textEn: "What is turnover ratio analysis and what does it reveal?",
    propositionsFr: [
      { text: "Elle mesure la vitesse à laquelle les stocks et les créances se renouvellent, révélant l'efficacité opérationnelle et la gestion du BFR", correct: true },
      { text: "Elle mesure la rotation du personnel dans l'entreprise (taux de turnover RH)", correct: false },
      { text: "Elle mesure combien de fois l'entreprise change de stratégie commerciale par an", correct: false },
      { text: "Elle mesure le nombre de clients qui changent de fournisseur chaque année", correct: false },
    ],
    propositionsEn: [
      { text: "It measures the speed at which inventory and receivables renew, revealing operational efficiency and working capital management", correct: true },
      { text: "It measures employee turnover in the company (HR churn rate)", correct: false },
      { text: "It measures how many times the company changes strategy per year", correct: false },
      { text: "It measures the number of customers switching suppliers each year", correct: false },
    ],
    explanationFr: "Les ratios de rotation, c'est le compteur de vitesse de l'entreprise. Trois ratios clés : 1) Rotation des stocks = Coût des ventes / Stock moyen. Il dit combien de fois le stock est entièrement renouvelé dans l'année. Un boulanger a une rotation de stock de farine très élevée (il achète et utilise en permanence). Un marchand de meubles a une rotation faible. 2) Délai de rotation des créances clients = (Créances clients / CA TTC) × 360. Il dit combien de jours les clients mettent à payer. 3) Délai de rotation des dettes fournisseurs = (Dettes fournisseurs / Achats TTC) × 360. Il dit combien de jours tu mets à payer tes fournisseurs. L'analyse combinée de ces trois ratios est le secret de la gestion du BFR : si tes clients paient à 60 jours et que tu paies tes fournisseurs à 30 jours, tu as un trou de trésorerie de 30 jours. Si c'est l'inverse, tu es financé par tes fournisseurs. C'est la mécanique de précision du cycle d'exploitation.",
    explanationEn: "Turnover ratios are the company's speedometer. Three key ratios: 1) Inventory turnover = Cost of sales / Average inventory. It tells you how many times inventory is fully renewed during the year. A baker has very high flour inventory turnover (they buy and use constantly). A furniture dealer has low turnover. 2) Customer receivable days = (Customer receivables / Revenue incl. tax) × 360. It tells you how many days customers take to pay. 3) Supplier payable days = (Supplier payables / Purchases incl. tax) × 360. It tells you how many days you take to pay suppliers. The combined analysis of these three ratios is the secret to working capital management: if your customers pay at 60 days and you pay suppliers at 30 days, you have a 30-day cash gap. If it's the reverse, you're financed by your suppliers. This is the precision mechanics of the operating cycle.",
  },

];

  for (const q of questions) {
    if (!q.domainId) {
      console.log('Skipping question - domain not found');
      continue;
    }
    await client.query(
      `INSERT INTO question ("domainId", level, "textFr", "textEn", "propositionsFr", "propositionsEn", "explanationFr", "explanationEn", "isActive", "subDomain")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
       ON CONFLICT DO NOTHING`,
      [
        q.domainId, q.level, q.textFr, q.textEn,
        JSON.stringify(q.propositionsFr), JSON.stringify(q.propositionsEn),
        q.explanationFr, q.explanationEn,
        q.subDomain || null
      ]
    );
  }

  console.log(`✅ ${questions.length} questions inserted`);
  await client.end();
}

seed().catch(console.error);