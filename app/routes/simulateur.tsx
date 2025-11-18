import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { loadData, calculateStats } from '~/utils/csvParser';
import type { RenovationData, RecommendationResult } from '~/types/renovation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export async function loader() {
  const data = await loadData('/data.json');
  return { data };
}

interface LoaderData {
  data: RenovationData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DPE_COLORS: Record<string, string> = {
  'A': '#00a06d',
  'B': '#4cb848',
  'C': '#c8d200',
  'D': '#f9e900',
  'E': '#f5b000',
  'F': '#ed7d31',
  'G': '#e30613'
};

export default function Simulateur() {
  const { data } = useLoaderData<LoaderData>();
  const [typeLogement, setTypeLogement] = useState('');
  const [surface, setSurface] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const typesLogement = [...new Set(data.map((d: RenovationData) => d.Type_logement))];

  useEffect(() => {
    const calculatedStats = calculateStats(data);
    setStats(calculatedStats);
  }, [data]);

  const handleSimulate = () => {
    if (!typeLogement || !surface) return;

    const userSurface = parseInt(surface);

    // Fonction pour vérifier si la surface utilisateur est dans la plage
    const isInRange = (surfaceRange: string, userSurface: number): boolean => {
      const [min, max] = surfaceRange.split('-').map(Number);
      return userSurface >= min && userSurface <= max;
    };

    // Trouver des données similaires
    const similarData = data.filter(
      (d: RenovationData) =>
        d.Type_logement === typeLogement &&
        isInRange(d.Surface, userSurface)
    );

    if (similarData.length === 0) {
      alert('Pas de données disponibles pour ce type de logement et cette surface');
      return;
    }

    // Calculer moyennes
    interface AvgDataType {
      Prix_Reno_Iso: number;
      Prix_Reno_Chauffage: number;
      Prix_Reno_Global: number;
      Economie_Prix_Elec_An_Iso: number;
      Economie_Prix_Elec_An_Chauffage: number;
      Economie_Prix_Elec_An_Global: number;
      Economie_Prix_Gaz_An_Iso: number;
      Economie_Prix_Gaz_An_Chauffage: number;
      Economie_Prix_Gaz_An_Global: number;
      Economie_Elec_Estime_Iso: number;
      Economie_Elec_Chauffage: number;
      Economie_Elec_Global: number;
      Economie_Gaz_Estime_Iso: number;
      Economie_Gaz_Estime_Chauffage: number;
      Economie_Gaz_Estime_Global: number;
      Dpe_Initial: string;
      Dpe_Final: string;
    }

    const avgData = similarData.reduce(
      (acc: AvgDataType, curr: RenovationData) => ({
        Prix_Reno_Iso: acc.Prix_Reno_Iso + curr.Prix_Reno_Iso / similarData.length,
        Prix_Reno_Chauffage: acc.Prix_Reno_Chauffage + curr.Prix_Reno_Chauffage / similarData.length,
        Prix_Reno_Global: acc.Prix_Reno_Global + curr.Prix_Reno_Global / similarData.length,
        Economie_Prix_Elec_An_Iso: acc.Economie_Prix_Elec_An_Iso + curr.Economie_Prix_Elec_An_Iso / similarData.length,
        Economie_Prix_Elec_An_Chauffage: acc.Economie_Prix_Elec_An_Chauffage + curr.Economie_Prix_Elec_An_Chauffage / similarData.length,
        Economie_Prix_Elec_An_Global: acc.Economie_Prix_Elec_An_Global + curr.Economie_Prix_Elec_An_Global / similarData.length,
        Economie_Prix_Gaz_An_Iso: acc.Economie_Prix_Gaz_An_Iso + curr.Economie_Prix_Gaz_An_Iso / similarData.length,
        Economie_Prix_Gaz_An_Chauffage: acc.Economie_Prix_Gaz_An_Chauffage + curr.Economie_Prix_Gaz_An_Chauffage / similarData.length,
        Economie_Prix_Gaz_An_Global: acc.Economie_Prix_Gaz_An_Global + curr.Economie_Prix_Gaz_An_Global / similarData.length,
        Economie_Elec_Estime_Iso: acc.Economie_Elec_Estime_Iso + curr.Economie_Elec_Estime_Iso / similarData.length,
        Economie_Elec_Chauffage: acc.Economie_Elec_Chauffage + curr.Economie_Elec_Chauffage / similarData.length,
        Economie_Elec_Global: acc.Economie_Elec_Global + curr.Economie_Elec_Global / similarData.length,
        Economie_Gaz_Estime_Iso: acc.Economie_Gaz_Estime_Iso + curr.Economie_Gaz_Estime_Iso / similarData.length,
        Economie_Gaz_Estime_Chauffage: acc.Economie_Gaz_Estime_Chauffage + curr.Economie_Gaz_Estime_Chauffage / similarData.length,
        Economie_Gaz_Estime_Global: acc.Economie_Gaz_Estime_Global + curr.Economie_Gaz_Estime_Global / similarData.length,
        Dpe_Initial: curr.Dpe_Initial,
        Dpe_Final: curr.Dpe_Final
      }),
      {
        Prix_Reno_Iso: 0,
        Prix_Reno_Chauffage: 0,
        Prix_Reno_Global: 0,
        Economie_Prix_Elec_An_Iso: 0,
        Economie_Prix_Elec_An_Chauffage: 0,
        Economie_Prix_Elec_An_Global: 0,
        Economie_Prix_Gaz_An_Iso: 0,
        Economie_Prix_Gaz_An_Chauffage: 0,
        Economie_Prix_Gaz_An_Global: 0,
        Economie_Elec_Estime_Iso: 0,
        Economie_Elec_Chauffage: 0,
        Economie_Elec_Global: 0,
        Economie_Gaz_Estime_Iso: 0,
        Economie_Gaz_Estime_Chauffage: 0,
        Economie_Gaz_Estime_Global: 0,
        Dpe_Initial: similarData[0].Dpe_Initial,
        Dpe_Final: similarData[0].Dpe_Final
      }
    );

    const results: RecommendationResult[] = [
      {
        scenario: 'iso',
        investissement: Math.round(avgData.Prix_Reno_Iso),
        economieAnnuelle: Math.round(avgData.Economie_Prix_Elec_An_Iso + avgData.Economie_Prix_Gaz_An_Iso),
        amortissement: Math.round(avgData.Prix_Reno_Iso / (avgData.Economie_Prix_Elec_An_Iso + avgData.Economie_Prix_Gaz_An_Iso)),
        dpeInitial: avgData.Dpe_Initial,
        dpeFinal: avgData.Dpe_Final,
        economieElec: Math.round(avgData.Economie_Elec_Estime_Iso),
        economieGaz: Math.round(avgData.Economie_Gaz_Estime_Iso)
      },
      {
        scenario: 'chauffage',
        investissement: Math.round(avgData.Prix_Reno_Chauffage),
        economieAnnuelle: Math.round(avgData.Economie_Prix_Elec_An_Chauffage + avgData.Economie_Prix_Gaz_An_Chauffage),
        amortissement: Math.round(avgData.Prix_Reno_Chauffage / (avgData.Economie_Prix_Elec_An_Chauffage + avgData.Economie_Prix_Gaz_An_Chauffage)),
        dpeInitial: avgData.Dpe_Initial,
        dpeFinal: avgData.Dpe_Final,
        economieElec: Math.round(avgData.Economie_Elec_Chauffage),
        economieGaz: Math.round(avgData.Economie_Gaz_Estime_Chauffage)
      },
      {
        scenario: 'global',
        investissement: Math.round(avgData.Prix_Reno_Global),
        economieAnnuelle: Math.round(avgData.Economie_Prix_Elec_An_Global + avgData.Economie_Prix_Gaz_An_Global),
        amortissement: Math.round(avgData.Prix_Reno_Global / (avgData.Economie_Prix_Elec_An_Global + avgData.Economie_Prix_Gaz_An_Global)),
        dpeInitial: avgData.Dpe_Initial,
        dpeFinal: avgData.Dpe_Final,
        economieElec: Math.round(avgData.Economie_Elec_Global),
        economieGaz: Math.round(avgData.Economie_Gaz_Estime_Global)
      }
    ];

    setRecommendations(results);
    setShowResults(true);
  };

  const chartDataCosts = recommendations.map(r => ({
    name: r.scenario === 'iso' ? 'Isolation' : r.scenario === 'chauffage' ? 'Chauffage' : 'Globale',
    'Investissement (€)': r.investissement
  }));

  const chartDataSavings = recommendations.map(r => ({
    name: r.scenario === 'iso' ? 'Isolation' : r.scenario === 'chauffage' ? 'Chauffage' : 'Globale',
    'Économie annuelle (€)': r.economieAnnuelle
  }));

  const chartDataROI = recommendations.map(r => ({
    name: r.scenario === 'iso' ? 'Isolation' : r.scenario === 'chauffage' ? 'Chauffage' : 'Globale',
    'Années amortissement': r.amortissement
  }));

  const energyData = recommendations.flatMap(r => [
    {
      name: `${r.scenario === 'iso' ? 'ISO' : r.scenario === 'chauffage' ? 'Chauff' : 'Global'} - Élec`,
      value: r.economieElec,
      type: 'Électricité'
    },
    {
      name: `${r.scenario === 'iso' ? 'ISO' : r.scenario === 'chauffage' ? 'Chauff' : 'Global'} - Gaz`,
      value: r.economieGaz,
      type: 'Gaz'
    }
  ]);

  const radarData = recommendations.map(r => ({
    scenario: r.scenario === 'iso' ? 'ISO' : r.scenario === 'chauffage' ? 'CHAUFF' : 'GLOBAL',
    'Investissement': (r.investissement / 30000) * 100,
    'Économies': (r.economieAnnuelle / 1000) * 100,
    'ROI': 100 - (r.amortissement / 15) * 100
  }));

  const bestOption = recommendations.length > 0 
    ? recommendations.reduce((best, curr) => 
        curr.amortissement < best.amortissement ? curr : best
      )
    : null;

  return (
    <div className="simulateur-container">
      <div className="hero-section">
        <h1>🏡 Simulateur de Rénovation Énergétique</h1>
        <p>Découvrez les économies potentielles pour votre logement</p>
      </div>

      <div className="form-section">
        <div className="form-card">
          <h2>Vos informations</h2>
          <div className="form-group">
            <label>Type de logement</label>
            <select 
              value={typeLogement} 
              onChange={(e) => setTypeLogement(e.target.value)}
              className="form-input"
            >
              <option value="">Sélectionnez...</option>
              {typesLogement.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Surface (m²)</label>
            <input
              type="number"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="Ex: 100"
              className="form-input"
            />
          </div>

          <button 
            onClick={handleSimulate}
            className="btn-primary"
            disabled={!typeLogement || !surface}
          >
            🔍 Simuler ma rénovation
          </button>
        </div>
      </div>

      {showResults && recommendations.length > 0 && (
        <>
          <div className="recommendation-banner">
            <div className="recommendation-content">
              <h2>💡 Notre Recommandation</h2>
              <p className="recommendation-text">
                Pour votre <strong>{typeLogement}</strong> de <strong>{surface}m²</strong>, 
                la <strong>{bestOption?.scenario === 'iso' ? 'rénovation par isolation' : bestOption?.scenario === 'chauffage' ? 'rénovation du chauffage' : 'rénovation globale'}</strong> est 
                la plus rentable avec un amortissement en <strong>{bestOption?.amortissement} ans</strong>.
              </p>
              <div className="dpe-evolution">
                <span className="dpe-badge" style={{ backgroundColor: DPE_COLORS[bestOption?.dpeInitial || 'E'] }}>
                  DPE {bestOption?.dpeInitial}
                </span>
                <span className="arrow">→</span>
                <span className="dpe-badge" style={{ backgroundColor: DPE_COLORS[bestOption?.dpeFinal || 'C'] }}>
                  DPE {bestOption?.dpeFinal}
                </span>
              </div>
            </div>
          </div>

          <div className="results-section">
            <h2>📊 Comparaison des scénarios</h2>
            
            <div className="comparison-cards">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`scenario-card ${rec.scenario === bestOption?.scenario ? 'best-option' : ''}`}>
                  {rec.scenario === bestOption?.scenario && <div className="best-badge">⭐ MEILLEUR CHOIX</div>}
                  <h3>
                    {rec.scenario === 'iso' ? '🏠 Isolation' : rec.scenario === 'chauffage' ? '🔥 Chauffage' : '🌟 Rénovation Globale'}
                  </h3>
                  <div className="metric">
                    <span className="metric-label">Investissement</span>
                    <span className="metric-value">{rec.investissement.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Économie annuelle</span>
                    <span className="metric-value green">{rec.economieAnnuelle.toLocaleString('fr-FR')} €/an</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Amortissement</span>
                    <span className="metric-value blue">{rec.amortissement} ans</span>
                  </div>
                  <div className="energy-breakdown">
                    <div className="energy-item">
                      <span>⚡ Élec: {rec.economieElec} kWh/an</span>
                    </div>
                    <div className="energy-item">
                      <span>🔥 Gaz: {rec.economieGaz} kWh/an</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>💰 Coûts d'investissement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataCosts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Investissement (€)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>💚 Économies annuelles</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataSavings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Économie annuelle (€)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>⏱️ Durée d'amortissement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataROI}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Années amortissement" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>⚡ Répartition des économies d'énergie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={energyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value} kWh`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {energyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>🎯 Vue d'ensemble comparative</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="scenario" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="Investissement" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Radar name="Économies" dataKey="Économies" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                    <Radar name="ROI" dataKey="ROI" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {showResults && recommendations.length === 0 && (
        <div className="no-results">
          <p>⚠️ Aucune donnée disponible pour ces critères</p>
        </div>
      )}
    </div>
  );
}
