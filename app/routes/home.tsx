import { Link } from 'react-router';

export function meta() {
  return [
    { title: "Datathon - Rénovation Énergétique" },
    { name: "description", content: "Analysez et simulez vos projets de rénovation énergétique" },
  ];
}

export default function Home() {
  return (
    <div className="home-container">
      <div className="hero">
        <h1 className="hero-title">
          <span className="gradient-text">Rénovation Énergétique</span>
        </h1>
        <p className="hero-subtitle">
          Analysez, simulez et optimisez vos projets de rénovation
        </p>
        <div className="hero-badges">
          <span className="badge">📊 Big Data</span>
          <span className="badge">💚 Écologique</span>
          <span className="badge">💰 Rentable</span>
        </div>
      </div>

      <div className="features-grid">
        <Link to="/simulateur" className="feature-card simulator-card">
          <div className="feature-icon">🏡</div>
          <h2>Simulateur Personnalisé</h2>
          <p>
            Calculez vos économies d'énergie et votre retour sur investissement
            en fonction de votre logement
          </p>
          <div className="feature-highlights">
            <span>✓ Comparaison des scénarios</span>
            <span>✓ Recommandations personnalisées</span>
            <span>✓ Évolution DPE</span>
          </div>
          <div className="cta-button">Lancer la simulation →</div>
        </Link>

        <Link to="/analytics" className="feature-card analytics-card">
          <div className="feature-icon">📊</div>
          <h2>Analytics & Statistiques</h2>
          <p>
            Explorez les tendances globales et les insights de notre base de données
            de rénovations énergétiques
          </p>
          <div className="feature-highlights">
            <span>✓ Coûts moyens par type</span>
            <span>✓ Corrélations avancées</span>
            <span>✓ ROI & Rentabilité</span>
          </div>
          <div className="cta-button">Explorer les données →</div>
        </Link>

       
      </div>

      

    </div>
  );
}
