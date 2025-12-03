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

  if (state.trendSettings.showTotal) {
    datasets.push({
      label: 'Total',
      data: totalData,
      borderColor: '#94a3b8',
      tension: 0.2,
      fill: false,
      borderDash: [4, 2]
    });
  }

  // Calculate EMAs for coloring logic
  const longEmaData = totalData.length >= 2 ? calculateEMA(totalData, state.trendSettings.longEmaPeriod) : [];
  const shortEmaData = totalData.length >= 2 ? calculateEMA(totalData, state.trendSettings.shortEmaPeriod) : [];

  // Long EMA (baseline) - 6 sprint average
  if (state.trendSettings.showLongEMA && longEmaData.length > 0) {
    datasets.push({
      label: `Baseline EMA(${state.trendSettings.longEmaPeriod})`,
      data: longEmaData,
      borderColor: 'rgba(251, 191, 36, 0.9)',
      tension: 0.3,
      fill: false,
      borderWidth: 3,
      borderDash: [8, 4],
      pointRadius: 0,
      pointHoverRadius: 5,
      spanGaps: true
    });
  }

  // Short EMA - 2 sprint average with dynamic coloring
  if (state.trendSettings.showShortEMA && shortEmaData.length > 0) {
    // Create segment colors based on position relative to baseline
    const segmentColors = shortEmaData.map((shortValue, idx) => {
      if (longEmaData.length > 0 && idx < longEmaData.length) {
        return shortValue >= longEmaData[idx]
          ? 'rgba(52, 211, 153, 1)'  // Green - above baseline
          : 'rgba(239, 68, 68, 1)';   // Red - below baseline
      }
      return 'rgba(52, 211, 153, 1)'; // Default green
    });

    datasets.push({
      label: `Short EMA(${state.trendSettings.shortEmaPeriod})`,
      data: shortEmaData,
      segment: {
        borderColor: (ctx) => {
          const idx = ctx.p0DataIndex;
          return segmentColors[idx] || 'rgba(52, 211, 153, 1)';
        }
      },
      borderColor: 'rgba(52, 211, 153, 1)', // Fallback color
      tension: 0.3,
      fill: false,
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 5,
      spanGaps: true
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
    const toggleTotal = document.getElementById('toggleTotal');
    const toggleShortEMA = document.getElementById('toggleShortEMA');
    const toggleLongEMA = document.getElementById('toggleLongEMA');
    if (toggleTotal) toggleTotal.checked = state.trendSettings.showTotal;
    if (toggleShortEMA) toggleShortEMA.checked = state.trendSettings.showShortEMA;
    if (toggleLongEMA) toggleLongEMA.checked = state.trendSettings.showLongEMA;
}

function setupTrendlineEventListeners() {
    const toggleTotal = document.getElementById('toggleTotal');
    const toggleShortEMA = document.getElementById('toggleShortEMA');
    const toggleLongEMA = document.getElementById('toggleLongEMA');
    const messageEl = document.getElementById('message');

    if (toggleTotal) {
        toggleTotal.addEventListener('change', (e) => {
            state.trendSettings.showTotal = e.target.checked;
            initChart();
            saveState();
            showMessage(
                messageEl,
                e.target.checked ? 'Total line enabled' : 'Total line disabled',
                'info',
                1500
            );
        });
    }

    if (toggleShortEMA) {
        toggleShortEMA.addEventListener('change', (e) => {
            state.trendSettings.showShortEMA = e.target.checked;
            initChart();
            saveState();
            showMessage(
                messageEl,
                e.target.checked ? 'Short EMA (2-sprint) enabled' : 'Short EMA disabled',
                'info',
                1500
            );
        });
    }

    if (toggleLongEMA) {
        toggleLongEMA.addEventListener('change', (e) => {
            state.trendSettings.showLongEMA = e.target.checked;
            initChart();
            saveState();
            showMessage(
                messageEl,
                e.target.checked ? 'Baseline EMA (6-sprint) enabled' : 'Baseline EMA disabled',
                'info',
                1500
            );
        });
    }
}
