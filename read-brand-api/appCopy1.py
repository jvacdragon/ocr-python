from flask import Flask, request, jsonify
from PIL import Image, ImageEnhance
import pytesseract

app = Flask(__name__)

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error':'Nenhum arquivo encontrado'}), 400
    
    file = request.files['file']
    image = Image.open(file).convert('L')

    width, height = image.size

    upperProportion = 0.25
    lowerProportion = 0.10

    left=0
    upper = int(height*upperProportion)
    right = width
    lower = int(height*(1-lowerProportion))

    box = (left, upper, right, lower)
    croppedImage = image.crop(box)

    enhancer = ImageEnhance.Contrast(croppedImage)
    enhancedImage = enhancer.enhance(1.4)

    binaryImage = enhancedImage.point(lambda p: p > 175 and 255)


    customConfig = '--oem 3 --psm 6'
    brandName = pytesseract.image_to_string(binaryImage, config=customConfig)

    return jsonify({'brand': brandName.strip()})

if __name__ == '__main__':
    app.run(port=5000)