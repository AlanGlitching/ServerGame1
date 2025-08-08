// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'ai'
let scores = { X: 0, O: 0 };

// DOM elements
const statusElement = document.getElementById('status');
const boardElement = document.getElementById('board');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Initialize the game
function initGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateStatus();
    updateBoard();
}

// Update the game status display
function updateStatus() {
    if (!gameActive) return;
    
    if (gameMode === 'ai' && currentPlayer === 'O') {
        statusElement.textContent = "AI is thinking...";
        statusElement.className = 'status player-o';
    } else {
        statusElement.textContent = `Player ${currentPlayer}'s turn`;
        statusElement.className = `status player-${currentPlayer.toLowerCase()}`;
    }
}

// Update the board display
function updateBoard() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.className = 'cell';
        if (board[index] === 'X') {
            cell.classList.add('x');
        } else if (board[index] === 'O') {
            cell.classList.add('o');
        }
    });
}

// Handle cell click
function handleCellClick(index) {
    if (board[index] !== '' || !gameActive) return;
    
    // Make the move
    makeMove(index);
    
    // If playing against AI and it's AI's turn, make AI move
    if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// Make a move
function makeMove(index) {
    board[index] = currentPlayer;
    updateBoard();
    
    // Check for win
    if (checkWin()) {
        handleGameEnd('win');
        return;
    }
    
    // Check for draw
    if (checkDraw()) {
        handleGameEnd('draw');
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

// Check for win
function checkWin() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinningCells(combination);
            return true;
        }
    }
    return false;
}

// Highlight winning cells
function highlightWinningCells(combination) {
    combination.forEach(index => {
        const cell = boardElement.querySelector(`[data-index="${index}"]`);
        cell.classList.add('winning');
    });
}

// Check for draw
function checkDraw() {
    return board.every(cell => cell !== '');
}

// Handle game end
function handleGameEnd(result) {
    gameActive = false;
    
    if (result === 'win') {
        scores[currentPlayer]++;
        statusElement.textContent = `Player ${currentPlayer} wins!`;
        statusElement.className = 'status winner';
    } else {
        statusElement.textContent = "It's a draw!";
        statusElement.className = 'status draw';
    }
    
    updateScore();
}

// Update score display
function updateScore() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

// AI move logic
function makeAIMove() {
    if (!gameActive) return;
    
    // Try to win
    let move = findWinningMove('O');
    
    // If no winning move, block opponent
    if (move === -1) {
        move = findWinningMove('X');
    }
    
    // If no blocking move, try to take center
    if (move === -1 && board[4] === '') {
        move = 4;
    }
    
    // If center is taken, try corners
    if (move === -1) {
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => board[i] === '');
        if (availableCorners.length > 0) {
            move = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
    }
    
    // If no strategic move, take any available cell
    if (move === -1) {
        const availableMoves = board.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
        if (availableMoves.length > 0) {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
    
    if (move !== -1) {
        makeMove(move);
    }
}

// Find winning move for a player
function findWinningMove(player) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        const cells = [board[a], board[b], board[c]];
        
        // Check if player has 2 cells and 1 empty
        const playerCount = cells.filter(cell => cell === player).length;
        const emptyCount = cells.filter(cell => cell === '').length;
        
        if (playerCount === 2 && emptyCount === 1) {
            // Find the empty cell
            if (board[a] === '') return a;
            if (board[b] === '') return b;
            if (board[c] === '') return c;
        }
    }
    return -1;
}

// Set game mode
function setGameMode(mode) {
    gameMode = mode;
    
    // Update button styles
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reset game
    resetGame();
}

// Reset game
function resetGame() {
    initGame();
}

// Reset score
function resetScore() {
    scores = { X: 0, O: 0 };
    updateScore();
    resetGame();
}

// Add event listeners to cells
function addCellListeners() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    addCellListeners();
    initGame();
});

// Add keyboard support
document.addEventListener('keydown', (event) => {
    if (!gameActive) return;
    
    const key = event.key;
    if (key >= '1' && key <= '9') {
        const index = parseInt(key) - 1;
        if (board[index] === '') {
            handleCellClick(index);
        }
    } else if (key === 'r' || key === 'R') {
        resetGame();
    } else if (key === 'n' || key === 'N') {
        resetScore();
    }
});

// Add touch support for mobile
let touchStartX, touchStartY;

boardElement.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

boardElement.addEventListener('touchend', (event) => {
    if (!touchStartX || !touchStartY) return;
    
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Reset touch coordinates
    touchStartX = null;
    touchStartY = null;
    
    // Simple tap detection (no significant movement)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const element = document.elementFromPoint(touchEndX, touchEndY);
        if (element && element.classList.contains('cell')) {
            const index = parseInt(element.getAttribute('data-index'));
            handleCellClick(index);
        }
    }
}); 