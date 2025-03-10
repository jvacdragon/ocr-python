import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brand } from "../Entity/brand.entity";
import { Repository } from "typeorm";
import axios from "axios";



@Injectable()
export class BrandService{
    constructor(
        @InjectRepository(Brand)
        private brandRepositoy: Repository<Brand>
    ){}

    async createBrand(image: Express.Multer.File): Promise<any>{

        const base64Image = image.buffer.toString('base64')

        const formData = {
            file: base64Image,
            fileName: image.originalname
        }

        const pythonApiUrl = process.env.PYTHON_API_URL|| 'http://python_app:5000'
        const response = await axios.post(`${pythonApiUrl}/process-image`, formData) 
    
        const brandName = response.data.brand.trim();

        if (!brandName) {
            throw new HttpException('Nenhuma marca encontrada na imagem.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        
        const brand = this.brandRepositoy.create({
            brand: response.data.brand,
            urlImage: image.originalname,
            createdAt: new Date()
        });

        await this.brandRepositoy.save(brand)
        return brand
    }
}