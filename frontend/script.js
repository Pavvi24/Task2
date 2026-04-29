const API = "http://localhost:5001/api/tasks";

let allTasks = [];
let currentFilter = 'all';
let useLocal = false;
let localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveLocal() {
    localStorage.setItem('tasks', JSON.stringify(localTasks));
}

async function getTasks() {
    try {
        if (!useLocal) {
            const res = await fetch(API, { signal: AbortSignal.timeout(2000) });
            allTasks = await res.json();
        } else {
            allTasks = localTasks;
        }
    } catch {
        useLocal = true;
        allTasks = localTasks;
    }
    renderTasks();
    updateStats();
}

async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();
    if (!title) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
    }
    if (!useLocal) {
        try {
            await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });
        } catch {
            useLocal = true;
            localTasks.push({ _id: Date.now().toString(), title, completed: false });
            saveLocal();
        }
    } else {
        localTasks.push({ _id: Date.now().toString(), title, completed: false });
        saveLocal();
    }
    input.value = "";
    getTasks();
}

async function deleteTask(id) {
    if (!useLocal) {
        try { await fetch(`${API}/${id}`, { method: "DELETE" }); }
        catch { useLocal = true; }
    }
    if (useLocal) { localTasks = localTasks.filter(t => t._id !== id); saveLocal(); }
    getTasks();
}

async function toggleComplete(id, current) {
    if (!useLocal) {
        try {
            await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !current })
            });
        } catch { useLocal = true; }
    }
    if (useLocal) {
        const task = localTasks.find(t => t._id === id);
        if (task) { task.completed = !current; saveLocal(); }
    }
    getTasks();
}

async function editTask(id, oldTitle) {
    const newTitle = prompt("Edit task:", oldTitle);
    if (!newTitle || newTitle.trim() === oldTitle) return;
    if (!useLocal) {
        try {
            await fetch(`${API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle.trim() })
            });
        } catch { useLocal = true; }
    }
    if (useLocal) {
        const task = localTasks.find(t => t._id === id);
        if (task) { task.title = newTitle.trim(); saveLocal(); }
    }
    getTasks();
}

function filterTasks(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
}

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
                <label class="custom-check">
                    <input type="checkbox" ${task.completed ? "checked" : ""}
                        onchange="toggleComplete('${task._id}', ${task.completed})">
                    <span class="check-box"></span>
                </label>
                <span class="task-title">${escapeHtml(task.title)}</span>
            </div>
            <div class="actions">
                <button onclick="editTask('${task._id}', '${escapeHtml(task.title)}')">✏️</button>
                <button class="del-btn" onclick="deleteTask('${task._id}')">✕</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function updateStats() {
    const total = allTasks.length;
    const done = allTasks.filter(t => t.completed).length;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('doneCount').textContent = done;
    document.getElementById('pendingCount').textContent = total - done;
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('taskInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') addTask();
    });
});

const style = document.createElement('style');
style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} } input.shake{animation:shake 0.4s ease;}`;
document.head.appendChild(style);

getTasks();
