import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Brand{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    brand: String;

    @Column()
    urlImage: string;

    @Column()
    createdAt: Date;

}
