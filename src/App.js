/** @format */

import { useState } from "react";

/**
 * Square component represents a single square in the tic-tac-toe board.
 * @param {object} props
 * @param {string|null} props.value - The value to display ("X", "O", or null).
 * @param {function} props.onSquareClick - Handler for when the square is clicked.
 * @param {number[]|undefined} props.winingLines - Array of winning square indices, if any.
 * @param {number} props.squareNum - The index of this square.
 */
function Square({ value, onSquareClick, winingLines, squareNum }) {
	return (
		<button
			className="square"
			onClick={onSquareClick}
			style={
				// highlight button when there's a winner
				winingLines && winingLines.includes(squareNum)
					? { backgroundColor: "rgba(255, 251, 0, 0.5)" }
					: {}
			}
		>
			{value}
		</button>
	);
}

/**
 * Board component renders the tic-tac-toe board and handles user interactions.
 * @param {object} props
 * @param {boolean} props.xIsNext - True if "X" is the next player.
 * @param {string[]} props.squares - Current squares' status of the board.
 * @param {function} props.onPlay - Handler for when a move is made.
 * @param {function} props.handleCoordinates - Handler to record move coordinates.
 */
function Board({ xIsNext, squares, onPlay, handleCoordinates }) {
	/**
	 * Handles a click on a square.
	 * @param {number} i - The index of the clicked square.
	 */
	function handleClick(i) {
		// Ignore click if square is filled or game is over
		if (squares[i] || calculateWinner(squares)) return;
		const nextSquares = squares.slice();
		nextSquares[i] = xIsNext ? "X" : "O";
		onPlay(nextSquares);
	}

	const winingInfo = calculateWinner(squares);
	const winner = winingInfo?.winner;
	const winingLines = winingInfo?.winingLines;
	const isDraw = !squares.includes(null) && !winner;
	const status = winner
		? `Winner: ${winner}`
		: isDraw
		? "Draw!!"
		: `Next Player: ${xIsNext ? "X" : "O"}`;

	return (
		<>
			<div className="status">{status}</div>
			{/* Render 3x3 board */}
			{Array.from({ length: 3 }, (_, i) => (
				<div className="board-row" key={i}>
					{Array.from({ length: 3 }, (_, j) => {
						const squareNum = i * 3 + j;
						return (
							<Square
								key={squareNum}
								value={squares[squareNum]}
								onSquareClick={() => {
									handleClick(squareNum);
									handleCoordinates(squareNum);
								}}
								winingLines={winingLines}
								squareNum={squareNum}
							/>
						);
					})}
				</div>
			))}
		</>
	);
}

/**
 * Game component manages the state and logic for the tic-tac-toe game.
 */
export default function Game() {
	const [history, setHistory] = useState([new Array(9).fill(null)]);
	const [currentMove, setCurrentMove] = useState(0);
	const [isDescendingMoves, setIsDescendingMoves] = useState(false);
	const [playCoordinates, setPlayCoordinates] = useState([null]);

	const xIsNext = currentMove % 2 === 0;
	const currentSquares = history[currentMove];

	/**
	 * Handles a new move and updates the game history.
	 * @param {string[]} nextSquares - The new board state (values of squares).
	 */
	function handlePlay(nextSquares) {
		const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
		setHistory(nextHistory);
		setCurrentMove(nextHistory.length - 1);
	}

	/**
	 * Jumps to a specific move in the game history.
	 * @param {number} nextMove - The move index to jump to.
	 */
	function jumpTo(nextMove) {
		setCurrentMove(nextMove);
	}

	/**
	 * Toggles the order of the move list.
	 */
	function handleMovesOrder() {
		setIsDescendingMoves(!isDescendingMoves);
	}

	/**
	 * Records the coordinates of the move.
	 * @param {number} squareNum - The index of the square played.
	 */
	function handleCoordinates(squareNum) {
		const squareCoordinates = [
			// SquareNum : [row,col]
			[1, 1],
			[1, 2],
			[1, 3],
			[2, 1],
			[2, 2],
			[2, 3],
			[3, 1],
			[3, 2],
			[3, 3],
		];

		const currentLocation = squareCoordinates[squareNum];
		const nextMovesLocations = [
			...playCoordinates.slice(0, currentMove + 1),
			currentLocation,
		];
		setPlayCoordinates(nextMovesLocations);
	}

	// Generate the list of moves for display
	const moves = history.map((_, move) => {
		// is it the latest move?
		if (move === history.length - 1) {
			// is it also the first move?
			return move === 0 ? (
				<li key={move}>You are at move #{move}</li>
			) : (
				// this is the last move, but it is not the first move
				<li key={move}>
					You are at move #{move} ({playCoordinates[move][0]},
					{playCoordinates[move][1]})
				</li>
			);
		} else {
			// move is not the lastest one
			const description =
				move > 0
					? // board is not in initial state? (we have Xs on the board)
					  `Go to move #${move} (${playCoordinates[move]})`
					: // no plays yet
					  "Go to game start";
			return (
				<li key={move}>
					<button onClick={() => jumpTo(move)}>{description}</button>
				</li>
			);
		}
	});

	// Reverse moves if descending order is selected
	isDescendingMoves ? moves.reverse() : null;

	return (
		<div className="game">
			<div className="game-board">
				<Board
					xIsNext={xIsNext}
					squares={currentSquares}
					onPlay={handlePlay}
					handleCoordinates={handleCoordinates}
				/>
			</div>
			<div className="game-info">
				<button onClick={handleMovesOrder}>
					{isDescendingMoves
						? "Show moves in ascending order"
						: "Show moves in descending order"}
				</button>
				<hr />
				<ol
					style={{
						listStyleType: "none",
						paddingLeft: "0",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{moves}
				</ol>
			</div>
		</div>
	);
}

/**
 * Determines if there is a winner in the current board state.
 * @param {string[]} squares - The current board state.
 * @returns {{winner: string, winingLines: number[]} | null}
 */
function calculateWinner(squares) {
	const winingLines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < winingLines.length; i++) {
		const [a, b, c] = winingLines[i];
		if (
			squares[a] &&
			squares[a] === squares[b] &&
			squares[a] === squares[c]
		) {
			return { winner: squares[a], winingLines: winingLines[i] };
		}
	}

	// default: no wining line found
	return null;
}
