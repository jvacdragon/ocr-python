import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beer } from './Entity/beerEntity';
import { BeerModule } from './Beer/beerModule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'sqlite',
      database: 'database.sqlite',
      entities: [Beer],
      synchronize: true
    }),
    BeerModule
  ]
})
export class AppModule {}
