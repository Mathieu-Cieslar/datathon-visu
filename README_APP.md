# 🏡 RénoVisu - Plateforme d'Analyse de Rénovation Énergétique

Une application web moderne et interactive pour analyser, simuler et optimiser vos projets de rénovation énergétique basée sur des données Big Data.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Recharts](https://img.shields.io/badge/Recharts-2-green)

## 🌟 Fonctionnalités

### 🏠 Simulateur Personnalisé
- **Saisie interactive** : Type de logement et surface
- **Comparaison de scénarios** : Isolation / Chauffage / Rénovation globale
- **Recommandation intelligente** : Meilleur ROI calculé automatiquement
- **Visualisations riches** :
  - Comparaison des coûts d'investissement
  - Économies annuelles projetées
  - Durée d'amortissement
  - Répartition électricité/gaz
  - Vue radar comparative
- **Évolution DPE** : Avant/après avec badges colorés

### 📊 Dashboard Analytics
Analyse Big Data multi-logements avec :
- **Statistiques générales** : 
  - Coûts moyens par type de logement
  - Surfaces moyennes
  - Économies et amortissements moyens
- **Graphiques avancés** :
  - Scatter plot : Économies vs Surface
  - Corrélation investissement/économies
  - ROI par type de rénovation
  - Répartition des gains gaz/électricité
  - Projection sur 15 ans
- **Insights data-driven** automatiques

### 🏷️ Dashboard DPE
Analyse approfondie des Diagnostics de Performance Énergétique :
- **Comparaison avant/après** rénovation
- **Flux de transitions** (E→C, F→D, etc.)
- **Coût par niveau d'amélioration**
- **Économies par DPE atteint**
- **Répartition par type de logement**
- **Insights clés** calculés automatiquement

## 🎨 Design

- **Interface moderne** avec dégradés et animations
- **Responsive** : adapté mobile, tablette et desktop
- **Cartes interactives** avec effets hover
- **Graphiques professionnels** (Recharts)
- **Palette colorée** : 
  - DPE : codes couleurs officiels (G rouge → A vert)
  - Gradients violets pour l'UI principale
  - Badges et highlights verts pour les économies

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
datathon-visu/
├── app/
│   ├── routes/
│   │   ├── home.tsx           # Page d'accueil avec navigation
│   │   ├── simulateur.tsx     # Simulateur personnalisé
│   │   ├── analytics.tsx      # Dashboard Big Data
│   │   └── dpe.tsx            # Dashboard DPE
│   ├── types/
│   │   └── renovation.ts      # Types TypeScript
│   ├── utils/
│   │   └── csvParser.ts       # Parser CSV + calculs stats
│   ├── app.css                # Styles globaux
│   ├── root.tsx               # Layout + Navigation
│   └── routes.ts              # Configuration routes
├── public/
│   └── test2_csv.csv          # Données de rénovation
└── package.json
```

## 🛠️ Technologies

- **React 18** avec React Router v7
- **TypeScript** pour la sécurité des types
- **Recharts** pour les graphiques
- **PapaParse** pour le parsing CSV
- **Vite** pour le build rapide
- **CSS moderne** avec animations et transitions

## 📊 Source de Données

Le fichier `test2_csv.csv` contient :
- Type de logement (Appartement, Maison)
- Surface (m²)
- Prix des rénovations (ISO, Chauffage, Global)
- Économies estimées (kWh et €/an)
- DPE initial et final
- Durée d'amortissement

## 🎯 Cas d'Usage

### Pour les Particuliers
1. **Simulation** : Entrez vos infos pour obtenir une recommandation personnalisée
2. **Comparaison** : Visualisez les 3 scénarios côte à côte
3. **Décision** : Choisissez en fonction du ROI et de l'amélioration DPE

### Pour les Professionnels
1. **Analytics** : Analysez les tendances du marché
2. **DPE** : Comprenez l'impact des rénovations
3. **Insights** : Extrayez des statistiques pour vos clients

## 🌐 Navigation

- **Accueil** : Présentation et accès rapide
- **Simulateur** : Parcours utilisateur personnalisé
- **Analytics** : Statistiques générales Big Data
- **DPE** : Analyse spécifique des diagnostics

## 🎨 Thématique Graphique

### Graphiques Utilisés
- **Bar Charts** : Comparaisons, coûts, économies
- **Scatter Plots** : Corrélations surface/économies
- **Pie Charts** : Répartitions DPE
- **Line Charts** : Projections temporelles
- **Radar Charts** : Vue multidimensionnelle
- **Stacked Bars** : Répartition gaz/électricité

### Couleurs DPE Officielles
```
A : #00a06d (vert foncé)
B : #4cb848 (vert)
C : #c8d200 (vert-jaune)
D : #f9e900 (jaune)
E : #f5b000 (orange clair)
F : #ed7d31 (orange)
G : #e30613 (rouge)
```

## 🔮 Améliorations Futures

- [ ] Export PDF des simulations
- [ ] Comparateur multi-régions avec prix variables
- [ ] Intégration API aides financières (MaPrimeRénov', etc.)
- [ ] Historique des simulations
- [ ] Mode sombre
- [ ] Graphiques interactifs avancés (zoom, filtres)
- [ ] Ajout de plus de données CSV

## 📝 Licence

Projet développé dans le cadre du Datathon CPE Lyon 2025

## 👥 Contribution

Projet créé avec ❤️ pour faciliter la transition énergétique

---

**🚀 Lancez l'app et explorez vos options de rénovation dès maintenant !**
