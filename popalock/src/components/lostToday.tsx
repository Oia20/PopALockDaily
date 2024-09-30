

export const LostToday = () => {

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="absolute flex flex-col justify-center bg-gradient-to-br from-sky-800 from-0% via-cyan-800 to-cyan-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 overflow-y-scroll h-content">
              <h1 className="text-2xl font-extrabold text-center text-amber-400">Nice try! You'll get em' tomorrow tiger</h1>
              <p className="text-gray-200 text-center mt-4">Return tomorrow to attempt another lock to start your streak!</p>
              <button
              className="mt-4 px-4 py-2 bg-yellow-600 text-white font-bold rounded justify-center items-center self-center"
              >
              <a href="/infinite">
                  Play Pop A Lock Infinite
              </a>
          </button>
            <h1 className="mt-8 text-lg text-gray-200 text-center">Created with ❤️ & ☕ by <a className='underline' href="https://dement.dev" target="_blank" rel="noopener noreferrer">Jacob Dement</a></h1>
          </div>
      </div>
    );
  };