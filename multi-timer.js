// multi-timer.js
// Handles multiple timers, localStorage, rendering, editing, and countdowns for each timer

let timers = [];
let editIndex = null;
let intervalHandles = [];

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

function renderTimers() {
    const list = document.getElementById('timers-list');
    const addBtn = document.getElementById('add-timer-btn');
    list.innerHTML = '';
    timers.forEach((timer, idx) => {
        const timerDiv = document.createElement('div');
        timerDiv.className = 'container timer-item';
        timerDiv.style.position = 'relative';
        timerDiv.style.marginBottom = '2rem';
        timerDiv.innerHTML = `
            <button class="edit-timer-btn" data-idx="${idx}" title="Edit" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.2rem;cursor:pointer;opacity:0;transition:opacity 0.2s;">✏️</button>
            <button class="delete-timer-btn" data-idx="${idx}" title="Delete" style="position:absolute;top:1rem;left:1rem;background:none;border:none;font-size:1.2rem;cursor:pointer;opacity:0;transition:opacity 0.2s;">🗑️</button>
            <h1 style="margin-bottom:0.5rem;text-align:center;">${timer.name}</h1>
            <div style="margin-bottom:1rem;font-size:1rem;color:#888;text-align:center;">Ends at: <span class="timer-end">${timer.end ? new Date(timer.end).toLocaleString() : ''}</span></div>
            <div class="countdown" id="timer-countdown-${idx}">
                <div class="countdown-unit"><span class="days">00</span><div class="label">days</div></div>
                <div class="countdown-unit"><span class="hours">00</span><div class="label">hours</div></div>
                <div class="countdown-unit"><span class="minutes">00</span><div class="label">minutes</div></div>
                <div class="countdown-unit"><span class="seconds">00</span><div class="label">seconds</div></div>
            </div>
        `;
        list.appendChild(timerDiv);
    });
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
    attachTimerEventListeners();
    setupAllCountdowns();
}

function attachTimerEventListeners() {
    document.querySelectorAll('.edit-timer-btn').forEach(btn => {
        btn.onclick = function() {
            editIndex = parseInt(this.dataset.idx);
            openEditModal(editIndex);
        };
    });
    document.querySelectorAll('.delete-timer-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.dataset.idx);
            timers.splice(idx, 1);
            clearInterval(intervalHandles[idx]);
            intervalHandles.splice(idx, 1);
            saveTimers();
            renderTimers();
        };
    });
}

function openEditModal(idx) {
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

document.getElementById('add-timer-btn').onclick = function() {
    timers.push({ name: 'Countdown Timer', end: '' });
    saveTimers();
    renderTimers();
};

document.getElementById('save-edit-btn').onclick = function() {
    if (editIndex !== null) {
        timers[editIndex].name = document.getElementById('edit-timer-name').value || 'Countdown Timer';
        timers[editIndex].end = document.getElementById('edit-date-picker').value;
        saveTimers();
        renderTimers();
        setupCountdownForTimer(editIndex);
        closeEditModal();
    }
};
document.getElementById('cancel-edit-btn').onclick = closeEditModal;

document.getElementById('edit-modal').onclick = function(e) {
    if (e.target === this) closeEditModal();
};

function setupCountdownForTimer(idx) {
    if (intervalHandles[idx]) clearInterval(intervalHandles[idx]);
    const timer = timers[idx];
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
    intervalHandles[idx] = setInterval(update, 1000);
}

function setupAllCountdowns() {
    timers.forEach((_, idx) => setupCountdownForTimer(idx));
}

window.addEventListener('DOMContentLoaded', function() {
    loadTimers();
    renderTimers();
    setupAllCountdowns();
});
