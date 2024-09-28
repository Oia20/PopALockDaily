import { create } from "domain"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class Global {

    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    todaysNumber: string

    @Column({nullable: true})
    hintOne: string

    @Column({nullable: true})
    hintTwo: string

    @Column({nullable: true})

    hintThree: string

    @Column({nullable: true, default: 0})
    totalAttempted: number

    @Column({nullable: true, default: 0})
    totalSolved: number

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date
}
