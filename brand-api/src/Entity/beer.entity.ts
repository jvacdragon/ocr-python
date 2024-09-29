import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Beer{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    brand: String;

    @Column()
    urlImage: string;

    @Column()
    createdAt: Date;

}
