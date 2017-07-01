---
title: 安装tensorflow r1.0的各种坑
date: 2017/2/24 13:11:31
categories:
 - deep-learning
tags:
 - tensorflow
---

# Install on Win10
我的笔记本是`GTX960M`，查了一下`cuda capacity = 5.0`，还可以支持`CUDA8.0`和`cuDNN5.1`这就是传说中的引言。记得一段时间以前还不支持windows，现在tensorflow也支持windows platform了。很早就听说它的架构设计的非常好，也一直想学习这样的模式。所以刚好有一些许时间，就打算看看它的模式。当然，还是习惯c++，因此又在虚拟机下安装了tf，由于vmware不知道怎么的安不上ubuntu16.04，只好换了virtualbox，这够折腾。此外，记得准保好`vpn`工具，不然有些资源可能会下载不下来。

## windows 安装
windows下貌似只支持python的安装。一直以来我用的是anaconda2-python27，结果告诉只有35版本。后来没注意下了Anaconda3-python36，结果依旧不可以用。好吧，反正Anaconda也用的不多，就干脆用原生的python35+vs code好了。
1. 首先下载并安装`CUDA8.0`，`cuDNN5.2` 并加入path路径
{% codeblock lang:bash %}
C:\extern\cudnn5.1\bin
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v8.0\extras\CUPTI\libx64` # important!
{% endcodeblock %}
2. 安装tesorflow `pip3 install --upgrade tensorflow-gpu`

##### Visual studio code 设置
推荐使用python插件，自带`pylint`规范化代码，挺有意思的。此外，在文件夹中打开，并配置一个tasks.json。可以使用`ctrl+shift+B`快速运行。我的配置代码如下：
{% codeblock lang:bash %} {
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "0.1.0",
    "command": "python",
    "owner": "py",
    "isShellCommand": true,
    "args": ["${file}"],
    "showOutput": "always"
} 
{% endcodeblock %} 输入tensorflow官方测试代码：
{% codeblock lang:python %}
import tensorflow as tf

node1 = tf.constant(3.0, tf.float32)
node2 = tf.constant(4.0) # also tf.float32 implicitly
print(node1, node2)
sess = tf.Session()
print(sess.run([node1, node2]))
{% endcodeblock %} 应该有正常输出的结果，以及一大串debug信息。包括设备(GPU)CUDA的连接情况以及设备型号等等。如果不想输出类似的结果，可以在开头`import tensorflow as tf`之前，插入:
{% codeblock lang:python %}
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
{% endcodeblock %} 就最小化输出了。

## Ubuntu 16.04 安装
ubuntu16.04的python安装就不说了，蛮简单的，和windows类似，这里说几个可能会用的指令。
Q：很多包(.sh之类)基于用户身份安装，但有些关联的包需要用sudo，却找不到用户安装的包。例如用户安装了python，但在sudo python却找不到命令。
A：将路径添加进用户变量：编辑`.bashrc`,最后添加`alias sudo='sudo env PATH=$PATH'`, 然后执行`source ~/.bashrc`

1. 安装bazel, 在官方网站下载下最新的bazel.sh
注意安装bazel之前，首先需要安装jre和jdk，在ubuntu16.04直接使用apt安装就好
{% codeblock lang:bash %}
sudo apt install default-jre
sudo apt install default-jdk
chmod +x bazel*.sh
./bazel*.sh
{% endcodeblock %}记得最后它要求把环境变量加进去的时候自己打进去。此外再加入一行。
{% codeblock lang:bash %}
source /home/yourname/.bazel/bin/bazel-complete.bash
export PATH=$PATH:/home/yourname/.bazel/bin
source ~/.bashrc
{% endcodeblock %} 安装tensorflow，从github上clone下来后
{% codeblock lang:bash %}
sudo apt-get install libcurl3 libcurl3-dev
sudo apt-get install zlib1g-dev
sudo ./configure
# bazel安装
bazel build --config opt //tensorflow/tools/pip_package:build_pip_package
mkdir _python_build
cd _python_build
ln -s ../bazel-bin/tensorflow/tools/pip_package/build_pip_package.runfiles/org_tensorflow/* .
ln -s ../tensorflow/tools/pip_package/* .
sudo python setup.py develop
# run train sample
git clone https://github.com/tensorflow/models
cd models/tutorials/image/mnist
python convolutional.py
{% endcodeblock %}

{% blockquote Google https://github.com/tensorflow/tensorflow/blob/master/tensorflow/g3doc/get_started/os_setup.md — Install Tensorflow %}
更多请参考该网站。
{% endblockquote %}





