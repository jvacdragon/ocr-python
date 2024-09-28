# Documentação do Upload e Processamento de Imagens com OCR para Identificação de Marcas de Cerveja

Aqui será documentado os principais arquivos utilizados na criação de uma API que tem como objetivo identificar marcas de cerveja através de suas logos.

## Divisão de pastas
- Na pasta ./brand-api está localizada a API feita em NestJS, onde no caminho ./brand-api/src estão as duas principais pastas contendo o código necessário para criação da entidade de cerveja, que é usado para ORM, armazenando seus dados no SQLite e também há os arquivos arquivos que lidam com as requisições HTTP, comunicação com a API de OCR e com a manipulação dos dados para criar a entidade de cerveja.

- Na pasta read-brand-api é onde tem o código Python responsável por receber a imagem e aplicar técnicas de processamento de imagem para converte-las em texto e enviar como resposta à API do NestJS.

## Bibliotecas necessária para o funcionamento das APIs

- Na pasta read-brand-api, onde está localizado o código que realiza o OCR, se faz necessária a instalação das bibliotecas: flask, pillow, pytesseract, opencv e numpy. Para realizar essas instalaçõs pela linha de comando se usa esse código em bash:

``` 
pip install flask pillow pytesseract opencv-python-headless numpy 

```
Se faz necessária a instalação do tesseract na máquina em que se executa o códgigo

- Na pasta brand-api temos o arquivo package.json contendo todas as depêndencias necessária para rodarmos a API sem problemas.

``` json
"dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.4.4",
    "@nestjs/typeorm": "^10.0.2",
    "axios": "^1.7.7",
    "form-data": "^4.0.0",
    "multer": "^1.4.5-lts.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1",
    "sqlite3": "^5.1.7",
    "typeorm": "^0.3.20"
  }
```
basta aplicar este código em seu pakage.json e executar nas linhas de comando:

```
npm install
```

## Pasta ./brand-api

### Entity
Adentro da pasta -/brand-api temos a pasta ./Entity contendo a entidade que iremos salvar no banco de dados, ela está localizada no arquivo beerEntity.ts. Este é o arquivo completo:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Beer{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    brand: String;

    @Column()
    urlImage: string;

    @Column()
    createdAt: Date;

}
```
Neste arquivo é mapeada a classe Beer, que é denotada por @Entity(), indicando que é uma entidade a ser mapeada para o banco de dados sqlite. Possui o campo de id, que é incrementado automaticamente sempre que é adicionado um registro ao banco de dados e é a primary key da tabela, um campo de brand, que é onde está armazenado o nome da marca, campo urlImage onde se é armazenado o nome do arquivo e um campo createdAt que é onde fica guardada a data de criação desse registro.

### Beer
No mesmo nível da pasta Entity, temos a pasta Beer, nela estão contidos três arquivos, são eles: beerController.ts, beerModule.ts e beerService.ts.

* beerController
O arquivo beerController.ts é responsável por ser o controlador da API, recebendo diretamente o arquivo de imagem através de um método POST enviado para o endereço '/beer'. Nele há uma injeção de depêndencia para BeerService. Após receber a image, o controller tenta criar uma entidade Beer através do BeerService. Caso seja bem sucedida essa criação, será retornado o seguinte código json:

```json

    success: true,
    brandName: NOME_DA_MARCA

```
* beerMdule.ts
Este arquivo é o responsável por organizar todas as funcionalidades relacionadas à cerveja, no caso todas as principais para o funcionamento dessa API. Seu código é:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Beer } from "src/Entity/beerEntity";
import { BeerController } from "./beerController";
import { BeerService } from "./beerService";


@Module({
    imports: [TypeOrmModule.forFeature([Beer])],
    controllers: [BeerController],
    providers: [BeerService]
})
export class BeerModule{}
```
- Na parte de imports, é definido que a entidade Beer será gerenciada pelo módulo de ORM (Object-Relational Mapping)
- Em controllers está sendo definido quem é o controlador
- Em provider está definindo que BeerService será o responsável pelo service

* beerService.ts
Este é o arquivo responsável pela manipulação dos dados recebidos pela controller para que se possa criar a entidade Beer para o banco de dados. Há uma injeção de dependências de Repository<Beer> indicando que é o responsável por manipular a tabela que armazena Beer. Nele existe a função createBeer(), que inicialmente recebe um arquivo de imagem como parâmetro e depois o transforma em uma imagem de base64. É criado um objeto formData:

``` typescript
const formData = {
            file: base64Image,
            fileName: image.originalname
        }
```
E é feita uma requisição POST para a API de OCR em python, no endpoint "/ocr" com formData no body da requisição. Se o valor de retorno dessa requisição tiver um brandName com valor de uma String vaiza, será retornado um erro 404, com a mensagem: "Nenhuma marca encontrada na imagem.". Caso não tenha valor de retorno uma String vazia, será criado no banco de dados uma entidade Beer com os dados referentes à resposta da requisição e esse objeto criado será retornado pela função.
