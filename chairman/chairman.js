"use strict";

// Global variable declarations go here
const endpoint =
  "https://delfin-semesterprojekt-default-rtdb.europe-west1.firebasedatabase.app/";

let tasks = [];

window.addEventListener("load", initApp);

// Initialize the app
function initApp() {
  setupTaskForm();
}

function setupTaskForm() {
  const form = document.getElementById('taskForm');
  const input = document.getElementById('taskInput');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const task = input.value.trim();

    if (task) {
      tasks.push({ description: task, completed: false });
      input.value = '';
      input.focus();
      renderTasks();
    }
  });
}

// Render the tasks on the page
function renderTasks() {
  const tasksList = document.getElementById('tasksList');
  let html = '<ul class="task-list">';
  
  tasks.forEach((task, i) => {
    const taskClass = task.completed ? 'completed' : '';
    html += `<li class="${taskClass}">
               <input type="checkbox" id="task${i}" onclick="toggleTask(${i})" ${task.completed ? 'checked' : ''}>
               <label for="task${i}">${task.description}</label>
               <button onclick="removeTask(${i})">Remove</button>
             </li>`;
  });

  html += '</ul>';
  tasksList.innerHTML = html;
}

// Toggle a task's completion status
function toggleTask(i) {
  tasks[i].completed = !tasks[i].completed;
  renderTasks();
}

// Remove a task
function removeTask(i) {
  tasks.splice(i, 1);
  renderTasks();
}
