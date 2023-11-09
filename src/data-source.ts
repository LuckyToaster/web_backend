import "reflect-metadata"
import { DataSource } from "typeorm"
import { Post } from "./entities"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "127042695",
    database: "gogocharity",
    synchronize: true,
    logging: false,
    entities: [Post],
    migrations: [],
    subscribers: [],
})
