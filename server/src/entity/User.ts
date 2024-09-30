import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    username: string

    @Column({nullable: true})
    githubId: string

    @Column({nullable: false, default: 0})
    streak: number

    @Column({nullable: false, default: false})
    solvedToday: boolean

    @Column({nullable: true, unique: true})
    email: string

    @Column({nullable: false, default: false})
    attemptedToday: boolean

    @Column({nullable: true})
    password: string
}
