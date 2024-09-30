<h1 align="center">🔐 Pop A Lock</h1>
<p align="center"><i>The open-source daily puzzle game where you attempt to pop a lock.</i></p>

---

<h2>🚀 Overview</h2>

<p><b>Pop A Lock</b> is a fun, puzzle game inspired by the popular game Wordle, and a <a href="https://www.reddit.com/r/puzzles/comments/192todc/how_do_you_solve_this_lock_combination_puzzle/">Reddit Post</a> I stumbled upon some time ago. The game is <b>open-source</b>, inviting developers and enthusiasts to contribute to its evolution.</p>

---

<h2>✨ Features</h2>

<ul>
  <li>🎮 <b>Daily Puzzle</b>: A new number combination with hints is generated once per day.</li>
  <li>🧠 <b>Brain Workout</b>: Strengthen your problem-solving skills with strategic guessing.</li>
  <li>♾️ <b>Infinite Mode</b>: Play lock after lock without having to wait for the next day.</li>
  <li>🌍 <b>Open Source</b>: Free to use, modify, and contribute.</li>
</ul>

---

<h2>🎯 How to Play</h2>

<ol>
  <li>Functionally Pop A Lock works like <b>Wordle</b>, but with numbers instead of letters.</li>
  <li>You get 4 guesses per day</li>
  <li>Use the hints to help you crack the code, without them it's near impossible to crack the code.</li>
  <li>Check back the next day for a <b>new puzzle</b>!</li>
</ol>

---

<h2>🔧 Installation/Run Locally</h2>

<h3>Clone Repo</h3>

```bash
git clone https://github.com/Oia20/PopALockDaily.git
```

<h3>Client Side</h3>

```bash
cd PopALockDaily/popalock
npm install
npm run dev
```

Make sure to change the `fetchUrl` variable at the top of the `popalockDaily.tsx` file.

<h3>Server Side</h3>
<p>This will require you to have a database you can connect to.</p>

```bash
cd PopALockDaily/server
npm install
```
Make your way to `server/src/data-source.ts` and add in your database connection info.

<p>Now you should be able to start the server.</p>

```bash
npm run start
```


<h2>🌱 Contributing</h2> <p>We welcome contributions! Feel free to open an issue or submit a pull request if you'd like to help improve Pop A Lock.</p> <ul> <li>Fork the repository</li> <li>Create a new branch (<code>git checkout -b feature-branch</code>)</li> <li>Make your changes</li> <li>Commit your changes (<code>git commit -m 'Add some feature'</code>)</li> <li>Push to the branch (<code>git push origin feature-branch</code>)</li> <li>Open a pull request</li> </ul>
<h2>🛠 Tech Stack</h2>
<table> 
  <tr> 
    <td>
      <b>Frontend</b>
    </td> 
    <td>React</td> 
  </tr> <tr> <td><b>Backend</b></td> 
    <td>Node.js/Express</td> </tr> <tr> 
      <td><b>Database</b></td> 
      <td>Postgres/TypeORM</td> </tr> <tr> 
        <td><b>Styling</b></td> 
        <td>Tailwind/CSS</td> </tr> 
</table>
<h2>🏆 Credits</h2> 
(When you contribute feel free to sign and plug yourself here in your PR)

<p>Built with ❤️ by <a href="https://github.com/Oia20">Jacob Dement</a>.</p>
<p>3D Lock model created by <a href="https://sketchfab.com/brandondmc10">brandon_grey</a></p>
<h2>📜 License</h2> <p>This project is licensed under the MIT License.</p> <div align="center"> <a href="https://github.com/Oia20/PopALockDaily/issues"> <img alt="Issues" src="https://img.shields.io/github/issues/Oia20/PopALockDaily?color=brightgreen"/> </a> <a href="https://github.com/Oia20/PopALockDaily"> <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/Oia20/PopALockDaily?style=social"/> </a> </div>
<p align="center"><i>Give it a go, and start popping those locks! 🔐</i></p>
