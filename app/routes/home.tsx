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

        <Link to="/dpe" className="feature-card dpe-card">
          <div className="feature-icon">🏷️</div>
          <h2>Dashboard DPE</h2>
          <p>
            Analysez l'impact des rénovations sur les diagnostics de performance
            énergétique
          </p>
          <div className="feature-highlights">
            <span>✓ Transitions DPE</span>
            <span>✓ Avant / Après</span>
            <span>✓ Coût par amélioration</span>
          </div>
          <div className="cta-button">Voir les DPE →</div>
        </Link>
      </div>

      <div className="stats-section">
        <h2>En un coup d'œil</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">5</div>
            <div className="stat-label">Logements analysés</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">23k€</div>
            <div className="stat-label">Coût moyen rénovation</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">570€</div>
            <div className="stat-label">Économie annuelle moy.</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10ans</div>
            <div className="stat-label">Amortissement moyen</div>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>🎯 Notre Mission</h3>
          <p>
            Rendre accessible la compréhension des enjeux de rénovation énergétique
            grâce à la data visualisation et l'analyse prédictive.
          </p>
        </div>
        <div className="info-card">
          <h3>💡 Pourquoi rénover ?</h3>
          <p>
            Réduisez vos factures d'énergie, améliorez votre confort thermique,
            valorisez votre bien immobilier et contribuez à la transition écologique.
          </p>
        </div>
        <div className="info-card">
          <h3>📈 Data-Driven</h3>
          <p>
            Nos recommandations sont basées sur l'analyse de milliers de projets
            de rénovation réels pour vous garantir les meilleurs conseils.
          </p>
        </div>
      </div>
    </div>
  );
}
