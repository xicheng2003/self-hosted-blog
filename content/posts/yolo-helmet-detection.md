---
title: 基于YOLO算法的安全帽的目标检测
slug: yolo-helmet-detection
date: '2024-03-17T00:00:00.000+08:00'
updated: '2024-03-17T07:29:02.824Z'
excerpt: YOLOv8训练简易实例
category: 技术
tags:
  - Tech
  - Machine Learning
cover: /images/posts/yolo-helmet-detection/cover.webp
featured: true
draft: false
---
> 🛠 （截至2024/03/16 12:14:28）本文仍在编辑中，内容可能不完整

## YOLO简介

YOLO是计算机视觉中广为人知的目标检测算法模型。由华盛顿大学的约瑟夫-雷德蒙（Joseph Redmon）和阿里-法哈迪（Ali Farhadi）开发。YOLO 于 2015 年推出，因其高速度和高精确度而迅速受到欢迎。

自2015年推出的YOLOv1开始，截至最近推出的YOLOv9，YOLO家族不断壮大。

> 关于YOLO算法的原理机制，感兴趣可以研读YOLOv1的论文。
> 具体而不严谨地说，后续版本都是在此原理上的优化改进。虽然版本演进，YOLO算法在不断完善，但是v1版本才是用回归做物体检测的开山之作。
> **Link:** [**You Only Look Once: Unified, Real-Time Object Detection**](https://arxiv.org/abs/1506.02640)

历遍各个优化迭代的版本，其中又以YOLOv5最为典型，使用广泛。

下面我们主要介绍v8版本的使用。

![Untitled](/images/posts/yolo-helmet-detection/e45d3a8a-Untitled.png)

YOLOv8由ultralytics公司开发，

## 准备工作

### 配置开发环境

> Conda 是 pip 的替代软件包管理器，也可用于安装。更多详情请访问 Anaconda：[https://anaconda.org/conda-forge/ultralytics](https://anaconda.org/conda-forge/ultralytics) 。

从个人习惯上说，我喜欢用Anaconda管理配置开发环境。

因此，本文仅介绍由Conda安装的方式。

**新建虚拟环境：** 启动Anaconda命令行，输入以下命令

```bash
conda create --name safehat
```

因为现在训练安全帽检测的YOLO模型，所以创建一个名为`safehat`的新虚拟环境，可以将`safehat`替换为你喜欢的任何名称。


**激活虚拟环境**：创建完毕后，激活虚拟环境以开始在其中工作。在终端中输入以下命令：

```bash
conda activate safehat
```

### 安装组件

此时的虚拟环境就是全新干净的环境，接下来就要**安装必要的包和各种组件**。

Python版本选择3.10.13

```bash
conda install python=3.10.13
```

Pytorch

![Untitled](/images/posts/yolo-helmet-detection/59cc8475-Untitled.png)

为了训练时能使用CUDA加速（需要硬件支持），此处安装适用于CUDA环境的Pytorch。

```bash
conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
```

Ultralytics

我们从YOLOv8的官方文档开始，访问ultralytics的网页，可以找到安装教程。

[Home](https://docs.ultralytics.com/)

> Explore a complete guide to Ultralytics YOLOv8, a high-speed, high-accuracy object detection & image segmentation model. Installation, prediction, training tutorials and more.

```bash
# Install the ultralytics package using conda
conda install -c conda-forge ultralytics
```
