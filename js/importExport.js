function parseCSV(text) {
  const rows = text.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0 && !r.startsWith('#'));
  if (rows.length === 0) return [];
  const header = rows.shift();

  const parsed = [];
  rows.forEach((r) => {
    const cols = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < r.length; i++) {
      const char = r[i];
      if (char === '"') {
        if (inQuotes && r[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    if (cols.length < 2) return;
    parsed.push({ label: cols[0], values: cols.slice(1) });
  });
  return parsed;
}

function setupImportExportEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const downloadBtn = document.getElementById('downloadBtn');

    fileInput.addEventListener('change', async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const name = f.name || '';
        const ext = name.split('.').pop().toLowerCase();
        let rows = [];
        let headers = [];
        let colorMetadata = {};

        if (ext === 'xlsx' || ext === 'xls') {
            try {
                const data = await f.arrayBuffer();
                const workbook = XLSX.read(data);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (aoa.length > 0) {
                    headers = aoa[0];
                    rows = aoa.slice(1).map(row => ({
                        label: row[0],
                        values: row.slice(1)
                    }));
                }
            } catch (err) {
                showMessage(document.getElementById('message'), 'Failed to parse spreadsheet: ' + err.message, 'error', 6000);
                return;
            }
        } else { // Assume CSV
            const text = await f.text();
            const lines = text.split(/\r?\n/);
            if (lines[0] && lines[0].startsWith('# Team Colors:')) {
                const colorLine = lines[0].substring(14).trim();
                colorLine.split(';').forEach(pair => {
                    const [teamName, color] = pair.split('=').map(s => s.trim());
                    if (teamName && color) colorMetadata[teamName] = color;
                });
            }

            try {
                const csvText = text.replace(/^#[^\n]*\n/, '');
                const headerLine = csvText.split(/\r?\n/)[0];
                headers = headerLine.split(',').map(h => h.trim());
                rows = parseCSV(csvText);
            } catch (err) {
                showMessage(document.getElementById('message'), 'Failed to parse CSV: ' + err.message, 'error', 6000);
                return;
            }
        }

        if (rows.length === 0) {
            showMessage(document.getElementById('message'), 'No data found in file', 'error', 3000);
            return;
        }

        const teamNames = headers.slice(1).filter(h => h && h.toLowerCase() !== 'total');

        if (state.teamData.length === 0 && teamNames.length > 0) {
            teamNames.forEach((name) => {
                state.teamData.push({
                    name,
                    data: [],
                    color: colorMetadata[name] || generateColor()
                });
            });
        } else if (state.teamData.length === teamNames.length) {
            teamNames.forEach((name, index) => {
                state.teamData[index].name = name;
                if (colorMetadata[name]) {
                    state.teamData[index].color = colorMetadata[name];
                }
            });
        } else {
            showMessage(document.getElementById('message'), 'Number of teams in the file does not match the current number of teams.', 'error', 5000);
            fileInput.value = '';
            return;
        }
        
        renderTeamInputs();
        renderAddRowInputs();

        const newRows = rows.map(row => {
            const teamValues = Array(state.teamData.length).fill(0);
            row.values.forEach((val, index) => {
                if (index < teamValues.length) {
                    teamValues[index] = Number(val) || 0;
                }
            });
            return { label: row.label, teamValues };
        });

        addMultipleRows(newRows);
        
        saveState();
        showMessage(document.getElementById('message'), `Imported ${rows.length} rows`, 'success', 5000);
        fileInput.value = '';
    });

    downloadBtn.addEventListener('click', () => {
        let csv = `# Team Colors: ${state.teamData.map(t => `${t.name}=${t.color}`).join(';')}\n`;
        csv += 'Label';
        state.teamData.forEach(team => csv += `,${team.name}`);
        csv += ',Total\n';

        for (let i = 0; i < state.labels.length; i++) {
            csv += `"${state.labels[i].replace(/"/g, '""')}"`;
            let total = 0;
            state.teamData.forEach(team => {
                const val = team.data[i] || 0;
                total += val;
                csv += `,${val}`;
            });
            csv += `,${total}\n`;
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'velocity-export.csv';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    });
}
