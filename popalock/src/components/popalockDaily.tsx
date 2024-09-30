import React, { useState, useEffect, useRef } from 'react';
import ThreeFiberLock from './threeFiberLock';
import '../layouts/popalock.css';
import Navbar from './navBar';
import { loggedIn, credential, streak } from '../store';
import { useStore } from '@nanostores/react';
import { AlreadySolved } from './alreadySolved';
import { attemptedToday } from '../store';
import { LostToday } from './lostToday';
import { WonToday } from './wonToday';

const NUMBER_LENGTH = 3; // Number of digits in the target number
const MAX_ATTEMPTS = 3;  // Maximum number of guesses
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
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(true);
  const streakStore = useStore(streak);
  const attemptedTodayStore = useStore(attemptedToday);


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
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        localStorage.setItem('PALtoken', token); // Store token in local storage
        window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
    }

    if (localStorage.getItem('PALtoken')) {
        setLoginModalOpen(false);
        const testToken = localStorage.getItem('PALtoken');
        setLoginModalOpen(false);
        if (testToken) {
            fetch('https://api.github.com/user', {
                headers: {
                  Authorization: `Bearer ${testToken}`,
                },
              })
              .then((response) => response.json())
              .then((data) => {
                if (data.login) {
                    credential.set(`${data.id}`);
                    loggedIn.set(true);
                    setLoginModalOpen(false);
                    fetch(`http://localhost:3000/user/${credential.value}`)
                    .then(response => response.json())
                    .then(data => {
                      console.log(data);
                      streak.set(data.streak);
                      if (data.attemptedToday) {
                        attemptedToday.set(true);
                      }
                    })
                } else {
                    console.log('Not logged in');
                    loggedIn.set(false);
                    setLoginModalOpen(true);
                }
            });
        }
    } else {
      const solvedTimestamp = localStorage.getItem('solvedTimestamp');
      console.log(solvedTimestamp);

      if (solvedTimestamp) {
        const timestamp = new Date(solvedTimestamp);
        console.log(timestamp.getTime(), new Date().getTime());
        if (timestamp.getTime() > new Date().getTime()) {
          console.log(timestamp.getTime(), new Date().getTime());
          attemptedToday.set(true);
        }
      }
    }
    fetch("http://localhost:3000/todays-codes")
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setTargetNumber(data.todaysNumber);
        setHintOne(data.hintOne);
        setHintTwo(data.hintTwo);
        setHintThree(data.hintThree);
      })
      .catch(error => {
        console.error("Error fetching today's codes:", error);
      });
  }, []);

  const handleSquareClick = () => {
    inputRef.current?.focus();
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
        window.scrollTo(0, 0);
        setTimeout(() => {
          setGameStatus('won');
        }, 2000);
        streak.set(streakStore + 1);
          if (localStorage.getItem('PALtoken')) {
            console.log(credential.value);
            try {
              fetch(`http://localhost:3000/update-streak/${credential.value}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              .then((response) => {
                if (response.status === 200) {
                  console.log('Streak updated successfully');
                } else {
                  console.error('Error updating streak:', response.status);
                }
              })
            } catch (error) {
              console.error('Error updating streak:', error);
            }
          } else {
            // set as the time with just the date of tomorrow with the dashes
            localStorage.setItem('solvedTimestamp', new Date(new Date().getTime() + 86400000).toISOString().replace(/T.+$/, ''));
          }
      } else if (newGuesses.length === MAX_ATTEMPTS) {
        setGameStatus('lost');
          try {
            fetch(`http://localhost:3000/attempt-today`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: credential.value }),
            })
            .then((response) => {
              if (response.status === 200) {
                console.log('Streak updated successfully');
              } else {
                console.error('Error updating streak:', response.status);
              }
            })
          } catch (error) {
            console.error('Error updating streak:', error);
          }
      }
    } else {
      handleShakeLock();
    }
  };

  const handleGitHubOAuth = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  const playAsGuest = () => {
    setLoginModalOpen(false);
  };

  const resetGame = () => {
    setGuesses([]);
    setGuessResults([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setCorrectDigits([]);
    setIncorrectDigits([]);
    setWrongPlaceDigits([]);
    handleCloseLock();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (

    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 pt-0 mt-0">
    {/* Login Modal */}

    {attemptedTodayStore && <AlreadySolved />}

    {loginModalOpen && (
  <div className="z-50 fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
    <div className="mt-2 mb-2 z-50 absolute bg-gradient-to-br from-sky-800 from-0% via-cyan-800 to-cyan-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 overflow-y-scroll h-4/5">
      <h1 className="text-4xl font-extrabold text-center text-amber-400">Pop A Lock!</h1>
      <p className="text-gray-200 text-center mt-4">The open-source daily puzzle game.</p>
      <p className="text-gray-300 text-center">
        Sign in to keep track of your daily streak, or play as a guest.
      </p>

      {/* How to Play Section */}
      <div className="bg-cyan-900 p-5 rounded-lg mt-6 shadow-lg">
        <h2 className="text-xl font-bold text-amber-400">How to Play</h2>
        <ul className="list-disc list-inside text-gray-200 mt-3 space-y-2">
          <li>Functionally this game is like Wordle, but with numbers instead of letters.</li>
          <li>You get 3 attempts each day to crack the code.</li>
          <li>Use the hints to help you crack the code.</li>
        </ul>
      </div>

      {/* Email and Password Input */}
      <form className="mt-6">
        <div>
          <label className="block text-gray-200 font-semibold" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full mt-2 p-3 rounded-lg bg-cyan-900 text-white placeholder-gray-400"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-200 font-semibold" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full mt-2 p-3 rounded-lg bg-cyan-900 text-white placeholder-gray-400"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-yellow-600 hover:bg-amber-600 text-white font-semibold py-3 px-5 rounded-lg shadow-lg transition duration-200"
        >
          Sign in/up with Email
        </button>
      </form>

      {/* GitHub OAuth Button */}
      <button
        onClick={handleGitHubOAuth}
        className="mt-4 w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-5 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="white">
          <path
            fillRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12c0 4.41 2.87 8.13 6.84 9.46.5.09.68-.22.68-.48v-1.7c-2.79.61-3.37-1.35-3.37-1.35-.45-1.14-1.1-1.45-1.1-1.45-.9-.61.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.9 1.54 2.36 1.1 2.94.84.09-.65.35-1.1.64-1.36-2.22-.26-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.02A9.548 9.548 0 0 1 12 6.8c.86.004 1.73.12 2.53.35 1.9-1.29 2.74-1.02 2.74-1.02.55 1.41.21 2.45.1 2.71.64.7 1.03 1.6 1.03 2.69 0 3.85-2.35 4.69-4.58 4.95.36.31.69.93.69 1.88v2.78c0 .27.18.58.68.48C19.13 20.13 22 16.41 22 12c0-5.52-4.48-10-10-10z"
            clipRule="evenodd"
          />
        </svg>
        <span>Sign in with GitHub</span>
      </button>

      {/* Play as Guest Button */}
      <button
        onClick={playAsGuest}
        className="mt-4 w-full bg-yellow-600 hover:bg-amber-600 text-white font-semibold py-3 px-5 rounded-lg shadow-lg flex items-center justify-center transition duration-200"
      >
        Play as Guest
      </button>
    </div>
  </div>
)}




      
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
          Todays Hints
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-sky-800 from-0% via-cyan-800 to-cyan-800 p-8 rounded-md text-black max-w-sm w-full">
            <h2 className="text-2xl mb-4 text-yellow-500">Todays Hints</h2>
            <ul className="list-disc list-inside">
              <p className='text-white'>Atleast one of the following digits is correct and positioned correctly.</p>
              <div className="flex flex-row gap-2 w-full justify-center">
              {hintOne.split(',').map((digit, index) => (
                <p className="text-yellow-400 mt-2 flex w-8 h-8 border-2 ${cellClass} flex-row items-center justify-center text-2xl font-bold" key={index}>{digit} </p>
              ))}
              </div>
              <p className='mt-4 center text-white'>None of the following digits are correct in any way.</p>
              <div className="flex flex-row gap-2 w-full justify-center">
              {hintTwo.split(',').map((digit, index) => (
                <p className="text-yellow-400 mt-2 flex w-8 h-8 border-2 ${cellClass} flex-row items-center justify-center text-2xl font-bold" key={index}>{digit} </p>
              ))}
              </div>
              <p className='mt-4 text-white'>Two of the following digits are correct, but incorrectly placed.</p>
              <div className="flex flex-row gap-2 w-full justify-center">
              {hintThree.split(',').map((digit, index) => (
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
        <WonToday />
      )}
      {gameStatus === 'lost' && (
        <LostToday />
      )}
      <h1 className="mt-8 text-lg">Created with ❤️ & ☕ by <a className='underline' href="https://dement.dev" target="_blank" rel="noopener noreferrer">Jacob Dement</a></h1>
    </div>
  );
};

export default PopALock;