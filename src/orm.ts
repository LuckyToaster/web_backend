import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    JoinColumn
} from "typeorm"

@Entity()
export class Post {
    @PrimaryGeneratedColumn() 
    id: number

    @Column({type: 'text', nullable: false}) 
    msg: string

    @CreateDateColumn() 
    date: Date

    @Column({type: 'boolean', default: 'false'}) 
    media: boolean

    @Column({type: 'text', default: null}) 
    mediaMimeType: string

    @Column({type: "integer", default: 0}) 
    likes: number

    @Column({type: "integer", default: 0}) 
    dislikes: number
}

@Entity() 
export class Payment {
    @PrimaryGeneratedColumn() 
    id: number

    @Column({type: 'text', default: 'false'})
    stripeId: string

    @CreateDateColumn() 
    date: Date

    @Column({type: 'numeric', precision: 8, scale: 2}) 
    amount: string

    @Column({type: 'text', default: 'false'})
    receiptUrl: string
}

import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "127042695",
    database: "gogocharity",
    synchronize: true,
    logging: false,
    entities: [Post, Payment],
    migrations: [],
    subscribers: [],
})
