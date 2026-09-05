/**
 * Analytics Engine using Chart.js
 * Renders 30-Year Decadal Climate Trends & Temperature Anomaly Distributions
 */
const AnalyticsEngine = (() => {
  let tempChart = null;
  let precipChart = null;

  return {
    renderCharts(baselineData) {
      const ctxTemp = document.getElementById('tempAnomalyChart').getContext('2d');
      const ctxPrecip = document.getElementById('precipTrendChart').getContext('2d');

      if (tempChart) tempChart.destroy();
      if (precipChart) precipChart.destroy();

      // Temperature Anomaly Chart
      tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
          labels: baselineData.years,
          datasets: [{
            label: 'Mean Temp (°C)',
            data: baselineData.tempAnomalies,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: '30-Year Temperature Anomaly Trend (1995-2025)', color: '#f8fafc' },
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });

      // Precipitation Distribution Chart
      precipChart = new Chart(ctxPrecip, {
        type: 'bar',
        data: {
          labels: baselineData.years,
          datasets: [{
            label: 'Annual Rain (mm)',
            data: baselineData.precipTrends,
            backgroundColor: '#06b6d4'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Decadal Rainfall Variability', color: '#f8fafc' },
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  };
})();