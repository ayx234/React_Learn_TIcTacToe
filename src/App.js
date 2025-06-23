/** @format */

/* 

*/

import { useState } from "react";

function Square({ value, onSquareClick, winningLines, squareNum }) {
	// highlight button when there's a winner
	if (winningLines && winningLines.includes(squareNum)) {
		return (
			<button
				className="square"
				onClick={onSquareClick}
				style={{ backgroundColor: "rgba(255, 251, 0, 0.5)" }}
			>
				{value}
			</button>
		);
	}
	// default: now winner yet/draw
	return (
		<button className="square" onClick={onSquareClick}>
			{value}
		</button>
	);
}

function Board({ xIsNext, squares, onPlay, handleMovesLocations }) {
	function handleClick(i) {
		if (squares[i] || calculateWinner(squares)) return;
		const nextSquares = squares.slice();
		nextSquares[i] = xIsNext ? "X" : "O";
		onPlay(nextSquares);
	}

	const winingStatus = calculateWinner(squares);
	const status = winingStatus
		? !winingStatus.winningPlayer
			? "Draw!!"
			: `Winner: ${winingStatus.winningPlayer}`
		: `Next player: ${xIsNext ? "X" : "O"}`;

	return (
		<>
			<div className="status">{status}</div>
			{Array.from({ length: 3 }, (_, i) => (
				<div className="board-row" key={i}>
					{Array.from({ length: 3 }, (_, j) => {
						const squareNum = i * 3 + j;
						return (
							<Square
								value={squares[squareNum]}
								onSquareClick={() => {
									handleClick(squareNum);
									handleMovesLocations(squareNum);
								}}
								key={squareNum}
								winningLines={winingStatus?.winningLines}
								squareNum={squareNum}
							/>
						);
					})}
				</div>
			))}
		</>
	);
}

export default function Game() {
	const [history, setHistory] = useState([new Array(9).fill(null)]);
	const [currentMove, setCurrentMove] = useState(0);
	const [movesLocations, setMovesLocations] = useState([null]);
	const [descendingMoves, setDescendingMoves] = useState(false);
	const xIsNext = currentMove % 2 === 0;
	const currentSquares = history[currentMove];

	function handlePlay(nextSquares) {
		const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
		setHistory(nextHistory);
		setCurrentMove(nextHistory.length - 1);
	}

	function jumpTo(nextMove) {
		setCurrentMove(nextMove);
	}

	function handleMovesOrder() {
		setDescendingMoves(prevDescendingMoves => !prevDescendingMoves);
	}

	function handleMovesLocations(squareNum) {
		const squareNumCoordinates = {
			// SquareNum : [row,col]
			0: [1, 1],
			1: [1, 2],
			2: [1, 3],
			3: [2, 1],
			4: [2, 2],
			5: [2, 3],
			6: [3, 1],
			7: [3, 2],
			8: [3, 3],
		};

		const currentLocation = squareNumCoordinates[squareNum];
		const nextMovesLocations = [
			...movesLocations.slice(0, currentMove + 1),
			currentLocation,
		];
		setMovesLocations(nextMovesLocations);
	}

	const moves = history.map((squares, move, historyArr) => {
		if (move === historyArr.length - 1) {
			return <li key={move}>You are at move #{move}</li>;
		} else {
			const description =
				move > 0
					? `Go to move #${move} (${movesLocations[move][0]},${movesLocations[move][1]})`
					: "Go to game start";
			return (
				<li key={move}>
					<button onClick={() => jumpTo(move)}>{description}</button>
				</li>
			);
		}
	});

	descendingMoves ? moves.reverse() : null;

	return (
		<div className="game">
			<div className="game-board">
				<Board
					xIsNext={xIsNext}
					squares={currentSquares}
					onPlay={handlePlay}
					handleMovesLocations={handleMovesLocations}
				/>
			</div>
			<div className="game-info">
				<button
					className="btn-moves-direction"
					onClick={handleMovesOrder}
				>
					{descendingMoves
						? "Switch moves order to ascending"
						: "Switch moves order to descending"}
				</button>
				{descendingMoves ? <ol reversed>{moves}</ol> : <ol>{moves}</ol>}
			</div>
		</div>
	);
}

function calculateWinner(squares) {
	const finalStatus = { winningLines: null, winningPlayer: null };
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (
			squares[a] &&
			squares[a] === squares[b] &&
			squares[a] === squares[c]
		) {
			finalStatus.winningLines = lines[i];
			finalStatus.winningPlayer = squares[a];
			return finalStatus;
		}
	}
	if (!squares.includes(null)) return finalStatus;

	return null;
}
