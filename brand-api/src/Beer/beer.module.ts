import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Beer } from "src/Entity/beer.entity";
import { BeerController } from "./beerController";
import { BeerService } from "./beer.service";


@Module({
    imports: [TypeOrmModule.forFeature([Beer])],
    controllers: [BeerController],
    providers: [BeerService]
})
export class BeerModule{}