import Papa from 'papaparse';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { RenovationData } from '~/types/renovation';

export const parseCSV = async (csvPath: string): Promise<RenovationData[]> => {
  try {
    // Lire le fichier depuis le système de fichiers (côté serveur)
    const filePath = join(process.cwd(), 'public', csvPath.replace(/^\//, ''));
    const csvText = readFileSync(filePath, 'utf-8');
    
    console.log('Contenu du CSV chargé:', csvText.slice(0, 200)); // Affiche les 200 premiers caractères du CSV
    return new Promise((resolve, reject) => {
      Papa.parse<RenovationData>(csvText, {
        header: true,
        delimiter: ';',
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('Erreurs de parsing:', results.errors);
          }
          resolve(results.data as RenovationData[]);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement du CSV:', error);
    throw error;
  }
};

export const calculateStats = (data: RenovationData[]) => {
  const stats = {
    prixMoyenParType: {} as Record<string, { iso: number; chauffage: number; global: number }>,
    economiesMoyennesParSurface: [] as Array<{ surface: number; economies: number }>,
    repartitionDPE: {
      initial: {} as Record<string, number>,
      final: {} as Record<string, number>,
      transitions: [] as Array<{ from: string; to: string; count: number }>
    },
    roiMoyen: {
      iso: 0,
      chauffage: 0,
      global: 0
    }
  };

  // Prix moyen par type de logement
  const typeGroups: Record<string, RenovationData[]> = {};
  data.forEach(row => {
    if (!typeGroups[row.Type_logement]) {
      typeGroups[row.Type_logement] = [];
    }
    typeGroups[row.Type_logement].push(row);
  });

  Object.keys(typeGroups).forEach(type => {
    const rows = typeGroups[type];
    stats.prixMoyenParType[type] = {
      iso: rows.reduce((sum, r) => sum + r.Prix_Reno_Iso, 0) / rows.length,
      chauffage: rows.reduce((sum, r) => sum + r.Prix_Reno_Chauffage, 0) / rows.length,
      global: rows.reduce((sum, r) => sum + r.Prix_Reno_Global, 0) / rows.length
    };
  });

  // Économies moyennes par surface
  data.forEach(row => {
    const economieAnnuelle = row.Economie_Prix_Elec_An_Global + row.Economie_Prix_Gaz_An_Global;
    stats.economiesMoyennesParSurface.push({
      surface: row.Surface,
      economies: economieAnnuelle
    });
  });

  // Répartition DPE
  const transitionMap: Record<string, number> = {};
  data.forEach(row => {
    stats.repartitionDPE.initial[row.Dpe_Initial] = (stats.repartitionDPE.initial[row.Dpe_Initial] || 0) + 1;
    stats.repartitionDPE.final[row.Dpe_Final] = (stats.repartitionDPE.final[row.Dpe_Final] || 0) + 1;
    
    const transitionKey = `${row.Dpe_Initial}->${row.Dpe_Final}`;
    transitionMap[transitionKey] = (transitionMap[transitionKey] || 0) + 1;
  });

  stats.repartitionDPE.transitions = Object.entries(transitionMap).map(([key, count]) => {
    const [from, to] = key.split('->');
    return { from, to, count };
  });

  // ROI moyen
  let countIso = 0, countChauffage = 0, countGlobal = 0;
  data.forEach(row => {
    const economieGlobalAnnuelle = row.Economie_Prix_Elec_An_Global + row.Economie_Prix_Gaz_An_Global;
    const economieIsoAnnuelle = row.Economie_Prix_Elec_An_Iso + row.Economie_Prix_Gaz_An_Iso;
    const economieChauffageAnnuelle = row.Economie_Prix_Elec_An_Chauffage + row.Economie_Prix_Gaz_An_Chauffage;
    
    if (economieIsoAnnuelle > 0) {
      stats.roiMoyen.iso += row.Prix_Reno_Iso / economieIsoAnnuelle;
      countIso++;
    }
    if (economieChauffageAnnuelle > 0) {
      stats.roiMoyen.chauffage += row.Prix_Reno_Chauffage / economieChauffageAnnuelle;
      countChauffage++;
    }
    if (economieGlobalAnnuelle > 0) {
      stats.roiMoyen.global += row.Prix_Reno_Global / economieGlobalAnnuelle;
      countGlobal++;
    }
  });

  stats.roiMoyen.iso = countIso > 0 ? stats.roiMoyen.iso / countIso : 0;
  stats.roiMoyen.chauffage = countChauffage > 0 ? stats.roiMoyen.chauffage / countChauffage : 0;
  stats.roiMoyen.global = countGlobal > 0 ? stats.roiMoyen.global / countGlobal : 0;

  return stats;
};
