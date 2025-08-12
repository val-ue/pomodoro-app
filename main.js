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
const aboutPomodoro.timer = get(".aboutPomodoro.timer");
const workSound = get(".work-sound");
const shortBreakSound = get(".short-break-sound");
const longBreakSound = get(".long-break-sound");
const statusBar = get(".bar");
const cycleStatus = get(".cycle-status");
const workTimeInput = document.getElementById("work-aboutPomodoro.time");
const shortTimeInput = document.getElementById("short-break");
const longTimeInput = document.getElementById("long-break");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

//for pomodoro
let selectedTask = null;
let = false;
let = false;
let cycles = 0;
let cycleLimit = 3; //number of aboutPomodoro.cycles
let isPaused = false;
let time;
let isWorking;
let count;
let restTime;
let staticTime = 0;

//clearInterval?????

const aboutPomodoro = {
  selectedTask: null,
  isTimerOn: false,
  isCycleDone: false,
  cycles: 0,
  cycleLimit: 3, //number of cycles
  isPaused: false,
  time: null, 
  isWorking: null,
  count: null,
  restTime: null,
  staticTime: 0
};



let workTime = parseInt(workTimeInput.value);
let shortBreak = parseInt(shortTimeInput.value);
let longBreak = parseInt(longTimeInput.value);

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
  const newItem = {
    text: text,
    id: giveId,
    isDone: false,
    isPriorityOn: false
  };
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

  if (!task) {
    return;
  }

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
  starButton.addEventListener("click", () => starToggle(starButton, text, id));
};

const deleteButton = (id) => {
  const findIndex = tasks.findIndex((item) => {
    return item.id === id;
  });

  tasks.splice(findIndex, 1);
  updateStorage();
  refreshTaskList();
};

const starToggle = (starButton, text, id) => {
  const allStars = document.querySelectorAll(".star");

  tasks.forEach((task) => {
    task.isPriorityOn = false;
  });

  allStars.forEach((star) => {
    star.classList.remove("fa-solid");
    star.classList.add("default-star", "fa-regular");
  });

  aboutPomodoro.selectedTask = tasks.find((task) => {
    return task.id === id;
  });

  if (!aboutPomodoro.selectedTask) {
    return;
  }

  aboutPomodoro.selectedTask.isPriorityOn = true;
  priorityTitle.innerText = `${text}`;

  if (aboutPomodoro.selectedTask.isPriorityOn === true) {
    starButton.classList.remove("fa-regular", "default-star");
    starButton.classList.add("fa-solid", "selected-star");
  }
};

/****************** POMODORO **********************/

const playSound = function (sound) {
  const soundClone = sound.cloneNode(true);
  soundClone.play();
};

const startConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 35,
    spread: 360,
    ticks: 120,
    zIndex: 1000
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    for (let i = 0; i < 3; i++) {
      confetti(
        Object.assign({}, defaults, {
          particleCount: 25,
          origin: {
            x: Math.random(),
            y: Math.random() * 0.2
          }
        })
      );
    }
  }, 150);
};

const formatTime = (aboutPomodoro) => {
  const minutes = Math.floor(aboutPomodoro.time / 60);
  let seconds = aboutPomodoro.time % 60;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  timer.innerHTML = `${minutes}:${seconds}`;
};

const updateProgressBar = (aboutPomodoro) => {
  const barWidth = (aboutPomodoro.time / aboutPomodoro.staticTime) * 100;
  statusBar.style.width = barWidth + "%";
};

const endWorkCycle = () => {
  clearInterval(aboutPomodoro);
  aboutPomodoro.isWorking = false;
  aboutPomodoro.time = aboutPomodoro.restTime * 60;
  aboutPomodoro.staticTime = aboutPomodoro.time;
  timer.style.color = "#0c110cad";
  cycleStatus.innerText = `Break`;
  aboutPomodoro.count = setInterval(updateCountdown, 100);

  if (aboutPomodoro.restTime === shortBreak) {
    playSound(shortBreakSound);
  } else {
    playSound(longBreakSound);
  }
};

const endRestCycle = () => {
  clearInterval(aboutPomodoro.count);
  aboutPomodoro.isCycleDone = true;
  aboutPomodoro.cycles++;

  if (aboutPomodoro.cycles < aboutPomodoro.cycleLimit) {
    startCycle(shortBreak, workTime);
  } else if (aboutPomodoro.cycles === aboutPomodoro.cycleLimit) {
    startCycle(longBreak, workTime);
  } else if (aboutPomodoro.cycles > aboutPomodoro.cycleLimit) {
    startConfetti();
    openModal();
    reset();
  } else {
    return;
  }
};

const updateCountdown = () => {
  formatTime(aboutPomodoro.time);
  updateProgressBar(aboutPomodoro.time, aboutPomodoro);
  aboutPomodoro.time--;

  if (aboutPomodoro.time < 0 && aboutPomodoro.isWorking === true) {
    endWorkCycle();
  }

  if (aboutPomodoro.time < 0 && aboutPomodoro.isWorking === false) {
    endRestCycle();
  }
};

const pauseTime = () => {
  clearInterval(aboutPomodoro);
  startButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
  aboutPomodoro.isPaused = true;
};

const resumeTime = () => {
  aboutPomodoro.isPaused = false;
  startButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  aboutPomodoro.count = setInterval(updateCountdown, 100);
};

const getInputs = () => {
  workTime = parseInt(workTimeInput.value);
  shortBreak = parseInt(shortTimeInput.value);
  longBreak = parseInt(longTimeInput.value);
};

startButton.addEventListener("click", () => {
  if (aboutPomodoro. === true && aboutPomodoro.isPaused === false) {
    pauseTime();
    return;
  }

  if (aboutPomodoro.isPaused === true) {
    resumeTime();
    return;
  }

  if (!aboutPomodoro.selectedTask) {
    priorityTitle.innerText = `Select a task`;
    return;
  }

  getInputs();

  if (isNaN(workTime) || isNaN(shortBreak) || isNaN(longBreak)) {
    workTime = 10;
    workTimeInput.value = `${workTime}`;
    shortBreak = 5;
    shortTimeInput.value = `${shortBreak}`;
    longBreak = 10;
    longTimeInput.value = `${longBreak}`;
  }

  aboutPomodoro.isWorking = true;
  aboutPomodoro. = true;
  aboutPomodoro.isPaused = false;

  startCycle(shortBreak, workTime);
  startButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  aboutPomodoro.timer.style.color = "#0c110c";
});

const reset = () => {
  aboutPomodoro.timer.innerHTML = "00:00";
  startButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
  aboutPomodoro.timer.style.color = "#0c110c";
  clearInterval(aboutPomodoro);
  aboutPomodoro.cycles = 0;
  aboutPomodoro.time = 0;
  aboutPomodoro.restTime = 0;
  aboutPomodoro. = false;
  aboutPomodoro.isPaused = false;
  aboutPomodoro.isWorking = false;
  statusBar.style.width = 100 + "%";
  workTimeInput.value = ``;
  shortBreak = 5;
  shortTimeInput.value = ``;
  longBreak = 10;
  longTimeInput.value = ``;
  cycleStatus.innerText = ``;
  aboutPomodoro.selectedTask = null;
  priorityTitle.innerText = ``;
};

resetButton.addEventListener("click", () => {
  reset();
});

const startCycle = (rest, work) => {
  playSound(workSound);
  startButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
  aboutPomodoro.timer.style.color = "#0c110c";
  cycleStatus.innerText = `work`;
  aboutPomodoro.isWorking = true;
  aboutPomodoro.time = work * 60;
  aboutPomodoro.staticTime = aboutPomodoro.time;
  aboutPomodoro. = false;
  aboutPomodoro.restTime = rest;
  aboutPomodoro.count = setInterval(updateCountdown, 100);
};

const createModalHtml = (finalPopup) => {
  finalPopup.innerHTML = `
    <div class="popup flex column justify-content-center align-items-center">
      <i id="close-modal-x" class="fa-solid fa-xmark full-width"></i>
      <h2 class="congrats">Session Complete!</h2>
      <h3>Is "${aboutPomodoro.selectedTask.text}" finished?</h3>
      <div class="modal-button-container flex align-items-center justify-content-center">
        <button id="yes-done" class="start-button session-button">Yes</button>
        <button id="no-done" class="start-button session-button">No</button>
      </div>
    </div>
  `;
};

const openModal = () => {
  const finalPopup = document.createElement("div");
  createModalHtml(finalPopup);
  document.body.appendChild(finalPopup);

  const itsDone = document.getElementById("yes-done");
  const notDone = document.getElementById("no-done");
  const closeButtonX = document.getElementById("close-modal-x");

  const closeModal = () => {
    finalPopup.remove();
  };

  if (itsDone) {
    itsDone.addEventListener("click", () => {
      aboutPomodoro.selectedTask.isDone = true;
      closeModal();
      updateStorage();
      refreshTaskList();
    });
  }

  if (notDone) {
    notDone.addEventListener("click", closeModal);
  }

  if (closeButtonX) {
    closeButtonX.addEventListener("click", closeModal);
  }
};

refreshTaskList();
