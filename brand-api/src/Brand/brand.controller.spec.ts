import { Test, TestingModule } from '@nestjs/testing';
import { BrandController } from './brand.controller.js';
import { BrandService } from './brand.service.js';
import { Response } from 'express';
import { createMock } from '@golevelup/ts-jest';

describe('BrandController', () => {
  let brandController: BrandController;
  let brandService: BrandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
      providers: [
        {
          provide: BrandService,
          useValue: {
            createBrand: jest.fn(),
          },
        },
      ],
    }).compile();

    brandController = module.get<BrandController>(BrandController);
    brandService = module.get<BrandService>(BrandService);
  });

  it('deve receber uma imagem e retornar o nome da marca', async () => {

    const file = { originalname: 'brandBrand.png' } as Express.Multer.File;

    const mockBrand = { brand: 'testBrand' };
    jest.spyOn(brandService, 'createBrand').mockResolvedValue(mockBrand);

    const mockResponse = createMock<Response>();
    mockResponse.json = jest.fn().mockReturnValue({
      success: true,
      brandName: mockBrand.brand,
    });

    const result = await brandController.uploadFile(file, mockResponse);

    expect(brandService.createBrand).toHaveBeenCalledWith(file);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      brandName: mockBrand.brand,
    });
    expect(result).toEqual({
      success: true,
      brandName: 'testBrand',
    });
  });
});
