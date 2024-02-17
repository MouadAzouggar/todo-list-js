const input = document.querySelector('#input');
const button = document.querySelector('#add_btn');
const todo = document.querySelector('#todo');
const columns = document.querySelectorAll('.status');
const archiveBtn = document.querySelector('#archive_btn');

// Counter for unique ID generation
let todoCount = 0;

button.addEventListener('click', addTodo);

// Function to add todo items
function addTodo() {
    const todoText = input.value.trim();
    input.value = '';
    if (todoText === '') return;

    createTodo({
        text: todoText, column: todo
    });

    // Save the todo items to local storage
    saveTodoToLocalStorage();
}

function createTodo({text, column, id}) {
    // Create unique ID for the todo item
    const todoId = id || 'todo_' + todoCount++;

    // Create the todo elements
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-card');
    todoItem.setAttribute('id', todoId);
    todoItem.textContent = text;
    todoItem.setAttribute('draggable', 'true');

    // Create the delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    todoItem.appendChild(deleteBtn);

    // Append elements to the todo list
    column.appendChild(todoItem);


    // Add appropriate class to the todo item based on the target column
    addClassBasedOnColumn(column, todoItem);

    // Add drag event listener to the todo item
    todoItem.addEventListener('dragstart', dragStart);
    todoItem.addEventListener('dragend', dragEnd);
}

// Function to remove todo items from UI
function removeFromUI(e) {
    if (e.target.classList.contains('delete-btn')) {
        const todoItem = e.target.closest('.todo-card');
        if (!todoItem) {
            console.error('Todo item not found');
            return;
        }
        const todoId = todoItem.id;
        const targetColumn = e.target.closest('.status');

        if (targetColumn) {
            // Delete the todo item from the UI
            todoItem.remove();

            // Update todo status in local storage
            UpdateTodoStatusInLocalStorage(todoId, targetColumn.id);

            // Archive the todo item in local storage
            archive(todoId);
        } else {
            console.error('Target column is null');
        }
    }
}

// Event listener to remove todo items from UI
addEventListener('click', function (e) {
    removeFromUI(e)
})

// Function to handle drag start
function dragStart(e) {
    // Transfer the todo item's ID as data
    e.dataTransfer.setData('text/plain', e.target.id);
}

// Function to handle drag end
function dragEnd() {
    // Reorder the todo items in local storage
    saveTodoToLocalStorage();
}

// Loop over the columns and add event listeners
columns.forEach(column => {
    column.addEventListener('dragover', dragOver);
    column.addEventListener('dragenter', dragEnter);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('drop', drop);
});

// Function to handle drag over
function dragOver(e) {
    e.preventDefault()
}

// Function to handle drag enter
function dragEnter(e) {
    e.preventDefault()
    e.target.classList.add('drag-over');
}

// Function to handle drag leave
function dragLeave(e) {
    e.target.classList.remove('drag-over');
}

// Function to add appropriate class to todo item based on target column
function addClassBasedOnColumn(targetColumn, draggedTodo) {
    if (targetColumn.id === 'in_progress') {
        draggedTodo.classList.add('todo-in-progress');
        draggedTodo.classList.remove('todo-completed');
    } else if (targetColumn.id === 'completed') {
        draggedTodo.classList.add('todo-completed');
        draggedTodo.classList.remove('todo-in-progress');
    } else {
        draggedTodo.classList.remove('todo-in-progress', 'todo-completed');
    }
}

// Function to handle drop
function drop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    // Get the dragged todo item's ID
    const todoId = e.dataTransfer.getData('text/plain');

    // Get the dragged todo item
    const draggedTodo = document.getElementById(todoId);

    // Get the target column
    const targetColumn = e.target.closest('.status');

    // Get the status of the target column
    // const targetStatus = targetColumn.id;

    // Get all todo items in the target column
    const todoItems = targetColumn.querySelectorAll('.todo-card');

    // Find the position to insert the dragged todo item
    let insertBeforeElement = null;
    for (const todoItem of todoItems) {
        const rect = todoItem.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
            insertBeforeElement = todoItem;
            break;
        }
    }

    // Insert the dragged todo item before the determined element
    if (insertBeforeElement) {
        targetColumn.insertBefore(draggedTodo, insertBeforeElement);
    } else {
        targetColumn.appendChild(draggedTodo);
    }

    // Add appropriate class to the dragged todo item based on the target column
    addClassBasedOnColumn(targetColumn, draggedTodo)

    // Update the status of the dragged todo item in localStorage
    UpdateTodoStatusInLocalStorage(todoId, targetColumn.id);
}

// Function to update the status of the dragged todo item in localStorage
function UpdateTodoStatusInLocalStorage(todoId, targetStatus) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);
    if (index !== -1) {
        todoItems[index].status = targetStatus;
        todoItems.sort((a, b) => a.order - b.order)
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
    } else {
        console.log('todo item not found in local storage');
    }
}

// Function to save todo items to local storage
function saveTodoToLocalStorage() {
    const todoItems = [];

    columns.forEach(column => {
        const status = column.id;
        const todoCards = column.querySelectorAll('.todo-card');

        todoCards.forEach((todoItem, index) => {
            const id = todoItem.id;
            const text = todoItem.textContent.trim();
            todoItems.push({id, text, status, order: index});
        });
    });

    localStorage.setItem('todoItems', JSON.stringify(todoItems));
}

// Function to get todo items from local storage
function getTodoFromLocalStorage() {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    todoItems
        .forEach(todoItem => {
            const column = document.querySelector(`#${todoItem.status}`);
            if (column) {
                createTodo({
                    text: todoItem.text, column, id: todoItem.id
                });
            }
        });
}

// Function to Archive todo items in local storage
function archive(todoId) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);
    if (index !== -1) {
        // Add archived status to the todo item and deleted_at timestamp
        todoItems[index].status = 'archived';
        todoItems[index].deleted_at = new Date().toISOString() || null;

        // Update local storage
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
        console.log('todo item archived', todoItems[index]);
    }
}

// Open Archive modal
archiveBtn.addEventListener('click', openArchiveModal);

function openArchiveModal() {
    // Create the modal
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.classList.add('status');
    modal.appendChild(modalContent);

    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close');
    modalContent.appendChild(closeBtn);

    const h2 = document.createElement('h2');
    h2.textContent = 'Archived Tasks';
    modalContent.appendChild(h2);
    document.body.appendChild(modal);
    getArchivedTodoFromLocalStorage();

    // Add event listener to close the modal
    closeBtn.addEventListener('click', closeModal);
}

// function to close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    modal.remove();
}

// function to create todo items in modal
function createArchivedTodos({text, id}) {
    // const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const modalContent = document.querySelector('.modal-content');
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-card');
    todoItem.setAttribute('id', id);
    todoItem.textContent = text;
    todoItem.setAttribute('draggable', 'true');

    // Create the restore button
    const restoreBtn = document.createElement('button');
    restoreBtn.classList.add('restore');
    restoreBtn.textContent = 'Restore';
    todoItem.appendChild(restoreBtn);

    modalContent.appendChild(todoItem);

    // add event listener to restore todo items
    restoreBtn.addEventListener('click', restoreTask);
}

// function to get archived todo items from local storage
function getArchivedTodoFromLocalStorage() {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const archivedItems = todoItems.filter(todoItem => todoItem.status === 'archived');

    archivedItems.forEach(archiveItem => {
        createArchivedTodos({
            text: archiveItem.text, id: archiveItem.id
        });
    });
}

// function to restore task from archive (LocalStorage)
function restoreTask(e) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const todoId = e.target.parentElement.id;
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);
    // const targetStatus = 'todo';

    if (index !== -1) {
        // Remove archived status from the todo item and deleted_at timestamp
        todoItems[index].status = 'todo';
        todoItems[index].deleted_at = null;

        console.log('todo item restored', todoItems[index]);

        // Remove todo item from modal
        e.target.parentElement.remove();
    }

    // Update localStorage
    localStorage.setItem('todoItems', JSON.stringify(todoItems));

    console.log('Task restored', todoId);
}

// Get todo items from local storage when the page loads
getTodoFromLocalStorage();