let chart = null;

function initChart() {
  if (chart) chart.destroy();

  const ctx = document.getElementById('velocityChart').getContext('2d');
  const datasets = state.teamData.map(team => ({
    label: team.name,
    data: team.data,
    borderColor: team.color,
    tension: 0.2,
    fill: false
  }));

  const totalData = [];
  for (let i = 0; i < state.labels.length; i++) {
    let sum = 0;
    state.teamData.forEach(team => sum += (team.data[i] || 0));
    totalData.push(sum);
  }

  datasets.push({
    label: 'Total',
    data: totalData,
    borderColor: '#94a3b8',
    tension: 0.2,
    fill: false,
    borderDash: [4, 2]
  });

  if (state.trendSettings.showMovingAverage && totalData.length >= state.trendSettings.movingAveragePeriod) {
    const maData = calculateMovingAverage(totalData, state.trendSettings.movingAveragePeriod);
    datasets.push({
      label: `Total MA(${state.trendSettings.movingAveragePeriod})`,
      data: maData,
      borderColor: 'rgba(251, 191, 36, 1)',
      tension: 0.3,
      fill: false,
      borderWidth: 3,
      borderDash: [8, 4],
      pointRadius: 0,
      pointHoverRadius: 4,
      spanGaps: true
    });
  }

  if (state.trendSettings.showLinearRegression && totalData.length >= 2) {
    const lrData = calculateLinearRegression(totalData);
    datasets.push({
      label: 'Total Trend (Linear)',
      data: lrData,
      borderColor: 'rgba(52, 211, 153, 0.7)',
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      tension: 0,
      fill: false,
      borderWidth: 2,
      borderDash: [2, 2],
      pointRadius: 0
    });
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: { labels: state.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#e6eef6',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#9aa4b2' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#9aa4b2' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function restoreTrendToggles() {
    const toggleMA = document.getElementById('toggleMovingAverage');
    const toggleLR = document.getElementById('toggleLinearRegression');
    if (toggleMA) toggleMA.checked = state.trendSettings.showMovingAverage;
    if (toggleLR) toggleLR.checked = state.trendSettings.showLinearRegression;
}

function setupTrendlineEventListeners() {
    const toggleMA = document.getElementById('toggleMovingAverage');
    const toggleLR = document.getElementById('toggleLinearRegression');
    const messageEl = document.getElementById('message');

    if (toggleMA) {
        toggleMA.addEventListener('change', (e) => {
            state.trendSettings.showMovingAverage = e.target.checked;
            initChart();
            saveState();
            showMessage(
                messageEl,
                e.target.checked ? 'Moving average enabled' : 'Moving average disabled',
                'info',
                1500
            );
        });
    }

    if (toggleLR) {
        toggleLR.addEventListener('change', (e) => {
            state.trendSettings.showLinearRegression = e.target.checked;
            initChart();
            saveState();
            showMessage(
                messageEl,
                e.target.checked ? 'Linear regression enabled' : 'Linear regression disabled',
                'info',
                1500
            );
        });
    }
}
