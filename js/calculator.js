function calculateStoryPointTarget() {
  const calcWeeks = document.getElementById('weeksInSprint');
  const calcDevs = document.getElementById('numberOfDevs');
  const calcHoursPerDay = document.getElementById('hoursPerDay');
  const calcDaysOff = document.getElementById('daysOff');
  const calcHolidays = document.getElementById('holidays');
  const calcLastVelocity = document.getElementById('lastVelocity');

  const calcWorkableHoursPerWeek = document.getElementById('workableHoursPerWeek');
  const calcTotalHoursOff = document.getElementById('totalHoursOff');
  const calcMaxHours = document.getElementById('maxHours');
  const calcActualHoursAvailable = document.getElementById('actualHoursAvailable');
  const calcTargetVelocity = document.getElementById('targetVelocity');
  const calcTargetStoryPoints = document.getElementById('targetStoryPoints');

  const weeks = Number(calcWeeks.value) || 0;
  const devs = Number(calcDevs.value) || 0;
  const hoursPerDay = Number(calcHoursPerDay.value) || 0;
  const daysOff = Number(calcDaysOff.value) || 0;
  const holidays = Number(calcHolidays.value) || 0;
  const lastVelocity = Number(calcLastVelocity.value) || 0;

  const workableHoursPerWeek = hoursPerDay * 5;
  const maxHours = devs * weeks * workableHoursPerWeek;
  const totalHoursOffIndividual = daysOff * hoursPerDay;
  const totalHoursOffHolidays = holidays * hoursPerDay * devs;
  const totalHoursOff = totalHoursOffIndividual + totalHoursOffHolidays;
  const actualHoursAvailable = maxHours > 0 ? (maxHours - totalHoursOff) / maxHours : 0;
  const targetVelocity = lastVelocity * actualHoursAvailable;
  const target = Math.round(targetVelocity * 100) / 100;

  calcWorkableHoursPerWeek.textContent = workableHoursPerWeek.toFixed(1);
  calcTotalHoursOff.textContent = totalHoursOff.toFixed(1);
  calcMaxHours.textContent = maxHours.toFixed(1);
  calcActualHoursAvailable.textContent = actualHoursAvailable.toFixed(2);
  calcTargetVelocity.textContent = targetVelocity.toFixed(2);
  calcTargetStoryPoints.textContent = target.toFixed(2);
}

function getCalculatorSettings() {
  return {
    weeks: document.getElementById('weeksInSprint').value,
    devs: document.getElementById('numberOfDevs').value,
    hoursPerDay: document.getElementById('hoursPerDay').value,
    daysOff: document.getElementById('daysOff').value,
    holidays: document.getElementById('holidays').value,
    lastVelocity: document.getElementById('lastVelocity').value
  };
}

function setCalculatorSettings(settings) {
    if (settings && typeof settings === 'object') {
        if (settings.weeks !== undefined) document.getElementById('weeksInSprint').value = settings.weeks;
        if (settings.devs !== undefined) document.getElementById('numberOfDevs').value = settings.devs;
        if (settings.hoursPerDay !== undefined) document.getElementById('hoursPerDay').value = settings.hoursPerDay;
        if (settings.daysOff !== undefined) document.getElementById('daysOff').value = settings.daysOff;
        if (settings.holidays !== undefined) document.getElementById('holidays').value = settings.holidays;
        if (settings.lastVelocity !== undefined) document.getElementById('lastVelocity').value = settings.lastVelocity;
        calculateStoryPointTarget();
    }
}

function setupCalculatorEventListeners() {
    document.getElementById('weeksInSprint').addEventListener('input', () => { calculateStoryPointTarget(); saveState(); });
    document.getElementById('numberOfDevs').addEventListener('input', () => { calculateStoryPointTarget(); saveState(); });
    document.getElementById('hoursPerDay').addEventListener('input', () => { calculateStoryPointTarget(); saveState(); });
    document.getElementById('daysOff').addEventListener('input', () => { calculateStoryPointTarget(); saveState(); });
    document.getElementById('holidays').addEventListener('input', () => { calculateStoryPointTarget(); saveState(); });
    document.getElementById('lastVelocity').addEventListener('input', () => { calculateStoryPointTarget(); saveState(); });
}
