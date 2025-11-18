import { useLoaderData } from 'react-router';
import { loadData, calculateStats } from '~/utils/csvParser';
import type { RenovationData } from '~/types/renovation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, ComposedChart, Area, Cell
} from 'recharts';

export async function loader() {
  const data = await loadData('/data.json');
  const stats = calculateStats(data);
  return { data, stats };
}

interface LoaderData {
  data: RenovationData[];
  stats: any;
}

export default function Analytics() {
  const { data, stats } = useLoaderData<LoaderData>();

  // Coût moyen de rénovation par type de logement
  const avgCostByType = Object.entries(stats.prixMoyenParType).map(([type, prices]: [string, any]) => ({
    type,
    Isolation: Math.round(prices.iso),
    Chauffage: Math.round(prices.chauffage),
    Global: Math.round(prices.global)
  }));

  // Économies par surface (scatter plot)
  const savingsBySurface = data.map((d: RenovationData) => ({
    surface: d.Surface,
    economiesEuro: d.Economie_Prix_Elec_An_Global + d.Economie_Prix_Gaz_An_Global,
    economiesKWh: d.Economie_Elec_Global + d.Economie_Gaz_Estime_Global,
    type: d.Type_logement
  }));

  // ROI moyen par type de rénovation
  const roiData = [
    { scenario: 'Isolation', 'Années amortissement': Math.round(stats.roiMoyen.iso * 10) / 10 },
    { scenario: 'Chauffage', 'Années amortissement': Math.round(stats.roiMoyen.chauffage * 10) / 10 },
    { scenario: 'Global', 'Années amortissement': Math.round(stats.roiMoyen.global * 10) / 10 }
  ];

  // Corrélation investissement / économies
  const investmentVsSavings = data.map((d: RenovationData) => ({
    investissement: d.Prix_Reno_Global,
    economieAnnuelle: d.Economie_Prix_Elec_An_Global + d.Economie_Prix_Gaz_An_Global,
    type: d.Type_logement,
    dpe: d.Dpe_Final_Global
  }));

  // Répartition des gains gaz/élec
  const totalElecIso = data.reduce((sum, d) => sum + d.Economie_Elec_Estime_Iso, 0);
  const totalElecChauffage = data.reduce((sum, d) => sum + d.Economie_Elec_Chauffage, 0);
  const totalElecGlobal = data.reduce((sum, d) => sum + d.Economie_Elec_Global, 0);
  const totalGazIso = data.reduce((sum, d) => sum + d.Economie_Gaz_Estime_Iso, 0);
  const totalGazChauffage = data.reduce((sum, d) => sum + d.Economie_Gaz_Estime_Chauffage, 0);
  const totalGazGlobal = data.reduce((sum, d) => sum + d.Economie_Gaz_Estime_Global, 0);

  const energySavingsBreakdown = [
    { scenario: 'Isolation', Électricité: totalElecIso, Gaz: totalGazIso },
    { scenario: 'Chauffage', Électricité: totalElecChauffage, Gaz: totalGazChauffage },
    { scenario: 'Global', Électricité: totalElecGlobal, Gaz: totalGazGlobal }
  ];

  // Stats générales
  const avgSurfaceByType: Record<string, { count: number; totalSurface: number }> = {};
  data.forEach((d: RenovationData) => {
    if (!avgSurfaceByType[d.Type_logement]) {
      avgSurfaceByType[d.Type_logement] = { count: 0, totalSurface: 0 };
    }
    avgSurfaceByType[d.Type_logement].count++;
    // Calculer la surface moyenne de la plage "min-max"
    const [min, max] = d.Surface.split('-').map(Number);
    const avgSurface = (min + max) / 2;
    avgSurfaceByType[d.Type_logement].totalSurface += avgSurface;
  });

  const surfaceStats = Object.entries(avgSurfaceByType).map(([type, stats]) => ({
    type,
    'Surface moyenne (m²)': Math.round(stats.totalSurface / stats.count)
  }));

  return (
    <div className="analytics-container">
      <div className="hero-section">
        <h1>📊 Analyse Big Data - Statistiques Générales</h1>
        <p>Vue d'ensemble des tendances de rénovation énergétique</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-value">{data.length}</div>
            <div className="stat-label">Logements analysés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round(data.reduce((sum, d) => sum + d.Prix_Reno_Global, 0) / data.length).toLocaleString('fr-FR')} €
            </div>
            <div className="stat-label">Coût moyen rénovation globale</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💚</div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round(data.reduce((sum, d) => sum + d.Economie_Prix_Elec_An_Global + d.Economie_Prix_Gaz_An_Global, 0) / data.length).toLocaleString('fr-FR')} €
            </div>
            <div className="stat-label">Économie annuelle moyenne</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round(data.reduce((sum, d) => sum + d.Nb_Annee_Amortissement, 0) / data.length)} ans
            </div>
            <div className="stat-label">Amortissement moyen</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>💰 Coût moyen de rénovation par type de logement</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={avgCostByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
              <Legend />
              <Bar dataKey="Isolation" fill="#8884d8" />
              <Bar dataKey="Chauffage" fill="#82ca9d" />
              <Bar dataKey="Global" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section">
        <h2>📏 Surface moyenne par type de logement</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={surfaceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Surface moyenne (m²)" fill="#8dd1e1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section">
        <h2>📈 Économies d'énergie en fonction de la surface</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="surface" name="Surface" unit=" m²" />
              <YAxis type="number" dataKey="economiesEuro" name="Économies" unit=" €/an" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Économies annuelles" data={savingsBySurface} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="chart-description">
            💡 Tendance : Plus la surface est grande, plus les économies potentielles sont importantes
          </p>
        </div>
      </div>

      <div className="section">
        <h2>⏱️ ROI moyen par type de rénovation</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={roiData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="scenario" type="category" />
              <Tooltip />
              <Bar dataKey="Années amortissement" fill="#ff7c7c">
                {roiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry['Années amortissement'] < 10 ? '#82ca9d' : entry['Années amortissement'] < 12 ? '#ffc658' : '#ff7c7c'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-description">
            🎯 La rénovation globale offre le meilleur retour sur investissement avec un amortissement moyen de {Math.round(stats.roiMoyen.global)} ans
          </p>
        </div>
      </div>

      <div className="section">
        <h2>💎 Corrélation : Investissement vs Économies</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="investissement" name="Investissement" unit=" €" />
              <YAxis type="number" dataKey="economieAnnuelle" name="Économie annuelle" unit=" €/an" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Logements" data={investmentVsSavings} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="chart-description">
            📊 Relation positive : Un investissement plus élevé génère généralement des économies annuelles plus importantes
          </p>
        </div>
      </div>

      <div className="section">
        <h2>⚡ Répartition des économies d'énergie (kWh)</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energySavingsBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} kWh`} />
              <Legend />
              <Bar dataKey="Électricité" stackId="a" fill="#ffd93d" />
              <Bar dataKey="Gaz" stackId="a" fill="#ff6b6b" />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-description">
            🔥 La rénovation globale maximise les économies à la fois en électricité et en gaz
          </p>
        </div>
      </div>

      <div className="section">
        <h2>📉 Évolution des économies cumulées sur 15 ans</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={Array.from({ length: 16 }, (_, year) => ({
                année: year,
                Isolation: year * (data.reduce((sum, d) => sum + d.Economie_Prix_Elec_An_Iso + d.Economie_Prix_Gaz_An_Iso, 0) / data.length),
                Chauffage: year * (data.reduce((sum, d) => sum + d.Economie_Prix_Elec_An_Chauffage + d.Economie_Prix_Gaz_An_Chauffage, 0) / data.length),
                Global: year * (data.reduce((sum, d) => sum + d.Economie_Prix_Elec_An_Global + d.Economie_Prix_Gaz_An_Global, 0) / data.length)
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="année" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${Math.round(value).toLocaleString('fr-FR')} €`} />
              <Legend />
              <Line type="monotone" dataKey="Isolation" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="Chauffage" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="Global" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
