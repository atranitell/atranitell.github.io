---
title: 在Ubuntu16.04安装TensorFlow
date: 2017-12-04 10:48:32
tags:
 - tensorflow
 - linux
categories:
 - tools
---

最近发现阿里云提供了按需GPU的服务，感觉还不错，跑一些小的网络总比跑自己笔记本划算的多。不过也因为没有仔细看说明，交了不少学费。

首先，按需收费是指自购买日期时就开始计算费用，**不管你是停止还是关机**，只有`完全释放`才能停止收费，可它将删除你所有的资料。因此，对于我们做深度学习的人来说，配置环境就是件麻烦事，拷贝数据程序，调试成功就需要不少时间。因此，在每次用完后，留存一个快照，下一次重新购买，这一点就不如亚马逊云做的好。不过因为服务器在国内，传输数据文件，访问速度等都有不小的优势。

### configure system
因为工作机器是`win10`的笔记本，因此强烈推荐大家使用`WinSCP`这款软件。可视化的基于scp的传输方式给linux系统传送文件，比起配置ftp等还是方便不少。

```bash
# update source.lists
vim /etc/apt/source.list
# type in
deb http://mirrors.aliyun.com/ubuntu/ xenial main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ xenial-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ xenial main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ xenial-backports main restricted universe multiverse
# update system
apt update
apt upgrade
```
首先配置`virtualenv`环境，这样有一个好处是使用各种python的包等不会影响到其它的用户。同时在不同的项目中可以具备很好的独立性。然而aliyun的pypi源在安装的时候似乎有些问题，我们切换回官方源。
```bash
# install virtualenv
# there we need change pypi source back to pypi
vim ~/.pip/pip.conf
# type in
[global]
index-url=https://pypi.python.org/simple/
[install]
trusted-host=pypi.python.org
# install
apt install python3-pip python3-dev python-virtualenv
virtualenv --system-site-packages -p python3 yourproject
source ~/yourproject/bin/activate
```

### install CUDA
如果成功进入`yourproject`环境，说明配置成功，下面我们来安装GPU环境。这里有个小坑，截止写文章时tensorflow版本号为`1.4`，因此还未支持`CUDA9.0`。最方便的安装方案仍然是：`CUDA8.0`+`cuDNN6.0`。下载`CUDA`: https://developer.nvidia.com/cuda-80-ga2-download-archive 。记得还有一个cudart补丁，一并安装好。
```bash
sudo dpkg -i cuda-repo-ubuntu1604-8-0-local-ga2_8.0.61-1_amd64.deb
sudo apt update
sudo apt install cuda
# add env path
vim ~/.bashrc
# type in
export LD_LIBRARY_PATH=/usr/local/cuda-8.0/lib64:/usr/local/cuda-8.0/extras/CUPTI/lib64:$LD_LIBRARY_PATH
export CUDA_HOME=/usr/local/cuda-8.0
export PATH=/usr/local/cuda-8.0/bin:$PATH
```

下载 `cuDNN Library for linux` :https://developer.nvidia.com/rdp/cudnn-download 。
```bash
tar -xzvf ~/downloads/cudnn-8.0-linux-x64-v6.0.tgz
sudo cp cuda/include/cudnn.h /usr/local/cuda-8.0/include
sudo cp cuda/lib64/libcudnn* /usr/local/cuda-8.0/lib64
sudo chmod a+r /usr/local/cuda/include/cudnn.h /usr/local/cuda-8.0/lib64/libcudnn*
```

# install tensorflow
```bash
# enter in env
source ~/yourproject/bin/activae
```
因为国内的某些原因，tensorflow直接下非常慢，建议更换为aliyun的源进行下载。

```bash
vim ~/.pip/pip.conf
# type in
[global]
index-url=http://mirrors.aliyun.com/pypi/simple/
[install]
trusted-host=mirrors.aliyun.com
```

开始安装tensorflow，如官网教程一样。
```bash
easy_install -U pip
pip3 install --upgrade tensorflow-gpu
pip3 install scipy sklearn pillow
```