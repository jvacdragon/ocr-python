import { Repository } from "typeorm";
import { BrandService } from "./brand.service";
import { Brand } from "../Entity/brand.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import axios from "axios";
import { HttpException, HttpStatus } from "@nestjs/common";

jest.mock("axios");

describe("BrandService", () => {
  let brandService: BrandService;
  let brandRepository: Repository<Brand>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: getRepositoryToken(Brand),
          useClass: Repository,
        },
      ],
    }).compile();

    brandService = module.get<BrandService>(BrandService);
    brandRepository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
  });

  afterEach(() => jest.clearAllMocks);

  it("deve criar uma cerveja", async () => {
    const mockFile = {
      originalname: "brandBrand.png",
      buffer: Buffer.from("imageData"),
    } as Express.Multer.File;

    (axios.post as jest.Mock).mockResolvedValue({
      data: { brand: "brandName" },
    });

    const mockBrand = {
      brand: "brandName",
      urlImage: mockFile.originalname,
      createdAt: new Date(),
    };
    jest.spyOn(brandRepository, "create").mockReturnValue(mockBrand as any);
    jest.spyOn(brandRepository, "save").mockReturnValue(mockBrand as any);

    const result = await brandService.createBrand(mockFile);

    expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/ocr", {
      file: mockFile.buffer.toString("base64"),
      fileName: mockFile.originalname,
    });

    expect(brandRepository.create).toHaveBeenCalledWith({
      brand: "brandName",
      urlImage: mockFile.originalname,
      createdAt: expect.any(Date),
    });

    expect(brandRepository.save).toHaveBeenCalledWith(mockBrand);
    expect(result).toEqual(mockBrand);
  });

  it('deve lançar exceção se a marca não for encontrada', async () => {
    // Mockando o arquivo de imagem
    const mockFile = {
      originalname: 'brandBrand.png',
      buffer: Buffer.from('imageData'),
    } as Express.Multer.File;

    const mockBrand = {
        brand: "",
        urlImage: mockFile.originalname,
        createdAt: new Date(),
      };

    jest.spyOn(brandRepository, "create").mockReturnValue(mockBrand as any);
    jest.spyOn(brandRepository, "save").mockReturnValue(mockBrand as any);

    (axios.post as jest.Mock).mockResolvedValue({
      data: { brand: '' },
    });

    await expect(brandService.createBrand(mockFile)).rejects.toThrow(
      new HttpException('Nenhuma marca encontrada na imagem.', HttpStatus.UNPROCESSABLE_ENTITY),
    );

    expect(axios.post).toHaveBeenCalled();
    expect(brandRepository.create).not.toHaveBeenCalled();
    expect(brandRepository.save).not.toHaveBeenCalled();
  });
});
