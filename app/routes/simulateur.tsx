import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { loadData, calculateStats } from '~/utils/csvParser';
import type { RenovationData, RecommendationResult } from '~/types/renovation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, RadialBarChart, RadialBar
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
  const [typeEnergie, setTypeEnergie] = useState<'gaz' | 'electricite'>('gaz');
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [baseConsumption, setBaseConsumption] = useState<{ gaz: number; elec: number } | null>(null);

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
      Dpe_Final_Iso: string;
      Dpe_Final_Chauffage: string;
      Dpe_Final_Global: string;
      Conso_Base_Gaz: number;
      Conso_Base_Elec: number;
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
        Conso_Base_Gaz: acc.Conso_Base_Gaz + curr.Conso_Base_Gaz / similarData.length,
        Conso_Base_Elec: acc.Conso_Base_Elec + curr.Conso_Base_Elec / similarData.length,
        Dpe_Initial: curr.Dpe_Initial,
        Dpe_Final_Iso: curr.Dpe_Final_Iso,
        Dpe_Final_Chauffage: curr.Dpe_Final_Chauffage,
        Dpe_Final_Global: curr.Dpe_Final_Global
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
        Conso_Base_Gaz: 0,
        Conso_Base_Elec: 0,
        Dpe_Initial: similarData[0].Dpe_Initial,
        Dpe_Final_Iso: similarData[0].Dpe_Final_Iso,
        Dpe_Final_Chauffage: similarData[0].Dpe_Final_Chauffage,
        Dpe_Final_Global: similarData[0].Dpe_Final_Global
      }
    );

    // Calculer les économies en fonction du type d'énergie
    const getEconomieAnnuelle = (elec: number, gaz: number) => {
      if (typeEnergie === 'electricite') return elec;
      return gaz; // gaz uniquement
    };

    const results: RecommendationResult[] = [
      {
        scenario: 'iso',
        investissement: Math.round(avgData.Prix_Reno_Iso),
        economieAnnuelle: Math.round(getEconomieAnnuelle(avgData.Economie_Prix_Elec_An_Iso, avgData.Economie_Prix_Gaz_An_Iso)),
        amortissement: Math.round(avgData.Prix_Reno_Iso / getEconomieAnnuelle(avgData.Economie_Prix_Elec_An_Iso, avgData.Economie_Prix_Gaz_An_Iso)),
        dpeInitial: avgData.Dpe_Initial,
        dpeFinal: avgData.Dpe_Final_Iso,
        economieElec: Math.round(avgData.Economie_Elec_Estime_Iso),
        economieGaz: Math.round(avgData.Economie_Gaz_Estime_Iso)
      },
      {
        scenario: 'chauffage',
        investissement: Math.round(avgData.Prix_Reno_Chauffage),
        economieAnnuelle: Math.round(getEconomieAnnuelle(avgData.Economie_Prix_Elec_An_Chauffage, avgData.Economie_Prix_Gaz_An_Chauffage)),
        amortissement: Math.round(avgData.Prix_Reno_Chauffage / getEconomieAnnuelle(avgData.Economie_Prix_Elec_An_Chauffage, avgData.Economie_Prix_Gaz_An_Chauffage)),
        dpeInitial: avgData.Dpe_Initial,
        dpeFinal: avgData.Dpe_Final_Chauffage,
        economieElec: Math.round(avgData.Economie_Elec_Chauffage),
        economieGaz: Math.round(avgData.Economie_Gaz_Estime_Chauffage)
      },
      {
        scenario: 'global',
        investissement: Math.round(avgData.Prix_Reno_Global),
        economieAnnuelle: Math.round(getEconomieAnnuelle(avgData.Economie_Prix_Elec_An_Global, avgData.Economie_Prix_Gaz_An_Global)),
        amortissement: Math.round(avgData.Prix_Reno_Global / getEconomieAnnuelle(avgData.Economie_Prix_Elec_An_Global, avgData.Economie_Prix_Gaz_An_Global)),
        dpeInitial: avgData.Dpe_Initial,
        dpeFinal: avgData.Dpe_Final_Global,
        economieElec: Math.round(avgData.Economie_Elec_Global),
        economieGaz: Math.round(avgData.Economie_Gaz_Estime_Global)
      }
    ];

    // Stocker les consommations de base
    setBaseConsumption({
      gaz: Math.round(avgData.Conso_Base_Gaz),
      elec: Math.round(avgData.Conso_Base_Elec)
    });

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

  const energyData = recommendations.flatMap(r => {
    const data = [];
    if (typeEnergie === 'electricite') {
      data.push({
        name: `${r.scenario === 'iso' ? 'ISO' : r.scenario === 'chauffage' ? 'Chauff' : 'Global'} - Élec`,
        value: r.economieElec,
        type: 'Électricité'
      });
    }
    if (typeEnergie === 'gaz') {
      data.push({
        name: `${r.scenario === 'iso' ? 'ISO' : r.scenario === 'chauffage' ? 'Chauff' : 'Global'} - Gaz`,
        value: r.economieGaz,
        type: 'Gaz'
      });
    }
    return data;
  });

  // Données pour graphique des économies cumulées sur 20 ans
  const cumulativeData = Array.from({ length: 21 }, (_, year) => ({
    année: year,
    ...recommendations.reduce((acc, r) => ({
      ...acc,
      [r.scenario === 'iso' ? 'Isolation' : r.scenario === 'chauffage' ? 'Chauffage' : 'Globale']: 
        r.economieAnnuelle * year - (year === 0 ? 0 : r.investissement)
    }), {})
  }));

  // Données pour graphique comparatif Investissement vs Économies totales sur 10 ans
  const investVsReturnData = recommendations.map(r => ({
    name: r.scenario === 'iso' ? 'Isolation' : r.scenario === 'chauffage' ? 'Chauffage' : 'Globale',
    'Investissement': r.investissement,
    'Économies 10 ans': r.economieAnnuelle * 10,
    'Économies 20 ans': r.economieAnnuelle * 20
  }));

  // Données pour graphique % de réduction énergétique
  const reductionData = recommendations.map(r => {
    const consoBase = typeEnergie === 'electricite' 
      ? (baseConsumption?.elec || 5000) 
      : (baseConsumption?.gaz || 12000);
    const economieEnergie = typeEnergie === 'electricite' ? r.economieElec : r.economieGaz;
    const tauxReduction = ((economieEnergie / consoBase) * 100);
    
    return {
      name: r.scenario === 'iso' ? 'Isolation' : r.scenario === 'chauffage' ? 'Chauffage' : 'Globale',
      'Réduction (%)': Math.round(tauxReduction),
      fill: r.scenario === 'iso' ? '#8884d8' : r.scenario === 'chauffage' ? '#82ca9d' : '#ffc658'
    };
  });

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

          <div className="form-group">
            <label>Type d'énergie actuel</label>
            <select 
              value={typeEnergie} 
              onChange={(e) => setTypeEnergie(e.target.value as 'gaz' | 'electricite')}
              className="form-input"
            >
              <option value="gaz">Gaz uniquement</option>
              <option value="electricite">Électricité uniquement</option>
            </select>
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
                  <div className="dpe-evolution" style={{ margin: '1rem 0' }}>
                    <span className="dpe-badge" style={{ backgroundColor: DPE_COLORS[rec.dpeInitial] }}>
                      {rec.dpeInitial}
                    </span>
                    <span className="arrow">→</span>
                    <span className="dpe-badge" style={{ backgroundColor: DPE_COLORS[rec.dpeFinal] }}>
                      {rec.dpeFinal}
                    </span>
                  </div>
                  <div className="energy-breakdown">
                    {typeEnergie === 'electricite' && (
                      <div className="energy-item">
                        <span>⚡ Élec: {rec.economieElec} kWh/an</span>
                      </div>
                    )}
                    {typeEnergie === 'gaz' && (
                      <div className="energy-item">
                        <span>🔥 Gaz: {rec.economieGaz} kWh/an</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {baseConsumption && (
              <div className="info-banner" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1rem' }}>📊 Consommations énergétiques de base</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {typeEnergie === 'gaz' && (
                    <div className="metric">
                      <span className="metric-label">Gaz actuel</span>
                      <span className="metric-value">{baseConsumption.gaz.toLocaleString('fr-FR')} kWh/an</span>
                    </div>
                  )}
                  {typeEnergie === 'electricite' && (
                    <div className="metric">
                      <span className="metric-label">Électricité actuelle</span>
                      <span className="metric-value">{baseConsumption.elec.toLocaleString('fr-FR')} kWh/an</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                <h3>📈 Évolution des économies cumulées (20 ans)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="année" label={{ value: 'Années', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Économies (€)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} €`} />
                    <Legend />
                    <Area type="monotone" dataKey="Isolation" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="Chauffage" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="Globale" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>💰 Investissement vs Retour sur 10 et 20 ans</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={investVsReturnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} €`} />
                    <Legend />
                    <Bar dataKey="Investissement" fill="#ff6b6b" />
                    <Bar dataKey="Économies 10 ans" fill="#4ecdc4" />
                    <Bar dataKey="Économies 20 ans" fill="#45b7d1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>📊 Réduction de consommation énergétique (%)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reductionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" unit="%" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="Réduction (%)" fill="#82ca9d">
                      {reductionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
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
