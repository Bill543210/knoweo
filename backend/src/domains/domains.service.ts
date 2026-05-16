import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './domain.entity';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private domainsRepository: Repository<Domain>,
  ) {}

  async findAll(): Promise<Domain[]> {
    return this.domainsRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Domain | null> {
    return this.domainsRepository.findOne({ where: { slug } });
  }

  async seed(): Promise<void> {
    const domains = [
      {
        slug: 'ma',
        nameFr: 'Fusions & Acquisitions',
        nameEn: 'Mergers & Acquisitions',
        descriptionFr: 'Processus d\'acquisition, valorisation, due diligence, synergies, LBO',
        descriptionEn: 'Acquisition process, valuation, due diligence, synergies, LBO',
        icon: '🤝',
        color: '#6366F1',
        order: 1,
      },
      {
        slug: 'accounting',
        nameFr: 'Comptabilité & Analyse Financière',
        nameEn: 'Accounting & Financial Analysis',
        descriptionFr: 'Bilan, compte de résultat, flux de trésorerie, ratios financiers, IFRS',
        descriptionEn: 'Balance sheet, income statement, cash flows, financial ratios, IFRS',
        icon: '📊',
        color: '#22C55E',
        order: 2,
      },
      {
        slug: 'private-equity',
        nameFr: 'Private Equity',
        nameEn: 'Private Equity',
        descriptionFr: 'Capital-investissement, fonds LBO, venture capital, IRR, multiples',
        descriptionEn: 'Private investment, LBO funds, venture capital, IRR, multiples',
        icon: '💰',
        color: '#F5A623',
        order: 3,
      },
      {
        slug: 'structured-finance',
        nameFr: 'Financement Structuré',
        nameEn: 'Structured Finance',
        descriptionFr: 'Titrisation, CLO/CDO, SPV, financements complexes',
        descriptionEn: 'Securitization, CLO/CDO, SPV, complex financing',
        icon: '🏗️',
        color: '#EF4444',
        order: 4,
      },
      {
        slug: 'project-finance',
        nameFr: 'Project Finance',
        nameEn: 'Project Finance',
        descriptionFr: 'Financement d\'infrastructures, DSCR, waterfall, parties prenantes',
        descriptionEn: 'Infrastructure financing, DSCR, waterfall, stakeholders',
        icon: '🏭',
        color: '#8B5CF6',
        order: 5,
      },
      {
        slug: 'capital-markets',
        nameFr: 'Marchés Financiers',
        nameEn: 'Capital Markets',
        descriptionFr: 'Actions, obligations, dérivés, marchés primaires/secondaires',
        descriptionEn: 'Equities, bonds, derivatives, primary/secondary markets',
        icon: '📈',
        color: '#06B6D4',
        order: 6,
      },
      {
        slug: 'ibd',
        nameFr: 'Banque d\'Investissement',
        nameEn: 'Investment Banking',
        descriptionFr: 'Rôle de la banque d\'affaires, ECM/DCM, syndication, pitchbooks',
        descriptionEn: 'Investment bank role, ECM/DCM, syndication, pitchbooks',
        icon: '🏦',
        color: '#F59E0B',
        order: 7,
      },
      {
        slug: 'asset-management',
        nameFr: 'Gestion d\'Actifs',
        nameEn: 'Asset Management',
        descriptionFr: 'Fonds d\'investissement, allocation, gestion active/passive, OPCVM',
        descriptionEn: 'Investment funds, allocation, active/passive management, UCITS',
        icon: '🎯',
        color: '#10B981',
        order: 8,
      },
    ];

    for (const domain of domains) {
      const exists = await this.domainsRepository.findOne({ where: { slug: domain.slug } });
      if (!exists) {
        await this.domainsRepository.save(this.domainsRepository.create(domain));
      }
    }
    console.log('✅ Domains seeded successfully');
  }
}