const game      = document.querySelector('.game');
const cells     = document.querySelectorAll('.game > li');

// Empty cells are set to their index, occupied cells are set to a string ('x' or 'o')
const board     = [
  0, 1, 2,
  3, 4, 5,
  6, 7, 8
];
const allCombos = ['012', '345', '678', '036', '147', '258', '048', '246'];





/**
 * Resets board and sets current player to 'x'
 */
function newGame() {
  
  for (let i = 0; i < board.length; i++) {

    // Clear cells
    cells[i].className = 'empty';

    // Clear board
    board[i] = i;
  }

  // Current player. If empty, game is over
  game.id = 'x';
}

// Start new game when page loads
newGame();





/**
 * If cell is empty and game is running, place current player's mark in selected position then
 * change players. Computer makes move after human player
 * 
 * @param {number} pos - Index on board
 */
function makeMove(pos) {

  // If game is not running or position on board is not empty, return
  if (!game.id || (typeof board[pos] !== 'number')) return;

  // Set cell's class to current player
  cells[pos].className = game.id;

  // Set position on board to current player
  board[pos]           = game.id;

  // If game is over, remove current player. Otherwise, change current player
  game.id              = isGameOver() ? '' : (game.id === 'x') ? 'o' : 'x';

  // If computer player's turn, make move using minimax function
  if (game.id === 'o') makeMove(minimax().bestMove);
}





/**
 * Gets winning combination played by player if there is one
 * @param   {string} player     - 'x' or 'o' depending on player
 * @returns { (string | null) } - Indices of winning combo if there is one
 */
function getWinCombo(player) {

  for (let c of allCombos) {

    // If all three indices on gameboard have been set by this player, return winning combination
    if ((board[c[0]] === player) && (board[c[1]] === player) && (board[c[2]] === player)) return c;
  }

  // If no winning combination has been played, return null
  return null;
}





/**
 * Gets list of indices for empty cells if there are any
 * @returns { (Array | null) } - List of indices for empty cells in gameboard
 */
function getEmptyCells() {

  // List containing only indices of empty cells
  const  list = board.filter(el => (typeof el === 'number'));

  // If list contains anything, return list. Otherwise, return null
  return list.length ? list : null;
}





/**
 * Checks if the game is over. If so, it dims the necessary cells to show that the game is over
 * @returns {boolean} - Whether the game is over
 */
function isGameOver() {

  // Winning combination made by current player
  const  winCombo = getWinCombo(game.id);

  // If there is a winning combination, dim all cells except the winning combo and return true.
  // If there is any empty cells left, return false. Otherwise, dim all cells and return true
  return winCombo ? dimAllCells(winCombo) : getEmptyCells() ? false : dimAllCells();
}





/**
 * Dim all cells except the ones specified
 * @param   {Array} [exceptions = []] - Any cells to ignore
 * @returns {boolean}                 - Always returns true
 */
function dimAllCells(exceptions = []) {

  for (let i = 0; i < board.length; i++) {

    // If this index is not in the list of exceptions, add class 'dim' to cell
    if (!exceptions.includes(i)) cells[i].classList.add('dim');
  }

  // Always return true
  return true;
}





/**
 * Scans every option in the game and calculates the best possible move in the worst-case scenario
 * @param   {boolean} isMax - Whether the current player is the maximizer
 * @param   {number}  alpha - Maximizer's best possible score so far
 * @param   {number}   beta - Minimizer's best possible score so far
 * @returns {Object}        - Contains the best option's index and its score
 */
function minimax(isMax = true, alpha = -Infinity, beta = Infinity) {

  // If the maximizer gets a winning combination, game ends in their favor
  if (getWinCombo('o')) return {score:  1};

  // If the minimizer gets a winning combination, game ends in their favor
  if (getWinCombo('x')) return {score: -1};

  // If there are no empty cells, game ends in a tie. Neutral for both players
  if (!getEmptyCells()) return {score:  0};

  // The possible options are the empty cells, and the best move is unknown
  let [options, bestMove] = [getEmptyCells(), null];

  // Maximizer is 'o' starting with their worst possible score of -Infinity
  // Minimizer is 'x' starting with their worst possible score of +Infinity
  let [player,     score] = isMax ? ['o', -Infinity] : ['x', Infinity];
  
  // Loop through the future possibilities and get the index of the cell being played
  for (let index of options) {
    
    // Make a move in the board
    board[index] = player;

    // Resulting score of the move made is found by recursing into this function playing as the
    // opposite player and passing down the best known scores for both players
    const result = minimax(!isMax, alpha, beta).score;

    // Undo the move so board isn't changed for next move
    board[index] = index;
    
    // If the maximizer has found a new best option, this index is saved as the best move and
    // the best and current scores are updated
    if (isMax  && result > alpha) [bestMove, score, alpha] = [index, result, result];

    // Same applies to the minimizer
    if (!isMax && result <  beta) [bestMove, score,  beta] = [index, result, result];

    // If this result is equal to or better than your opponent's already-known best option (from
    // earlier in the game), stop looking for better results, since your opponent will choose to
    // avoid this route if it's not equally as good or better than their best option from earlier.
    // e.g. if this option results in a tie or a win for you, and your opponent knows they could
    // have won or at least blocked you from winning earlier in the game, assume they will do so
    if (alpha >= beta) break;
  }

  // Score is used for the algorithm, and the best move is used for the game
  return {score, bestMove};
}