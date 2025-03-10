import { Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandService } from './brand.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('upload')
export class BrandController {
  constructor(private readonly BrandService: BrandService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    
    const Brand = await this.BrandService.createBrand(file);
    
    return res.json({
      success: true,
      brandName: Brand.brand,
    });
  }
}
