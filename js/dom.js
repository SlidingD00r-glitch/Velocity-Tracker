function renderTeamInputs() {
  const teamNamesContainer = document.getElementById('teamNamesContainer');
  teamNamesContainer.innerHTML = '';
  state.teamData.forEach((team, idx) => {
    const group = document.createElement('div');
    group.className = 'team-name-group';

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = team.color;
    colorPicker.className = 'color-picker';
    colorPicker.title = 'Change team color';
    colorPicker.addEventListener('input', (e) => {
      state.teamData[idx].color = e.target.value;
      initChart();
      saveState();
    });

    const input = document.createElement('input');
    input.value = team.name;
    input.dataset.teamIdx = idx;
    input.addEventListener('input', (e) => {
      state.teamData[idx].name = e.target.value.trim() || `Team ${idx + 1}`;
      renderTable();
      initChart();
      renderAddRowInputs();
      renderAnalytics();
      saveState();
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove team';
    removeBtn.addEventListener('click', () => removeTeam(idx));

    group.appendChild(colorPicker);
    group.appendChild(input);
    if (state.teamData.length > 1) group.appendChild(removeBtn);
    teamNamesContainer.appendChild(group);
  });
}

function renderAddRowInputs() {
  const addRowTeamInputs = document.getElementById('addRowTeamInputs');
  addRowTeamInputs.innerHTML = '';
  state.teamData.forEach((team, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'team-input-field';

    const label = document.createElement('label');
    label.htmlFor = `newTeam${idx}`;
    label.textContent = team.name;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = MIN;
    input.max = MAX;
    input.placeholder = 'Enter points';
    input.dataset.teamIdx = idx;
    input.id = `newTeam${idx}`;
    input.required = true;

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    addRowTeamInputs.appendChild(wrapper);
  });
}

function renderTable() {
    const dataTableHead = document.querySelector('#dataTable thead tr');
    const dataTableBody = document.querySelector('#dataTable tbody');

    dataTableHead.innerHTML = '<th>Label</th>';
    state.teamData.forEach(team => {
        const th = document.createElement('th');
        th.textContent = team.name;
        dataTableHead.appendChild(th);
    });
    dataTableHead.innerHTML += '<th>Total</th><th>Actions</th>';

    dataTableBody.innerHTML = '';

    for (let i = 0; i < state.labels.length; i++) {
        const tr = document.createElement('tr');
        tr.dataset.rowIdx = i;

        const labelCell = document.createElement('td');
        labelCell.textContent = state.labels[i];
        labelCell.className = 'editable-cell';
        labelCell.dataset.field = 'label';
        labelCell.dataset.rowIdx = i;
        tr.appendChild(labelCell);

        let total = 0;
        state.teamData.forEach((team, teamIdx) => {
            const val = team.data[i] || 0;
            total += val;
            const cell = document.createElement('td');
            cell.textContent = val;
            cell.className = 'editable-cell';
            cell.dataset.field = 'team';
            cell.dataset.rowIdx = i;
            cell.dataset.teamIdx = teamIdx;
            tr.appendChild(cell);
        });

        const totalCell = document.createElement('td');
        totalCell.textContent = total;
        tr.appendChild(totalCell);

        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
      <button class="edit-btn" data-i="${i}">Edit</button>
      <button class="delete-btn" data-i="${i}">Delete</button>
    `;
        tr.appendChild(actionsCell);

        dataTableBody.appendChild(tr);
    }

    makeTableRowsFocusable();
}


function makeRowEditable(rowIdx) {
    const dataTableBody = document.querySelector('#dataTable tbody');
    const row = dataTableBody.querySelector(`tr[data-row-idx="${rowIdx}"]`);
    if (!row) return;

    row.classList.add('editing');

    const labelCell = row.querySelector('td[data-field="label"]');
    const labelValue = state.labels[rowIdx];
    labelCell.innerHTML = `<input type="text" class="edit-input" value="${escapeHtml(labelValue)}" data-field="label">`;

    const teamCells = row.querySelectorAll('td[data-field="team"]');
    teamCells.forEach((cell, teamIdx) => {
        const value = state.teamData[teamIdx].data[rowIdx] || 0;
        cell.innerHTML = `<input type="number" class="edit-input" min="${MIN}" max="${MAX}" value="${value}" data-field="team" data-team-idx="${teamIdx}">`;
    });

    const actionsCell = row.querySelector('td:last-child');
    actionsCell.innerHTML = `
    <button class="save-btn" data-i="${rowIdx}">Save</button>
    <button class="cancel-btn" data-i="${rowIdx}">Cancel</button>
  `;
}

function saveRowEdit(rowIdx) {
    const dataTableBody = document.querySelector('#dataTable tbody');
    const messageEl = document.getElementById('message');
    const row = dataTableBody.querySelector(`tr[data-row-idx="${rowIdx}"]`);
    if (!row) return;

    const labelInput = row.querySelector('input[data-field="label"]');
    const newLabel = labelInput.value.trim();
    if (!newLabel) {
        showMessage(messageEl, 'Label cannot be empty', 'error', 2000);
        return;
    }

    const teamInputs = row.querySelectorAll('input[data-field="team"]');
    const newValues = [];
    let hasError = false;
    teamInputs.forEach(input => {
        const val = Number(input.value);
        if (!isFinite(val) || val < MIN || val > MAX) {
            hasError = true;
            showMessage(messageEl, `Values must be between ${MIN} and ${MAX}`, 'error', 2000);
        }
        newValues.push(val);
    });

    if (hasError) return;

    state.labels[rowIdx] = newLabel;
    state.teamData.forEach((team, idx) => {
        team.data[rowIdx] = newValues[idx];
    });

    row.classList.remove('editing');
    renderTable();
    initChart();
    renderAnalytics();
    saveState();
    showMessage(messageEl, 'Row updated', 'success', 1500);
}

function cancelRowEdit(rowIdx) {
  renderTable();
}

function addTeam() {
    const messageEl = document.getElementById('message');
  const teamIdx = state.teamData.length;
  const newTeam = {
    name: `Team ${String.fromCharCode(65 + teamIdx)}`,
    data: new Array(state.labels.length).fill(0),
    color: generateColor()
  };
  state.teamData.push(newTeam);
  renderTeamInputs();
  renderAddRowInputs();
  renderTable();
  initChart();
  renderAnalytics();
  saveState();
  showMessage(messageEl, `Added ${newTeam.name}`, 'success', 1500);
}

function removeTeam(idx) {
    const messageEl = document.getElementById('message');
    if (state.teamData.length <= 1) {
        showMessage(messageEl, 'Cannot remove last team', 'error', 2000);
        return;
    }
    const teamName = state.teamData[idx].name;
    showConfirmationModal(`Remove team "${teamName}"? This will delete all data for this team.`, () => {
        state.teamData.splice(idx, 1);
        renderTeamInputs();
        renderAddRowInputs();
        renderTable();
        initChart();
        renderAnalytics();
        saveState();
        showMessage(messageEl, `Removed ${teamName}`, 'info', 1500);
    });
}

function addRow(label, teamValues) {
    state.labels.push(label);
    state.teamData.forEach((team, idx) => {
        team.data.push(teamValues[idx] || 0);
    });
}

function addMultipleRows(rows) {
    rows.forEach(row => {
        addRow(row.label, row.teamValues);
    });
    renderTable();
    initChart();
    renderAnalytics();
}

function deleteRow(index) {
  state.labels.splice(index, 1);
  state.teamData.forEach(team => team.data.splice(index, 1));
  state.storyPointsApp.splice(index, 1);
  renderTable();
  initChart();
  renderAnalytics();
}

function renderAnalytics() {
    const container = document.getElementById('analytics-container');
    if (!container) return;
    container.innerHTML = '';

    state.teamData.forEach(team => {
        const avg = calculateAverage(team.data);
        const stdDev = calculateStdDev(team.data);

        const item = document.createElement('div');
        item.className = 'analytics-item';
        item.style.borderLeftColor = team.color;
        item.innerHTML = `
            <h3>${escapeHtml(team.name)}</h3>
            <div class="stat">
                <span>Avg Velocity</span>
                <span class="value">${avg.toFixed(2)}</span>
            </div>
            <div class="stat">
                <span>Std Deviation</span>
                <span class="value">${stdDev.toFixed(2)}</span>
            </div>
        `;
        container.appendChild(item);
    });

    const totalData = [];
    for (let i = 0; i < state.labels.length; i++) {
        let sum = 0;
        state.teamData.forEach(team => sum += (team.data[i] || 0));
        totalData.push(sum);
    }

    const totalAvg = calculateAverage(totalData);
    const totalStdDev = calculateStdDev(totalData);
    const totalItem = document.createElement('div');
    totalItem.className = 'analytics-item';
    totalItem.style.borderLeftColor = '#94a3b8';
    totalItem.innerHTML = `
        <h3>Total</h3>
        <div class="stat">
            <span>Avg Velocity</span>
            <span class="value">${totalAvg.toFixed(2)}</span>
        </div>
        <div class="stat">
            <span>Std Deviation</span>
            <span class="value">${totalStdDev.toFixed(2)}</span>
        </div>
    `;
    container.appendChild(totalItem);
}

function showConfirmationModal(message, onConfirm) {
    const modal = document.getElementById('custom-modal');
    const messageEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    messageEl.textContent = message;
    modal.style.display = 'flex';

    const confirmHandler = () => {
        onConfirm();
        hideConfirmationModal();
    };

    const cancelHandler = () => {
        hideConfirmationModal();
    };

    confirmBtn.onclick = confirmHandler;
    cancelBtn.onclick = cancelHandler;
}

function hideConfirmationModal() {
    const modal = document.getElementById('custom-modal');
    modal.style.display = 'none';
}

function makeTableRowsFocusable() {
    const dataTableBody = document.querySelector('#dataTable tbody');
    const rows = dataTableBody.querySelectorAll('tr[data-row-idx]');
    rows.forEach(row => {
        if (!row.hasAttribute('tabindex')) {
            row.setAttribute('tabindex', '0');
        }
    });
}

function setupDOMEventListeners() {
    const addRowForm = document.getElementById('addRowForm');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const addTeamBtn = document.getElementById('addTeamBtn');
    const clearSavedBtn = document.getElementById('clearSavedBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const messageEl = document.getElementById('message');

    addRowForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const label = document.getElementById('newLabel').value.trim();
        if (!label) {
            showMessage(messageEl, 'Provide a label', 'error');
            return;
        }

        const values = [];
        state.teamData.forEach((team, idx) => {
            const input = document.getElementById(`newTeam${idx}`);
            const val = Number(input.value);
            if (!isFinite(val) || val < MIN || val > MAX) {
                showMessage(messageEl, `Invalid value for ${team.name}`, 'error');
                return;
            }
            values.push(val);
        });

        if (values.length !== state.teamData.length) {
            showMessage(messageEl, 'Provide values for all teams', 'error');
            return;
        }

        addRow(label, values);
        renderTable();
        initChart();
        renderAnalytics();
        addRowForm.reset();
        saveState();
    });

    dataTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const i = Number(target.dataset.i);
        if (!Number.isFinite(i)) return;

        if (target.matches('.edit-btn')) {
            makeRowEditable(i);
        } else if (target.matches('.save-btn')) {
            saveRowEdit(i);
        } else if (target.matches('.cancel-btn')) {
            cancelRowEdit(i);
        } else if (target.matches('.delete-btn')) {
            showConfirmationModal('Delete row "' + state.labels[i] + '"?', () => {
                deleteRow(i);
                saveState();
            });
        }
    });

    addTeamBtn.addEventListener('click', addTeam);

    if (clearSavedBtn) {
        clearSavedBtn.addEventListener('click', () => {
            showConfirmationModal('Clear saved data and current rows?', () => {
                clearSaved();
                renderTeamInputs();
                renderAddRowInputs();
                renderTable();
                initChart();
            });
        });
    }

    document.addEventListener('keydown', (e) => {
        if (isTypingInInput() && !['Enter', 'Escape'].includes(e.key)) {
            return;
        }

        if (isCommandKey(e) && e.key.toLowerCase() === 'e') {
            e.preventDefault();
            downloadBtn.click();
            showMessage(messageEl, 'Exported to CSV', 'success', 1500);
            return;
        }

        if (isCommandKey(e) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveState();
            showMessage(messageEl, 'Data saved to browser storage', 'success', 2000);
            return;
        }

        if ((e.key === 'Delete' || e.key === 'Backspace') && !isTypingInInput()) {
            e.preventDefault();
            const focusedRow = document.activeElement.closest('tr[data-row-idx]');
            if (focusedRow) {
                const rowIdx = Number(focusedRow.dataset.rowIdx);
                if (Number.isFinite(rowIdx)) {
                    showConfirmationModal(`Delete row "${state.labels[rowIdx]}"?`, () => {
                        deleteRow(rowIdx);
                        saveState();
                        showMessage(messageEl, 'Row deleted', 'info', 1500);
                    });
                }
            }
            return;
        }

        if (e.key === 'Escape') {
            const editingRow = dataTableBody.querySelector('tr.editing');
            if (editingRow) {
                const rowIdx = Number(editingRow.dataset.rowIdx);
                if (Number.isFinite(rowIdx)) {
                    cancelRowEdit(rowIdx);
                    showMessage(messageEl, 'Edit cancelled', 'info', 1200);
                }
            }
            return;
        }

        if (e.key === 'Enter') {
            const editingRow = dataTableBody.querySelector('tr.editing');
            if (editingRow) {
                e.preventDefault();
                const rowIdx = Number(editingRow.dataset.rowIdx);
                if (Number.isFinite(rowIdx)) {
                    saveRowEdit(rowIdx);
                }
            }
            return;
        }
    });
}

