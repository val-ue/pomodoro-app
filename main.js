const get = function (selector) {
  return document.querySelector(selector);
};

const entry = get(".entry");
const add = get(".add");
const todoContainer = get(".todo-list");
const doneContainer = get(".done-list");
const priorityTitle = get(".priority-title");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
//let isPriorityOn = false;

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

const findItemBox = () => {

}

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

  /*<i class="fa-solid fa-star"></i>   filled star   */

  const itemCheckbox = itemBox.querySelector(".checkbox");
  itemCheckbox.addEventListener("click", clickCheckbox);

  const deleteBox = itemBox.querySelector(".x");
  const starButton = itemBox.querySelector(".star");

  deleteBox.addEventListener("click", () => deleteButton(id));
  starButton.addEventListener("click", () => priotitize(text));
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

  //when u click on a star
  //if any priority = true,
  //make it false
  //and make the clicked one true
  //and change innertext
  //line 95

  tasks.forEach(() => {
    isPriorityOn = false;
  });

  const task = tasks.find((task) => {
    return task.id === id;
  });

  task.isPriorityOn = true;

  console.log(task);


  starButton.style.color = "white";
  priorityTitle.innerText = `${text}`;


};

const priotitize = (text) => {
 /* priorityTitle.innerText = `${text}`;*/

};

refreshTaskList();


/*<i class="fa-solid fa-pause"></i>*/ 