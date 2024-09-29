import React, { useState } from 'react';
import { FaLock, FaStar } from 'react-icons/fa';
import { loggedIn } from '../store';
import { useStore } from '@nanostores/react';

const Navbar = () => {
  // State to track if the user is signed in
  // const [signedIn, setSignedIn] = useState(false);
  const loggedInStore = useStore(loggedIn);

  // Handler to toggle sign-in state
  const handleSignInOut = () => {
    // setSignedIn(!signedIn);
    if (loggedIn) {
      loggedIn.set(!loggedIn);
      localStorage.removeItem('PALtoken');
      window.location.reload();
    } else {
      window.location.reload();
    }
  };

  return (
    <nav className="bg-transparent p-4 flex justify-between items-center w-screen">
      {/* Left side: Logo */}
      <div className="flex items-center">
        <FaLock className="text-yellow-400 text-2xl mr-2" />
        <span className="text-white text-lg font-semibold cursor-pointer">Pop A Lock</span>
      </div>

      {/* Right side: Links and Buttons */}
      <div className="flex items-center">
        {/* GitHub Link/Button */}
        <a
          href="https://github.com/Oia20/PopALockDaily"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center bg-yellow-500 text-black px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200 mr-4"
        >
          <FaStar className="mr-2" />
          <span className="font-semibold">Star on GitHub</span>
        </a>
        {/* GitHub Text for Smaller Screens */}
        <a
          href="https://github.com/Oia20/PopALockDaily"
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden text-white font-semibold mr-4"
        >
          GitHub
        </a>
        {/* Sign In/Sign Out Button */}
        <button
          onClick={handleSignInOut}
          className="bg-yellow-500 text-black px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200"
        >
          {loggedInStore ? 'Sign Out' : 'Sign In'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
