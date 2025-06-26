// color-customizer.js
// Handles the color customization UI, color application, and localStorage for color settings

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
    applyCustomColors(saved);

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
});
