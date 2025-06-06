const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

function addTask(){
    if(inputBox.value === ''){
        alert("You must write something!")
    }
    else{
        let li = document.createElement("li");
        li.classList.add("inprogress"); // اضافه کردن کلاس inprogress برای فیلتر وضعیت
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);

        let edit = document.createElement("span");
        edit.className = "edit-icon";
        edit.innerHTML = "&#9998;"; // ✏️
        edit.onclick = function(e) {
        e.stopPropagation(); // جلوگیری از تغییر وضعیت تسک وقتی کلیک میکنیم
        editTask(li);
        };
        li.appendChild(edit);
        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);

    }
    inputBox.value = "";
    saveData();
    updateProgressBar();
}

listContainer.addEventListener("click", function(e){
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("checked");
        saveData();
    }
    else if(e.target.tagName === "SPAN"){
        e.target.parentElement.remove();
        saveData();
        updateProgressBar();
    }
}, false);

function updateProgressBar() {
    const tasks = listContainer.getElementsByTagName("li");
    let total = tasks.length;
    let completed = 0;

    Array.from(tasks).forEach(task => {
        if (task.classList.contains("checked")) {
            completed++;
        }
    });

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = progress + "%";
    progressBar.innerText = progress + "%";
}

function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
}
function showTask(){
    listContainer.innerHTML = localStorage.getItem("data");
}
showTask();

document.getElementById("search-box").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const tasks = listContainer.getElementsByTagName("li");

    Array.from(tasks).forEach(task => {
        const text = task.textContent || task.innerText;
        if (text.toLowerCase().indexOf(searchTerm) > -1) {
            task.style.display = "";
        } else {
            task.style.display = "none";
        }
    });
});

function deleteAllTasks() {
    if (confirm("Are you sure you want to delete all tasks?")) {
        listContainer.innerHTML = "";
        localStorage.removeItem("data");
        updateProgressBar();
    }
}

document.getElementById("status-filter").addEventListener("change", function () {
    const filterValue = this.value.toLowerCase();
    const tasks = listContainer.getElementsByTagName("li");

    Array.from(tasks).forEach(task => {
        // اگر تسک چک شده باشه، completed هست
        const isCompleted = task.classList.contains("checked");
        let showTask = true;

        if (filterValue === "completed") {
            showTask = isCompleted;
        } else if (filterValue === "uncompleted") {
            showTask = !isCompleted;
        } else if (filterValue === "inprogress") {
            showTask = !isCompleted && !task.classList.contains("inprogress") ? false : true;
        }

        task.style.display = showTask ? "" : "none";
    });
});

window.onload = function () {
    showTask();
    updateProgressBar();
};

function editTask(taskElement) {
    const oldText = taskElement.innerText;
    
    // ساخت input برای ویرایش
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.style.width = "100%";
    input.style.padding = "10px";
    input.style.marginTop = "5px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "5px";

    // جایگزین کردن متن با input
    taskElement.innerHTML = "";
    taskElement.appendChild(input);
    input.focus();

    // ذخیره تغییرات وقتی Enter زده شد
    input.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            const newText = input.value.trim();
            if (newText !== "") {
                taskElement.innerHTML = newText;
                // دوباره ایکون‌ها رو اضافه کن
                addIcons(taskElement);
                saveData();
                updateProgressBar(); // اگر Progress Bar داری
            } else {
                taskElement.innerHTML = oldText;
                addIcons(taskElement);
            }
        }
    });

    // ذخیره وقتی از input خارج شد
    input.addEventListener("blur", function() {
        const newText = input.value.trim();
        if (newText !== "") {
            taskElement.innerHTML = newText;
            addIcons(taskElement);
            saveData();
            updateProgressBar(); // اگر Progress Bar داری
        } else {
            taskElement.innerHTML = oldText;
            addIcons(taskElement);
        }
    });
}

function addIcons(taskElement) {
    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    span.onclick = function(e) {
        e.stopPropagation();
        this.parentElement.remove();
        saveData();
        updateProgressBar(); // اگر Progress Bar داری
    };
     taskElement.appendChild(span);

    const edit = document.createElement("span");
    edit.className = "edit-icon";
    edit.innerHTML = "&#9998;";
    edit.onclick = function(e) {
        e.stopPropagation();
        editTask(taskElement);
    };
    taskElement.appendChild(edit);
}

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    // تغییر متن دکمه
    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }

    // ذخیره حالت تم در لوکال استوریج
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// بارگذاری حالت ذخیره شده وقتی صفحه لود میشه
window.onload = function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.textContent = "🌙 Dark Mode";
    }

    showTask();
    updateProgressBar(); // فقط اگر داری
};
