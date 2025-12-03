const MAX = 999;
const MIN = 0;

function escapeHtml(s) {
  return String(s).replace(/[&<"']/g, ch => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[ch]));
}

function calculateEMA(data, period) {
  if (!Array.isArray(data) || period < 1 || data.length === 0) return [];

  const result = [];
  const multiplier = 2 / (period + 1);

  // Start with first value as the initial EMA
  let ema = data[0] || 0;
  result.push(ema);

  // Calculate EMA for remaining values
  for (let i = 1; i < data.length; i++) {
    const currentValue = data[i] || 0;
    ema = (currentValue * multiplier) + (ema * (1 - multiplier));
    result.push(ema);
  }

  return result;
}

const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform);

function isCommandKey(e) {
  return isMac ? e.metaKey : e.ctrlKey;
}

function isTypingInInput() {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tagName = activeEl.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || activeEl.isContentEditable;
}

function showMessage(messageEl, text, type = 'info', timeout = 4000) {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = '';
  if (type) messageEl.classList.add(type);
  if (timeout > 0) {
    setTimeout(() => { messageEl.textContent = ''; messageEl.className = ''; }, timeout);
  }
}

function calculateAverage(data) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + (val || 0), 0);
    return sum / data.length;
}

function calculateStdDev(data) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    const avg = calculateAverage(data);
    const squareDiffs = data.map(value => {
        const diff = (value || 0) - avg;
        return diff * diff;
    });
    const avgSquareDiff = calculateAverage(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function generateColor() {
    const existingColors = state.teamData.map(team => team.color);
    let newColor;
    do {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 20) + 70; // 70-90% saturation
        const l = Math.floor(Math.random() * 20) + 60; // 60-80% lightness
        newColor = `hsl(${h}, ${s}%, ${l}%)`;
    } while (existingColors.includes(newColor));

    // Convert HSL to HEX
    let s = newColor.split("(")[1].split(")")[0];
    s = s.split(",");
    let h = parseInt(s[0]);
    let sat = parseInt(s[1].slice(0, -1));
    let light = parseInt(s[2].slice(0, -1));
    
    sat /= 100;
    light /= 100;
    let c = (1 - Math.abs(2 * light - 1)) * sat,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = light - c/2,
        r = 0,
        g = 0,
        b = 0;
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}
