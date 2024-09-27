import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
const express = require("express");
import axios from "axios";

AppDataSource.initialize()
    .then(() => {
        console.log("Data source is initialized");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

const app = express();
app.use(express.json());


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



app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log("Press Ctrl+C 2x to quit.");
});
