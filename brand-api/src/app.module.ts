import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './Entity/brand.entity';
import { BrandModule } from './Brand/brand.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'sqlite',
      database: process.env.DATABASEPATH || 'database.sqlite',
      entities: [Brand],
      synchronize: true
    }),
    BrandModule
  ]
})
export class AppModule {}
