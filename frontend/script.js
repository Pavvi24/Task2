const API = "https://task2-1-ibkb.onrender.com/api/tasks";

let allTasks = [];
let currentFilter = 'all';

// FETCH TASKS
async function getTasks() {
    try {
        const res = await fetch(API);
        allTasks = await res.json();
    } catch (err) {
        console.error("Fetch error:", err);
        alert("Backend not reachable ❌");
        return;
    }

    renderTasks();
    updateStats();
}

// ADD TASK
async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
    }

    await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });

    input.value = "";
    getTasks();
}

// DELETE TASK
async function deleteTask(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    getTasks();
}

// TOGGLE COMPLETE
async function toggleComplete(id, current) {
    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current })
    });
    getTasks();
}

// EDIT TASK
async function editTask(id, oldTitle) {
    const newTitle = prompt("Edit task:", oldTitle);
    if (!newTitle || newTitle.trim() === oldTitle) return;

    await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() })
    });

    getTasks();
}

// FILTER TASKS
function filterTasks(filter, btn) {
    currentFilter = filter;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    renderTasks();
}

// RENDER TASKS
function renderTasks() {
    const list = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    const filtered = allTasks.filter(task => {
        if (currentFilter === 'done') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
        return true;
    });

    list.innerHTML = "";

    emptyState.classList.toggle('visible', filtered.length === 0);

    filtered.forEach((task, i) => {
        const li = document.createElement("li");

        li.className = task.completed ? 'completed' : '';
        li.style.animationDelay = `${i * 40}ms`;

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? "checked" : ""}
                    onchange="toggleComplete('${task._id}', ${task.completed})">

                <span class="task-title">
                    ${escapeHtml(task.title)}
                </span>
            </div>

            <div class="actions">
                <button onclick="editTask('${task._id}', '${escapeHtml(task.title)}')">✏️</button>
                <button class="del-btn" onclick="deleteTask('${task._id}')">✕</button>
            </div>
        `;

        list.appendChild(li);
    });
}

// UPDATE STATS
function updateStats() {
    const total = allTasks.length;
    const done = allTasks.filter(t => t.completed).length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('doneCount').textContent = done;
    document.getElementById('pendingCount').textContent = total - done;
}

// SAFE TEXT
function escapeHtml(str) {
    return str
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

// ENTER KEY SUPPORT
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('taskInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') addTask();
    });
});

// INPUT SHAKE ANIMATION
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%,100%{transform:translateX(0)}
  20%{transform:translateX(-6px)}
  40%{transform:translateX(6px)}
  60%{transform:translateX(-4px)}
  80%{transform:translateX(4px)}
}
input.shake{animation:shake 0.4s ease;}
`;
document.head.appendChild(style);

// INITIAL LOAD
getTasks();
