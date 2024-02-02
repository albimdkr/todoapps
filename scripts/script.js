/**
 * [
 *    {
 *      id: <int>
 *      task: <string>
 *      timestamp: <string>
 *      isCompleted: <boolean>
 *    }
 * ]
 */
const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const DELETED_EVENT = 'deleted-todo'
const UNDO_EVENT = 'undo-todo';
const STORAGE_KEY = 'TODO_APPS';

function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, description, timestamp, isCompleted) {
  return {
    id,
    task,
    description,
    timestamp,
    isCompleted,
  };
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see todos}
 */
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// function makeTodo
function makeTodo(todoObject) {
  const { id, task, description, timestamp, isCompleted } = todoObject;

  const textTitle = document.createElement('h2');
  textTitle.innerText = task;

  const textDescription = document.createElement('p');
  textDescription.innerText = description;

  const textTimestamp = document.createElement('p');
  textTimestamp.innerText = timestamp;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textDescription, textTimestamp);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `todo-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });

    container.append(checkButton);
  }

  return container;
}

// function addTodo
function addTodo() {
  const textTodo = document.getElementById('title').value;
  const textDescription = document.getElementById('description').value;
  const timestamp = document.getElementById('date').value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    textDescription,
    timestamp,
    false
  );
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// function addTaskToCompleted
function addTaskToCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// function remove task
function removeTaskFromCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// function undoTask
function undoTaskFromCompleted(todoId /* HTMLELement */) {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// DOM loaded
const isDataValid = true;
document.addEventListener('DOMContentLoaded', function () {
  const submitForm /* HTMLFormElement */ = document.getElementById('form');

  function validateTitle(title) {
    return title.trim() !== '';
  }

  function validateDescription(desc) {
    return desc.trim() !== '';
  }

  function validateDate(date) {
    return date.trim() !== '';
  }

  function handleValidationFailure(messageFailure) {
    const inputElement = document.activeElement;
    inputElement.style.border = '1px solid red';
    Swal.fire({
      title: 'Simpan Gagal!',
      text: messageFailure,
      icon: 'error',
    });
  }

  submitForm.addEventListener('submit', function (event) {
    const formTitle = document.getElementById('title').value;
    const formDescription = document.getElementById('description').value;
    const formDate = document.getElementById('date').value;

    if (!validateTitle(formTitle)) {
      event.preventDefault();
      handleValidationFailure('Ulangi! harap isi judul anda');
    } else if (formDescription.trim() === '') {
      event.preventDefault();
      handleValidationFailure('Ulangi! harap isi deskripsi anda');
    } else if (formDate.trim() === '') {
      event.preventDefault();
      handleValidationFailure('Ulangi! harap isi waktu batas anda');
    } else {
      event.preventDefault();
      addTodo();
    }
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  handleValidationSuccess('Anda telah berhasil!');
});

function handleValidationSuccess(messageSuccesed) {
  Swal.fire({
    title: 'Berhasil',
    text: messageSuccesed,
    icon: 'success',
  });
}

// Costume Event RENDER_EVENT
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  const listCompleted = document.getElementById('completed-todos');

  // clearing list item
  uncompletedTODOList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (todoItem.isCompleted) {
      listCompleted.append(todoElement);
    } else {
      uncompletedTODOList.append(todoElement);
    }
  }
});