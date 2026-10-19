const STORAGE_KEY = "taskly-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskTemplate = document.querySelector("#task-template");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const completedCount = document.querySelector("#completed-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach((task) => {
    const item = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector(".complete-checkbox");
    const title = item.querySelector(".task-title");

    item.dataset.id = task.id;
    item.classList.toggle("completed", task.completed);
    checkbox.checked = task.completed;
    title.textContent = task.title;
    item.querySelector(".edit-button").addEventListener("click", () => editTask(task.id));
    item.querySelector(".delete-button").addEventListener("click", () => deleteTask(task.id));
    checkbox.addEventListener("change", () => toggleTask(task.id));
    taskList.append(item);
  });

  const completedTasks = tasks.filter((task) => task.completed).length;
  remainingCount.textContent = tasks.length - completedTasks;
  completedCount.textContent = `${completedTasks} completed`;
  emptyState.hidden = visibleTasks.length > 0;
  clearCompletedButton.disabled = completedTasks === 0;
  clearCompletedButton.style.opacity = completedTasks === 0 ? "0.45" : "1";
}

function addTask(title) {
  tasks.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title: title.trim(),
    completed: false
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  const updatedTitle = window.prompt("Edit task", task.title);
  if (updatedTitle === null) return;
  const trimmedTitle = updatedTitle.trim();
  if (!trimmedTitle) return;
  task.title = trimmedTitle;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addTask(title);
  taskInput.value = "";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

const today = new Date();
document.querySelector("#day-name").textContent = today.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
document.querySelector("#date-value").textContent = today.getDate();
renderTasks();
