const STORAGE_KEY = 'velocity-tracker-v2';

let state = {
  labels: [],
  teamData: [], // { name, data: [], color }
  storyPointsApp: [],
  trendSettings: {
    showTotal: true,
    showShortEMA: true,
    showLongEMA: true,
    shortEmaPeriod: 2,
    longEmaPeriod: 6
  },
  calcSettings: {}
};

function saveState() {
  try {
    const appState = {
      labels: state.labels,
      teamData: state.teamData.map(t => ({ name: t.name, data: t.data, color: t.color })),
      storyPointsApp: state.storyPointsApp,
      calcSettings: getCalculatorSettings(),
      trendSettings: { ...state.trendSettings }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    showMessage(document.getElementById('message'), 'Saved', 'success', 1200);
  } catch (err) {
    console.warn('Failed to save state', err);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const st = JSON.parse(raw);

    state.labels = Array.isArray(st.labels) ? st.labels : [];
    state.teamData = Array.isArray(st.teamData) ? st.teamData.map(team => ({
      name: team.name,
      data: Array.isArray(team.data) ? [...team.data] : [],
      color: team.color || generateColor()
    })) : [];
    state.storyPointsApp = Array.isArray(st.storyPointsApp) ? st.storyPointsApp : [];

    if (st.calcSettings) {
        state.calcSettings = st.calcSettings;
        setCalculatorSettings(st.calcSettings);
    }

    if (st.trendSettings && typeof st.trendSettings === 'object') {
      state.trendSettings.showTotal = st.trendSettings.showTotal !== undefined ? st.trendSettings.showTotal : true;
      state.trendSettings.showShortEMA = st.trendSettings.showShortEMA !== undefined ? st.trendSettings.showShortEMA : true;
      state.trendSettings.showLongEMA = st.trendSettings.showLongEMA !== undefined ? st.trendSettings.showLongEMA : true;
      state.trendSettings.shortEmaPeriod = st.trendSettings.shortEmaPeriod || 2;
      state.trendSettings.longEmaPeriod = st.trendSettings.longEmaPeriod || 6;
    }

    showMessage(document.getElementById('message'), 'Loaded saved data', 'info', 1400);
    return true;
  } catch (err) {
    console.warn('Failed to load state', err);
    return false;
  }
}

function clearSaved() {
  localStorage.removeItem(STORAGE_KEY);
  state.labels = [];
  state.teamData = [];
  state.storyPointsApp = [];
  initDefaultTeams();
  showMessage(document.getElementById('message'), 'Cleared saved data', 'info', 1600);
}

function initDefaultTeams() {
  state.teamData.length = 0;
  ['Team Alpha', 'Team Beta', 'Team Gamma'].forEach((name, idx) => {
    state.teamData.push({
      name,
      data: [],
      color: generateColor()
    });
  });
}
