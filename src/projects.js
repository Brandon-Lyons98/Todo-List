const listsContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]');
const listTitleElement = document.querySelector('[data-list-title]');
const listCountElement = document.querySelector('[data-list-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]');

const LOCAL_STORAGE_LIST_KEY = 'task.lists'; // Make a namespace to prevent overridding other websites local storage and so they don't override ours
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []; // This says get this info from local storage if there is any or use the empty array
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

listsContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId;
    saveAndRender();
  }
});

tasksContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = lists.find(list => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id) // Compares task.id to the checkbox.id
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
});

clearCompleteTasksButton.addEventListener('click', e => {
  const selectedList = lists.find(list => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
  saveAndRender();
});

deleteListButton.addEventListener('click', e => {
  lists = lists.filter(list => list.id !== selectedListId);
  selectedListId = null;
  saveAndRender();
});

newListForm.addEventListener('submit', e => {
  e.preventDefault(); // Prevents the page from refreshing when submitting an entry
  const listName = newListInput.value; // The list name we are typing to add
  if (listName == null || listName == '') return // Checks to make sure a list name has actually been typed. If not, return nothing
  const list = createList(listName); // Creates a new list with a unique id. The name is what we type. And it by default has an empty array for future tasks
  newListInput.value = null;
  lists.push(list);
  saveAndRender();
});

newTaskForm.addEventListener('submit', e => {
  e.preventDefault(); // Prevents the page from refreshing when submitting an entry
  const taskName = newTaskInput.value; // The list name we are typing to add
  if (taskName == null || taskName == '') return // Checks to make sure a list name has actually been typed. If not, return nothing
  const task = createTask(taskName); // Creates a new list with a unique id. The name is what we type. And it by default has an empty array for future tasks
  newTaskInput.value = null;
  const selectedList = lists.find(list => list.id === selectedListId);
  selectedList.tasks.push(task);
  saveAndRender();
});

function createList(name) {
  return { id: Date.now().toString(), name: name, tasks: [] }
}

function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false }
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists)); // This passes the key we want followed by the value
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function saveAndRender() {
  save();
  render();
}

function render() {
  clearElement(listsContainer);
  renderLists();
  const selectedList = lists.find(list => list.id === selectedListId);
  if (selectedListId == null) {
    listDisplayContainer.style.display = 'none';
  } else {
    listDisplayContainer.style.display = '';
    listTitleElement.innerText = selectedList.name; // Makes the title of the task section display the name of the project
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector('input');
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector('label');
    label.htmlFor = task.id;
    label.append(task.name);
    tasksContainer.appendChild(taskElement);
  });
}

function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
  const taskString = incompleteTaskCount === 1 ? 'task' : 'tasks';
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
  lists.forEach(list => {
    const listElement = document.createElement('li');
    listElement.dataset.listId = list.id;
    listElement.classList.add('list-name');
    listElement.innerText = list.name; // Sets the innerText to be the name property of the object passed in
    if (list.id === selectedListId) {
      listElement.classList.add('active-list');
    }
    listsContainer.appendChild(listElement);
  })
}
// Because the renderLists function clears everything each time it's called we don't need to reassign the 'active-list' class name as it will due it on its own

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export default render;