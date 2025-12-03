document.addEventListener('DOMContentLoaded', () => {
  const hadSaved = loadState();
  if (!hadSaved) {
    initDefaultTeams();
  }
  
  renderTeamInputs();
  renderProjections();
  renderAddRowInputs();
  renderTable();
  initChart();
  restoreTrendToggles();
  calculateStoryPointTarget();
  renderAnalytics();
  
  setupDOMEventListeners();
  setupImportExportEventListeners();
  setupTrendlineEventListeners();
  setupCalculatorEventListeners();

  console.log('Dynamic velocity tracker ready');
});
