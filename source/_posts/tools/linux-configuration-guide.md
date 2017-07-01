---
title: linux的相关配置命令
date: 2017-04-04 17:34:04
tags:
 - linux
categories:
 - tools
---

虽然`linux`确实蛮好用的，如果熟悉命令的话。但是一直以来在windows下工作，因此很多命令以前挺熟悉的现在又忘记了，还有一些服务的配置等。现在做个memo记录一下，以后再进行配置的时候就可以进行参考。当然，本机的linux版本是`ubuntu 16.04`。

### 配置用户权限
一直以来都不太熟悉用户权限的控制，直到开始配置网站和ftp的时候，才发现这个东西还是要仔细看看的。在`linux`下用数字来表示三种权限：
- `0 无权限` `1 执行权限` `2 写入权限` `4 读取权限`

利用`chmod xxx filename/foldname`改变文件或文件夹的权限。
其中`xxx`按顺序分别代表`owner`, `group`, `others`的权限配置。

### 配置 vsftp
```bash
apt install vsftpd
vim /etc/vsftpd.conf    # config vsftp
```
默认是不允许使用`root`用户登陆，因此还需要增加一个ftp用户。

<!--## 安装 nginx-->

### 安装 node
一般来说，直接使用`apt install nodejs npm`就可以了，但是`ubuntu 16.04`默认并不是最新的。因此很多插件不支持，比如`hexo-generator-json-content`。
```bash
apt purge nodejs npm
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 关于sudo后，环境变量的改变
有时候，我们安装程序时必须要使用`sudo`，然而`sudo`安装后增加的`path`和普通模式下是不一样的。如果使用软连接的话，又会带来一大堆版本问题。这个时候，我们可以修改普通用户的`.bash_profile`文件:
```bash
$vi ~/.bash_profile
# 添加:
PATH=$PATH:$HOME/bin:/sbin:/usr/sbin:/usr/local/bin:/usr/local/sbin
source ~/.bash_profile
```

另外一种情况是，执行`sudo`命令时，发现`command not found`。我们需要增加本地路径到`sudoers`文件中。
```bash
vim /etc/sudoers
# find secure_path and add line
Defaults secure_path = /sbin:/bin:/usr/sbin:/usr/bin:/usr/local/bin
```