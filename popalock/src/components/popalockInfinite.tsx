import React, { useState, useEffect, useRef } from 'react';
import ThreeFiberLock from './threeFiberLock';
import '../layouts/popalock.css';
import Navbar from './navBarInfinite';

const NUMBER_LENGTH = 3; // Number of digits in the target number
const MAX_ATTEMPTS = 4;  // Maximum number of guesses
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hintOne, setHintOne] = useState<string>('');
  const [hintTwo, setHintTwo] = useState<string>('');
  const [hintThree, setHintThree] = useState<string>('');
  const [jokeLog, setJokeLog] = useState<string>('749');


  const inputRef = useRef<HTMLInputElement>(null);
  const lockRef = useRef<{
    openLock(): unknown;
    shakeLockAnimation: () => void;
    closeLock: () => unknown;
  }>(null);

  const handleCloseLock = () => {
    if (lockRef.current) {
      lockRef.current.closeLock(); // Call the child's closeLock
    }
  };

  const createHintThree= () => {
    const correctDigits = targetNumber.split('');
      // Step 1: Randomly select an index to change
  const indexToChange = Math.floor(Math.random() * 3);

  // Step 2: Create a new random digit for the selected index (different from the original)
  let newDigit: string;
  do {
    newDigit = Math.floor(Math.random() * 10).toString();
  } while (newDigit === correctDigits[indexToChange]);

  // Step 3: Get the two remaining correct digits
  const correctTwoDigits = correctDigits.filter((_, index) => index !== indexToChange);

  // Step 4: Shuffle the correct digits so they are not in their original positions
  const shuffledDigits = [correctDigits[1], correctDigits[0]]; // Since there are only 2, just swap them

  // Step 5: Reconstruct the new list
  const newNumbers = correctDigits.map((num, index) => {
    if (index === indexToChange) {
      return newDigit;
    } else {
      return shuffledDigits.shift()!;
    }
  });
  setHintThree(newNumbers.join(''));
  }

  const createHintTwo = () => {
    const correctDigits = targetNumber.split('');

  // Step 1: Create a pool of digits from 0 to 9
    const digitPool = Array.from({ length: 10 }, (_, i) => i.toString());

    // Step 2: Remove the digits in the original list from the pool
    const availableDigits = digitPool.filter(digit => !correctDigits.includes(digit));

    const newNumbers: string[] = [];
    while (newNumbers.length < 3) {
      const randomIndex = Math.floor(Math.random() * availableDigits.length);
      newNumbers.push(availableDigits.splice(randomIndex, 1)[0]);
    }
    setHintTwo(newNumbers.join(''));
  }

  const createHintOne = () => {
    const correctDigits = targetNumber.split('');

    const indexToKeep = Math.floor(Math.random() * 3);

    // Step 2: Generate new random digits (from 0 to 9) for the other two positions
    const newNumbers = correctDigits.map((num, index) => {
      return index === indexToKeep ? num : Math.floor(Math.random() * 10);
    });
  
    setHintOne(newNumbers.join());
  };

  const handleShakeLock = () => {
    if (lockRef.current) {
      lockRef.current.shakeLockAnimation(); // Call the child's shakeLockAnimation
    }
  };

  const handleOpenLock = () => {
    if (lockRef.current) {
      lockRef.current.openLock(); // Call the child's openLock
    }
  };

  useEffect(() => {
    generateTargetNumber();
  }, []);

  useEffect(() => {
    if (targetNumber) {
      createHintOne();
      createHintTwo();
      createHintThree();
      console.log("Hello there Mr || Mrs dev tool onlooker! the code is " + jokeLog);
    }
  }, [targetNumber]);

  const handleSquareClick = () => {
    inputRef.current?.focus();
  };

  const generateTargetNumber = () => {
    const randomNumber = Math.floor(100 + Math.random() * 900).toString();
    setTargetNumber(randomNumber);
  };

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
      if (currentGuess == jokeLog) {
        console.log("You did not really just trust a console, did you..??")
      }
      const newCorrectDigits: string[] = [...correctDigits];
      const newIncorrectDigits: string[] = [...incorrectDigits];
      const newWrongPlaceDigits: string[] = [...wrongPlaceDigits];

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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 pt-0 mt-0">
      <div className="w-screen h-full flex justify-center items-center"><Navbar/></div>
      <div className="w-full h-full flex justify-center">
        <ThreeFiberLock ref={lockRef} />
      </div>

      {/* Guesses Grid */}
      <div className="grid grid-rows-${MAX_ATTEMPTS} gap-2 mb-8">
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
              const animationDelay = `${colIndex * 0.2}s`;

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

      <div>
        <button
          className="mb-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-black px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200"
          onClick={toggleModal}
        >
          Hints
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-sky-800 from-0% via-cyan-800 to-cyan-800 p-8 rounded-md text-black max-w-sm w-full">
            <h2 className="text-2xl mb-4 text-yellow-500">This Rounds Hints</h2>
            <ul className="list-disc list-inside">
              <p className='text-white'>Atleast one of the following digits is correct and positioned correctly.</p>
              <div className="flex flex-row gap-2 w-full justify-center">
              {hintOne.split(',').map((digit, index) => (
                <p className="text-yellow-400 mt-2 flex w-8 h-8 border-2 ${cellClass} flex-row items-center justify-center text-2xl font-bold" key={index}>{digit} </p>
              ))}
              </div>
              <p className='mt-4 center text-white'>None of the following digits are correct in any way.</p>
              <div className="flex flex-row gap-2 w-full justify-center">
              {hintTwo.split('').map((digit, index) => (
                <p className="text-yellow-400 mt-2 flex w-8 h-8 border-2 ${cellClass} flex-row items-center justify-center text-2xl font-bold" key={index}>{digit} </p>
              ))}
              </div>
              <p className='mt-4 text-white'>Two of the following digits are correct, but incorrectly placed.</p>
              <div className="flex flex-row gap-2 w-full justify-center">
              {hintThree.split('').map((digit, index) => (
                <p className="text-yellow-400 mt-2 flex w-8 h-8 border-2 ${cellClass} flex-row items-center justify-center text-2xl font-bold" key={index}>{digit} </p>
              ))}
              </div>
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-yellow-500 text-black font-bold rounded"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

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

      {gameStatus === 'playing' && (
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 w-0 h-0"
          onKeyDown={handleKeyDown}
        />
      )}

      {gameStatus === 'won' && (
        <div className="flex flex-col justify-center items-center fixed inset-0 bg-black bg-opacity-20 z-50">
          <div className="bg-gradient-to-tr from-neutral-700 via-neutral-800 to-neutral-700 p-8 rounded-lg shadow-lg w-80 text-center border border-black shadow-xl">
            <div className="text-3xl font-bold text-green-500 mb-4">🎉 Gratz! You cracked it!</div>
            <button
              onClick={resetGame}
              className="mt-4 px-4 py-2 bg-green-500 text-black font-bold rounded"
            >
              Crack Another
            </button>
          </div>
        </div>
      )}
      {gameStatus === 'lost' && (
        <div className="flex flex-col justify-center items-center fixed inset-0 bg-black bg-opacity-20 z-50">
          <div className="bg-gradient-to-tr from-neutral-700 via-neutral-800 to-neutral-700 p-8 rounded-lg shadow-lg w-80 text-center border border-black shadow-xl">
            <div className="text-3xl font-bold text-red-500 mb-4">😞 Game Over!</div>
            <div className="text-lg text-yellow-500">
              Nice try! The number was <span className="font-bold">{targetNumber}</span>.
            </div>
            <button
              onClick={resetGame}
              className="mt-4 px-4 py-2 bg-yellow-500 text-black font-bold rounded"
            >
              Try Again
            </button>
          </div>
        </div>

      )}
      <h1 className="mt-8 text-lg">Created with ❤️ & ☕ by <a className='underline' href="https://dement.dev" target="_blank" rel="noopener noreferrer">Jacob Dement</a></h1>
    </div>
  );
};

export default PopALock;