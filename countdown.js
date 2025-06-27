// countdown.js
// Refactored: Encapsulate countdown logic in CountdownTimer class and clean up DOM/event handling

class CountdownTimer {
    constructor(timer, idx, onEdit, onDelete) {
        this.timer = timer;
        this.idx = idx;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
        this.interval = null;
        this.element = null;
    }

    async render() {
        const html = await fetch('timer-item.html').then(r => r.text());
        let timerHtml = html
            .replace(/__IDX__/g, this.idx)
            .replace(/__NAME__/g, this.timer.name)
            .replace(/__END__/g, this.timer.end ? new Date(this.timer.end).toLocaleString() : '');
        const timerDiv = document.createElement('div');
        timerDiv.className = 'container timer-item';
        timerDiv.style.position = 'relative';
        timerDiv.style.marginBottom = '2rem';
        timerDiv.innerHTML = timerHtml;
        this.element = timerDiv;
        this.attachEvents();
        this.updateCountdown();
        this.startInterval();
        return timerDiv;
    }

    attachEvents() {
        this.element.querySelector('.edit-timer-btn').onclick = () => this.onEdit(this.idx);
        this.element.querySelector('.delete-timer-btn').onclick = () => this.onDelete(this.idx);
        this.element.addEventListener('mouseenter', function() {
            this.querySelectorAll('.edit-timer-btn, .delete-timer-btn').forEach(btn => btn.style.opacity = '1');
        });
        this.element.addEventListener('mouseleave', function() {
            this.querySelectorAll('.edit-timer-btn, .delete-timer-btn').forEach(btn => btn.style.opacity = '0');
        });
    }

    updateCountdown() {
        const countdownDiv = this.element.querySelector('.countdown');
        if (!this.timer.end) {
            ['days','hours','minutes','seconds'].forEach(cls => {
                countdownDiv.querySelector('.' + cls).textContent = '00';
            });
            return;
        }
        const now = new Date();
        const target = new Date(this.timer.end);
        let diff = target - now;
        if (diff < 0) diff = 0;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        countdownDiv.querySelector('.days').textContent = String(days).padStart(2, '0');
        countdownDiv.querySelector('.hours').textContent = String(hours).padStart(2, '0');
        countdownDiv.querySelector('.minutes').textContent = String(minutes).padStart(2, '0');
        countdownDiv.querySelector('.seconds').textContent = String(seconds).padStart(2, '0');
    }

    startInterval() {
        this.stopInterval();
        this.interval = setInterval(() => this.updateCountdown(), 1000);
    }

    stopInterval() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
    }

    destroy() {
        this.stopInterval();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Timer management
let timers = [];
let timerObjects = [];
let editIndex = null;

function loadTimers() {
    const saved = localStorage.getItem('timers');
    if (saved) {
        try {
            timers = JSON.parse(saved);
        } catch {
            timers = [];
        }
    }
}

function saveTimers() {
    localStorage.setItem('timers', JSON.stringify(timers));
}

async function renderTimers() {
    // Clean up old timer objects
    timerObjects.forEach(obj => obj.destroy());
    timerObjects = [];
    const list = document.getElementById('timers-list');
    list.innerHTML = '';
    await Promise.all(timers.map(async (timer, idx) => {
        const timerObj = new CountdownTimer(timer, idx, openEditModal, deleteTimer);
        const timerDiv = await timerObj.render();
        list.appendChild(timerDiv);
        timerObjects.push(timerObj);
    }));
    // Add Timer button
    const addBtn = document.createElement('button');
    addBtn.id = 'add-timer-btn';
    addBtn.textContent = '+ Add Timer';
    addBtn.style.margin = '2rem auto 0 auto';
    addBtn.style.display = 'block';
    addBtn.style.width = '220px';
    addBtn.style.height = '2.5rem';
    addBtn.onclick = function() {
        timers.push({ name: 'Countdown Timer', end: '' });
        saveTimers();
        renderTimers();
    };
    list.appendChild(addBtn);
}

function openEditModal(idx) {
    editIndex = idx;
    const modal = document.getElementById('edit-modal');
    const nameInput = document.getElementById('edit-timer-name');
    const dateInput = document.getElementById('edit-date-picker');
    nameInput.value = timers[idx].name;
    dateInput.value = timers[idx].end ? new Date(timers[idx].end).toISOString().slice(0,16) : '';
    modal.style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function deleteTimer(idx) {
    timers.splice(idx, 1);
    saveTimers();
    renderTimers();
}

// Only inject modal and options menu once
async function injectModalAndOptions() {
    if (!document.getElementById('edit-modal')) {
        const editModalHtml = await fetch('edit-modal.html').then(r => r.text());
        const tempEdit = document.createElement('div');
        tempEdit.innerHTML = editModalHtml;
        document.body.appendChild(tempEdit.firstElementChild);
    }
    if (!document.getElementById('options-btn')) {
        const optionsBtn = document.createElement('button');
        optionsBtn.id = 'options-btn';
        optionsBtn.title = 'Customize Colors';
        optionsBtn.innerHTML = '⚙️';
        optionsBtn.setAttribute('aria-label', 'Customize Colors');
        document.body.appendChild(optionsBtn);
        fetch('options-menu.html')
            .then(response => response.text())
            .then(html => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const menu = tempDiv.firstElementChild;
                document.body.appendChild(menu);
                optionsBtn.addEventListener('click', () => {
                    menu.classList.toggle('open');
                });
                menu.querySelector('#close-options').addEventListener('click', () => {
                    menu.classList.remove('open');
                });
                // Color logic
                const saved = JSON.parse(localStorage.getItem('customColors') || '{}');
                if (saved.bg) document.getElementById('color-bg').value = saved.bg;
                if (saved.container) document.getElementById('color-container').value = saved.container;
                if (saved.numbers) document.getElementById('color-numbers').value = saved.numbers;
                if (saved.labels) document.getElementById('color-labels').value = saved.labels;
                if (saved.countdownBg) document.getElementById('color-countdown-bg').value = saved.countdownBg;
                if (saved.title) document.getElementById('color-title').value = saved.title;
                applyCustomColors(saved);
                menu.querySelectorAll('input[type=color]').forEach(input => {
                    input.addEventListener('input', () => {
                        const colors = {
                            bg: document.getElementById('color-bg').value,
                            container: document.getElementById('color-container').value,
                            numbers: document.getElementById('color-numbers').value,
                            labels: document.getElementById('color-labels').value,
                            countdownBg: document.getElementById('color-countdown-bg').value,
                            title: document.getElementById('color-title').value
                        };
                        localStorage.setItem('customColors', JSON.stringify(colors));
                        applyCustomColors(colors);
                    });
                });
                document.getElementById('reset-colors').onclick = function() {
                    const defaultColors = {
                        bg: '#89f7fe',
                        container: '#fff',
                        numbers: '#66a6ff',
                        labels: '#555555',
                        countdownBg: '#f0f8ff',
                        title: '#333'
                    };
                    localStorage.removeItem('customColors');
                    document.getElementById('color-bg').value = defaultColors.bg;
                    document.getElementById('color-container').value = defaultColors.container;
                    document.getElementById('color-numbers').value = defaultColors.numbers;
                    document.getElementById('color-labels').value = defaultColors.labels;
                    document.getElementById('color-countdown-bg').value = defaultColors.countdownBg;
                    document.getElementById('color-title').value = defaultColors.title;
                    applyCustomColors(defaultColors);
                };
            });
    }
}

window.addEventListener('DOMContentLoaded', async function() {
    await injectModalAndOptions();
    loadTimers();
    await renderTimers();
    // Modal events
    document.getElementById('save-edit-btn').onclick = function() {
        if (editIndex !== null) {
            timers[editIndex].name = document.getElementById('edit-timer-name').value || 'Countdown Timer';
            timers[editIndex].end = document.getElementById('edit-date-picker').value;
            saveTimers();
            renderTimers();
            closeEditModal();
        }
    };
    document.getElementById('cancel-edit-btn').onclick = closeEditModal;
    document.getElementById('edit-modal').onclick = function(e) {
        if (e.target === this) closeEditModal();
    };
});

function applyCustomColors(colors) {
    if (colors.bg) {
        try {
            const base = colors.bg;
            function shadeColor(color, percent) {
                let R = parseInt(color.substring(1,3),16);
                let G = parseInt(color.substring(3,5),16);
                let B = parseInt(color.substring(5,7),16);
                R = Math.min(255, Math.max(0, R + percent));
                G = Math.min(255, Math.max(0, G + percent));
                B = Math.min(255, Math.max(0, B + percent));
                return `#${R.toString(16).padStart(2,'0')}${G.toString(16).padStart(2,'0')}${B.toString(16).padStart(2,'0')}`;
            }
            const lighter = shadeColor(base, 40);
            const darker = shadeColor(base, -40);
            document.body.style.background = `linear-gradient(120deg, ${lighter} 0%, ${darker} 100%)`;
        } catch {
            document.body.style.background = colors.bg;
        }
    }
    if (colors.container) {
        document.querySelectorAll('.container').forEach(e => e.style.background = colors.container);
        document.querySelectorAll('#edit-modal-content').forEach(e => e.style.background = colors.container);
    }
    if (colors.numbers) {
        document.querySelectorAll('.countdown-unit span').forEach(e => e.style.color = colors.numbers);
    }
    if (colors.labels) {
        document.querySelectorAll('.countdown-unit .label').forEach(e => e.style.color = colors.labels);
    }
    if (colors.countdownBg) {
        document.querySelectorAll('.countdown').forEach(e => e.style.background = colors.countdownBg);
    }
    if (colors.title) {
        document.querySelectorAll('.timer-item h1').forEach(e => e.style.color = colors.title);
    }
}
