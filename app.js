const words = ["BIG", "SMALL", "HAPPY", "SAD",
    "BEAUTIFUL", "UGLY", "GOOD", "BAD", "HOT", "COLD",
    "FAST", "SLOW", "INTERESTING", "BORING", "DELICIOUS",
    "TIRED", "EXCITED", "ANGRY", "CLEVER", "KIND"];

// Tamaño de la cuadrícula (10x10 es más razonable para visualización)
const gridSize = 10;
let wordGrid;
let currentSelection = [];
let wordsFound = [];
let placedWords = []; // Lista de palabras efectivamente colocadas

document.addEventListener('DOMContentLoaded', () => {
    startNewGame();
    document.getElementById('generateNew').addEventListener('click', startNewGame);
});

function startNewGame() {
    // Restablecer todo
    currentSelection = [];
    wordsFound = [];
    placedWords = [];

    // Filtramos palabras que son demasiado largas para la cuadrícula
    const validWords = words.filter(word => word.length <= gridSize);

    // Intentar crear un tablero válido (hasta 5 intentos)
    let attempts = 0;
    let success = false;

    while (!success && attempts < 5) {
        attempts++;
        wordGrid = generateEmptyGrid(gridSize);
        placedWords = [];

        // Intentar colocar todas las palabras válidas
        success = placeAllWordsInGrid(validWords, wordGrid);
    }

    if (!success) {
        // Si después de varios intentos no se pueden colocar todas, reducir expectativas
        wordGrid = generateEmptyGrid(gridSize);
        placedWords = [];
        placeWordsInGrid(validWords, wordGrid);
    }

    fillEmptyCells(wordGrid);
    renderGrid(wordGrid);
    renderWordsList(placedWords); // Solo mostrar las palabras realmente colocadas

    console.log("Palabras colocadas:", placedWords);
}

function generateEmptyGrid(size) {
    return Array(size).fill(null).map(() => Array(size).fill('_'));
}

function placeAllWordsInGrid(words, grid) {
    // Ordenamos las palabras de más larga a más corta para colocar primero las más difíciles
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (let word of sortedWords) {
        if (!placeWordInGrid(word, grid)) {
            return false; // Si no pudimos colocar alguna palabra, fallamos
        }
    }

    return true; // Éxito, colocamos todas las palabras
}

function placeWordsInGrid(words, grid) {
    // Intentar colocar tantas palabras como sea posible
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    sortedWords.forEach(word => {
        placeWordInGrid(word, grid);
    });
}

function placeWordInGrid(word, grid) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
        attempts++;

        // Elegimos dirección aleatoria: 0 = horizontal, 1 = vertical, 2 = diagonal
        const direction = Math.floor(Math.random() * 3);

        let row, col;

        if (direction === 0) { // Horizontal
            row = Math.floor(Math.random() * gridSize);
            col = Math.floor(Math.random() * (gridSize - word.length + 1));

            if (canPlaceWordHorizontally(word, grid, row, col)) {
                for (let i = 0; i < word.length; i++) {
                    grid[row][col + i] = word[i];
                }
                placed = true;
            }
        } else if (direction === 1) { // Vertical
            row = Math.floor(Math.random() * (gridSize - word.length + 1));
            col = Math.floor(Math.random() * gridSize);

            if (canPlaceWordVertically(word, grid, row, col)) {
                for (let i = 0; i < word.length; i++) {
                    grid[row + i][col] = word[i];
                }
                placed = true;
            }
        } else { // Diagonal
            row = Math.floor(Math.random() * (gridSize - word.length + 1));
            col = Math.floor(Math.random() * (gridSize - word.length + 1));

            if (canPlaceWordDiagonally(word, grid, row, col)) {
                for (let i = 0; i < word.length; i++) {
                    grid[row + i][col + i] = word[i];
                }
                placed = true;
            }
        }
    }

    if (placed) {
        placedWords.push(word);
    } else {
        console.log(`No se pudo colocar la palabra: ${word}`);
    }

    return placed;
}

function canPlaceWordHorizontally(word, grid, row, col) {
    for (let i = 0; i < word.length; i++) {
        if (col + i >= gridSize || (grid[row][col + i] !== '_' && grid[row][col + i] !== word[i])) {
            return false;
        }
    }
    return true;
}

function canPlaceWordVertically(word, grid, row, col) {
    for (let i = 0; i < word.length; i++) {
        if (row + i >= gridSize || (grid[row + i][col] !== '_' && grid[row + i][col] !== word[i])) {
            return false;
        }
    }
    return true;
}

function canPlaceWordDiagonally(word, grid, row, col) {
    for (let i = 0; i < word.length; i++) {
        if (row + i >= gridSize || col + i >= gridSize ||
            (grid[row + i][col + i] !== '_' && grid[row + i][col + i] !== word[i])) {
            return false;
        }
    }
    return true;
}

function fillEmptyCells(grid) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === '_') {
                grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
}

function renderGrid(grid) {
    const container = document.getElementById('wordSearchContainer');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellElement = document.createElement('div');
            cellElement.textContent = grid[row][col];
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            cellElement.addEventListener('click', handleCellClick);
            container.appendChild(cellElement);
        }
    }
}

function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    // Si es la primera selección o es adyacente a la última selección
    if (currentSelection.length === 0 || isAdjacent(row, col)) {
        const cellKey = `${row}-${col}`;
        const cellIndex = currentSelection.findIndex(cell => cell.key === cellKey);

        if (cellIndex === -1) {
            // Añadir a la selección
            event.target.classList.add('selected');
            currentSelection.push({
                key: cellKey,
                row: row,
                col: col,
                element: event.target
            });

            checkForWord();
        } else if (cellIndex === currentSelection.length - 1) {
            // Deshacer la última selección
            event.target.classList.remove('selected');
            currentSelection.pop();
        }
    }
}

function isAdjacent(row, col) {
    if (currentSelection.length === 0) return true;

    const lastCell = currentSelection[currentSelection.length - 1];
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);

    // Es adyacente si está en una celda contigua (horizontal, vertical o diagonal)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

function checkForWord() {
    const selectedWord = currentSelection.map(cell => {
        return wordGrid[cell.row][cell.col];
    }).join('');

    // Comprobar si la palabra está en la lista y no ha sido encontrada ya
    if (placedWords.includes(selectedWord) && !wordsFound.includes(selectedWord)) {
        wordsFound.push(selectedWord);

        // Marcar las celdas como encontradas
        currentSelection.forEach(cell => {
            cell.element.classList.remove('selected');
            cell.element.classList.add('found');
        });

        // Marcar la palabra en la lista
        document.querySelector(`[data-word="${selectedWord}"]`).classList.add('found');

        // Reiniciar la selección actual
        currentSelection = [];

        // Comprobar si se han encontrado todas las palabras
        if (wordsFound.length === placedWords.length) {
            setTimeout(() => {
                alert('¡Has ganado! Has encontrado todas las palabras.');
                startNewGame();
            }, 500);
        } else {
            alert(`¡Has encontrado la palabra "${selectedWord}"!`);
        }
    } else if (currentSelection.length > 1) {
        // Comprobar si la palabra puede seguir creciendo
        const potentialMatches = placedWords.filter(word =>
            word.startsWith(selectedWord) && word.length > selectedWord.length
        );

        if (potentialMatches.length === 0) {
            // No hay posibles coincidencias, reiniciar selección
            currentSelection.forEach(cell => {
                cell.element.classList.remove('selected');
            });
            currentSelection = [];
        }
    }
}

function renderWordsList(words) {
    const wordsListContainer = document.getElementById('wordsList');
    wordsListContainer.innerHTML = '';

    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.textContent = word;
        wordElement.setAttribute('data-word', word);

        if (wordsFound.includes(word)) {
            wordElement.classList.add('found');
        }

        wordsListContainer.appendChild(wordElement);
    });
}