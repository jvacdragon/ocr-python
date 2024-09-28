import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Beer } from "src/Entity/beerEntity";
import { BeerController } from "./beerController";
import { BeerService } from "./beerService";


@Module({
    imports: [TypeOrmModule.forFeature([Beer])],
    controllers: [BeerController],
    providers: [BeerService]
})
export class BeerModule{}