let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";

const list = document.getElementById("taskList");
const count = document.getElementById("count");

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setFilter(f) {
  filter = f;
  render();
}

function addTask() {
  const input = document.getElementById("taskInput");
  const priority = document.getElementById("priority");

  if (!input.value.trim()) return;

  tasks.push({
    text: input.value,
    done: false,
    priority: priority.value,
    date: new Date().toLocaleString()
  });

  input.value = "";

  save();
  render();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  save();
  render();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  save();
  render();
}

function render() {
  list.innerHTML = "";

  let filtered = tasks.filter(t => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  filtered.forEach((t, i) => {
    const div = document.createElement("div");

    div.className = `task ${t.done ? "done" : ""} priority-${t.priority}`;

    div.innerHTML = `
      <div onclick="toggleTask(${i})">
        <strong>${t.text}</strong><br>
        <small>${t.date}</small>
      </div>

      <button onclick="deleteTask(${i})">❌</button>
    `;

    list.appendChild(div);
  });

  updateCount();
}

function updateCount() {
  const active = tasks.filter(t => !t.done).length;
  count.textContent = `Activas: ${active}`;
}

render();

/* PWA */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}