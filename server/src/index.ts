import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
const express = require("express");
import axios from "axios";
import { Global } from "./entity/Global";
const cron = require('node-cron');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

AppDataSource.initialize()
    .then(() => {
        console.log("Data source is initialized");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

const app = express();
app.use(express.json());
const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));

// This route will fetch all users from the database and return them as JSON
app.get("/users", async (req, res) => {
    console.log("Fetching users from the database");
    try {
        const users = await AppDataSource.getRepository(User).find();
        console.log(users);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.get("/user/:id", async (req, res) => {
    console.log("Fetching user from the database");
    const id = req.params.id;
    try {
        const user = await AppDataSource.getRepository(User).findOne({ where: { githubId: id } || { email: id } });
        console.log(user);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("logging in with: ", email, password);
    try {
      const user = await AppDataSource.getRepository(User).findOne({ where: { email } });
      if (!user) {
        try {
        console.log("user not found, creating new user");
        const newUser = new User();
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hashed password: ", hashedPassword);
        newUser.email = email;
        newUser.password = hashedPassword;
        console.log("new user: ", newUser);
        await AppDataSource.manager.save(newUser);
        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1d' });
        console.log("token: ", token);
        res.status(201).json({ token, userId: newUser.id });
        return;
        } catch (error) {
            console.log("error creating new user: ", error);
          res.status(500).json({ message: 'Error registering user' });
        }
      } else {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Invalid password' });
            }
        
            const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token, userId: user.id });
        }
    } catch (error) {
      res.status(500).json({ message: 'Error logging in' });
    }
  });

  app.post('/confirm-auth', async (req, res) => {
    const { token } = req.body;
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const user = await AppDataSource.getRepository(User).findOne({ where: { id } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Error confirming auth' });
    }
  });

app.get("/todays-codes", async (req, res) => {
    console.log("Fetching today's codes from the database");
    try {
        const latestCodes = await AppDataSource.getRepository(Global)
            .createQueryBuilder("global")
            .orderBy("global.createdAt", "DESC")  // Adjust "createdAt" to your appropriate field
            .getOne();  // Retrieves the last entry
        console.log(latestCodes);
        res.json(latestCodes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch today's codes" });
    }
});

app.get('/auth/github', async (req, res) => {
    console.log("in auth github");
    const githubAuthUrl = 'https://github.com/login/oauth/authorize';
    const clientId = process.env.GITHUB_CLIENT_ID;
    console.log("client id: ", clientId);
    res.redirect(`${githubAuthUrl}?client_id=${clientId}`);
});

app.get('/auth/github/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        const tokenData = tokenResponse.data;
        if (!tokenData.access_token) {
            throw new Error('Access token not found in the response');
        }
        let githubdata = await axios.get(`https://api.github.com/user`, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });
        console.log(githubdata);
        if (githubdata.data.login) {
            const user = await AppDataSource.getRepository(User).findOne({ where: { githubId: githubdata.data.id } });
            if (user) {
                console.log("User already exists");
                res.redirect('http://localhost:4321/?token=' + tokenData.access_token);
            } else {
                console.log("making new user");
                const newUser = new User();
                newUser.githubId = githubdata.data.id;
                newUser.username = githubdata.data.login;
                newUser.streak = 0;
                await AppDataSource.manager.save(newUser);
                res.redirect('http://localhost:4321/?token=' + tokenData.access_token);
            }
        } else {
            res.redirect('http://localhost:4321/?token=' + tokenData.access_token);
        }
    } catch (error) {
        console.error('Error fetching access token:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/update-streak/:authorization', async (req, res) => {
    const token = req.params.authorization;
    console.log('Updating streak for user:', token);

    if (!token) {
        res.status(401).send('Unauthorized');
        return;
    }
    try {
        const user = await AppDataSource.getRepository(User).findOne({ where: [{ githubId: token }, { id: parseInt(token) }] });
        if (!user) {
            console.log('User not found');
            res.status(401).send('Unauthorized');
            return;
        } else {
            console.log('User found: ', user);
            const streak = user.streak;
            user.streak = streak + 1;
            user.solvedToday = true;
            user.attemptedToday = true;
            await AppDataSource.manager.save(user);
            res.status(200)
        }
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/attempt-today', async (req, res) => {
    const token = req.body.token;
    console.log('Attempting today for user: ', token);
    if (!token) {
        res.status(401).send('Unauthorized');
        return;
    }
    try {
        const user = await AppDataSource.getRepository(User).findOne({ where: [{ githubId: token }, { id: parseInt(token) }] });
        if (!user) {
            console.log('User not found');
            res.status(401).send('Unauthorized');
            return;
        } else {
            console.log('User found: ', user);
            user.attemptedToday = true;
            await AppDataSource.manager.save(user);
            res.status(200)
        }
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).send('Internal Server Error');
    }
});


const generateTodaysCodes = async () => {
    console.log("Generating today's codes");
    const todaysNumbers: string[] = [];
    const hintOne: string[] = [];
    const hintTwo: string[] = [];
    const hintThree: string[] = [];

    const generateTargetNumber = () => {
        const randomNumber = Math.floor(100 + Math.random() * 900).toString();
        todaysNumbers.push(randomNumber);
      };

    const createHintOne = () => {
        const correctDigits = todaysNumbers[0].split('');
    
        const indexToKeep = Math.floor(Math.random() * 3);
    
        // Step 2: Generate new random digits (from 0 to 9) for the other two positions
        const newNumbers = correctDigits.map((num, index) => {
          return index === indexToKeep ? num : Math.floor(Math.random() * 10);
        });
        hintOne.push(newNumbers.join());
      };

    const createHintTwo = () => {
        const correctDigits = todaysNumbers[0].split('');

    
      // Step 1: Create a pool of digits from 0 to 9
        const digitPool = Array.from({ length: 10 }, (_, i) => i.toString());
    
        // Step 2: Remove the digits in the original list from the pool
        const availableDigits = digitPool.filter(digit => !correctDigits.includes(digit));
    
        const newNumbers: string[] = [];
        while (newNumbers.length < 3) {
          const randomIndex = Math.floor(Math.random() * availableDigits.length);
          newNumbers.push(availableDigits.splice(randomIndex, 1)[0]);
        }
        hintTwo.push(newNumbers.join());

    
    }

    const createHintThree= () => {
        const correctDigits = todaysNumbers[0].split('');

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
        hintThree.push(newNumbers.join());
    }
    generateTargetNumber();
    createHintOne();
    createHintTwo();
    createHintThree();
    // Save todays hints to the database
    const todaysHints = {
        targetNumber: todaysNumbers[0],
        hintOne: hintOne,
        hintTwo: hintTwo,
        hintThree: hintThree,
    };
    console.log(todaysHints);
    const todaysHintsEntity = new Global();
    todaysHintsEntity.todaysNumber = todaysNumbers[0];
    todaysHintsEntity.hintOne = hintOne.join(',');
    todaysHintsEntity.hintTwo = hintTwo.join(',');
    todaysHintsEntity.hintThree = hintThree.join(',');
    try {
        await AppDataSource.manager.save(todaysHintsEntity);
    } catch (error) {
        console.error("Error saving today's hints:", error);
    }
    console.log("Todays hints saved to the database");

    // Loop over all users and update their solvedToday and streak
    const users = await AppDataSource.getRepository(User).find();
    users.forEach(async (user) => {
        console.log("resetting user: ", user.githubId);
        if (user.solvedToday == false) {
            user.streak = 0;
            user.solvedToday = false;
            user.attemptedToday = false;
        } else {
            user.attemptedToday = false;
            user.solvedToday = false;
        }
        await AppDataSource.manager.save(user);
    });
};


// Schedule the task to run every 5 minutes
// cron.schedule('*/5 * * * *', generateTodaysCodes);

// Schedule the task to run every 1 minutes
cron.schedule('*/1 * * * *', generateTodaysCodes);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log("Press Ctrl+C 2x to quit.");
});
