import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Global } from "./entity/Global"
const dotenv = require('dotenv');
dotenv.config();

//Dev
// export const AppDataSource = new DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: 5433,
//     username: "Oia",
//     password: "Panther98",
//     database: "mydb",
//     synchronize: true,
//     logging: false,
//     entities: [User, Global],
//     migrations: [],
//     subscribers: [],
// })

//Prod
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "postgres.railway.internal",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Global],
    migrations: [],
    subscribers: [],
})