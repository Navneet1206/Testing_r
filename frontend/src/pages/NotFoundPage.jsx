import React, { useState } from 'react';

const NotFoundPage = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStatus, setGameStatus] = useState('');

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every(square => square) ? 'Draw' : null;
  };

  const handleClick = (index) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const winner = calculateWinner(newBoard);
    if (winner) {
      setGameStatus(winner === 'Draw' ? "It's a draw!" : `${winner} wins!`);
    }
    
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 404 Section */}
      <div className="text-center mb-12">
        <h1 className="text-8xl font-bold text-gray-700 mb-4 animate-bounce">
          4<span className="text-blue-500">0</span>4
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Oops! This page seems to be lost in space...
        </p>
        <p className="text-lg text-gray-500 mb-6">
          While you're here, fancy a game of tic-tac-toe?
        </p>
      </div>

      {/* Game Section */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className={`w-20 h-20 flex items-center justify-center text-2xl font-bold 
                ${cell ? 'bg-white' : 'bg-gray-50'} 
                border-2 border-gray-200 rounded-lg
                hover:bg-gray-100 transition-colors
                ${cell === 'X' ? 'text-blue-500' : 'text-pink-500'}`}
            >
              {cell}
            </button>
          ))}
        </div>

        {/* Game Status */}
        <div className="text-center mb-4">
          {!gameStatus && (
            <p className="text-lg text-gray-600">
              Next player: {isXNext ? 'X' : 'O'}
            </p>
          )}
          {gameStatus && (
            <p className="text-xl font-semibold text-blue-500">
              {gameStatus}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reset Game
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>

      {/* Easter Egg Message */}
      <p className="text-sm text-gray-400 mt-8">
        Lost and found: You discovered our secret game! 🎮
      </p>
    </div>
  );
};

export default NotFoundPage;