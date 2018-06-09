---
title: Docker 安装 Detectron 框架
date: 2018-06-09 11:48:31
tags:
 - docker
 - detectron
 - linux
categories:
 - deep learning

---

## 安装 docker
```bash
# Older versions of Docker were called docker or docker-engine. If these are installed, uninstall them; The contents of /var/lib/docker/, including images, containers, volumes, and networks, are preserved. The Docker CE package is now called docker-ce.
sudo apt-get remove docker docker-engine docker.io

# update package index
sudo apt-get update

# Install packages to allow apt to use a repository over HTTPS:
sudo apt-get install 
  apt-transport-https \
  ca-certificates \
  curl \
  software-properties-common

# Add Docker's official GPG key:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Verify that you now have the key with the fingerprint 9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88, by searching for the last 8 characters of the fingerprint.
sudo apt-key fingerprint 0EBFCD88

# Use the following command to set up the stable repository. You always need the stable repository, even if you want to install builds from the edge or test repositories as well. To add the edge or test repository, add the word edge or test (or both) after the word stable in the commands below.
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

# install
sudo apt-get update
sudo apt-get install docker-ce

# verify
sudo docker run hello-world
```

## 安装 nvidia docker
```bash
# If you have nvidia-docker 1.0 installed: we need to remove it and all existing GPU containers
docker volume ls -q -f driver=nvidia-docker | xargs -r -I{} -n1 docker ps -q -a -f volume={} | xargs -r docker rm -f
sudo apt-get purge -y nvidia-docker

# Add the package repositories
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update

# Install nvidia-docker2 and reload the Docker daemon configuration
sudo apt-get install -y nvidia-docker2
sudo pkill -SIGHUP dockerd

# Test nvidia-smi with the latest official CUDA image
docker run --runtime=nvidia --rm nvidia/cuda nvidia-smi
```

## 安装 Caffe2 Docker
```bash
# pull from library
docker pull caffe2ai/caffe2
# to test
nvidia-docker run -it caffe2ai/caffe2:latest python -m caffe2.python.operator_test.relu_op_test
# to interact
nvidia-docker run -it caffe2ai/caffe2:latest /bin/bash
```

## 安装 Detectron Docker
```bash
# pull from github
git clone https://github.com/facebookresearch/detectron
cd Detectron/docker

# build docker
docker build -t detectron:c2-cuda9-cudnn7 .
```

## Docker 相关指令
- 启动 
`service docker start`

- 查看版本 
`docker version`

- 删除镜像 
`docker image rm [imageName]`

- 抓取镜像 
`docker image pull library/hello-world`

- 运行镜像/运行并挂载本地目录
`docker container run hello-world`
`docker run -it -v /home/:/home ubuntu64 /bin/bash`

- 列出所有容器包括已经停止的
`docker container ls --all`

- 恢复容器(包括终止的)
`docker container start -i [Container-ID]`