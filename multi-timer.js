// multi-timer.js
// Handles multiple timers, localStorage, rendering, editing, and countdowns for each timer

let multiTimers = [];
let multiEditIndex = null;
let multiIntervalHandles = [];

function loadMultiTimers() {
    const saved = localStorage.getItem('timers');
    if (saved) {
        try {
            multiTimers = JSON.parse(saved);
        } catch {
            multiTimers = [];
        }
    }
}

function saveMultiTimers() {
    localStorage.setItem('timers', JSON.stringify(multiTimers));
}

async function renderMultiTimers() {
    const list = document.getElementById('timers-list');
    list.innerHTML = '';
    await Promise.all(multiTimers.map(async (timer, idx) => {
        const html = await fetch('timer-item.html').then(r => r.text());
        let timerHtml = html
            .replace(/__IDX__/g, idx)
            .replace(/__NAME__/g, timer.name)
            .replace(/__END__/g, timer.end ? new Date(timer.end).toLocaleString() : '');
        const timerDiv = document.createElement('div');
        timerDiv.className = 'container timer-item';
        timerDiv.style.position = 'relative';
        timerDiv.style.marginBottom = '2rem';
        timerDiv.innerHTML = timerHtml;
        list.appendChild(timerDiv);
    }));
    // Create a new Add Timer button each time
    const addBtn = document.createElement('button');
    addBtn.id = 'add-timer-btn';
    addBtn.textContent = '+ Add Timer';
    addBtn.style.margin = '2rem auto 0 auto';
    addBtn.style.display = 'block';
    addBtn.style.width = '220px';
    addBtn.style.height = '2.5rem';
    addBtn.onclick = function() {
        multiTimers.push({ name: 'Countdown Timer', end: '' });
        saveMultiTimers();
        renderMultiTimers();
    };
    list.appendChild(addBtn);
    setTimeout(() => {
        document.querySelectorAll('.timer-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.querySelectorAll('.edit-timer-btn, .delete-timer-btn').forEach(btn => btn.style.opacity = '1');
            });
            item.addEventListener('mouseleave', function() {
                this.querySelectorAll('.edit-timer-btn, .delete-timer-btn').forEach(btn => btn.style.opacity = '0');
            });
        });
    }, 0);
    attachMultiTimerEventListeners();
    setupAllMultiCountdowns();
}

function attachMultiTimerEventListeners() {
    document.querySelectorAll('.edit-timer-btn').forEach(btn => {
        btn.onclick = function() {
            multiEditIndex = parseInt(this.dataset.idx);
            openMultiEditModal(multiEditIndex);
        };
    });
    document.querySelectorAll('.delete-timer-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.dataset.idx);
            multiTimers.splice(idx, 1);
            clearInterval(multiIntervalHandles[idx]);
            multiIntervalHandles.splice(idx, 1);
            saveMultiTimers();
            renderMultiTimers();
        };
    });
}

function openMultiEditModal(idx) {
    const modal = document.getElementById('edit-modal');
    const nameInput = document.getElementById('edit-timer-name');
    const dateInput = document.getElementById('edit-date-picker');
    nameInput.value = multiTimers[idx].name;
    dateInput.value = multiTimers[idx].end ? new Date(multiTimers[idx].end).toISOString().slice(0,16) : '';
    modal.style.display = 'flex';
}

function closeMultiEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function setupCountdownForMultiTimer(idx) {
    if (multiIntervalHandles[idx]) clearInterval(multiIntervalHandles[idx]);
    const timer = multiTimers[idx];
    const countdownDiv = document.getElementById(`timer-countdown-${idx}`);
    function update() {
        if (!timer.end) return;
        const now = new Date();
        const target = new Date(timer.end);
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
    update();
    multiIntervalHandles[idx] = setInterval(update, 1000);
}

function setupAllMultiCountdowns() {
    multiTimers.forEach((_, idx) => setupCountdownForMultiTimer(idx));
}

window.addEventListener('DOMContentLoaded', async function() {
    // Load and inject the edit modal if not present
    if (!document.getElementById('edit-modal')) {
        const editModalHtml = await fetch('edit-modal.html').then(r => r.text());
        const tempEdit = document.createElement('div');
        tempEdit.innerHTML = editModalHtml;
        document.body.appendChild(tempEdit.firstElementChild);
    }
    loadMultiTimers();
    await renderMultiTimers();
    setupAllMultiCountdowns();

    document.getElementById('add-timer-btn').onclick = function() {
        multiTimers.push({ name: 'Countdown Timer', end: '' });
        saveMultiTimers();
        renderMultiTimers();
    };

    document.getElementById('save-edit-btn').onclick = function() {
        if (multiEditIndex !== null) {
            multiTimers[multiEditIndex].name = document.getElementById('edit-timer-name').value || 'Countdown Timer';
            multiTimers[multiEditIndex].end = document.getElementById('edit-date-picker').value;
            saveMultiTimers();
            renderMultiTimers();
            setupCountdownForMultiTimer(multiEditIndex);
            closeMultiEditModal();
        }
    };
    document.getElementById('cancel-edit-btn').onclick = closeMultiEditModal;
    document.getElementById('edit-modal').onclick = function(e) {
        if (e.target === this) closeMultiEditModal();
    };
});
