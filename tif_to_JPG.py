import os
import sys
from PIL import Image


for i in range(0,1):
    file =f"tailing{i}.tif"
    print(file)
    if os.path.exists(file):
        filename=file.split(".")
        img = Image.open(file)
        img = img.resize((400,400))
        target_name = filename[0] + ".jpg"
        rgb_image = img.convert('RGB')
        rgb_image.save(target_name)
    else:
        print(file + " not found in given location")