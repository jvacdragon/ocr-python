from flask import Flask, request, jsonify
from PIL import Image, ImageEnhance
import base64
from flask_cors import CORS
import pytesseract
from io import BytesIO
import cv2
import numpy as np
import re

app = Flask(__name__)
CORS(app)

@app.route('/process-image', methods=['POST'])
def ocr():
    data = request.json

    if 'file' not in data:
        return jsonify({'error':'Nenhum arquivo encontrado'}), 400
    
    #convertendo imagem de base64 pra arquivo com RGB
    imageData = base64.b64decode(data['file'])
    image = Image.open(BytesIO(imageData)).convert('RGB')

    #pre processamento de imagem
    enhancer = ImageEnhance.Contrast(image)
    enhancedImage = enhancer.enhance(2)

    image_cv = cv2.cvtColor(np.array(enhancedImage), cv2.COLOR_RGB2BGR)

    hsv_image = cv2.cvtColor(image_cv, cv2.COLOR_BGR2HSV)
    lower_red = np.array([0, 70, 50]) 
    upper_red = np.array([10, 255, 255])  
    mask1 = cv2.inRange(hsv_image, lower_red, upper_red)

    lower_red = np.array([170, 70, 50])  
    upper_red = np.array([180, 255, 255])  
    mask2 = cv2.inRange(hsv_image, lower_red, upper_red)

    red_mask = mask1 + mask2

    red_mask_inv = cv2.bitwise_not(red_mask)
    result = cv2.bitwise_and(image_cv, image_cv, mask=red_mask_inv)

    gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    #kernel = np.ones((3, 3), np.uint8)
    #dilated = cv2.dilate(binary, kernel, iterations=1)
    #eroded = cv2.erode(dilated, kernel, iterations=1)

    inverted = cv2.bitwise_not(binary)

    #configuração do pytesseract e transformando em string
    customConfig = '--oem 3 --psm 6'
    brandName = pytesseract.image_to_string(inverted, config=customConfig)

    #pós processamento de imagem
    brandName = re.sub(r'[^a-zA-Z\s]', '', brandName)
    brandName = brandName.replace("\n", "")

    return jsonify({'brand': brandName})

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port=5000)