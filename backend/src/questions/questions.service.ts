import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async findByDomain(domainId: string, level?: number): Promise<Question[]> {
    const where: any = { domainId, isActive: true };
    if (level) where.level = level;
    return this.questionsRepository.find({ where });
  }

  async findRandom(domainIds: string[], level: number, count: number, excludeIds: string[] = []): Promise<Question[]> {
    const query = this.questionsRepository
      .createQueryBuilder('question')
      .where('question.domainId IN (:...domainIds)', { domainIds })
      .andWhere('question.level = :level', { level })
      .andWhere('question.isActive = true');

    if (excludeIds.length > 0) {
      query.andWhere('question.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const questions = await query.getMany();
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async findForSession(
    domainIds: string[],
    currentLevel: number,
    seenIds: string[],
    missedIds: string[],
  ): Promise<Question | null> {
    if (missedIds.length > 0 && Math.random() < 0.3) {
      const missedQuestions = await this.questionsRepository
        .createQueryBuilder('question')
        .where('question.id IN (:...missedIds)', { missedIds })
        .andWhere('question.isActive = true')
        .getMany();

      if (missedQuestions.length > 0) {
        return missedQuestions.sort(() => Math.random() - 0.5)[0];
      }
    }

    const query = this.questionsRepository
      .createQueryBuilder('question')
      .where('question.domainId IN (:...domainIds)', { domainIds })
      .andWhere('question.level = :level', { level: currentLevel })
      .andWhere('question.isActive = true');

    if (seenIds.length > 0) {
      query.andWhere('question.id NOT IN (:...seenIds)', { seenIds });
    }

    const questions = await query.getMany();

    if (questions.length === 0) {
      const fallback = await this.questionsRepository
        .createQueryBuilder('question')
        .where('question.domainId IN (:...domainIds)', { domainIds })
        .andWhere('question.level = :level', { level: currentLevel })
        .andWhere('question.isActive = true')
        .getMany();

      if (fallback.length === 0) return null;
      return fallback.sort(() => Math.random() - 0.5)[0];
    }

    return questions.sort(() => Math.random() - 0.5)[0];
  }

  async findById(id: string): Promise<Question | null> {
    return this.questionsRepository.findOne({ where: { id } });
  }

  async findForInterview(
  domainIds: string[],
  levels: number[],
  count: number,
  excludeIds: string[] = [],
): Promise<Question[]> {
  const query = this.questionsRepository
    .createQueryBuilder('question')
    .where('question.domainId IN (:...domainIds)', { domainIds })
    .andWhere('question.isActive = true')
    .andWhere('question.isInterviewQuestion = true');

  if (levels.length > 0) {
    query.andWhere('question.level IN (:...levels)', { levels });
  }

  if (excludeIds.length > 0) {
    query.andWhere('question.id NOT IN (:...excludeIds)', { excludeIds });
  }

  const questions = await query.getMany();

  // Mélange et limite
  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, 30));
}

  async create(data: Partial<Question>): Promise<Question> {
    const question = this.questionsRepository.create(data);
    return this.questionsRepository.save(question);
  }

  async seed(domainId: string): Promise<void> {
    const questions = [
      {
        domainId,
        level: 1,
        textFr: 'Que signifie l\'acronyme M&A ?',
        textEn: 'What does the acronym M&A stand for?',
        propositionsFr: [
          { text: 'Mergers & Acquisitions (Fusions & Acquisitions)', correct: true },
          { text: 'Markets & Assets (Marchés & Actifs)', correct: false },
          { text: 'Management & Accounting (Management & Comptabilité)', correct: false },
          { text: 'Money & Arbitrage (Monnaie & Arbitrage)', correct: false },
        ],
        propositionsEn: [
          { text: 'Mergers & Acquisitions', correct: true },
          { text: 'Markets & Assets', correct: false },
          { text: 'Management & Accounting', correct: false },
          { text: 'Money & Arbitrage', correct: false },
        ],
        explanationFr: 'M&A signifie "Mergers & Acquisitions", soit Fusions & Acquisitions. C\'est l\'ensemble des opérations par lesquelles des entreprises se regroupent (fusion) ou l\'une achète l\'autre (acquisition). Imagine deux restaurants qui fusionnent pour former une chaîne plus grande.',
        explanationEn: 'M&A stands for Mergers & Acquisitions. These are operations where companies combine or one buys another.',
      },
      {
        domainId,
        level: 1,
        textFr: 'Qu\'est-ce qu\'une due diligence ?',
        textEn: 'What is due diligence?',
        propositionsFr: [
          { text: 'Un audit approfondi de la société cible avant la finalisation de la transaction', correct: true },
          { text: 'La signature du contrat de vente entre acheteur et vendeur', correct: false },
          { text: 'Le processus de négociation du prix de cession', correct: false },
          { text: 'La présentation de l\'entreprise aux investisseurs', correct: false },
        ],
        propositionsEn: [
          { text: 'A thorough audit of the target company before completing the transaction', correct: true },
          { text: 'The signing of the sales contract', correct: false },
          { text: 'The price negotiation process', correct: false },
          { text: 'The company presentation to investors', correct: false },
        ],
        explanationFr: 'La due diligence est l\'audit complet que l\'acheteur réalise sur la cible avant d\'acquérir. C\'est comme inspecter minutieusement une maison avant de l\'acheter : finances, contrats, risques juridiques, RH.',
        explanationEn: 'Due diligence is the comprehensive audit conducted on the target before acquisition — like thoroughly inspecting a house before buying.',
      },
      {
        domainId,
        level: 1,
        textFr: 'Qu\'est-ce qu\'un LBO ?',
        textEn: 'What is an LBO?',
        propositionsFr: [
          { text: 'Un rachat d\'entreprise financé majoritairement par de la dette', correct: true },
          { text: 'Une introduction en bourse d\'une société privée', correct: false },
          { text: 'Une fusion entre deux entreprises de taille égale', correct: false },
          { text: 'Un contrat de distribution exclusive', correct: false },
        ],
        propositionsEn: [
          { text: 'A company buyout financed mainly by debt', correct: true },
          { text: 'An IPO of a private company', correct: false },
          { text: 'A merger between two equal-sized companies', correct: false },
          { text: 'An exclusive distribution contract', correct: false },
        ],
        explanationFr: 'LBO = Leveraged Buy-Out. Rachat d\'entreprise avec effet de levier : tu achètes avec un peu de fonds propres et beaucoup de dette. Comme acheter un appartement 500k€ avec 100k€ d\'apport et 400k€ de crédit.',
        explanationEn: 'LBO = Leveraged Buy-Out. A company buyout using mostly debt — like buying a house with a small down payment and a large mortgage.',
      },
      {
        domainId,
        level: 2,
        textFr: 'Qu\'est-ce qu\'un teaser dans un processus M&A ?',
        textEn: 'What is a teaser in an M&A process?',
        propositionsFr: [
          { text: 'Un document anonyme présentant brièvement une opportunité d\'acquisition sans révéler l\'identité de la cible', correct: true },
          { text: 'La lettre d\'intention signée par l\'acheteur', correct: false },
          { text: 'Le rapport final de due diligence', correct: false },
          { text: 'Le contrat de cession définitif', correct: false },
        ],
        propositionsEn: [
          { text: 'An anonymous document briefly presenting an acquisition opportunity without revealing the target', correct: true },
          { text: 'The letter of intent signed by the buyer', correct: false },
          { text: 'The final due diligence report', correct: false },
          { text: 'The definitive sale contract', correct: false },
        ],
        explanationFr: 'Le teaser est le premier document envoyé aux acheteurs potentiels : présente l\'entreprise sans révéler son identité. Comme une annonce immobilière sans l\'adresse exacte.',
        explanationEn: 'A teaser is the first document sent to potential buyers presenting the company without revealing its identity — like a property listing without the exact address.',
      },
      {
        domainId,
        level: 2,
        textFr: 'Qu\'est-ce qu\'un earn-out ?',
        textEn: 'What is an earn-out?',
        propositionsFr: [
          { text: 'Un mécanisme de paiement différé conditionné aux performances futures de la société acquise', correct: true },
          { text: 'Les frais de conseil versés aux banques d\'affaires', correct: false },
          { text: 'Le montant de la dette reprise lors d\'une acquisition', correct: false },
          { text: 'Le dividende versé aux actionnaires après la cession', correct: false },
        ],
        propositionsEn: [
          { text: 'A deferred payment mechanism contingent on future performance', correct: true },
          { text: 'Advisory fees paid to investment banks', correct: false },
          { text: 'The debt assumed in an acquisition', correct: false },
          { text: 'The dividend paid after the sale', correct: false },
        ],
        explanationFr: 'L\'earn-out réconcilie vendeur et acheteur sur la valeur : une partie du prix est payée maintenant, le reste dépend des résultats futurs. Ex : 10M€ aujourd\'hui + jusqu\'à 5M€ si CA > 20M€ dans 2 ans.',
        explanationEn: 'An earn-out bridges valuation gaps: part paid upfront, rest depends on future performance.',
      },
      {
        domainId,
        level: 3,
        textFr: 'Qu\'est-ce qu\'une clause MAC dans un contrat d\'acquisition ?',
        textEn: 'What is a MAC clause in an acquisition agreement?',
        propositionsFr: [
          { text: 'Une clause permettant à l\'acheteur de se retirer si un événement défavorable majeur affecte la cible avant la clôture', correct: true },
          { text: 'Une clause fixant le montant maximum de la garantie de passif', correct: false },
          { text: 'Une disposition interdisant au vendeur de concurrencer l\'acheteur', correct: false },
          { text: 'Un mécanisme d\'ajustement du prix basé sur la trésorerie nette', correct: false },
        ],
        propositionsEn: [
          { text: 'A clause allowing the buyer to withdraw if a major adverse event affects the target before closing', correct: true },
          { text: 'A clause setting the maximum warranty amount', correct: false },
          { text: 'A non-compete provision', correct: false },
          { text: 'A price adjustment mechanism', correct: false },
        ],
        explanationFr: 'La clause MAC (Material Adverse Change) protège l\'acheteur entre signature et closing. Si un événement majeur dégrade significativement la valeur de la cible, l\'acheteur peut invoquer cette clause pour renégocier ou annuler.',
        explanationEn: 'The MAC clause protects the buyer between signing and closing. If a major unforeseen event degrades the target\'s value, the buyer can withdraw or renegotiate.',
      },
    ];

    for (const q of questions) {
      const exists = await this.questionsRepository.findOne({
        where: { textFr: q.textFr, domainId },
      });
      if (!exists) {
        await this.questionsRepository.save(this.questionsRepository.create(q));
      }
    }
    console.log(`✅ Questions seeded for domain ${domainId}`);
  }
}