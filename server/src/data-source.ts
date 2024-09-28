import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Global } from "./entity/Global"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "Oia",
    password: "Panther98",
    database: "mydb",
    synchronize: true,
    logging: false,
    entities: [User, Global],
    migrations: [],
    subscribers: [],
})
