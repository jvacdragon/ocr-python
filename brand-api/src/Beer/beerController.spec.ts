import { Test, TestingModule } from '@nestjs/testing';
import { BeerController } from './beerController';
import { BeerService } from './beerService';
import { Response } from 'express';
import { createMock } from '@golevelup/ts-jest';

describe('BeerController', () => {
  let beerController: BeerController;
  let beerService: BeerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeerController],
      providers: [
        {
          provide: BeerService,
          useValue: {
            createBeer: jest.fn(), // Mock do método createBeer
          },
        },
      ],
    }).compile();

    beerController = module.get<BeerController>(BeerController);
    beerService = module.get<BeerService>(BeerService);
  });

  it('deve receber uma imagem e retornar o nome da marca', async () => {

    const file = { originalname: 'beerBrand.png' } as Express.Multer.File;

    const mockBeer = { brand: 'testBrand' };
    jest.spyOn(beerService, 'createBeer').mockResolvedValue(mockBeer);

    const mockResponse = createMock<Response>();
    mockResponse.json = jest.fn().mockReturnValue({
      success: true,
      brandName: mockBeer.brand,
    });

    const result = await beerController.uploadFile(file, mockResponse);

    expect(beerService.createBeer).toHaveBeenCalledWith(file);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      brandName: mockBeer.brand,
    });
    expect(result).toEqual({
      success: true,
      brandName: 'testBrand',
    });
  });
});
