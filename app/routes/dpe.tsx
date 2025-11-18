import { useLoaderData } from 'react-router';
import { loadData, calculateStats } from '~/utils/csvParser';
import type { RenovationData } from '~/types/renovation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sankey, Rectangle
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

const DPE_COLORS: Record<string, string> = {
  'A': '#00a06d',
  'B': '#4cb848',
  'C': '#c8d200',
  'D': '#f9e900',
  'E': '#f5b000',
  'F': '#ed7d31',
  'G': '#e30613'
};

const DPE_ORDER = ['G', 'F', 'E', 'D', 'C', 'B', 'A'];

export default function DPEDashboard() {
  const { data, stats } = useLoaderData<LoaderData>();

  // Répartition DPE initial
  const dpeInitialData = Object.entries(stats.repartitionDPE.initial)
    .sort(([a], [b]) => DPE_ORDER.indexOf(a) - DPE_ORDER.indexOf(b))
    .map(([dpe, count]) => ({
      name: `DPE ${dpe}`,
      value: count as number,
      dpe
    }));

  // Répartition DPE final
  const dpeFinalData = Object.entries(stats.repartitionDPE.final)
    .sort(([a], [b]) => DPE_ORDER.indexOf(a) - DPE_ORDER.indexOf(b))
    .map(([dpe, count]) => ({
      name: `DPE ${dpe}`,
      value: count as number,
      dpe
    }));

  // Transitions DPE
  const transitionsData = stats.repartitionDPE.transitions
    .sort((a: any, b: any) => b.count - a.count)
    .map((t: any) => ({
      transition: `${t.from} → ${t.to}`,
      count: t.count,
      from: t.from,
      to: t.to
    }));

  // Amélioration moyenne du DPE
  const dpeToNumber: Record<string, number> = { G: 1, F: 2, E: 3, D: 4, C: 5, B: 6, A: 7 };
  const avgImprovement = data.reduce((sum, d) => {
    return sum + (dpeToNumber[d.Dpe_Final] - dpeToNumber[d.Dpe_Initial]);
  }, 0) / data.length;

  // Coût moyen par niveau d'amélioration DPE
  const improvementCostData: Record<number, { count: number; totalCost: number }> = {};
  data.forEach((d: RenovationData) => {
    const improvement = dpeToNumber[d.Dpe_Final] - dpeToNumber[d.Dpe_Initial];
    if (!improvementCostData[improvement]) {
      improvementCostData[improvement] = { count: 0, totalCost: 0 };
    }
    improvementCostData[improvement].count++;
    improvementCostData[improvement].totalCost += d.Prix_Reno_Global;
  });

  const costByImprovement = Object.entries(improvementCostData)
    .map(([improvement, stats]) => ({
      amélioration: `+${improvement} niveau${parseInt(improvement) > 1 ? 'x' : ''}`,
      'Coût moyen (€)': Math.round(stats.totalCost / stats.count),
      count: stats.count
    }))
    .sort((a, b) => parseInt(a.amélioration.replace('+', '')) - parseInt(b.amélioration.replace('+', '')));

  // Distribution des économies par DPE final
  const savingsByFinalDPE: Record<string, { count: number; totalSavings: number }> = {};
  data.forEach((d: RenovationData) => {
    if (!savingsByFinalDPE[d.Dpe_Final]) {
      savingsByFinalDPE[d.Dpe_Final] = { count: 0, totalSavings: 0 };
    }
    savingsByFinalDPE[d.Dpe_Final].count++;
    savingsByFinalDPE[d.Dpe_Final].totalSavings += d.Economie_Prix_Elec_An_Global + d.Economie_Prix_Gaz_An_Global;
  });

  const savingsByDPE = Object.entries(savingsByFinalDPE)
    .sort(([a], [b]) => DPE_ORDER.indexOf(a) - DPE_ORDER.indexOf(b))
    .map(([dpe, stats]) => ({
      dpe: `DPE ${dpe}`,
      'Économie annuelle moyenne (€)': Math.round(stats.totalSavings / stats.count)
    }));

  // Stats par type de logement et DPE
  const dpeByType: Record<string, Record<string, number>> = {};
  data.forEach((d: RenovationData) => {
    if (!dpeByType[d.Type_logement]) {
      dpeByType[d.Type_logement] = {};
    }
    if (!dpeByType[d.Type_logement][d.Dpe_Final]) {
      dpeByType[d.Type_logement][d.Dpe_Final] = 0;
    }
    dpeByType[d.Type_logement][d.Dpe_Final]++;
  });

  const dpeTypeData = Object.entries(dpeByType).map(([type, dpes]) => {
    const result: any = { type };
    Object.entries(dpes).forEach(([dpe, count]) => {
      result[dpe] = count;
    });
    return result;
  });

  const allDPEKeys = [...new Set(data.map(d => d.Dpe_Final))].sort((a, b) => DPE_ORDER.indexOf(a) - DPE_ORDER.indexOf(b));

  return (
    <div className="dpe-container">
      <div className="hero-section">
        <h1>🏷️ Analyse DPE - Diagnostic de Performance Énergétique</h1>
        <p>Visualisez l'impact des rénovations sur la classification énergétique</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">+{avgImprovement.toFixed(1)}</div>
            <div className="stat-label">Amélioration moyenne (niveaux DPE)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{Math.round((dpeFinalData.filter(d => ['A', 'B', 'C'].includes(d.dpe)).reduce((sum, d) => sum + d.value, 0) / data.length) * 100)}%</div>
            <div className="stat-label">Logements atteignant A, B ou C</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">
              {transitionsData[0]?.transition || 'N/A'}
            </div>
            <div className="stat-label">Transition la plus fréquente</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {costByImprovement.find(d => d.amélioration.includes('+2'))?.['Coût moyen (€)']?.toLocaleString('fr-FR') || 'N/A'} €
            </div>
            <div className="stat-label">Coût pour +2 niveaux DPE</div>
          </div>
        </div>
      </div>

      <div className="comparison-section">
        <h2>🔄 Avant / Après Rénovation</h2>
        <div className="dpe-comparison">
          <div className="dpe-chart-wrapper">
            <h3>📊 DPE Initial</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dpeInitialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Nombre de logements">
                  {dpeInitialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DPE_COLORS[entry.dpe]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dpe-chart-wrapper">
            <h3>✨ DPE Final</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dpeFinalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Nombre de logements">
                  {dpeFinalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DPE_COLORS[entry.dpe]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>🔀 Flux des transitions DPE</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={transitionsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="transition" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Nombre de transitions" fill="#8884d8">
                {transitionsData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={DPE_COLORS[entry.to]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="transitions-list">
            <h4>Transitions détaillées :</h4>
            {transitionsData.map((t: any, idx: number) => (
              <div key={idx} className="transition-item">
                <span className="dpe-badge" style={{ backgroundColor: DPE_COLORS[t.from] }}>
                  {t.from}
                </span>
                <span className="arrow">→</span>
                <span className="dpe-badge" style={{ backgroundColor: DPE_COLORS[t.to] }}>
                  {t.to}
                </span>
                <span className="count-badge">{t.count} logements</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>💰 Coût moyen par niveau d'amélioration</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={costByImprovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="amélioration" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} />
              <Bar dataKey="Coût moyen (€)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-description">
            💡 Plus l'amélioration est importante, plus l'investissement requis est élevé (rénovation globale recommandée)
          </p>
        </div>
      </div>

      <div className="section">
        <h2>💚 Économies annuelles par DPE atteint</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={savingsByDPE}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dpe" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €/an`} />
              <Bar dataKey="Économie annuelle moyenne (€)" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-description">
            🎯 Les logements atteignant un DPE C bénéficient des meilleures économies annuelles
          </p>
        </div>
      </div>

      <div className="section">
        <h2>🏠 DPE final par type de logement</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dpeTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              {allDPEKeys.map((dpe) => (
                <Bar key={dpe} dataKey={dpe} stackId="a" fill={DPE_COLORS[dpe]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section">
        <h2>📊 Répartition des DPE finaux</h2>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dpeFinalData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {dpeFinalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DPE_COLORS[entry.dpe]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insight-section">
        <h2>🔍 Insights clés</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>🏆 Performance globale</h3>
            <p>
              Après rénovation, <strong>{Math.round((dpeFinalData.filter(d => ['A', 'B', 'C'].includes(d.dpe)).reduce((sum, d) => sum + d.value, 0) / data.length) * 100)}%</strong> des 
              logements atteignent une classe énergétique C ou supérieure, contre seulement <strong>
              {Math.round((dpeInitialData.filter(d => ['A', 'B', 'C'].includes(d.dpe)).reduce((sum, d) => sum + d.value, 0) / data.length) * 100)}%</strong> initialement.
            </p>
          </div>
          <div className="insight-card">
            <h3>💰 Investissement optimal</h3>
            <p>
              Pour améliorer de 2 niveaux son DPE (ex: E→C), comptez en moyenne <strong>
              {costByImprovement.find(d => d.amélioration.includes('+2'))?.['Coût moyen (€)']?.toLocaleString('fr-FR')} €</strong> d'investissement.
            </p>
          </div>
          <div className="insight-card">
            <h3>🎯 Transition populaire</h3>
            <p>
              La transition la plus fréquente est <strong>{transitionsData[0]?.from} → {transitionsData[0]?.to}</strong>, 
              concernant <strong>{transitionsData[0]?.count}</strong> logements de notre échantillon.
            </p>
          </div>
          <div className="insight-card">
            <h3>📈 Amélioration moyenne</h3>
            <p>
              En moyenne, les rénovations permettent d'améliorer le DPE de <strong>{avgImprovement.toFixed(1)} niveaux</strong>, 
              avec un impact significatif sur la valeur du bien et le confort thermique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
