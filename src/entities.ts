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
}

@Entity()
export class Media {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Post, post => post.id, { nullable: false })
    @JoinColumn({ name: 'post_id' })
    post_id: number;

    @Column({ type: 'bytea' })
    data: Buffer;
}
