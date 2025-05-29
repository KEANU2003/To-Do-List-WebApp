const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const counter = document.getElementById("counter");

function addTask() {
  if (inputBox.value.trim() === "") {
    alert("Please enter a task!");
    return;
  }

  let li = document.createElement("li");
  li.innerHTML = inputBox.value;

  let span = document.createElement("span");
  span.innerHTML = "\u00d7";
  li.appendChild(span);

  listContainer.appendChild(li);
  inputBox.value = "";
  saveData();
  updateCounter();
  showToast("Task added!");
}

inputBox.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

listContainer.addEventListener("click", function (e) {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveData();
    updateCounter();
  } else if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveData();
    updateCounter();
    showToast("Task deleted!");
  }
});

listContainer.addEventListener("dblclick", function (e) {
  if (e.target.tagName === "LI") {
    const originalText = e.target.textContent.replace("×", "");
    const newText = prompt("Edit task:", originalText);
    if (newText && newText.trim() !== "") {
      e.target.firstChild.nodeValue = newText;
      saveData();
      updateCounter();
      showToast("Task updated!");
    }
  }
});

function filterTasks(type) {
  const tasks = listContainer.querySelectorAll("li");
  tasks.forEach((li) => {
    li.style.display = "block";
    if (type === "done" && !li.classList.contains("checked"))
      li.style.display = "none";
    if (type === "undone" && li.classList.contains("checked"))
      li.style.display = "none";
  });
}

function updateCounter() {
  const total = listContainer.querySelectorAll("li").length;
  const done = listContainer.querySelectorAll("li.checked").length;
  counter.textContent = `Done: ${done} / Total: ${total}`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.opacity = 1;
  setTimeout(() => {
    toast.style.opacity = 0;
  }, 2000);
}

function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
  listContainer.innerHTML = localStorage.getItem("data") || "";
  updateCounter();
}

function saveTheme() {
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
}

document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  saveTheme();
});

showTask();
loadTheme();
