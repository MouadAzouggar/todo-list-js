const input = document.getElementById('input');
const addTodoBtn = document.getElementById('add_btn');
const todo = document.getElementById('todo');
const columns = document.querySelectorAll('.status');
const archiveBtn = document.getElementById('archive_btn');
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('searchResults');
const overlay = document.getElementById('overlay');
// const searchBtn = document.getElementById('search_btn');

let modal = null;

addTodoBtn.addEventListener('click', addTodo);

// Function to add todo items
function addTodo() {
    const todoText = input.value.trim();
    input.value = '';
    if (todoText === '') return;

    createTodo({
        text: todoText, column: todo
    });
}

function createTodo({text, column, id}) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];

    // Determine the todo item's ID
    let maxId = 0;
    todoItems.forEach(todoItem => {
        const id = todoItem.id.split('_')[1];
        maxId = Math.max(maxId, id);
        if (id > maxId) {
            maxId = id;
        }
    });

    // Create unique ID for the todo item
    const todoId = id || `todo_${++maxId}`;


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

    // Update local storage
    todoItems.push({
        id: todoId,
        text,
        status: column.id,
        order: column.children.length - 2,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('todoItems', JSON.stringify(todoItems));
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
            // Update todo status in local storage
            UpdateTodoStatusInLocalStorage(todoId, targetColumn.id);

            // Archive the todo item in local storage
            archive(todoId);

            // Delete the todo item from the UI
            todoItem.remove();
        } else {
            console.error('Target column is null');
        }
    }
}

// Event listener to remove todo items from UI
addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-btn')) {
        removeFromUI(e);
        console.log('todo item deleted from UI')
    }
})

// Function to handle drag start
function dragStart(e) {
    // Transfer the todo item's ID as data
    e.dataTransfer.setData('text/plain', e.target.id);
}

// Function to handle drag end
function dragEnd() {
    // sort the todo items in local storage (order, status)
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

// Function to handle drag leave
function dragLeave(e) {
    e.target.classList.remove('drag-over');
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
        // todoItems.sort((a, b) => a.order - b.order)
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
    } else {
        console.log('todo item not found in local storage');
    }
}

// Function to save todo items to local storage
function saveTodoToLocalStorage() {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];

    // Iterate over the columns to collect todo items
    columns.forEach(column => {
        const status = column.id;
        const todoCards = column.querySelectorAll('.todo-card');

        todoCards.forEach((todoItem, index) => {
            const id = todoItem.id;
            const text = todoItem.textContent.trim();

            // Check if the todo item already exists in todoItems array
            const existingIndex = todoItems.findIndex(item => item.id === id);

            // If the todo item doesn't exist, add it to todoItems
            if (existingIndex === -1) {
                todoItems.push({id, text, status, order: index});
            } else {
                // If the todo item exists, update its status and order
                todoItems[existingIndex].status = status;
                todoItems[existingIndex].order = index;
            }
        });
    });

    localStorage.setItem('todoItems', JSON.stringify(todoItems));
}


// Function to get todo items from local storage
function getTodoFromLocalStorage() {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const storedTodoItems = todoItems.filter(todoItem => todoItem.status !== 'archived');

    if (storedTodoItems) {
        storedTodoItems.forEach(todoItem => {
            const todoId = todoItem.id;
            const text = todoItem.text;
            const column = document.querySelector(`#${todoItem.status}`);
            addStoredTodosToUI({
                text, column, todoId
            });
        });
    }
}

// Function to create todo items from local storage
function addStoredTodosToUI({text, column, todoId}) {
    // Create the todo elements
    const storedItem = document.createElement('div');
    storedItem.classList.add('todo-card');
    storedItem.setAttribute('id', todoId);
    storedItem.textContent = text;
    storedItem.setAttribute('draggable', 'true');

    // Create the delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    storedItem.appendChild(deleteBtn);

    // Append elements to the todo list
    column.appendChild(storedItem);

    // Add appropriate class to the todo item based on the target column
    addClassBasedOnColumn(column, storedItem);

    // Add drag event listener to the todo item
    storedItem.addEventListener('dragstart', dragStart);
}

// Function to Archive todo items in local storage
function archive(todoId) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);

    if (index !== -1) {
        // Add archived status to the todo item and deleted_at timestamp
        todoItems[index].status = 'archived';
        todoItems[index].deleted_at = new Date().toISOString() || null;
    }

    localStorage.setItem('todoItems', JSON.stringify(todoItems));

    if (modal) {
        // Display todo items in the archive modal
        createArchivedTodos({
            text: todoItems[index].text, id: todoId
        })
    }
}

// Add event listener to create the modal
archiveBtn.addEventListener('click', openModal);

// Function to create modal
function createModal() {
    if (!modal) {
        modal = document.createElement('div');
        modal.classList.add('modal');
        modal.setAttribute('data-modal-open', 'true');

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close');
        modal.appendChild(closeBtn);

        // Check if modal has content
        if (modal.innerHTML.trim() !== '') {
            modal.classList.add('has-content');
        } else {
            modal.classList.remove('has-content');
        }

        // Add event listener to close the modal
        closeBtn.addEventListener('click', closeModal);

        archiveModal(modal);
    }

}

// Function to close modal
function closeModal() {
    if (modal) {
        overlay.style.display = 'none';
        modal.setAttribute('data-modal-open', 'false');
        modal.classList.add('hide');
    }
}

// Function to open modal
function openModal() {
    if (!modal) {
        createModal();
    }
    overlay.style.display = 'block';
    modal.setAttribute('data-modal-open', 'true');
    modal.classList.remove('hide');
}

// Function to create archive modal
function archiveModal(modalContainer) {
    // Create the modal
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modalContent.setAttribute('id', 'archived')
    modalContent.classList.add('status');
    modalContainer.appendChild(modalContent);

    const h2 = document.createElement('h2');
    h2.style.color = 'var(--clr-progress)';
    h2.textContent = 'Archived Tasks';
    modalContent.appendChild(h2);
    document.body.appendChild(modalContainer);
    getArchivedTodoFromLocalStorage();
}

// Function to create todo items in modal
function createArchivedTodos({text, id}) {
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

// Function to get archived todo items from local storage
function getArchivedTodoFromLocalStorage() {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const archivedItems = todoItems.filter(todoItem => todoItem.status === 'archived');

    archivedItems.forEach(archiveItem => {
        createArchivedTodos({
            text: archiveItem.text, id: archiveItem.id
        });
    });
}

// Function to restore task from archive (LocalStorage)
function restoreTask(e) {
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const todoId = e.target.parentElement.id;
    const index = todoItems.findIndex(todoItem => todoItem.id === todoId);

    if (index !== -1) {
        // Remove archived status from the todo item and deleted_at timestamp
        todoItems[index].status = 'todo';
        todoItems[index].deleted_at = null;

        // Create the restored todo item in the UI
        createTodo({
            text: todoItems[index].text,
            column: document.querySelector(`#${todoItems[index].status}`),
            id: todoId
        });

        // Remove todo item from modal
        e.target.parentElement.remove();
    }

    // Update localStorage
    localStorage.setItem('todoItems', JSON.stringify(todoItems));
}

// Function to search for todo items in LocalStorage
searchInput.addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    const searchResults = todoItems.filter(todoItem => todoItem.text.toLowerCase().includes(searchText));

    displaySearchResults(searchResults);
});

function displaySearchResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.textContent = 'No results found';
        searchResults.style.display = 'block';
    }

    results.forEach(result => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('result-item');

        // Create span for the todo item text
        const resultText = document.createElement('span');
        resultText.classList.add('result-text');
        resultText.textContent = result.text;
        todoItem.appendChild(resultText);

        // Create span for the todo item status
        const resultStatus = document.createElement('span');
        resultStatus.classList.add('result-status');
        resultStatus.textContent = result.status;

        // Assign background color to the status span
        resultStatus.style.backgroundColor = getStatusColor(result.status);
        todoItem.appendChild(resultStatus);


        todoItem.addEventListener('click', function () {
            searchInput.value = result.text;
            searchResults.style.display = 'none';
        });
        searchResults.appendChild(todoItem);
    });
}

// Function to get status color
function getStatusColor(status) {
    if (status === 'todo') {
        return 'var(--clr-background)';
    } else if (status === 'in_progress') {
        return 'var(--clr-progress)';
    } else if (status === 'completed') {
        return 'var(--clr-completed)';
    } else {
        return 'var(--clr-archived)';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
        searchResults.style.display = 'none';
    } else {
        searchResults.textContent = 'Type in the search box to search for todo items';
        searchResults.style.display = 'block';
    }

});

// Get todo items from local storage when the page loads
getTodoFromLocalStorage();