import React, { useState, useEffect, useRef } from 'react';
import ThreeFiberLock from '../components/threeFiberLock';
import '../layouts/popalock.css';
import Navbar from '../components/navBar';


const NUMBER_LENGTH = 3; // Number of digits in the target number
const MAX_ATTEMPTS = 2;  // Maximum number of guesses
type Feedback = 'correct' | 'present' | 'absent';

const PopALock: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<Feedback[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [correctDigits, setCorrectDigits] = useState<string[]>([]);
  const [incorrectDigits, setIncorrectDigits] = useState<string[]>([]);
  const [wrongPlaceDigits, setWrongPlaceDigits] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const lockRef = useRef<{
    openLock(): unknown; shakeLockAnimation: () => void; closeLock: () => unknown;
  }>(null);

  const handleCloseLock = () => {
    if (lockRef.current) {
      console.log('Closing lock');
      lockRef.current.closeLock(); // Call the child's closeLock
    }
  };
  const handleShakeLock = () => {
    if (lockRef.current) {
      console.log('Shaking lock');
      lockRef.current.shakeLockAnimation(); // Call the child's shakeLockAnimation
    }
  };

  const handleOpenLock = () => {
    if (lockRef.current) {
      console.log('Opening lock');
      lockRef.current.openLock(); // Call the child's openLock
    }
  };
  // Generate a random target number when the component mounts
  useEffect(() => {
    generateTargetNumber();

  }, []);



  const handleSquareClick = () => {
    inputRef.current?.focus();

  }


  const generateTargetNumber = () => {
    const randomNumber = Math.floor(100 + Math.random() * 900).toString();
    setTargetNumber(randomNumber);
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameStatus !== 'playing') return;

    if (e.key === 'Enter') {
      submitGuess();
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^\d$/.test(e.key)) {
      if (currentGuess.length < NUMBER_LENGTH) {
        setCurrentGuess(currentGuess + e.key);
      }
    }
  };

  // Handle number pad button clicks
  const handleButtonClick = (digit: string) => {
    if (gameStatus !== 'playing') return;

    if (digit === 'Enter') {
      submitGuess();
    } else if (digit === 'Del') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else {
      if (currentGuess.length < NUMBER_LENGTH) {
        setCurrentGuess(currentGuess + digit);
      }
    }
  };

  const submitGuess = () => {
    if (currentGuess.length === NUMBER_LENGTH) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);

      const newCorrectDigits: string[] = [...correctDigits];
      const newIncorrectDigits: string[] = [...incorrectDigits];
      const newWrongPlaceDigits: string[] = [...wrongPlaceDigits];

      // Compute feedback for each digit
      const feedback = currentGuess.split('').map((digit, index) => {
        if (digit === targetNumber[index]) {
          if (!newCorrectDigits.includes(digit)) newCorrectDigits.push(digit);
          return 'correct';
          
        } else if (targetNumber.includes(digit)) {
          if (!newWrongPlaceDigits.includes(digit)) newWrongPlaceDigits.push(digit);
          handleShakeLock();
          return 'present';
        } else {
          if (!newIncorrectDigits.includes(digit)) newIncorrectDigits.push(digit);
          handleShakeLock();
          return 'absent';
        }
      });

      setGuessResults([...guessResults, feedback]);
      setCurrentGuess('');
      setCorrectDigits(newCorrectDigits);
      setIncorrectDigits(newIncorrectDigits);
      setWrongPlaceDigits(newWrongPlaceDigits);

      if (currentGuess === targetNumber) {
        handleOpenLock();
        setGameStatus('won');
      } else if (newGuesses.length === MAX_ATTEMPTS) {
        setGameStatus('lost');
      }
    } else {
      handleShakeLock();
    }
  };

  // Reset the game
  const resetGame = () => {
    setGuesses([]);
    setGuessResults([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setCorrectDigits([]);
    setIncorrectDigits([]);
    setWrongPlaceDigits([]);
    generateTargetNumber();
    handleCloseLock();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 pt-0 mt-0">
      <div className="w-screen h-full flex justify-center items-center"><Navbar/></div>
      <div className="w-full h-full flex justify-center">
      <ThreeFiberLock ref={lockRef} />
      </div>

      {/* Guesses Grid */}
      <div className="grid grid-rows-2 gap-2 mb-8">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-2">
            {Array.from({ length: NUMBER_LENGTH }).map((_, colIndex) => {
              const guessRow = guesses[rowIndex];
              const guessDigit = guessRow ? guessRow[colIndex] : (rowIndex === guesses.length && currentGuess[colIndex]) || '';
              const feedback = guessResults[rowIndex]?.[colIndex];

              const cellClass = feedback === 'correct'
                ? 'bg-green-500 border-green-500'
                : feedback === 'present'
                ? 'bg-yellow-500 border-yellow-500'
                : feedback === 'absent'
                ? 'bg-gray-700 border-gray-700'
                : 'border-gray-500';

              const shouldAnimate = Boolean(feedback);
              const animationDelay = `${colIndex * 0.2}s`; // Delay between flips

              return (
                <div
                  key={colIndex}
                  className={`w-16 h-16 border-2 ${cellClass} flex items-center justify-center text-2xl font-bold text-white ${shouldAnimate ? 'flip-animation' : ''}`}
                  style={{ animationDelay: animationDelay }}
                  onClick={handleSquareClick}
                >
                  {guessDigit}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      {gameStatus === 'playing' && (
        <div className="flex flex-row gap-2 flex-wrap justify-center">
          {['Del', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0','Enter'].map((digit) => {
            let bgColor = 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800';

            if (correctDigits.includes(digit)) {
              bgColor = 'bg-green-500';
            } else if (incorrectDigits.includes(digit)) {
              bgColor = 'bg-red-500';
            } else if (wrongPlaceDigits.includes(digit)) {
              bgColor = 'bg-yellow-500';
            }

            return (
              <button
                key={digit}
                onClick={() => handleButtonClick(digit)}
                className={`${bgColor} text-white font-bold py-4 rounded p-3 pt-1 pb-1 shadow-2xl`}
                aria-label={digit === 'Del' ? 'Delete' : digit}
              >
                <p className="text-center text-lg">{digit}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Hidden input to capture keyboard events */}
      {gameStatus === 'playing' && (
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 w-0 h-0"
          onKeyDown={handleKeyDown}
          autoFocus
        />
      )}

      {/* Game status messages */}
      {gameStatus === 'won' && (
        <div className="mt-8 text-green-500 text-2xl text-center">
          🎉 Congratulations! You guessed the number!
          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded"
          >
            Play Again
          </button>
        </div>
      )}
      {gameStatus === 'lost' && (
        <div className="mt-8 text-red-500 text-2xl text-center">
          😞 Game Over! The number was {targetNumber}.
          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded"
          >
            Try Again
          </button>
        </div>
      )}
      <h1 className="mt-8 text-lg">Created with ❤️ & ☕ by <a className='underline' href="https://dement.dev" target="_blank" rel="noopener noreferrer">Jacob Dement</a></h1>
    </div>
  );
};

export default PopALock;