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
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    console.log('Target number:', targetNumber);
  }, [targetNumber]);


  (window as any).mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
    console.log(check);
    return check;
  };


  useEffect(() => {
    console.log('MobileCheck:', (window as any).mobileCheck());
    if (gameStatus === 'playing' && (window as any).mobileCheck()) {
      inputRef.current?.focus();
    }
  }, [gameStatus]);

  const handleDocumentClick = () => {
    if (gameStatus === 'playing') {
      inputRef.current?.focus();
    }
  };

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