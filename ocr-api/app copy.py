from flask import Flask, request, jsonify
from PIL import Image, ImageEnhance
import base64
import pytesseract
from io import BytesIO
import cv2
import numpy as np

app = Flask(__name__)

@app.route('/ocr', methods=['POST'])
def ocr():
    data = request.json

    if 'file' not in data:
        return jsonify({'error':'Nenhum arquivo encontrado'}), 400
    
    imageData = base64.b64decode(data['file'])
    image = Image.open(BytesIO(imageData)).convert('RGB')  

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

    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(binary, kernel, iterations=1)
    eroded = cv2.erode(dilated, kernel, iterations=1)

    inverted = cv2.bitwise_not(eroded)

    #inverted = cv2.bitwise_not(binary)


    #file = request.files['file']
    #image = Image.open(file).convert('L')

    #width, height = image.size

    #upperProportion = 0.25
    #lowerProportion = 0.10

    #left=0
    #upper = int(height*upperProportion)
    #right = width
    #lower = int(height*(1-lowerProportion))

    #box = (left, upper, right, lower)
    #croppedImage = image.crop(box)

    #enhancer = ImageEnhance.Contrast(croppedImage)
    #enhancedImage = enhancer.enhance(1.4)

    #binaryImage = enhancedImage.point(lambda p: p > 175 and 255)


    customConfig = '--oem 3 --psm 6'
    brandName = pytesseract.image_to_string(inverted, config=customConfig)

    return jsonify({'brand': brandName.strip()})

if __name__ == '__main__':
    app.run(port=5000)