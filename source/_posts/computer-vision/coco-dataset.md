---
title: COCO 数据集解析
date: 2018-06-13 12:00:31
tags:
 - coco
 - segmentation
 - cv
categories:
 - computer vision
---

Microsoft COCO 数据集提供四种数据：
- captions: 图像描述任务
- instance: 图像实例分割任务
- keypoint: 人物关键点检测
- stuff: 语义分割

## prepare
MSCOCO 官方提供了一个 PythonAPI 可以通过 `pip` 直接安装
```bash
pip install pycocotools
```

## instance segmentation

### 数据格式
举 `instances_val2017.json` 来说，仅输出前一张图片，它的格式是：
```json
{
  "info": {
    "description": "COCO 2017 Dataset",
    "url": "http://cocodataset.org",
    "version": "1.0",
    "year": 2017,
    "contributor": "COCO Consortium",
    "date_created": "2017/09/01"
  },
  "licenses": [],
  "images": [
    {
      "license": 4, 
      "file_name": "000000397133.jpg", 
      "coco_url": "http://images.cocodataset.org/val2017/000000397133.jpg", 
      "height": 427, 
      "width": 640, 
      "date_captured": '2013-11-14 17:02:52', 
      "flickr_url": "http://farm7.staticflickr.com/6116/6255196340_da26cf2c9e_z.jpg", 
      "id": 397133
    }
  ],
  "annotations": [
    {
      "segmentation": [[0.5, 195.31, 4.73, 202.28, 9.7, 212.97, 8.46, ...]], 
      "area": 838.0560500000003, 
      "iscrowd": 0, 
      "image_id": 291634, 
      "bbox": [0.0, 194.82, 14.92, 89.78], 
      "category_id": 1, 
      "id": 464772
    }
  ],
  "categories": {
    "supercategory": "animal", 
    "id": 17, 
    "name": "cat"
  }
}
```

这里需要说明的是，对于annotations，如果一个物体存在遮挡（刚好中间被挡住），那么它可能有多个segmentation。如果instance表示单个object，则iscrowd=0，segmentation=polygon； 单个object也可能需要多个polygons，比如occluded的情况下； 如果instance表示多个objecs的集合，则iscrowd=1，segmentation=RLE， iscrowd=1用于标注较多的objects。

<center><img src="/image/coco-dataset-fig1.png" width="70%" /></center>

假设我们开始训练，重要的是如何索引 image，segmentation，category等。
```python
from pycocotools.coco import COCO
coco = COCO('annotations/instances_val2017.json')

# load all category
class_ids = sorted(coco.getCatIds(catNms=[]))

# load all image
image_ids = []
  for id in class_ids:
    # getImgIds will search for the image meet catIds.
    # e.g. catIds=['people', 'dog'], return the image with object of `people`
    #   and `dog`
    image_ids.extend(list(coco.getImgIds(catIds=[id])))
  # Remove duplicates
  image_ids = list(set(image_ids))

# load someone mask
annIds = coco.getAnnIds(imgIds=imgIds, catIds=[], iscrowd=None)
anns = coco.loadAnns(annIds)
```

这里 `anns` 包含该图像所有的 `objects`，具体见上文 `annotations` 所包含的键值。

### 评测指标
> 参考 http://cocodataset.org/#detection-eval

```latex
Average Precision (AP):
  AP                % AP at IoU=.50:.05:.95 (primary challenge metric)
  AP^IoU = .50      % AP at IoU=.50 (PASCAL VOC metric)
  AP^Iou = .75      % AP at IoU=.75 (strict metric)
AP Across Scales:
  AP^small          % AP for small objects: area < 322 
  AP^medium         % AP for medium objects: 322 < area < 962 
  AP^large          % AP for large objects: area > 962
Average Recall (AR):
  AR^max = 1        % AR given 1 detection per image 
  AR^max = 10       % AR given 10 detections per image 
  AR^max = 100      % AR given 100 detections per image
AR Across Scales:
  AR^small          % AR for small objects: area < 322 
  AR^medium         % AR for medium objects: 322 < area < 962 
  AR^large          % AR for large objects: area > 962
```
1. Unless otherwise specified, AP and AR are averaged over multiple Intersection over Union (IoU) values. **Specifically we use 10 IoU thresholds of .50:.05:.95**. This is a break from tradition, where AP is computed at a single IoU of .50 (which corresponds to our metric APIoU=.50). Averaging over IoUs rewards detectors with better localization.
2. AP is averaged over all categories. Traditionally, this is called `mean average precision` (mAP). We make no distinction between AP and mAP (and likewise AR and mAR) and assume the difference is clear from context.
3. AP (averaged across all 10 IoU thresholds and all 80 categories) will determine the challenge winner. This should be considered the single most important metric when considering performance on COCO.
4. In COCO, **there are more small objects than large objects**. Specifically: approximately 41% of objects are small (area < 322), 34% are medium (322 < area < 962), and 24% are large (area > 962). Area is measured as the number of pixels in the segmentation mask.
5. AR is the maximum recall **given a fixed number of detections per image**, averaged over categories and IoUs. AR is related to the metric of the same name used in proposal evaluation but is computed on a per-category basis.
6. All metrics are computed allowing for **at most 100 top-scoring detections per image (across all categories)**.
7. The evaluation metrics for detection with bounding boxes and segmentation masks are identical in all respects except for the IoU computation (which is performed over boxes or masks, respectively).

### 当前结果

## semantic segmentation
### 数据格式
### 评测指标
### 当前结果

## keypoint detection
### 数据格式
### 评测指标
### 当前结果

## caption description
### 数据格式
### 评测指标
### 当前结果