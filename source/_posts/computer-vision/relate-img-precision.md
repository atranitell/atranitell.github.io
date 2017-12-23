---
title: 关于图像格式的那点事情
date: 2017-02-27 09:50:31
tags:
 - python
 - image
 - format
categories:
 - computer vision
---

最近遇到一些有关Image图像格式的问题，精度确实在一定程度上很影响识别的精度。以前没有太过注意`PIL`库的使用方式，直到自己构建了一个tensorflow example之后才发现accuracy的不一致。这里仔细探究一下图像格式的一些问题。
```python
from PIL import Image
import numpy as np

im_ori = Image.open('img_01.jpg')
im_ori.save('img_01_save.jpg', quality=75)

im = Image.open('img_01_save.jpg')

im_ori_np = np.asarray(im_ori, dtype='float32')
print('original pic:')
print(im_ori_np[0][0:3])

im_np = np.asarray(im, dtype='float32')
print('\nreload pic:')
print(im_np[0][0:3])

print('\nMSE:')
print(((im_ori_np-im_np)**2).mean(axis=None))
```
首先是读入一张`77,535 Byte`的`JPG`格式的图像，然后再以默认的方式输出。结果发现输出后的图像大小为`37,061 Byte`也就是说，默认输出是存在有损压缩的。经查阅文档发现，有如下内容：

{% blockquote Image http://pillow.readthedocs.io/en/3.1.x/handbook/image-file-formats.html - save function %}
The image quality, on a scale from 1 (worst) to 95 (best). **The default is 75**. Values above 95 should be avoided; 100 disables portions of the JPEG compression algorithm, and results in large files with hardly any gain in image quality.
{% endblockquote %}

既然这样，那我们将quality增加到95，输出MSE，观察结果。发现MSE结果从`55.8553`降至`2.50801`，看起来似乎很小了，RGB三通道只有一两位有误差。但有没有零误差的方法呢？这里就不能使用JPG格式的图像了，必须要BMP格式。

{% blockquote Wiki https://en.wikipedia.org/wiki/BMP_file_format - BMP Format %}
The BMP file format is capable of storing two-dimensional digital images both monochrome and color, in various color depths, and **optionally with data compression**, alpha channels, and color profiles. 
{% endblockquote %}

输出以`im_ori.save('img_01_save.bmp)`该方式，检查`MSE`结果为`0`，Good Job。