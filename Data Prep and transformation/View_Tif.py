import gdal

filepath = r'tailing0.tif'

dataset = gdal.Open(filepath)
image = dataset.ReadAsArray()

print(type(image))  # <class 'numpy.ndarray'>
print(image.shape)  # (13, 64, 64)
print(image.dtype)  # uint16