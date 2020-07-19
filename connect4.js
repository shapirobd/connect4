/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const WIDTH = 7; //number of columns on the board
const HEIGHT = 6; // number of rows on the board (aside from the top row that is clicked to place a piece on the board)

let currPlayer = 1; // active player: 1 or 2
const board = []; // array of rows, each row is array of cells  (board[y][x])

let p1Score = 0; // counter that increments by 1 every time player 1 places a piece onto the board
let p2Score = 0; //counter that increments by 1 every time player 2 places a piece onto the board
let hasListener; //set to true when the top row has an event listener on it, and set to false when the top row does not have an event listener on it - the event listener will be removed when the game ends, but will be added back once the player hits one of the reset buttons (having a boolean prevents me from accidentally adding two eventListeners)

//sound that plays when a player places a biece onto the board
const dingSound = new sound('https://freesound.org/data/previews/335/335908_5865517-lq.mp3');
//sound that plays when a player wins the game
const winSound = new sound('https://freesound.org/data/previews/274/274177_5123851-lq.mp3');

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
	// TODO: set "board" to empty HEIGHT x WIDTH matrix array
	for (let i = 0; i < HEIGHT; i++) {
		board.push([]);
		for (let j = 0; j < WIDTH; j++) {
			board[i].push('null');
		}
	}
	return board;
}

//updates the score of either player once they place a piece on the board - each score represent the number of turns that each player has taken. First the score is updated in localStorage, and then the score is updated in the DOM.
function updateScore(player, score) {
	localStorage.setItem(`p${player}CurrScore`, `${score}`);
	document.querySelector(`#p${player}-curr-score`).textContent = score;
	dingSound.play();
	// TODO: switch currPlayer 1 <-> 2
	currPlayer === 1 ? (currPlayer = 2) : (currPlayer = 1);
	const topRow = document.getElementById('column-top');
	const topRowArr = Array.from(topRow.querySelectorAll('td div'));
	//changes the class of the 'hover circles' in the top row so that the color of the hover circle corresponds to the current player
	topRowArr.map((div) => {
		div.className = `hover-piece-p${currPlayer}`;
	});
}

//loads high scores from localStorage into the DOM.
function loadHighScores() {
	//If the game has never been played, they are each set to zero in localStorage.
	if (localStorage.getItem('p1HighScore') === null || localStorage.getItem('p2HighScore') === null) {
		localStorage.setItem('p1HighScore', '0');
		localStorage.setItem('p2HighScore', '0');
	}
	//If either player's high score in localStorage is not zero at this point, the DOM is updated with their high score(s).
	if (localStorage.getItem('p1HighScore') !== '0') {
		document.querySelector('#p1-high-score').textContent = localStorage.getItem('p1HighScore');
	}
	if (localStorage.getItem('p2HighScore') !== '0') {
		document.querySelector('#p2-high-score').textContent = localStorage.getItem('p2HighScore');
	}
}

/** makeHtmlBoard: make HTML table and row of column tops. */
function makeHtmlBoard() {
	// TODO: get "htmlBoard" variable from the item in HTML w/ID of "board"
	const htmlBoard = document.createElement('table');
	htmlBoard.setAttribute('id', 'board');
	document.querySelector('#game').append(htmlBoard);

	// TODO: add comment for this code
	//Create a row, assign it to variable 'top', and then give it an ID of 'column-top'. We then add an eventListener to execute the 'handleClick' function when 'top' is clicked.
	//Next, create WIDTH ammount of 'td' cells, give each an ID of 0 thru WIDTH - 1 in order of creation, and then append each one in order before the next is created - then we append the entire 'column-top' row to 'htmlBoard'.
	const top = document.createElement('tr');
	top.setAttribute('id', 'column-top');
	top.addEventListener('click', handleClick);
	hasListener = true;
	let topCircle;
	for (let x = 0; x < WIDTH; x++) {
		const headCell = document.createElement('td');
		headCell.setAttribute('id', x);
		topCircle = document.createElement('div');
		topCircle.setAttribute('id', x + 7);
		topCircle.className = 'hover-piece-p1';
		headCell.append(topCircle);
		top.append(headCell);
	}
	htmlBoard.append(top);

	// TODO: add comment for this code
	//Create HEIGHT amount of 'tr' rows (each one declared with the varaible name 'row') by using a for loop with 'y' being the incrementing variable.  For each row, create WIDTH amount of 'td' cells (each one declared with the variable name 'cell') by using a nested for loop with 'x' being the incrememnting variable. Give each cell the unique ID of 'y-x' and append each cell to the corresponding row. Append each 'row' to 'htmlBoard' at the end of each iteration of the parent for loop.
	for (let y = HEIGHT - 1; y >= 0; y--) {
		const row = document.createElement('tr');
		for (let x = 0; x < WIDTH; x++) {
			const cell = document.createElement('td');
			cell.setAttribute('id', `${y}-${x}`);
			const cellWrap = document.createElement('div');
			cellWrap.classList.add('cell-wrapper');
			cell.append(cellWrap);
			row.append(cell);
		}
		htmlBoard.append(row);
	}
	// const backLayer = document.createElement('div');
	// htmlBoard.append(backLayer);
}

/** findSpotForCol: given column x, return top empty y (null if filled) */
function findSpotForCol(x) {
	//for each row in 'board', find the first row where its cell at column 'x' does not contain a piece.
	let y = board.findIndex((row) => {
		return row[x] === 'null';
	});
	//if there is no row 'y' that contains an empty cell at column 'x', return null
	if (y === -1) {
		return null;
	}
	return y;
}

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
	// TODO: make a div and insert into correct table cell
	//p1 class has a red background & p2 class has a blue background
	let className = 'p1';
	if (currPlayer === 2) {
		className = 'p2';
	}
	// the 'y' in fall-r${y} determins how long the animation will take to fall to its spot, which will also help determine when the sound for it being placed will play
	const piece = document.createElement('div');
	piece.classList.add('piece', className, `fall-r${y}`);

	//piece is placed into appropriate cell
	const pieceCell = document.getElementById(`${y}-${x}`);
	pieceCell.querySelector('.cell-wrapper').append(piece);
}

/** endGame: announce game end */

function endGame(msg) {
	// TODO: pop up alert message
	setTimeout(() => {
		alert(msg);
	}, 300);
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
	// get x from ID of clicked cell
	let x;
	if (evt.target.tagName === 'DIV') {
		x = +evt.target.id - 7;
	} else {
		x = +evt.target.id;
	}
	console.log(evt.target.tagName + ' : ' + x);
	// get next spot in column (if none, ignore click)
	var y = findSpotForCol(x);
	if (y === null) {
		return;
	}

	// place piece in board and add to HTML table
	// TODO: add line to update in-memory board
	board[y][x] = currPlayer;
	placeInTable(y, x);

	//if player 1 is the player who just played a piece, increment their score by 1
	if (currPlayer === 1) {
		p1Score++;
		//update player 1's new score in the DOM once the falling animation is complete
		for (let i = 0; i < HEIGHT; i++) {
			if (y === i) {
				setTimeout(() => {
					updateScore(currPlayer, p1Score);
				}, 300 - 30 * i);
			}
		}
		//if player 2 is the player who just played a piece, increment their score by 1
	} else {
		p2Score++;
		//update player 2's new score in the DOM once the falling animation is complete
		for (let i = 0; i < HEIGHT; i++) {
			if (y === i) {
				setTimeout(() => {
					updateScore(currPlayer, p2Score);
				}, 300 - 30 * i);
			}
		}
	}

	// check for win
	if (checkForWin()) {
		//remove eventListener from the top row so that no more pieces can be placed
		const topRow = document.getElementById('column-top');
		topRow.removeEventListener('click', handleClick);
		hasListener = false;

		//time the winSound to play once the falling animation ends
		for (let i = 0; i < HEIGHT; i++) {
			if (y === i) {
				setTimeout(() => {
					winSound.play();
				}, 300 - 30 * i);
			}
		}
		//change colors of elements depending on who wins
		for (let i = 0; i < HEIGHT; i++) {
			//if player 1 wins...
			if (currPlayer === 1) {
				//set the color change to happen once the falling animation ends
				setTimeout(() => {
					//make player 2's score limegreen and replace the blue in the linear gradient in the background with black so that only red & black appears
					document.querySelector('#p1-curr-score').style.color = 'limegreen';
					document.querySelector('#score-panel').style.backgroundImage =
						'linear-gradient(to bottom left, rgba(255, 49, 49), black)';
					//if player 1's winning score is better their high score OR this is their first time winning, set their high score in localStorage & in the DOM to be their current score, and turn their high score in the DOM limegreen
					if (localStorage.getItem('p1HighScore') > p1Score || localStorage.getItem('p1HighScore') === '0') {
						localStorage.setItem('p1HighScore', p1Score);
						document.querySelector('#p1-high-score').textContent = p1Score;
						document.querySelector('#p1-high-score').style.color = 'limegreen';
					}
				}, 300 - 30 * 1);

				//if player 2 wins...
			} else {
				//set the color change to happen once the falling animation ends
				setTimeout(() => {
					//make player 2's score limegreen and replace the red in the linear gradient in the background with black so that only blue & black appears
					document.querySelector('#p2-curr-score').style.color = 'limegreen';
					document.querySelector('#score-panel').style.backgroundImage =
						'linear-gradient(to bottom left, black, rgba(38, 38, 255)';
					//if player 2's winning score is better their high score OR this is their first time winning, set their high score in localStorage & in the DOM to be their current score, and turn their high score in the DOM limegreen
					if (localStorage.getItem('p2HighScore') > p2Score || localStorage.getItem('p2HighScore') === '0') {
						localStorage.setItem('p2HighScore', p2Score);
						document.querySelector('#p2-high-score').textContent = p2Score;
						document.querySelector('#p2-high-score').style.color = 'limegreen';
					}
				}, 300 - 30 * 1);
			}
		}
		return endGame(`Player ${currPlayer} won!`);
	}

	// check for tie
	// TODO: check if all cells in board are filled; if so call, call endGame
	let isTie = board.every((row) => {
		return row.every((slot) => {
			return slot !== 'null';
		});
	});
	if (isTie) {
		endGame("It's a tie!");
	}
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
	function _win(cells) {
		// Check four cells to see if they're all color of current player
		//  - cells: list of four (y, x) cells
		//  - returns true if all are legal coordinates & all match currPlayer

		return cells.every(([ y, x ]) => y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH && board[y][x] === currPlayer);
	}

	// TODO: read and understand this code. Add comments to help you.
	//Create a for loop that uses the variable 'y' to iterate through the board row by row. Then, create a nested for loop that uses the variable 'x' to iterate thorugh each row cell by cell (or column by column) within the current row in the loop. For each iteration thorugh the nested loop, create 4 variables: horiz, vert, diagDR, diagDL (each being an array consisting of four sub-arrays, each subarray consisting of a potentially modified 'x,y coordinate')
	//
	//horiz: each subarray has the same 'y' value, but the 'x' value starts at 'x' in the first subarray and increments by 1 for each subsequent subarray. This means that 'horiz' represents a horizontal row pieces within row 'y'
	//vert: each subarray has the same 'x' value, but the 'y' value starts at 'y' in the first subarray and increments by 1 for each subsequent subarray. This means that 'vert' represents a vertical column of pieces within column 'x'
	//diagDR: the 'x' value starts at 'x' in the first subarray and increments by 1 for each subsequent subarray, and the 'y' value starts at 'y' in the first subarray and increments by 1 for each subsequent subarray. This means that 'diagDR' represents a diagonal series of 4 pieces that go down-right (I edited my code however to where row 0 is on the bottom instead of the top like it was originally written, so diagDR should be called diagDL and vise versa)
	//diagDL: the 'x' value starts at 'x' in the first subarray and decrements by 1 for each subsequent subarray, and the 'y' value starts at 'y' in the first subarray and increments by 1 for each subsequent subarray. This means that 'diagDL' represents a diagonal series of 4 pieces that go down-left (I edited my code however to where row 0 is on the bottom instead of the top like it was originally written, so diagDR should be called diagDL and vise versa)
	//
	//at the end of each iteration through the nested loop, there is an if statement to check if the _win function returns true when either 'horiz', 'vert', 'diagDR' or 'diagDL' is used as a parameter.
	for (var y = 0; y < HEIGHT; y++) {
		for (var x = 0; x < WIDTH; x++) {
			var horiz = [ [ y, x ], [ y, x + 1 ], [ y, x + 2 ], [ y, x + 3 ] ];
			var vert = [ [ y, x ], [ y + 1, x ], [ y + 2, x ], [ y + 3, x ] ];
			var diagDR = [ [ y, x ], [ y + 1, x + 1 ], [ y + 2, x + 2 ], [ y + 3, x + 3 ] ];
			var diagDL = [ [ y, x ], [ y + 1, x - 1 ], [ y + 2, x - 2 ], [ y + 3, x - 3 ] ];

			if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
				return true;
			}
		}
	}
}

let resetBtn = document.querySelector('#reset'); // 'reset game' button
let resetSection = document.querySelector('#reset-section'); //div that contains the reset buttons

//Event listener is added to resetSection to handle one of the two reset buttons being clicked
resetSection.addEventListener('click', (e) => {
	e.preventDefault();

	//if the 'Reset All' button specifically is clicked, localStorage is cleared and all of the high scores in the DOM are erased
	if (e.target.id === 'memory') {
		localStorage.clear();
		document.querySelector('#p1-high-score').innerText = '';
		document.querySelector('#p2-high-score').innerText = '';
	}
	//if either 'Reset All' or 'Reset Game' are clicked, erase the current scores from localStorage and the DOM, and reset the game board
	if (e.target.id === 'reset' || e.target.id === 'memory') {
		localStorage.setItem('p1CurrScore', '0');
		localStorage.setItem('p2CurrScore', '0');
		//reset the score counter variable for each player
		p1Score = 0;
		p2Score = 0;
		//removes all pieces from the board
		let allPieces = Array.from(document.querySelectorAll('.piece'));
		for (let piece of allPieces) {
			piece.remove();
		}
		//erases the current socres from the DOM
		document.querySelector('#p1-curr-score').innerText = '';
		document.querySelector('#p2-curr-score').innerText = '';
		//resets the 'board' variable to represent an empty board
		for (i = 0; i < board.length; i++) {
			for (j = 0; j < board[i].length; j++) {
				board[i][j] = 'null';
			}
		}
		//put the most up-to-date high scores from localStorage in the DOM
		loadHighScores();
		//if the reset button was hit after the game had ended (which means the eventListener on the top row to add a new piece was removed), add an eventListener to the topRow.
		if (hasListener === false) {
			const topRow = document.getElementById('column-top');
			topRow.addEventListener('click', handleClick);
			const topRowArr = Array.from(topRow.querySelectorAll('td div'));
		}
		hasListener = true;
		//change back to player 1, regardless of which player won the last game
		currPlayer = 1;
		//for each hover piece on the top row, make them red so that they correspond with player 1
		for (let x = 0; x < WIDTH; x++) {
			const headCell = document.getElementById(`${x}`);
			const topCircle = headCell.querySelector('div');
			topCircle.className = 'hover-piece-p1';
		}
		//since the winner's score becomes green after winning, reset both player's current scores to be white
		document.querySelector('#p1-curr-score').style.color = 'white';
		document.querySelector('#p2-curr-score').style.color = 'white';
		//since the winner's high score becomes green if it's a new high score of theirs, reset both player's high scores to be red for player 1 and blue for player 2
		document.querySelector('#p1-high-score').style.color = 'rgb(255, 49, 49)';
		document.querySelector('#p2-high-score').style.color = 'rgb(38, 38, 255)';
		//since the background image for the score panel changes depending on who wins, reset it to it's original color gradient
		document.querySelector('#score-panel').style.backgroundImage =
			'linear-gradient(to bottom left, rgb(255, 49, 49), rgb(38, 38, 255))';
	}
});

//accepts an audio file (or url to an audio file) as a parameter and makes a sound out of it that can be played or stopped
function sound(src) {
	this.sound = document.createElement('audio');
	this.sound.src = src;
	this.sound.setAttribute('preload', 'auto');
	this.sound.setAttribute('controls', 'none');
	this.sound.style.display = 'none';
	document.body.appendChild(this.sound);
	this.play = function() {
		this.sound.play();
	};
	this.stop = function() {
		this.sound.pause();
	};
}

makeBoard();
makeHtmlBoard();
loadHighScores();
