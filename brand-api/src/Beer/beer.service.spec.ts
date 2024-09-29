import { Repository } from "typeorm";
import { BeerService } from "./beer.service";
import { Beer } from "../Entity/beer.entity.ts";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import axios from "axios";
import { HttpException, HttpStatus } from "@nestjs/common";

jest.mock("axios");

describe("BeerService", () => {
  let beerService: BeerService;
  let beerRepository: Repository<Beer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeerService,
        {
          provide: getRepositoryToken(Beer),
          useClass: Repository,
        },
      ],
    }).compile();

    beerService = module.get<BeerService>(BeerService);
    beerRepository = module.get<Repository<Beer>>(getRepositoryToken(Beer));
  });

  afterEach(() => jest.clearAllMocks);

  it("deve criar uma cerveja", async () => {
    const mockFile = {
      originalname: "beerBrand.png",
      buffer: Buffer.from("imageData"),
    } as Express.Multer.File;

    (axios.post as jest.Mock).mockResolvedValue({
      data: { brand: "brandName" },
    });

    const mockBeer = {
      brand: "brandName",
      urlImage: mockFile.originalname,
      createdAt: new Date(),
    };
    jest.spyOn(beerRepository, "create").mockReturnValue(mockBeer as any);
    jest.spyOn(beerRepository, "save").mockReturnValue(mockBeer as any);

    const result = await beerService.createBeer(mockFile);

    expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/ocr", {
      file: mockFile.buffer.toString("base64"),
      fileName: mockFile.originalname,
    });

    expect(beerRepository.create).toHaveBeenCalledWith({
      brand: "brandName",
      urlImage: mockFile.originalname,
      createdAt: expect.any(Date),
    });

    expect(beerRepository.save).toHaveBeenCalledWith(mockBeer);
    expect(result).toEqual(mockBeer);
  });

  it('deve lançar exceção se a marca não for encontrada', async () => {
    // Mockando o arquivo de imagem
    const mockFile = {
      originalname: 'beerBrand.png',
      buffer: Buffer.from('imageData'),
    } as Express.Multer.File;

    const mockBeer = {
        brand: "",
        urlImage: mockFile.originalname,
        createdAt: new Date(),
      };

    jest.spyOn(beerRepository, "create").mockReturnValue(mockBeer as any);
    jest.spyOn(beerRepository, "save").mockReturnValue(mockBeer as any);

    (axios.post as jest.Mock).mockResolvedValue({
      data: { brand: '' },
    });

    await expect(beerService.createBeer(mockFile)).rejects.toThrow(
      new HttpException('Nenhuma marca encontrada na imagem.', HttpStatus.UNPROCESSABLE_ENTITY),
    );

    expect(axios.post).toHaveBeenCalled();
    expect(beerRepository.create).not.toHaveBeenCalled();
    expect(beerRepository.save).not.toHaveBeenCalled();
  });
});
