import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async search(query: string): Promise<Company[]> {
    if (!query || query.trim().length < 2) return [];
    return this.companiesRepository.find({
      where: { name: ILike(`%${query}%`) },
      take: 8,
      order: { name: 'ASC' },
    });
  }

  async findOrCreate(name: string): Promise<Company> {
    let company = await this.companiesRepository.findOne({ where: { name } });
    if (!company) {
      company = this.companiesRepository.create({ name, isVerified: false });
      await this.companiesRepository.save(company);
    }
    return company;
  }

  async seed(): Promise<void> {
    const companies = [
      // ── BANQUES & FINANCE ─────────────────────────────────────────
      { name: 'BNP Paribas', sector: 'Banque', country: 'France' },
      { name: 'Société Générale', sector: 'Banque', country: 'France' },
      { name: 'Crédit Agricole', sector: 'Banque', country: 'France' },
      { name: 'Natixis', sector: 'Banque', country: 'France' },
      { name: 'BPCE', sector: 'Banque', country: 'France' },
      { name: 'Crédit Mutuel', sector: 'Banque', country: 'France' },
      { name: 'La Banque Postale', sector: 'Banque', country: 'France' },
      { name: 'CIC', sector: 'Banque', country: 'France' },
      { name: 'LCL', sector: 'Banque', country: 'France' },
      { name: 'Goldman Sachs', sector: 'Banque d\'investissement', country: 'États-Unis' },
      { name: 'JPMorgan', sector: 'Banque d\'investissement', country: 'États-Unis' },
      { name: 'Morgan Stanley', sector: 'Banque d\'investissement', country: 'États-Unis' },
      { name: 'Bank of America', sector: 'Banque d\'investissement', country: 'États-Unis' },
      { name: 'Citigroup', sector: 'Banque d\'investissement', country: 'États-Unis' },
      { name: 'Deutsche Bank', sector: 'Banque d\'investissement', country: 'Allemagne' },
      { name: 'Barclays', sector: 'Banque d\'investissement', country: 'Royaume-Uni' },
      { name: 'HSBC', sector: 'Banque', country: 'Royaume-Uni' },
      { name: 'UBS', sector: 'Banque d\'investissement', country: 'Suisse' },
      { name: 'Credit Suisse', sector: 'Banque d\'investissement', country: 'Suisse' },
      { name: 'Lazard', sector: 'Banque d\'affaires', country: 'France' },
      { name: 'Rothschild & Co', sector: 'Banque d\'affaires', country: 'France' },
      { name: 'Mediobanca', sector: 'Banque d\'affaires', country: 'Italie' },
      { name: 'Jefferies', sector: 'Banque d\'investissement', country: 'États-Unis' },
      { name: 'Houlihan Lokey', sector: 'Banque d\'affaires', country: 'États-Unis' },

      // ── PRIVATE EQUITY & ASSET MANAGEMENT ────────────────────────
      { name: 'Ardian', sector: 'Private Equity', country: 'France' },
      { name: 'Eurazeo', sector: 'Private Equity', country: 'France' },
      { name: 'PAI Partners', sector: 'Private Equity', country: 'France' },
      { name: 'Tikehau Capital', sector: 'Private Equity', country: 'France' },
      { name: 'Apax Partners', sector: 'Private Equity', country: 'France' },
      { name: 'Bridgepoint', sector: 'Private Equity', country: 'Royaume-Uni' },
      { name: 'KKR', sector: 'Private Equity', country: 'États-Unis' },
      { name: 'Blackstone', sector: 'Private Equity', country: 'États-Unis' },
      { name: 'Carlyle Group', sector: 'Private Equity', country: 'États-Unis' },
      { name: 'Apollo Global Management', sector: 'Private Equity', country: 'États-Unis' },
      { name: 'CVC Capital Partners', sector: 'Private Equity', country: 'Luxembourg' },
      { name: 'Amundi', sector: 'Asset Management', country: 'France' },
      { name: 'AXA Investment Managers', sector: 'Asset Management', country: 'France' },
      { name: 'Carmignac', sector: 'Asset Management', country: 'France' },
      { name: 'La Française', sector: 'Asset Management', country: 'France' },
      { name: 'Ostrum Asset Management', sector: 'Asset Management', country: 'France' },
      { name: 'BlackRock', sector: 'Asset Management', country: 'États-Unis' },
      { name: 'Vanguard', sector: 'Asset Management', country: 'États-Unis' },
      { name: 'Fidelity', sector: 'Asset Management', country: 'États-Unis' },

      // ── AUDIT & CONSEIL ───────────────────────────────────────────
      { name: 'Deloitte', sector: 'Audit & Conseil', country: 'Multinational' },
      { name: 'PwC', sector: 'Audit & Conseil', country: 'Multinational' },
      { name: 'EY', sector: 'Audit & Conseil', country: 'Multinational' },
      { name: 'KPMG', sector: 'Audit & Conseil', country: 'Multinational' },
      { name: 'McKinsey & Company', sector: 'Conseil en stratégie', country: 'États-Unis' },
      { name: 'Boston Consulting Group', sector: 'Conseil en stratégie', country: 'États-Unis' },
      { name: 'Bain & Company', sector: 'Conseil en stratégie', country: 'États-Unis' },
      { name: 'Oliver Wyman', sector: 'Conseil en stratégie', country: 'États-Unis' },
      { name: 'Roland Berger', sector: 'Conseil en stratégie', country: 'Allemagne' },
      { name: 'Accenture', sector: 'Conseil & Tech', country: 'Irlande' },
      { name: 'Capgemini', sector: 'Conseil & Tech', country: 'France' },
      { name: 'Wavestone', sector: 'Conseil', country: 'France' },
      { name: 'Sia Partners', sector: 'Conseil', country: 'France' },
      { name: 'Eight Advisory', sector: 'Conseil financier', country: 'France' },
      { name: 'Accuracy', sector: 'Conseil financier', country: 'France' },
      { name: 'Duff & Phelps', sector: 'Conseil financier', country: 'États-Unis' },
      { name: 'Mazars', sector: 'Audit & Conseil', country: 'France' },
      { name: 'Grant Thornton', sector: 'Audit & Conseil', country: 'Multinational' },
      { name: 'BDO', sector: 'Audit & Conseil', country: 'Belgique' },
      { name: 'RSM', sector: 'Audit & Conseil', country: 'Multinational' },

      // ── CAC 40 & GRANDES ENTREPRISES FRANÇAISES ──────────────────
      { name: 'TotalEnergies', sector: 'Énergie', country: 'France' },
      { name: 'LVMH', sector: 'Luxe', country: 'France' },
      { name: 'L\'Oréal', sector: 'Cosmétique', country: 'France' },
      { name: 'Hermès', sector: 'Luxe', country: 'France' },
      { name: 'Kering', sector: 'Luxe', country: 'France' },
      { name: 'Airbus', sector: 'Aéronautique', country: 'France' },
      { name: 'Safran', sector: 'Aéronautique', country: 'France' },
      { name: 'Thales', sector: 'Défense & Tech', country: 'France' },
      { name: 'Dassault Aviation', sector: 'Aéronautique', country: 'France' },
      { name: 'Renault', sector: 'Automobile', country: 'France' },
      { name: 'Stellantis', sector: 'Automobile', country: 'France' },
      { name: 'Michelin', sector: 'Pneumatiques', country: 'France' },
      { name: 'Vinci', sector: 'Construction', country: 'France' },
      { name: 'Bouygues', sector: 'Construction', country: 'France' },
      { name: 'Saint-Gobain', sector: 'Matériaux', country: 'France' },
      { name: 'Engie', sector: 'Énergie', country: 'France' },
      { name: 'EDF', sector: 'Énergie', country: 'France' },
      { name: 'Veolia', sector: 'Environnement', country: 'France' },
      { name: 'Suez', sector: 'Environnement', country: 'France' },
      { name: 'Orange', sector: 'Télécommunications', country: 'France' },
      { name: 'Vivendi', sector: 'Médias', country: 'France' },
      { name: 'Publicis', sector: 'Communication', country: 'France' },
      { name: 'Danone', sector: 'Agroalimentaire', country: 'France' },
      { name: 'Pernod Ricard', sector: 'Boissons', country: 'France' },
      { name: 'Carrefour', sector: 'Distribution', country: 'France' },
      { name: 'Auchan', sector: 'Distribution', country: 'France' },
      { name: 'Leclerc', sector: 'Distribution', country: 'France' },
      { name: 'Sanofi', sector: 'Pharmacie', country: 'France' },
      { name: 'Essilor Luxottica', sector: 'Optique', country: 'France' },
      { name: 'Schneider Electric', sector: 'Énergie & Automatisation', country: 'France' },
      { name: 'Legrand', sector: 'Électrique', country: 'France' },
      { name: 'Sodexo', sector: 'Services', country: 'France' },
      { name: 'Edenred', sector: 'Services', country: 'France' },
      { name: 'Worldline', sector: 'Fintech', country: 'France' },
      { name: 'Deezer', sector: 'Tech', country: 'France' },
      { name: 'Criteo', sector: 'Tech', country: 'France' },
      { name: 'OVHcloud', sector: 'Cloud', country: 'France' },
      { name: 'Blablacar', sector: 'Tech', country: 'France' },
      { name: 'Doctolib', sector: 'Healthtech', country: 'France' },
      { name: 'Ledger', sector: 'Crypto / Fintech', country: 'France' },
      { name: 'Contentsquare', sector: 'Tech', country: 'France' },
      { name: 'Alan', sector: 'Insurtech', country: 'France' },
      { name: 'Qonto', sector: 'Fintech', country: 'France' },
      { name: 'Lydia', sector: 'Fintech', country: 'France' },
      { name: 'Swile', sector: 'Fintech', country: 'France' },
      { name: 'Payfit', sector: 'RH Tech', country: 'France' },

      // ── MULTINATIONALES ───────────────────────────────────────────
      { name: 'Apple', sector: 'Tech', country: 'États-Unis' },
      { name: 'Google', sector: 'Tech', country: 'États-Unis' },
      { name: 'Microsoft', sector: 'Tech', country: 'États-Unis' },
      { name: 'Amazon', sector: 'Tech & E-commerce', country: 'États-Unis' },
      { name: 'Meta', sector: 'Tech', country: 'États-Unis' },
      { name: 'Netflix', sector: 'Tech & Médias', country: 'États-Unis' },
      { name: 'Tesla', sector: 'Automobile & Tech', country: 'États-Unis' },
      { name: 'IBM', sector: 'Tech', country: 'États-Unis' },
      { name: 'Salesforce', sector: 'Tech', country: 'États-Unis' },
      { name: 'SAP', sector: 'Tech', country: 'Allemagne' },
    ];

    for (const company of companies) {
      const exists = await this.companiesRepository.findOne({ where: { name: company.name } });
      if (!exists) {
        await this.companiesRepository.save(
          this.companiesRepository.create({ ...company, isVerified: true }),
        );
      }
    }
    console.log('✅ Companies seeded successfully');
  }
}