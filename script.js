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

    // Create unique ID for the todo item
    const todoId = 'todo_' + todoCount++;

    // Create the todo elements
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-card');
    todoItem.setAttribute('id', todoId);
    todoItem.textContent = todoText;
    todoItem.setAttribute('draggable', 'true');

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');

    // Append elements to the todo list
    todo.appendChild(todoItem);
    todoItem.appendChild(deleteBtn);

    // Add drag event listener to the todo item
    todoItem.addEventListener('dragstart', dragStart);

    console.log(todoItem);
}

// Function to delete todo items
function deleteTodo(e) {
        if (e.target.classList.contains('delete-btn')) {
            e.target.parentElement.remove();
            console.log('item deleted')
        }
}

addEventListener('click', function(e) {
    deleteTodo(e)
})

// Function to handle drag start
function dragStart(e){
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
function dragOver(e){
    e.preventDefault()
    // console.log('drag over');
}

// Function to handle drag enter
function dragEnter(e){
    e.preventDefault()
    e.target.classList.add('drag-over');
    console.log('drag enter');
}

// Function to handle drag leave
function dragLeave(e){
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
function drop(e){
    e.preventDefault();
    e.target.classList.remove('drag-over');

    // Get the dragged todo item's ID
    const todoId = e.dataTransfer.getData('text/plain');

    // Get the dragged todo item
    const draggedTodo = document.getElementById(todoId);

    // Get the target column
    const targetColumn = e.target.closest('.status');

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

    // Add appropriate class to the dragged todo item based on the target column
    addClassBasedOnColumn(targetColumn, draggedTodo)

    // Insert the dragged todo item before the determined element
    if (insertBeforeElement) {
        targetColumn.insertBefore(draggedTodo, insertBeforeElement);
    } else {
        targetColumn.appendChild(draggedTodo);
    }

    console.log('item dropped');
}
