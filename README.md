# Documentação do Upload e Processamento de Imagens com OCR para Identificação de Marcas de Cerveja

Aqui será documentado os principais arquivos utilizados na criação de uma API que tem como objetivo identificar marcas de cerveja através de suas logos.

## Divisão de pastas
- Na pasta ./brand-api está localizada a API feita em NestJS, onde no caminho ./brand-api/src estão as duas principais pastas contendo o código necessário para criação da entidade de cerveja, que é usado para ORM, armazenando seus dados no SQLite e também há os arquivos arquivos que lidam com as requisições HTTP, comunicação com a API de OCR e com a manipulação dos dados para criar a entidade de cerveja.

- Na pasta ocr-api é onde tem o código Python responsável por receber a imagem e aplicar técnicas de processamento de imagem para converte-las em texto e enviar como resposta à API do NestJS.

## Bibliotecas necessária para o funcionamento das APIs

- Na pasta ocr-api, onde está localizado o código que realiza o OCR, se faz necessária a instalação das bibliotecas: flask, pillow, pytesseract, opencv e numpy. Para realizar essas instalaçõs pela linha de comando se usa esse código em bash:

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
Dentro da pasta -/brand-api temos a pasta ./Entity contendo a entidade que iremos salvar no banco de dados, ela está localizada no arquivo beerEntity.ts. Este é o arquivo completo:

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
No mesmo nível da pasta Entity, temos a pasta Beer, nela estão contidos três principais arquivos, são eles: beer.controller.ts, beer.module.ts e beer.service.ts. Também há mais dois arquivos de teste referentes a controller e service, que estão denotados com o sufixo "spec.ts"

* beerController
O arquivo beer.controller.ts é responsável por ser o controlador da API, recebendo diretamente o arquivo de imagem através de um método POST enviado para o endereço '/beer'. Nele há uma injeção de depêndencia para BeerService. Após receber a image, o controller tenta criar uma entidade Beer através do BeerService. Caso seja bem sucedida essa criação, será retornado o seguinte código json:

```json

    success: true,
    brandName: NOME_DA_MARCA

```
* beer.module.ts
Este arquivo é o responsável por organizar todas as funcionalidades relacionadas à cerveja, no caso todas as principais para o funcionamento dessa API. Seu código é:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Beer } from "src/Entity/beer.entity";
import { BeerController } from "./beer.controller.ts";
import { BeerService } from "./beer.service";


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

* beer.service.ts
Este é o arquivo responsável pela manipulação dos dados recebidos pela controller para que se possa criar a entidade Beer para o banco de dados. Há uma injeção de dependências de Repository<Beer> indicando que é o responsável por manipular a tabela que armazena Beer. Nele existe a função createBeer(), que inicialmente recebe um arquivo de imagem como parâmetro e depois o transforma em uma imagem de base64. É criado um objeto formData:

``` typescript
const formData = {
            file: base64Image,
            fileName: image.originalname
        }
```
E é feita uma requisição POST para a API de OCR em python, no endpoint "/ocr" com formData no body da requisição. Se o valor de retorno dessa requisição tiver um brandName com valor de uma String vaiza, será retornado um erro 404, com a mensagem: "Nenhuma marca encontrada na imagem.". Caso não tenha valor de retorno uma String vazia, será criado no banco de dados uma entidade Beer com os dados referentes à resposta da requisição e esse objeto criado será retornado pela função.

## Pasta  ./ocr-api

Aqui é onde está o arquivo principal para a API de OCR. Aqui estão as bibliotecas necessárias e o que fazer para instala-las para que o programa funcione: 

* Flask - framework web para Python
```
pip install Flask
```

* Pillow - biblioteca para manipulação de imagens
```
pip install pillow
```

* Numpy - biblioteca para manipulação de arrays e operações matemáticas
```
pip install numpy
```

* Opencv-python - para processamento de imagens
```
pip install opencv-python
```

* Pytesseract - para utilizar o Tesseract OCR em python (Certifique-se de ter instalado corretamente o Tessseract OCR na sua máquina)
```
pip install pytesseract
```

Link para instalação do Tesseract no Windows: https://github.com/UB-Mannheim/tesseract/wiki

### Código para OCR em app.py
Este é o arquivo que responsável por receber a imagem em base64, converte-la para um arquivo e fazer todo o processamento da imagem para enviar a resposta ao backend em NestJS. A partir daqui serão explicados os trechos de código para que se possa compreender como é feito esse processamento de imagem. Estarei dividindo o código em cinco seções para entendimento: Importações, inicio da função, pré processamento de imagem, pós processamento de imagem e finalização

#### Imports
Aqui é onde estão sendo importadas bibliotecas e funções delas que serão utilizadas ao decorrer doc código

```python
from flask import Flask, request, jsonify
from PIL import Image, ImageEnhance
import base64
import pytesseract
from io import BytesIO
import cv2
import numpy as np
import re
```

- Flask está sendo utilizado para criar a API
- Pillow para manipular a imagem recebida pela API
- base64 é usado para decodificar a imagem recebida
- pytesseract é usado para identificar palavras na imagem
- io.BytesIO está sendo usado para conversão da imagem base64.
- cv2 (OpenCV) serve para o processamento de imagem
- numpy (np) Usada em conjunto com OpenCV para manipulação de arrays de pixels da imagem
- re é a bliblioteca de expressões regulares usada para o pós processamento da imagem


#### Inicialização de servidor Flask e inicio da função

Abaixo é iniciado o servidor Flask e definida a rota para a função que irá lidar com o método POST. A rota sendo '/ocr'.

```python
app = Flask(__name__)

@app.route('/ocr', methods=['POST'])
def ocr():
```

Aqui é feita a verificação de se o que foi recebido pela requisição tem o campo 'file', caso não tenha, será retornado um erro 400 com a mensagem descrita.

```python
data = request.json

    if 'file' not in data:
        return jsonify({'error':'Nenhum arquivo encontrado'}), 400
```

No trecho abaixo a imagem recebida é decodificada e convertida para RGB, para que se possa manipular suas cores

```python
    imageData = base64.b64decode(data['file'])
    image = Image.open(BytesIO(imageData)).convert('RGB')
```

#### Pré processamento da imagem

Abaixo é a primeira manipulação de imagem, aumentando seu contraste para tentar distinguir o fundo dela das palavras

```python
    enhancer = ImageEnhance.Contrast(image)
    enhancedImage = enhancer.enhance(2)
```

Convertendo imagem para formato RGB, para que possa ser manipulada pelo OpenCV:

```python
    image_cv = cv2.cvtColor(np.array(enhancedImage), cv2.COLOR_RGB2BGR)
```

Notei que diversas marcas de cerveja utilizam vermelho no fundo e percebi que nas primeiras versões do código isso estava atrapalhando na manipulação da imagem para reconhecer palavras. Então abaixo existe um código para detectar tons mais escuros e mais claros de vermelho com a finalidade de remover da imagem.

```python
    hsv_image = cv2.cvtColor(image_cv, cv2.COLOR_BGR2HSV)
    lower_red = np.array([0, 70, 50]) 
    upper_red = np.array([10, 255, 255])  
    mask1 = cv2.inRange(hsv_image, lower_red, upper_red)

    lower_red = np.array([170, 70, 50])  
    upper_red = np.array([180, 255, 255])  
    mask2 = cv2.inRange(hsv_image, lower_red, upper_red)

    red_mask = mask1 + mask2
```

Abaixo são aplicadas as máscaras feitas para tons de vermelho, visando a remoção:

```python
    red_mask_inv = cv2.bitwise_not(red_mask)
    result = cv2.bitwise_and(image_cv, image_cv, mask=red_mask_inv)
```

E aqui a imagem é aplicado tons de cinza na imagem para melhor identificação de palavras:

```python
    gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
```

Logo depois é utilizado método para suavizar a imagem e binarizar ela (tornar preto e branco) através do método de Otsu:

```python
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
```

Melhorando nitidez de bordas:

```python
kernel = np.ones((3, 3), np.uint8)
dilated = cv2.dilate(binary, kernel, iterations=1)
eroded = cv2.erode(dilated, kernel, iterations=1)
```

Fazendo inversão de imagem para ser melhor lido pelo OCR:

```python
    inverted = cv2.bitwise_not(eroded)
```

Abaixo é definida a configuração do OCR. Sendo oem 3 o modo de reconhecimento OCR e psm 6 o modo de segmentação, que é usado para linhas de texto. Ao fim, é extraída a String identificada para a variável brandName

```python
    customConfig = '--oem 3 --psm 6'
    brandName = pytesseract.image_to_string(inverted, config=customConfig)

```

#### Pós processamento da imagem
Após o pré processamento, ainda se faz necessário processar o que foi extraído da imagem, visto que podem conter erros. O código usado para isso foi: 

```python
    brandName = re.sub(r'[^a-zA-Z\s]', '', brandName)
    brandName = brandName.replace("\n", "")
```

Acima é usado uma expressão regular para remover todos os caractere que não sejam letras maiúsculas, minúsculas ou espaços. Também é substituído todas as quebras de linha (\n) por uma string vazia

#### Finalização
Por fim, é retornado o json com o nome da marca e logo após inicializado o servidor flask na porta 5000:

```python
    return jsonify({'brand': brandName})

if __name__ == '__main__':
    app.run(port=5000)
```