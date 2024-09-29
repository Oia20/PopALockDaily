import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
const express = require("express");
import axios from "axios";
import { Global } from "./entity/Global";
const cron = require('node-cron');
const cors = require('cors');

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
    origin: 'http://localhost:4321',
    credentials: true,
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

app.get("/auth/github"), async (req, res) => {
    
}

app.get("/auth/github/callback"), async (req, res) => {

}

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
};

// app.get("/codes", async (req, res) => {
//     try {
//         const codes = await AppDataSource.getRepository(Global).find();
//         console.log(codes);
//         res.json(codes); 
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch codes" });
//     }
// });

// Schedule the task to run every 5 minutes
// cron.schedule('*/5 * * * *', generateTodaysCodes);

// Schedule the task to run every 1 minutes
// cron.schedule('*/1 * * * *', generateTodaysCodes);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log("Press Ctrl+C 2x to quit.");
});
