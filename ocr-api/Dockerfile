FROM python:3.9

RUN apt-get update && \ 
    apt-get -y install tesseract-ocr && \
    apt-get -y install ffmpeg libsm6 libxext6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

#copiar e instalar dependências
COPY requirements.txt ./
RUN pip install -r requirements.txt


COPY . .

EXPOSE 5000

CMD ["python", "app.py"]