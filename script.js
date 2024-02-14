const input = document.querySelector('#input');
const button = document.querySelector('#add_btn');
const todo = document.querySelector('#todo');
const columns = document.querySelectorAll('.status');

// Counter for unique ID generation
let todoCount = 0;

button.addEventListener('click', addTodo);

// Function to add todo items
function addTodo() {
    const todoText = input.value.trim();
    console.log(todoText);
    input.value = '';
    if (todoText === '') return;

    createTodo({
        text: todoText,
        column: todo
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

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');

    // Append elements to the todo list
    column.appendChild(todoItem);
    todoItem.appendChild(deleteBtn);

    // Add appropriate class to the todo item based on the target column
    addClassBasedOnColumn(column, todoItem);

    // Add drag event listener to the todo item
    todoItem.addEventListener('dragstart', dragStart);

    // Save the todo items to local storage
    saveTodoToLocalStorage();

    console.log(todoItem);
}

// Function to delete todo items
function deleteTodo(e) {
    if (e.target.classList.contains('delete-btn')) {
        const todoId = e.target.parentElement.id;
        // Delete the todo item from the UI
        e.target.parentElement.remove();
        // Delete the todo items from local storage
        deleteTodoFromLocalStorage(todoId);
        console.log('item deleted')
    }
}

addEventListener('click', function (e) {
    deleteTodo(e)
})

// Function to handle drag start
function dragStart(e) {
    // Transfer the todo item's ID as data
    e.dataTransfer.setData('text/plain', e.target.id);
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
    // console.log('drag over');
}

// Function to handle drag enter
function dragEnter(e) {
    e.preventDefault()
    e.target.classList.add('drag-over');
    console.log('drag enter');
}

// Function to handle drag leave
function dragLeave(e) {
    e.target.classList.remove('drag-over');
    console.log('drag leave');
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
    const targetStatus = targetColumn.id;

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
    UpdateTodoStatusInLocalStorage(todoId, targetStatus);

    console.log('item dropped');
}

// Function to update the status of the dragged todo item in localStorage
function UpdateTodoStatusInLocalStorage(todoId, targetStatus) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);
    if (index !== -1) {

        todoItems[index].status = targetStatus;
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
        console.log('todo status updated in local storage');
    } else {
        console.log('todo item not found in local storage');
    }
}

// Function to add todo items to local storage
function saveTodoToLocalStorage() {
    const todoItems = [];

    columns.forEach(column => {
        const status = column.id;
        const todoCards = column.querySelectorAll('.todo-card');

        todoCards.forEach(todoItem => {
            const id = todoItem.id;
            const text = todoItem.textContent.trim();
            todoItems.push({ id, text, status });
        });
    });

    localStorage.setItem('todoItems', JSON.stringify(todoItems));
    console.log('todo items saved to local storage');
}

// Function to get todo items from local storage
function getTodoFromLocalStorage() {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    todoItems.forEach(todoItem => {
        const column = document.querySelector(`#${todoItem.status}`);
        if (column) {
            createTodo({
                text: todoItem.text,
                column,
                id: todoItem.id
            });
        }
    });
    console.log('todo items retrieved from local storage')
}

// Function to delete todo items from local storage
function deleteTodoFromLocalStorage(todoId) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);
    if (index !== -1) {
        todoItems.splice(index, 1);
        // save the updated todo items to local storage
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
        console.log('todo item deleted from local storage');
    } else {
        console.log('todo item not found in local storage');
    }
}

// Get todo items from local storage when the page loads
getTodoFromLocalStorage();