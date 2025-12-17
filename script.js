/**
 * Vacation Planner Logic
 * Handles state, plan generation, and UI updates.
 */

const APP_KEY = 'vacation_planner_data';

// --- Data & Configuration ---

const DATA_ = {
    surahs: {
        young: ['Al-Fatiha', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas', 'Al-Kawthar', 'Al-Asr', 'Al-Masad', 'Quraish', 'Al-Maun', 'Al-Kafirun', 'An-Nasr', 'Al-Fil', 'Al-Humazah', 'Al-Takathur', 'Ad-Duha'],
        middle: ['Al-Ala', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams', 'Al-Lail', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat', 'Al-Qari\'ah'],
        teen: ['Al-Mulk (1-5)', 'Al-Mulk (6-10)', 'Al-Mulk (11-15)', 'Al-Mulk (16-20)', 'Al-Mulk (21-25)', 'Al-Mulk (26-30)', 'Al-Qalam (1-10)', 'Al-Qalam (11-20)', 'Al-Haqqah (1-10)', 'Al-Haqqah (11-20)', 'Al-Maarij (1-10)', 'Nuh (1-10)', 'Al-Jinn (1-5)', 'Al-Muzzammil (1-5)', 'Al-Muddathir (1-5)']
    },
    vocab: {
        en: ['Colors', 'Animals', 'Family', 'Numbers', 'Food', 'Nature', 'Body Parts', 'Clothes', 'House', 'School', 'Sports', 'Feelings', 'Jobs', 'Transport', 'Time'],
        fr: ['Les Couleurs', 'Les Animaux', 'La Famille', 'Les Nombres', 'La Nourriture', 'La Nature', 'Le Corps', 'Les Vêtements', 'La Maison', 'L\'École', 'Les Sports', 'Les Émotions', 'Les Métiers', 'Le Transport', 'Le Temps'],
        ar: ['الألوان', 'الحيوانات', 'العائلة', 'الأرقام', 'الطعام', 'الطبيعة', 'أعضاء الجسم', 'الملابس', 'المنزل', 'المدرسة', 'الرياضة', 'المشاعر', 'المهن', 'المواصلات', 'الوقت']
    },
    activities: [
        'Draw a scene from the Quran verse you learned.',
        'Find 5 items in your room starting with letter "A".',
        'Help your mom or dad with a household chore.',
        'Write a short story about kindness.',
        'Build a puzzle or play a memory game.',
        'Learn a new joke and tell it to your family.',
        'Go for a 15-minute walk and observe nature.',
        'Call a relative just to say hello.',
        'Make a paper airplane and see how far it flies.',
        'Draw your favorite animal.',
        'List 3 things you are grateful for today.',
        'Read a story to your siblings or parents.',
        'Clean your room for 10 minutes.',
        'Make a greeting card for a friend.',
        'Sit silently for 5 minutes and reflect.'
    ]
};

// --- State Management ---

let state = {
    user: null, // { name, age, level, languages: [] }
    plan: [],   // Array of 15 day objects
    progress: 0 // Completed days count
};

function loadState() {
    const stored = localStorage.getItem(APP_KEY);
    if (stored) {
        state = JSON.parse(stored);
        return true;
    }
    return false;
}

function saveState() {
    localStorage.setItem(APP_KEY, JSON.stringify(state));
    updateProgressUI();
}

function resetState() {
    localStorage.removeItem(APP_KEY);
    location.reload();
}

// --- Plan Generator ---

function generatePlan(user) {
    const ageGroup = user.age < 8 ? 'young' : (user.age < 13 ? 'middle' : 'teen');
    const plan = [];

    for (let i = 0; i < 15; i++) {
        // Morning: Quran
        const surah = DATA_.surahs[ageGroup][i] || `Review Day ${i + 1}`;

        // Afternoon: Language (Rotate chosen languages)
        const langIndex = i % user.languages.length;
        const langCode = user.languages[langIndex]; // 'en', 'fr', 'ar'
        const topic = DATA_.vocab[langCode][i] || 'General Review';
        const langName = getLangName(langCode);

        // Evening: Reading & Activity
        const activity = DATA_.activities[i];

        plan.push({
            day: i + 1,
            completed: false,
            tasks: {
                morning: { title: 'Quran Time', desc: `Memorize/Review: Surah ${surah}`, done: false },
                afternoon: { title: `${langName} Fun`, desc: `Topic: ${topic}`, done: false },
                evening: { title: 'Story & Activity', desc: activity, done: false }
            }
        });
    }
    return plan;
}

function getLangName(code) {
    if (code === 'en') return 'English';
    if (code === 'fr') return 'French';
    if (code === 'ar') return 'Arabic';
    return 'Language';
}

// --- UI Logic ---

const views = {
    onboarding: document.getElementById('view-onboarding'),
    dashboard: document.getElementById('view-dashboard')
};

function initApp() {
    if (loadState()) {
        showDashboard();
    } else {
        showOnboarding();
    }
}

function showOnboarding() {
    document.getElementById('view-onboarding').classList.remove('hidden');
    document.getElementById('view-dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('view-onboarding').classList.add('hidden');
    document.getElementById('view-dashboard').classList.remove('hidden');

    document.getElementById('user-name-display').innerText = state.user.name;
    renderPlan();
    updateProgressUI();
}

// Onboarding Form Handler
document.getElementById('onboarding-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('inp-name').value;
    const age = parseInt(document.getElementById('inp-age').value);
    const level = document.getElementById('inp-level').value;

    // Get selected languages
    const languages = [];
    if (document.getElementById('lang-en').checked) languages.push('en');
    if (document.getElementById('lang-fr').checked) languages.push('fr');
    if (document.getElementById('lang-ar').checked) languages.push('ar');

    if (languages.length === 0) {
        alert('Please select at least one language.');
        return;
    }

    state.user = { name, age, level, languages };
    state.plan = generatePlan(state.user);
    saveState();
    showDashboard();
});

// Render the 15-day timeline
function renderPlan() {
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';

    state.plan.forEach((dayData, index) => {
        const dayEl = document.createElement('div');
        dayEl.className = `day-card ${dayData.completed ? 'completed' : ''}`;

        // Calculate progress for this day
        const totalTasks = 3;
        let doneTasks = 0;
        if (dayData.tasks.morning.done) doneTasks++;
        if (dayData.tasks.afternoon.done) doneTasks++;
        if (dayData.tasks.evening.done) doneTasks++;
        const isDayDone = doneTasks === totalTasks;

        if (isDayDone && !dayData.completed) {
            state.plan[index].completed = true;
            saveState();
        }

        dayEl.innerHTML = `
            <div class="day-header">
                <h3>Day ${dayData.day}</h3>
                <span class="status-icon">${isDayDone ? '🌟' : '🌱'}</span>
            </div>
            <div class="task-list">
                <div class="task-item ${dayData.tasks.morning.done ? 'done' : ''}" onclick="toggleTask(${index}, 'morning')">
                    <span class="icon">🌅</span>
                    <div class="content">
                        <strong>Morning</strong>
                        <p>${dayData.tasks.morning.desc}</p>
                    </div>
                    <div class="checkbox"></div>
                </div>
                <div class="task-item ${dayData.tasks.afternoon.done ? 'done' : ''}" onclick="toggleTask(${index}, 'afternoon')">
                    <span class="icon">☀️</span>
                    <div class="content">
                        <strong>Afternoon</strong>
                        <p>${dayData.tasks.afternoon.desc}</p>
                    </div>
                    <div class="checkbox"></div>
                </div>
                <div class="task-item ${dayData.tasks.evening.done ? 'done' : ''}" onclick="toggleTask(${index}, 'evening')">
                    <span class="icon">🌙</span>
                    <div class="content">
                        <strong>Evening</strong>
                        <p>${dayData.tasks.evening.desc}</p>
                    </div>
                    <div class="checkbox"></div>
                </div>
            </div>
        `;
        container.appendChild(dayEl);
    });
}

function toggleTask(dayIndex, time) {
    const day = state.plan[dayIndex];
    day.tasks[time].done = !day.tasks[time].done;

    // Check if day is newly completed
    const doneCount = (day.tasks.morning.done ? 1 : 0) + (day.tasks.afternoon.done ? 1 : 0) + (day.tasks.evening.done ? 1 : 0);
    day.completed = doneCount === 3;

    saveState();
    renderPlan(); // Re-render to update UI state
}

function updateProgressUI() {
    const totalDays = 15;
    const completedDays = state.plan.filter(d => d.completed).length;
    const percent = (completedDays / totalDays) * 100;

    document.getElementById('progress-fill').style.width = `${percent}%`;
    document.getElementById('progress-text').innerText = `${completedDays} / ${totalDays} Days Completed!`;
}

// Global reset function for testing/parents
window.resetApp = resetState;

// Initialize
initApp();
