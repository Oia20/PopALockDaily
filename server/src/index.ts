import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
const express = require("express")
import axios from "axios"

AppDataSource.initialize()
    .then(() => {
        console.log("Data source is initialized")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.get("/users", async function (req, res) {
    const users = await AppDataSource.getRepository(User).find()
    res.json(users)
})


app.listen(3000, () => {
    console.log("Server is running on port 3000")
    console.log("Press Ctrl+C to quit.")
    console.log("users route", axios.get("http://localhost:3000/users"))
})
