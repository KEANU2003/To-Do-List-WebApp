const inputBox = document.getElementById("input-box");
const deadlineInput = document.getElementById("deadline");
const listContainer = document.getElementById("list-container");
const filterSelect = document.getElementById("filter-tasks");
const darkToggle = document.getElementById("darkModeToggle");
const clearAll = document.getElementById("clear-all");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Add a task with animation
function addTask() {
  const taskText = inputBox.value.trim();
  const deadline = deadlineInput.value;

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const newTask = {
    text: taskText,
    deadline: deadline,
    completed: false,
    createdAt: new Date().toLocaleString(),
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  inputBox.value = "";
  deadlineInput.value = "";
  applyFilter();
  markDeadlines();
}

// Render tasks from array to UI
function renderTasks() {
  listContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task.text;

    if (task.completed) li.classList.add("checked");

    li.classList.add("animate-in"); // انیمیشن اضافه شدن تسک

    // اضافه کردن اطلاعات زمان ایجاد و ددلاین
    const createdSpan = document.createElement("span");
    createdSpan.className = "timestamp";
    createdSpan.textContent = `Created: ${task.createdAt}`;
    li.appendChild(createdSpan);

    if (task.deadline) {
      const deadlineSpan = document.createElement("span");
      deadlineSpan.className = "deadline-date";
      deadlineSpan.textContent = `Deadline: ${task.deadline}`;
      li.appendChild(deadlineSpan);
    }

    // Toggle complete on click
    li.addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
      applyFilter();
      markDeadlines();
    });

    // Delete button
    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "\u00d7";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // انیمیشن حذف
      li.classList.add("animate-out");

      // حذف بعد از پایان انیمیشن
      li.addEventListener("animationend", () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
        applyFilter();
        markDeadlines();
      }, { once: true });
    });

    li.appendChild(closeBtn);
    listContainer.appendChild(li);
  });
}

// فیلتر تسک‌ها
function applyFilter() {
  const filter = filterSelect.value;
  const lis = listContainer.querySelectorAll("li");

  lis.forEach(li => {
    const isChecked = li.classList.contains("checked");
    if (filter === "done" && !isChecked) {
      li.style.display = "none";
    } else if (filter === "not-done" && isChecked) {
      li.style.display = "none";
    } else {
      li.style.display = "";
    }
  });
}

// علامت‌گذاری تسک‌های نزدیک یا گذشته ددلاین
function markDeadlines() {
  const now = new Date();
  listContainer.querySelectorAll("li").forEach(li => {
    li.classList.remove("overdue", "soon");
    const deadlineSpan = li.querySelector(".deadline-date");
    if (!deadlineSpan) return;

    const deadline = new Date(deadlineSpan.textContent.replace("Deadline: ", ""));
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      li.classList.add("overdue");
    } else if (diffHours <= 24) {
      li.classList.add("soon");
    }
  });
}

// ذخیره تسک‌ها در localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// بارگذاری حالت دارک مود از localStorage
function loadDarkMode() {
  const dark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", dark);
  darkToggle.checked = dark;
}

// ذخیره حالت دارک مود در localStorage
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
  localStorage.setItem("darkMode", darkToggle.checked);
});

// فیلتر تسک‌ها هنگام تغییر
filterSelect.addEventListener("change", applyFilter);

// پاک کردن همه تسک‌ها با تایید
clearAll.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// دکمه اینتر در input
inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

let editingIndex = null; // فقط یک آیتم در حال ویرایش

function renderTasks() {
  listContainer.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    
    if (index === editingIndex) {
      li.classList.add("edit-mode");

      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveEdit(index, input.value);
      });

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "save-btn";
      saveBtn.addEventListener("click", () => saveEdit(index, input.value));

      li.appendChild(input);
      li.appendChild(saveBtn);
    } else {
      li.textContent = task.text;

      if (task.completed) li.classList.add("checked");

      // آیکن Edit
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "edit-btn";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editingIndex = index;
        renderTasks();
      });

// مقداردهی اولیه برنامه
function init() {
  loadDarkMode();
  renderTasks();
  applyFilter();
  markDeadlines();
}

init();

