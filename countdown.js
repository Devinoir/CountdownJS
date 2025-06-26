// countdown.js
// Countdown logic, written in plain JavaScript with comments for learners

// Helper function to pad numbers with leading zeros
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Function to calculate the time difference and update the display
function updateCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    // If the countdown is over, display zeros
    if (diff <= 0) {
        setCountdownDisplay(0, 0, 0, 0);
        return;
    }

    // Calculate days, hours, minutes, seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setCountdownDisplay(days, hours, minutes, seconds);
}

// Function to set the countdown display values
function setCountdownDisplay(days, hours, minutes, seconds) {
    document.getElementById('days').textContent = pad(days);
    document.getElementById('hours').textContent = pad(hours);
    document.getElementById('minutes').textContent = pad(minutes);
    document.getElementById('seconds').textContent = pad(seconds);
}

// Main function to set up event listeners and logic
function setupCountdown() {
    const datePicker = document.getElementById('date-picker');
    const startBtn = document.getElementById('start-btn');
    const timerTitle = document.getElementById('timer-title');
    const endTime = document.getElementById('end-time');
    let intervalId = null;

    // Inline edit for timer name
    timerTitle.addEventListener('click', function() {
        if (document.getElementById('timer-name-edit')) return;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'timer-name-edit';
        input.value = timerTitle.textContent;
        input.style.width = '100%';
        input.style.fontSize = '1.2rem';
        input.style.textAlign = 'center';
        timerTitle.replaceWith(input);
        input.focus();
        input.select();
        function finishEdit() {
            const newTitle = input.value.trim() || 'Countdown Timer';
            const newH1 = document.createElement('h1');
            newH1.id = 'timer-title';
            newH1.textContent = newTitle;
            input.replaceWith(newH1);
            setupTimerTitleEdit(newH1);
        }
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });

    function setupTimerTitleEdit(titleElem) {
        titleElem.addEventListener('click', function() {
            if (document.getElementById('timer-name-edit')) return;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'timer-name-edit';
            input.value = titleElem.textContent;
            input.style.width = '100%';
            input.style.fontSize = '1.2rem';
            input.style.textAlign = 'center';
            titleElem.replaceWith(input);
            input.focus();
            input.select();
            function finishEdit() {
                const newTitle = input.value.trim() || 'Countdown Timer';
                const newH1 = document.createElement('h1');
                newH1.id = 'timer-title';
                newH1.textContent = newTitle;
                input.replaceWith(newH1);
                setupTimerTitleEdit(newH1);
            }
            input.addEventListener('blur', finishEdit);
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
        });
    }
    setupTimerTitleEdit(timerTitle);

    startBtn.addEventListener('click', function() {
        // Get the selected date and time
        const selectedDate = datePicker.value;
        if (!selectedDate) {
            alert('Please select a date and time.');
            return;
        }
        const targetDate = new Date(selectedDate);
        if (targetDate.getTime() <= Date.now()) {
            alert('Please select a future date and time.');
            return;
        }
        // Show end time
        endTime.style.display = '';
        endTime.textContent = 'Ends at: ' + targetDate.toLocaleString();
        // Clear any previous countdown
        if (intervalId) {
            clearInterval(intervalId);
        }
        // Update countdown immediately and then every second
        updateCountdown(targetDate);
        intervalId = setInterval(function() {
            updateCountdown(targetDate);
        }, 1000);
    });
}

// MULTI-TIMER LOGIC
let timers = [];
let editIndex = null;
let intervalHandles = [];

// Load timers from localStorage if available
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

// Save timers to localStorage
function saveTimers() {
    localStorage.setItem('timers', JSON.stringify(timers));
}

function renderTimers() {
    const list = document.getElementById('timers-list');
    // Remove all children except the add button
    const addBtn = document.getElementById('add-timer-btn');
    list.innerHTML = '';
    timers.forEach((timer, idx) => {
        const timerDiv = document.createElement('div');
        timerDiv.className = 'container timer-item'; // add timer-item class for hover effect
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
    // Always append the add button as the last child
    list.appendChild(addBtn);
    // Add hover effect for edit/delete buttons
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
    setupAllCountdowns(); // Ensure countdowns are set up after rendering
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
            saveTimers(); // Save after delete
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
    saveTimers(); // Save after add
    renderTimers();
};

document.getElementById('save-edit-btn').onclick = function() {
    if (editIndex !== null) {
        timers[editIndex].name = document.getElementById('edit-timer-name').value || 'Countdown Timer';
        timers[editIndex].end = document.getElementById('edit-date-picker').value;
        saveTimers(); // Save after edit
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

// Re-setup all countdowns after render
function setupAllCountdowns() {
    timers.forEach((_, idx) => setupCountdownForTimer(idx));
}

// Run setup when the DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    // Always add the color settings button
    const optionsBtn = document.createElement('button');
    optionsBtn.id = 'options-btn';
    optionsBtn.title = 'Customize Colors';
    optionsBtn.innerHTML = '⚙️';
    optionsBtn.setAttribute('aria-label', 'Customize Colors');
    document.body.appendChild(optionsBtn);

    // Create the options menu
    const menu = document.createElement('div');
    menu.id = 'options-menu';
    menu.innerHTML = `
        <h2>Customize Colors</h2>
        <label>Background:
            <input type="color" id="color-bg" value="#89f7fe">
        </label>
        <label>Timer Window:
            <input type="color" id="color-container" value="#ffffff">
        </label>
        <label>Countdown Numbers:
            <input type="color" id="color-numbers" value="#66a6ff">
        </label>
        <label>Countdown Labels:
            <input type="color" id="color-labels" value="#555555">
        </label>
        <label>Countdown Background:
            <input type="color" id="color-countdown-bg" value="#f0f8ff">
        </label>
        <label>Title Text:
            <input type="color" id="color-title" value="#333333">
        </label>
        <button id="close-options">Close</button>
        <button id="reset-colors" style="margin-top:0.5rem;align-self:flex-end;padding:0.3rem 1.2rem;border-radius:0.5rem;border:none;background:#e0e7ff;color:#3b3b5c;font-size:1rem;cursor:pointer;transition:background 0.2s;">Reset Colors</button>
    `;
    document.body.appendChild(menu);

    // Show/hide menu
    optionsBtn.addEventListener('click', () => {
        menu.classList.toggle('open');
    });
    menu.querySelector('#close-options').addEventListener('click', () => {
        menu.classList.remove('open');
    });

    // Load saved colors and apply them immediately
    const saved = JSON.parse(localStorage.getItem('customColors') || '{}');
    if (saved.bg) document.getElementById('color-bg').value = saved.bg;
    if (saved.container) document.getElementById('color-container').value = saved.container;
    if (saved.numbers) document.getElementById('color-numbers').value = saved.numbers;
    if (saved.labels) document.getElementById('color-labels').value = saved.labels;
    if (saved.countdownBg) document.getElementById('color-countdown-bg').value = saved.countdownBg;
    if (saved.title) document.getElementById('color-title').value = saved.title;
    applyCustomColors(saved); // Always apply colors on load

    // Listen for color changes
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

    loadTimers(); // Load timers from storage
    renderTimers();
    setupAllCountdowns();
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
