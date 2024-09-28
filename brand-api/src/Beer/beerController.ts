import { Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BeerService } from './beerService';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('beer')
export class BeerController {
  constructor(private readonly BeerService: BeerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    
    const beer = await this.BeerService.createBeer(file);
    
    return res.json({
      success: true,
      brandName: beer.brand,
    });
  }
}
