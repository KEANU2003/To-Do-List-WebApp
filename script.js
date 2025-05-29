const inputBox = document.getElementById("input-box");
const deadlineInput = document.getElementById("deadline");
const listContainer = document.getElementById("list-container");
const filterSelect = document.getElementById("filter-tasks");
const darkToggle = document.getElementById("darkModeToggle");
const clearAll = document.getElementById("clear-all");

// Task creation
function addTask() {
  const taskText = inputBox.value.trim();
  const deadline = deadlineInput.value;

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const li = document.createElement("li");
  li.classList.add("fade-in");

  const now = new Date();
  const timestamp = now.toLocaleString();

  li.innerHTML = `
    ${taskText}
    <span class="timestamp">Created: ${timestamp}</span>
    ${deadline ? `<span class="deadline-date">Deadline: ${deadline}</span>` : ""}
  `;

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "\u00d7";
  li.appendChild(closeBtn);
  listContainer.appendChild(li);

  inputBox.value = "";
  deadlineInput.value = "";

  saveData();
  applyFilter();
}

// Event listeners
listContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveData();
  } else if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveData();
  }
});

filterSelect.addEventListener("change", applyFilter);

clearAll.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all tasks?")) {
    listContainer.innerHTML = "";
    saveData();
  }
});

// Save / load
function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function loadData() {
  listContainer.innerHTML = localStorage.getItem("data") || "";
}

// Filter
function applyFilter() {
  const filter = filterSelect.value;
  const tasks = listContainer.querySelectorAll("li");

  tasks.forEach(task => {
    const isChecked = task.classList.contains("checked");
    if (filter === "done" && !isChecked) {
      task.style.display = "none";
    } else if (filter === "not-done" && isChecked) {
      task.style.display = "none";
    } else {
      task.style.display = "";
    }
  });
}

// Deadline alert
function markDeadlines() {
  const now = new Date();
  listContainer.querySelectorAll("li").forEach(task => {
    task.classList.remove("overdue", "soon");
    const deadlineSpan = task.querySelector(".deadline-date");
    if (!deadlineSpan) return;

    const deadline = new Date(deadlineSpan.textContent.replace("Deadline: ", ""));
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      task.classList.add("overdue");
    } else if (diffHours <= 24) {
      task.classList.add("soon");
    }
  });
}

// Dark mode toggle
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
  localStorage.setItem("darkMode", darkToggle.checked);
});

function loadDarkMode() {
  const dark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", dark);
  darkToggle.checked = dark;
}

// Init
function init() {
  loadDarkMode();
  loadData();
  applyFilter();
  markDeadlines();
}

init();
