import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { School } from './school.entity';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private schoolsRepository: Repository<School>,
  ) {}

  async search(query: string): Promise<School[]> {
    if (!query || query.trim().length < 2) return [];
    return this.schoolsRepository.find({
      where: { name: ILike(`%${query}%`) },
      take: 8,
      order: { name: 'ASC' },
    });
  }

  async findOrCreate(name: string): Promise<School> {
    let school = await this.schoolsRepository.findOne({ where: { name } });
    if (!school) {
      school = this.schoolsRepository.create({ name, isVerified: false });
      await this.schoolsRepository.save(school);
    }
    return school;
  }

  async seed(): Promise<void> {
    const schools = [
      // ── GRANDES ÉCOLES DE COMMERCE (CGE) ──────────────────────────
      { name: 'HEC Paris', city: 'Jouy-en-Josas', type: 'grande_ecole' },
      { name: 'ESSEC Business School', city: 'Cergy', type: 'grande_ecole' },
      { name: 'ESCP Business School', city: 'Paris', type: 'grande_ecole' },
      { name: 'EM Lyon Business School', city: 'Lyon', type: 'grande_ecole' },
      { name: 'EDHEC Business School', city: 'Lille', type: 'grande_ecole' },
      { name: 'Audencia Business School', city: 'Nantes', type: 'grande_ecole' },
      { name: 'Grenoble École de Management', city: 'Grenoble', type: 'grande_ecole' },
      { name: 'Kedge Business School', city: 'Bordeaux', type: 'grande_ecole' },
      { name: 'Skema Business School', city: 'Sophia Antipolis', type: 'grande_ecole' },
      { name: 'Neoma Business School', city: 'Reims', type: 'grande_ecole' },
      { name: 'TBS Education', city: 'Toulouse', type: 'grande_ecole' },
      { name: 'ICN Business School', city: 'Nancy', type: 'grande_ecole' },
      { name: 'IESEG School of Management', city: 'Lille', type: 'grande_ecole' },
      { name: 'Montpellier Business School', city: 'Montpellier', type: 'grande_ecole' },
      { name: 'ESC Clermont Business School', city: 'Clermont-Ferrand', type: 'grande_ecole' },
      { name: 'Rennes School of Business', city: 'Rennes', type: 'grande_ecole' },
      { name: 'BSB - Burgundy School of Business', city: 'Dijon', type: 'grande_ecole' },
      { name: 'INSEEC Business School', city: 'Paris', type: 'grande_ecole' },
      { name: 'ISG Paris', city: 'Paris', type: 'grande_ecole' },
      { name: 'IPAG Business School', city: 'Paris', type: 'grande_ecole' },
      { name: 'ESDES Lyon', city: 'Lyon', type: 'grande_ecole' },
      { name: 'ESC Pau', city: 'Pau', type: 'grande_ecole' },
      { name: 'IDRAC Business School', city: 'Lyon', type: 'grande_ecole' },
      { name: 'EDC Paris Business School', city: 'Paris', type: 'grande_ecole' },
      { name: 'ESAM Paris', city: 'Paris', type: 'grande_ecole' },
      { name: 'EBS Paris', city: 'Paris', type: 'grande_ecole' },
      { name: 'Excelia Business School', city: 'La Rochelle', type: 'grande_ecole' },
      { name: 'ESPEME', city: 'Lille', type: 'grande_ecole' },
      { name: 'ESCI Business School', city: 'Paris', type: 'grande_ecole' },
      { name: 'ESC Amiens', city: 'Amiens', type: 'grande_ecole' },
      { name: 'ESC Troyes', city: 'Troyes', type: 'grande_ecole' },
      { name: 'ISCID-CO', city: 'Dunkerque', type: 'grande_ecole' },

      // ── SCIENCES PO ───────────────────────────────────────────────
      { name: 'Sciences Po Paris', city: 'Paris', type: 'grande_ecole' },
      { name: 'Sciences Po Lyon', city: 'Lyon', type: 'grande_ecole' },
      { name: 'Sciences Po Bordeaux', city: 'Bordeaux', type: 'grande_ecole' },
      { name: 'Sciences Po Grenoble', city: 'Grenoble', type: 'grande_ecole' },
      { name: 'Sciences Po Lille', city: 'Lille', type: 'grande_ecole' },
      { name: 'Sciences Po Rennes', city: 'Rennes', type: 'grande_ecole' },
      { name: 'Sciences Po Strasbourg', city: 'Strasbourg', type: 'grande_ecole' },
      { name: 'Sciences Po Aix', city: 'Aix-en-Provence', type: 'grande_ecole' },
      { name: 'Sciences Po Toulouse', city: 'Toulouse', type: 'grande_ecole' },

      // ── GRANDES ÉCOLES D'INGÉNIEURS (CGE) ─────────────────────────
      { name: 'École Polytechnique', city: 'Palaiseau', type: 'ecole_ingenieur' },
      { name: 'École Normale Supérieure Paris', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'CentraleSupélec', city: 'Gif-sur-Yvette', type: 'ecole_ingenieur' },
      { name: 'Mines Paris - PSL', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'Télécom Paris', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'ENSTA Paris', city: 'Palaiseau', type: 'ecole_ingenieur' },
      { name: 'Arts et Métiers', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'INSA Lyon', city: 'Lyon', type: 'ecole_ingenieur' },
      { name: 'INSA Toulouse', city: 'Toulouse', type: 'ecole_ingenieur' },
      { name: 'INSA Rennes', city: 'Rennes', type: 'ecole_ingenieur' },
      { name: 'INSA Strasbourg', city: 'Strasbourg', type: 'ecole_ingenieur' },
      { name: 'INSA Rouen Normandie', city: 'Rouen', type: 'ecole_ingenieur' },
      { name: 'INSA Centre Val de Loire', city: 'Bourges', type: 'ecole_ingenieur' },
      { name: 'École Centrale Paris', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'École Centrale Lyon', city: 'Lyon', type: 'ecole_ingenieur' },
      { name: 'École Centrale Nantes', city: 'Nantes', type: 'ecole_ingenieur' },
      { name: 'École Centrale Lille', city: 'Lille', type: 'ecole_ingenieur' },
      { name: 'École Centrale Marseille', city: 'Marseille', type: 'ecole_ingenieur' },
      { name: 'IMT Atlantique', city: 'Nantes', type: 'ecole_ingenieur' },
      { name: 'IMT Nord Europe', city: 'Lille', type: 'ecole_ingenieur' },
      { name: 'Télécom SudParis', city: 'Évry', type: 'ecole_ingenieur' },
      { name: 'Mines Saint-Étienne', city: 'Saint-Étienne', type: 'ecole_ingenieur' },
      { name: 'Mines Nancy', city: 'Nancy', type: 'ecole_ingenieur' },
      { name: 'Mines Alès', city: 'Alès', type: 'ecole_ingenieur' },
      { name: 'ENPC - École des Ponts ParisTech', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'ENSAE Paris', city: 'Palaiseau', type: 'ecole_ingenieur' },
      { name: 'ENSAM', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'ENSIIE', city: 'Évry', type: 'ecole_ingenieur' },
      { name: 'ENSIMAG', city: 'Grenoble', type: 'ecole_ingenieur' },
      { name: 'ENSEIRB-MATMECA', city: 'Bordeaux', type: 'ecole_ingenieur' },
      { name: 'EPF École d\'Ingénieurs', city: 'Montigny-le-Bretonneux', type: 'ecole_ingenieur' },
      { name: 'ISAE-SUPAERO', city: 'Toulouse', type: 'ecole_ingenieur' },
      { name: 'ISAE-ENSMA', city: 'Poitiers', type: 'ecole_ingenieur' },
      { name: 'ENAC', city: 'Toulouse', type: 'ecole_ingenieur' },
      { name: 'EIGSI La Rochelle', city: 'La Rochelle', type: 'ecole_ingenieur' },
      { name: 'ECAM Lyon', city: 'Lyon', type: 'ecole_ingenieur' },
      { name: 'ECAM Rennes', city: 'Rennes', type: 'ecole_ingenieur' },
      { name: 'ECAM Strasbourg-Europe', city: 'Strasbourg', type: 'ecole_ingenieur' },
      { name: 'ICAM Lille', city: 'Lille', type: 'ecole_ingenieur' },
      { name: 'ICAM Nantes', city: 'Nantes', type: 'ecole_ingenieur' },
      { name: 'ICAM Paris-Sénart', city: 'Sénart', type: 'ecole_ingenieur' },
      { name: 'ICAM Toulouse', city: 'Toulouse', type: 'ecole_ingenieur' },
      { name: 'ICAM Strasbourg-Europe', city: 'Strasbourg', type: 'ecole_ingenieur' },
      { name: 'ICAM Vannes', city: 'Vannes', type: 'ecole_ingenieur' },
      { name: 'ESTP Paris', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'EIVP', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'ESIGELEC', city: 'Rouen', type: 'ecole_ingenieur' },
      { name: 'ESIEE Paris', city: 'Marne-la-Vallée', type: 'ecole_ingenieur' },
      { name: 'ESIEA', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'ESME Sudria', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'EFREI Paris', city: 'Villejuif', type: 'ecole_ingenieur' },
      { name: 'ECE Paris', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'EPITA', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'EPITECH', city: 'Paris', type: 'ecole_ingenieur' },
      { name: '42 Paris', city: 'Paris', type: 'ecole_ingenieur' },
      { name: 'Supélec', city: 'Gif-sur-Yvette', type: 'ecole_ingenieur' },
      { name: 'Sup Galilée', city: 'Villetaneuse', type: 'ecole_ingenieur' },
      { name: 'Polytech Paris-Saclay', city: 'Orsay', type: 'ecole_ingenieur' },
      { name: 'Polytech Nantes', city: 'Nantes', type: 'ecole_ingenieur' },
      { name: 'Polytech Lyon', city: 'Lyon', type: 'ecole_ingenieur' },
      { name: 'Polytech Nice Sophia', city: 'Nice', type: 'ecole_ingenieur' },
      { name: 'Polytech Grenoble', city: 'Grenoble', type: 'ecole_ingenieur' },
      { name: 'Polytech Montpellier', city: 'Montpellier', type: 'ecole_ingenieur' },
      { name: 'Polytech Bordeaux', city: 'Bordeaux', type: 'ecole_ingenieur' },
      { name: 'Polytech Clermont', city: 'Clermont-Ferrand', type: 'ecole_ingenieur' },
      { name: 'Polytech Annecy-Chambéry', city: 'Annecy', type: 'ecole_ingenieur' },
      { name: 'Polytech Tours', city: 'Tours', type: 'ecole_ingenieur' },
      { name: 'Polytech Orléans', city: 'Orléans', type: 'ecole_ingenieur' },
      { name: 'Polytech Lille', city: 'Lille', type: 'ecole_ingenieur' },

      // ── UNIVERSITÉS ───────────────────────────────────────────────
      { name: 'Université Paris 1 Panthéon-Sorbonne', city: 'Paris', type: 'universite' },
      { name: 'Université Paris Dauphine - PSL', city: 'Paris', type: 'universite' },
      { name: 'Université Paris-Saclay', city: 'Saclay', type: 'universite' },
      { name: 'Sorbonne Université', city: 'Paris', type: 'universite' },
      { name: 'Université Paris Cité', city: 'Paris', type: 'universite' },
      { name: 'Université Paris Nanterre', city: 'Nanterre', type: 'universite' },
      { name: 'Université Paris-Est Créteil', city: 'Créteil', type: 'universite' },
      { name: 'Université Gustave Eiffel', city: 'Marne-la-Vallée', type: 'universite' },
      { name: 'Université Cergy-Paris', city: 'Cergy', type: 'universite' },
      { name: 'Université Versailles Saint-Quentin', city: 'Versailles', type: 'universite' },
      { name: 'Université Aix-Marseille', city: 'Marseille', type: 'universite' },
      { name: 'Université de Lyon', city: 'Lyon', type: 'universite' },
      { name: 'Université Lyon 1 Claude Bernard', city: 'Lyon', type: 'universite' },
      { name: 'Université Lyon 2 Lumière', city: 'Lyon', type: 'universite' },
      { name: 'Université Lyon 3 Jean Moulin', city: 'Lyon', type: 'universite' },
      { name: 'Université de Bordeaux', city: 'Bordeaux', type: 'universite' },
      { name: 'Université de Strasbourg', city: 'Strasbourg', type: 'universite' },
      { name: 'Université de Lille', city: 'Lille', type: 'universite' },
      { name: 'Université de Montpellier', city: 'Montpellier', type: 'universite' },
      { name: 'Université Toulouse Capitole', city: 'Toulouse', type: 'universite' },
      { name: 'Université Toulouse 2 Jean Jaurès', city: 'Toulouse', type: 'universite' },
      { name: 'Université Toulouse 3 Paul Sabatier', city: 'Toulouse', type: 'universite' },
      { name: 'Université de Nantes', city: 'Nantes', type: 'universite' },
      { name: 'Université de Rennes 1', city: 'Rennes', type: 'universite' },
      { name: 'Université Rennes 2', city: 'Rennes', type: 'universite' },
      { name: 'Université de Grenoble Alpes', city: 'Grenoble', type: 'universite' },
      { name: 'Université de Nice Côte d\'Azur', city: 'Nice', type: 'universite' },
      { name: 'Université de Caen Normandie', city: 'Caen', type: 'universite' },
      { name: 'Université de Rouen Normandie', city: 'Rouen', type: 'universite' },
      { name: 'Université du Havre Normandie', city: 'Le Havre', type: 'universite' },
      { name: 'Université de Poitiers', city: 'Poitiers', type: 'universite' },
      { name: 'Université de Tours', city: 'Tours', type: 'universite' },
      { name: 'Université d\'Orléans', city: 'Orléans', type: 'universite' },
      { name: 'Université de Clermont Auvergne', city: 'Clermont-Ferrand', type: 'universite' },
      { name: 'Université de Dijon', city: 'Dijon', type: 'universite' },
      { name: 'Université de Franche-Comté', city: 'Besançon', type: 'universite' },
      { name: 'Université de Lorraine', city: 'Nancy', type: 'universite' },
      { name: 'Université de Haute-Alsace', city: 'Mulhouse', type: 'universite' },
      { name: 'Université de Perpignan', city: 'Perpignan', type: 'universite' },
      { name: 'Université de Pau et des Pays de l\'Adour', city: 'Pau', type: 'universite' },
      { name: 'Université de La Rochelle', city: 'La Rochelle', type: 'universite' },
      { name: 'Université de Bretagne Occidentale', city: 'Brest', type: 'universite' },
      { name: 'Université de Bretagne Sud', city: 'Lorient', type: 'universite' },
      { name: 'Université d\'Angers', city: 'Angers', type: 'universite' },
      { name: 'Université du Maine', city: 'Le Mans', type: 'universite' },
      { name: 'Université de Limoges', city: 'Limoges', type: 'universite' },
      { name: 'Université de Reims Champagne-Ardenne', city: 'Reims', type: 'universite' },
      { name: 'Université d\'Artois', city: 'Arras', type: 'universite' },
      { name: 'Université du Littoral Côte d\'Opale', city: 'Dunkerque', type: 'universite' },
      { name: 'Université de Valenciennes', city: 'Valenciennes', type: 'universite' },
      { name: 'Université Paris 8 Vincennes-Saint-Denis', city: 'Saint-Denis', type: 'universite' },
      { name: 'Université Paris 13 Sorbonne Paris Nord', city: 'Villetaneuse', type: 'universite' },
      { name: 'Université Paris-Est Marne-la-Vallée', city: 'Marne-la-Vallée', type: 'universite' },
    ];

    for (const school of schools) {
      const exists = await this.schoolsRepository.findOne({ where: { name: school.name } });
      if (!exists) {
        await this.schoolsRepository.save(
          this.schoolsRepository.create({ ...school, isVerified: true }),
        );
      }
    }
    console.log('✅ Schools seeded successfully');
  }
}