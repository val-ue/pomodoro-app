const get = function (selector) {
  return document.querySelector(selector);
};

const entry = get(".entry");
const add = get(".add");
const todoContainer = get(".todo-list");
const doneContainer = get(".done-list");
const priorityTitle = get(".priority-title");
const resetButton = get(".reset-button");
const startButton = get(".start-button");
const timer = get(".timer");
const workSound = get(".work-sound");
const shortBreakSound = get(".short-break-sound");
const longBreakSound = get(".long-break-sound");
const statusBar = get(".bar");

const workTimeInput = document.getElementById("work-time");
const shortTimeInput = document.getElementById("short-break");
const longTimeInput = document.getElementById("long-break");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const updateStorage = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

let allTaskIds = tasks.map((task) => {
  if (typeof task.id === "number") {
    return task.id;
  } else {
    return 0;
  }
});

let maxId;

if (allTaskIds.length > 0) {
  maxId = Math.max(...allTaskIds);
} else {
  maxId = 0;
}

let idNumber = maxId;

const generateID = () => {
  idNumber += 1;
  return idNumber;
};

const pushToList = (text) => {
  const giveId = generateID();
  const newItem = { text: text, id: giveId, isDone: false, isPriorityOn: false };
  tasks.push(newItem);
  return newItem;
};

const prepareCreateTask = () => {
  const inputText = entry.value;
  if (inputText === "") {
    return;
  } else {
    entry.value = "";
    pushToList(inputText);
    updateStorage();
    refreshTaskList();
  }
};

add.addEventListener("click", prepareCreateTask);

entry.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    prepareCreateTask();
  }
});

const refreshTaskList = () => {
  todoContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach((task) => {
    let type;
    let list;
    let checked;

    if (task.isDone === true) {
      type = "done";
      list = doneContainer;
      checked = "checked";
    } else {
      type = "todo";
      list = todoContainer;
      checked = "";
    }
    createTask(task.text, type, list, task.id, checked);
  });
};

const clickCheckbox = (e) => {
  const itemBox = e.target.closest(".list-item");
  const id = parseInt(itemBox.dataset.id);
  const task = tasks.find((task) => {
    return task.id === id;
  });

  if (task.isDone === false) {
    task.isDone = true;
  } else {
    task.isDone = false;
  }
  updateStorage();
  refreshTaskList();
};

const createTask = (text, type, list, id, checked) => {
  if (typeof id !== "number") {
    return;
  }

  const itemBox = document.createElement("div");
  itemBox.classList.add("list-item", "flex", "row", "align-items-center", type);
  itemBox.dataset.id = id.toString();

  itemBox.innerHTML = `
    <label class="checkbox-container flex align-items-center">
        <input type="checkbox" class="checkbox" ${checked}/>
        <span class="checkmark"></span>
    </label>
    <i class="fa-regular star fa-star"></i>
    <p class="text-line">${text} <span class="x"><i class="fa-solid fa-square-xmark"></i></span></p>`;
  list.appendChild(itemBox);

  const itemCheckbox = itemBox.querySelector(".checkbox");
  itemCheckbox.addEventListener("click", clickCheckbox);

  const deleteBox = itemBox.querySelector(".x");
  const starButton = itemBox.querySelector(".star");

  deleteBox.addEventListener("click", () => deleteButton(id));
  starButton.addEventListener("click", () => starToggle(starButton, text, id, list));

};

const deleteButton = (id) => {
  const findIndex = tasks.findIndex((item) => {
    return item.id === id;
  });
  tasks.splice(findIndex, 1);
  updateStorage();
  refreshTaskList();
};

const starToggle = (starButton, text, id, list) => {
  const allStars = list.querySelectorAll(".star");

  tasks.forEach((task) => {
    task.isPriorityOn = false;
  });

  allStars.forEach((star) => {
    star.classList.remove("fa-solid");
    star.classList.add("default-star", "fa-regular");
    console.log("reversed");
    console.log(allStars);
  });

  const selectedTask = tasks.find((task) => {
    return task.id === id;
  });

  selectedTask.isPriorityOn = true;
  console.log(selectedTask);
  priorityTitle.innerText = `${text}`;

  if (selectedTask.isPriorityOn === true) {
    starButton.classList.remove("fa-regular", "default-star");
    starButton.classList.add("fa-solid", "selected-star");
  }
  console.log(tasks);
};

/****************** POMODORO **********************/

let isTimerOn = false;
let isCycleDone = false;
let cycles = 0;
let cycleLimit = 3; //number of cycles
let isPaused = false;
let time;
let isWorking;
let count;
let restTime;
let staticTime = 0;
let workTime = parseInt(workTimeInput.value);
let shortBreak = parseInt(shortTimeInput.value);
let longBreak = parseInt(longTimeInput.value);


//let barWidth = window.getComputedStyle(statusBar).width;




const playSound = function (sound) {
  const soundClone = sound.cloneNode(true);
  soundClone.play();
};

const updateCountdown = () => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  timer.innerHTML = `${minutes}:${seconds}`;
  time--;

  const barWidth = (time / staticTime) * 100;
  statusBar.style.width = barWidth + "%";

  if (time < 0 && isWorking === true) {
    clearInterval(count);
    console.log("work done");
    isWorking = false;
    time = restTime * 60;
    staticTime = time;
    timer.style.color = "#0c110cad";
    count = setInterval(updateCountdown, 100); 

    if (restTime === shortBreak) {
      playSound(shortBreakSound);
    } else {
      playSound(longBreakSound);
    }
  }

  if (time < 0 && isWorking === false) {
    clearInterval(count);
    console.log("rest done");
    isCycleDone = true;
    cycles++;
    console.log(cycles);

    if(cycles < cycleLimit) {
      startCycle(shortBreak, workTime);
    } else if (cycles === cycleLimit) {
      // playSound(workSound);
      startCycle(longBreak, workTime);
      console.log("long starting");
    } else {
      return;
    }
  }
}; 

startButton.addEventListener("click", () => {
 if(isTimerOn === true && isPaused === false) {
    //pause 
    clearInterval(count);
    startButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
    isPaused = true;
    return;
  }

  if (isPaused === true) {
    isPaused = false;
    startButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    count = setInterval(updateCountdown, 100); // resume countdown
    return;
  }

  workTime = parseInt(workTimeInput.value);
  shortBreak = parseInt(shortTimeInput.value);
  longBreak = parseInt(longTimeInput.value);

  if (isNaN(workTime) || isNaN(shortBreak) || isNaN(longBreak)) {
    timer.innerHTML = `Whole Numbers Only`;
    console.log("whole numbers only");
    return;
  }

  isWorking = true;
  isTimerOn = true;
  isPaused = false;
  startCycle(shortBreak, workTime);
  startButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  timer.style.color = "#0c110c";
});

resetButton.addEventListener("click", () => {
  timer.innerHTML = "00:00";
  startButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
  timer.style.color = "#0c110c"; 
  clearInterval(count);
  cycles = 0;       
  time = 0;           
  restTime = 0;
  isTimerOn = false;
  isPaused = false; 
  isWorking = false;
});

const startCycle = (rest, work) => {
  playSound(workSound);
  startButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  timer.style.color = "#0c110c";
  isWorking = true;
  time = work * 60;
  staticTime = time;
  isCycleDone = false;
  restTime = rest;
  count = setInterval(updateCountdown, 100);
};

refreshTaskList();