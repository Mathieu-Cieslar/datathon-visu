import type { RenovationData } from '~/types/renovation';

export const loadData = async (jsonPath: string): Promise<RenovationData[]> => {
  try {
    // Déterminer si on est côté serveur ou client
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      // Côté serveur : lire directement le fichier
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', jsonPath.replace(/^\//, ''));
      const jsonText = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(jsonText) as RenovationData[];
      console.log('Données JSON chargées (serveur):', data.length, 'entrées');
      return data;
    } else {
      // Côté client : utiliser fetch
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json() as RenovationData[];
      console.log('Données JSON chargées (client):', data.length, 'entrées');
      return data;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du JSON:', error);
    throw error;
  }
};

export const calculateStats = (data: RenovationData[]) => {
  const stats = {
    prixMoyenParType: {} as Record<string, { iso: number; chauffage: number; global: number }>,
    economiesMoyennesParSurface: [] as Array<{ surface: string; economies: number }>,
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

  // Économies moyennes par surface (garder la plage de surface)
  data.forEach(row => {
    const economieAnnuelle = row.Economie_Prix_Elec_An_Global + row.Economie_Prix_Gaz_An_Global;
    stats.economiesMoyennesParSurface.push({
      surface: row.Surface, // Maintenant c'est une chaîne de caractères comme "40-60"
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
