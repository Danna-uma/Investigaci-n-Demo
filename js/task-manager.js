// ELEMENTOS DEL DOM
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");

const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statDone = document.getElementById("stat-done");
const pendingCounter = document.getElementById("pending-counter");

const filterAll = document.getElementById("filter-all");
const filterPending = document.getElementById("filter-pending");
const filterDone = document.getElementById("filter-done");
const clearBtn = document.getElementById("clear-btn");

const themeBtn = document.getElementById("theme-btn");
const fontDecreaseBtn = document.getElementById("font-decrease");
const fontResetBtn =document.getElementById("font-reset");
const fontIncreaseBtn = document.getElementById("font-increase");

const modalOverlay = document.getElementById("modal-overlay");
const editInput = document.getElementById("edit-input");
const editPriority = document.getElementById("edit-priority");
const editDate = document.getElementById("edit-date");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");


// CONSTANTES Y ESTADO
const TASKS_KEY = "task_manager_tasks";
const THEME_KEY = "task_manager_theme";
const FONT_SIZE_KEY = "task_manager_font_size";

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 22;
const DEFAULT_FONT_SIZE = 16;

let tasks = loadTasks();
let currentFilter = "all";
let editingTaskId = null;
let fontSize = loadFontSize();


// LOCALSTORAGE
function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(TASKS_KEY);
    const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];

    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    console.error("No se pudieron cargar las tareas:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("No se pudieron guardar las tareas:", error);
  }
}

function loadFontSize() {
  const storedSize = Number(localStorage.getItem(FONT_SIZE_KEY));

  if (
    Number.isFinite(storedSize) &&
    storedSize >= MIN_FONT_SIZE &&
    storedSize <= MAX_FONT_SIZE
  ) {
    return storedSize;
  }

  return DEFAULT_FONT_SIZE;
}

// CREAR TAREAS

function generateTaskId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;

  if (!text) {
    taskInput.focus();
    return;
  }

  const newTask = {
    id: generateTaskId(),
    text,
    priority,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);

  saveTasks();
  resetTaskForm();
  renderTasks();
}

function resetTaskForm() {
  taskInput.value = "";
  prioritySelect.value = "media";
  dueDateInput.value = "";
  taskInput.focus();
}

// FILTROS

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function setFilter(filter) {
  currentFilter = filter;

  const filters = {
    all: filterAll,
    pending: filterPending,
    done: filterDone,
  };

  Object.entries(filters).forEach(([name, button]) => {
    const isActive = name === filter;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderTasks();
}

// RENDERIZADO

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  filteredTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });

  emptyState.hidden = filteredTasks.length > 0;

  updateStatistics();
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.id = task.id;

  if (task.completed) {
    item.classList.add("completed");
  }

  const taskContent = document.createElement("div");
  taskContent.className = "task-content";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;

  checkbox.setAttribute(
    "aria-label",
    task.completed
      ? `Marcar ${task.text} como pendiente`
      : `Marcar ${task.text} como completada`
  );

  checkbox.addEventListener("change", () => {
    toggleTask(task.id);
  });

  const taskInfo = document.createElement("div");
  taskInfo.className = "task-info";

  const taskTitle = document.createElement("p");
  taskTitle.className = "task-title";
  taskTitle.textContent = task.text;

  const taskDetails = document.createElement("div");
  taskDetails.className = "task-details";

  const priority = document.createElement("span");
  priority.className = `priority priority-${task.priority}`;
  priority.textContent = capitalize(task.priority);

  taskDetails.appendChild(priority);

  if (task.dueDate) {
    const dueDate = document.createElement("span");
    dueDate.className = "task-date";
    dueDate.textContent = `Vence: ${formatDate(task.dueDate)}`;

    if (!task.completed && isOverdue(task.dueDate)) {
      dueDate.classList.add("overdue");
      dueDate.textContent += " · Vencida";
    }

    taskDetails.appendChild(dueDate);
  }

  taskInfo.append(taskTitle, taskDetails);
  taskContent.append(checkbox, taskInfo);

  const taskActions = document.createElement("div");
  taskActions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "task-action edit-btn";
  editBtn.textContent = "✏️ Editar";
  editBtn.setAttribute("aria-label", `Editar tarea ${task.text}`);

  editBtn.addEventListener("click", () => {
    openEditModal(task.id);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "task-action delete-btn";
  deleteBtn.textContent = "🗑️ Eliminar";
  deleteBtn.setAttribute("aria-label", `Eliminar tarea ${task.text}`);

  deleteBtn.addEventListener("click", () => {
    deleteTask(task.id);
  });

  taskActions.append(editBtn, deleteBtn);
  item.append(taskContent, taskActions);

  return item;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

function isOverdue(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dateValue.split("-");
  const dueDate = new Date(Number(year), Number(month) - 1, Number(day));

  return dueDate < today;
}

// ESTADÍSTICAS

function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  statTotal.textContent = total;
  statPending.textContent = pending;
  statDone.textContent = completed;

  pendingCounter.textContent =
    pending === 1 ? "1 tarea pendiente" : `${pending} tareas pendientes`;
}

// COMPLETAR Y ELIMINAR

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);

  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);

  saveTasks();
  renderTasks();
}

// MODAL DE EDICIÓN

function openEditModal(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  editingTaskId = taskId;

  editInput.value = task.text;
  editPriority.value = task.priority;
  editDate.value = task.dueDate || "";

  modalOverlay.classList.add("active");
  modalOverlay.style.display = "flex";
  modalOverlay.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    editInput.focus();
    editInput.select();
  }, 0);
}

function closeEditModal() {
  editingTaskId = null;

  modalOverlay.classList.remove("active");
  modalOverlay.style.display = "none";
  modalOverlay.setAttribute("aria-hidden", "true");

  editInput.value = "";
  editPriority.value = "media";
  editDate.value = "";
}

function saveEditedTask() {
  if (!editingTaskId) {
    return;
  }

  const text = editInput.value.trim();

  if (!text) {
    editInput.focus();
    return;
  }

  tasks = tasks.map((task) =>
    task.id === editingTaskId
      ? {
          ...task,
          text,
          priority: editPriority.value,
          dueDate: editDate.value,
        }
      : task
  );

  saveTasks();
  closeEditModal();
  renderTasks();
}

// TEMA

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const useDarkTheme = savedTheme === "dark";

  document.body.classList.toggle("dark-mode", useDarkTheme);
  updateThemeButton(useDarkTheme);
}

function toggleTheme() {
  const isDarkTheme = document.body.classList.toggle("dark-mode");

  localStorage.setItem(
    THEME_KEY,
    isDarkTheme ? "dark" : "light"
  );

  updateThemeButton(isDarkTheme);
}

function updateThemeButton(isDarkTheme) {
  themeBtn.textContent = isDarkTheme ? "☀️" : "⚫";

  themeBtn.setAttribute(
    "aria-label",
    isDarkTheme ? "Activar tema claro" : "Activar tema oscuro"
  );

  themeBtn.title = isDarkTheme
    ? "Activar tema claro"
    : "Activar tema oscuro";
}

// TAMAÑO DEL TEXTO

function applyFontSize() {
  document.documentElement.style.fontSize = `${fontSize}px`;

  localStorage.setItem(
    FONT_SIZE_KEY,
    String(fontSize)
  );

  fontDecreaseBtn.disabled = fontSize <= MIN_FONT_SIZE;
  fontIncreaseBtn.disabled = fontSize >= MAX_FONT_SIZE;
}

function increaseFontSize() {
  if (fontSize >= MAX_FONT_SIZE) {
    return;
  }

  fontSize += 1;
  applyFontSize();
}

function decreaseFontSize() {
  if (fontSize <= MIN_FONT_SIZE) {
    return;
  }

  fontSize -= 1;
  applyFontSize();
}

function resetFontSize() {
  fontSize = DEFAULT_FONT_SIZE;
  applyFontSize();
}

// EVENTOS

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

filterAll.addEventListener("click", () => {
  setFilter("all");
});

filterPending.addEventListener("click", () => {
  setFilter("pending");
});

filterDone.addEventListener("click", () => {
  setFilter("done");
});

clearBtn.addEventListener("click", clearCompletedTasks);
saveBtn.addEventListener("click", saveEditedTask);
cancelBtn.addEventListener("click", closeEditModal);
themeBtn.addEventListener("click", toggleTheme);
fontIncreaseBtn.addEventListener("click", increaseFontSize);
fontDecreaseBtn.addEventListener("click", decreaseFontSize);
fontResetBtn.addEventListener("click", resetFontSize);

editInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveEditedTask();
  }
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeEditModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modalOverlay.getAttribute("aria-hidden") === "false"
  ) {
    closeEditModal();
  }
});

// INICIALIZACIÓN

function initializeTaskManager() {
  closeEditModal();
  loadTheme();
  applyFontSize();
  renderTasks();
}

initializeTaskManager();