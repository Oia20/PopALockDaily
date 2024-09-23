import React from 'react';
import { FaLock } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-b from-gray-900 to-gray-900 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <FaLock className="text-yellow-400 text-2xl mr-2" />
        <span className="text-white text-lg font-semibold cursor-pointer">Pop A Lock</span>
      </div>
      <a
        href="https://github.com/Oia20/PopALock"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-yellow-300 transition duration-200"
      >
        GitHub
      </a>
    </nav>
  );
};

export default Navbar;
