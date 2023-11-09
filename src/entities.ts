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

    @Column({ type: 'text', nullable: false })
    msg: string

    @CreateDateColumn()
    date: Date

    @Column({ type: 'boolean', default: 'false' })
    media: boolean

    @Column({ type: 'text', default: null})
    mediaMimeType: string
}