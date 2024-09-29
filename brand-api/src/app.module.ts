import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beer } from './Entity/beer.entity';
import { BeerModule } from './Beer/beer.module';

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
