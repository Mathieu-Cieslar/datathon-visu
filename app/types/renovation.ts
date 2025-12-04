export interface RenovationData {
  Type_logement: string;
  Categorie: string; // Plage de surface (ex: "0-10", "10-20", "50-60")
  Energie: string; // Type d'énergie: "ELEC" ou "GAZ"
  Surface: number; // Surface moyenne de la catégorie (pour affichage uniquement)
  Prix_Reno_Chauffage: number;
  Prix_Reno_Iso: number;
  Prix_Reno_Global: number;
  Economie_Elec_Estime_Iso: number;
  Economie_Elec_Chauffage: number;
  Economie_Elec_Global: number;
  Economie_Gaz_Estime_Iso: number;
  Economie_Gaz_Estime_Chauffage: number;
  Economie_Gaz_Estime_Global: number;
  Economie_Prix_Gaz_An_Iso: number;
  Economie_Prix_Gaz_An_Chauffage: number;
  Economie_Prix_Gaz_An_Global: number;
  Economie_Prix_Elec_An_Iso: number;
  Economie_Prix_Elec_An_Chauffage: number;
  Economie_Prix_Elec_An_Global: number;
  Nb_Annee_Amortissement: number;
  Dpe_Initial: string;
  Dpe_Final_Iso: string; // DPE après rénovation isolation uniquement
  Dpe_Final_Chauffage: string; // DPE après rénovation chauffage uniquement
  Dpe_Final_Global: string; // DPE après rénovation globale
  Nb_Logements: number; // Nombre de logements dans cette catégorie
}

export interface UserInput {
  typeLogement: string;
  surface: number;
  consoAnnuelle?: number;
  region?: string;
}

export interface RecommendationResult {
  scenario: 'iso' | 'chauffage' | 'global';
  investissement: number;
  economieAnnuelle: number;
  amortissement: number;
  dpeInitial: string;
  dpeFinal: string;
  economieElec: number;
  economieGaz: number;
}
