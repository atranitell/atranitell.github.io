---
title: Linux进程后台运行的几种方式
date: 2017-04-04 15:05:32
tags:
 - linux
categories:
 - tools
---

最近在`aliyun`上配置个人网站。有一些用`node`生成出静态网页，用`nginx`提供路由服务。另一些采用`node`原生服务，比如`ejs`等开启在另外的端口。对于前者已经注册成系统服务，可以随系统后台开启，但对于后者，如果关闭`session`便会中断服务。**个人推荐采用screen方式进行后台处理**。

> 主要借鉴于：[Linux 进程后台运行的几种方式](https://yq.aliyun.com/articles/47309)

## Ctrl+z/bg/nohup/setsid/&
在Linux中，如果要让进程在后台运行，一般情况下，我们在命令后面加上&即可，实际上，这样是将命令放入到一个作业队列中了：

``` bash
./rsync.sh &
jobs
```
对于已经在前台执行的命令，也可以重新放到后台执行，首先按ctrl+z暂停已经运行的进程，然后使用bg命令将停止的作业放到后台运行：bg %1，放回前台运行：%1。

但是如上方到后台执行的进程，其父进程还是当前终端shell的进程，而一旦父进程退出，则会发送hangup信号给所有子进程，子进程收到hangup以后也会退出。如果我们要在退出shell的时候继续运行进程，则需要使用nohup忽略hangup信号，或者setsid将将父进程设为init进程(进程号为1)：
```bash
nohup ./rsync.sh &
setsid ./rsync.sh &
(./rsync.sh &)        # 在一个subshell中执行
ps -ef|grep rsync
```
nohup 的用途就是让提交的命令忽略 hangup 信号，标准输出和标准错误缺省会被重定向到 nohup.out 文件中。。一般我们可在结尾加上"&"来将命令同时放入后台运行，也可用" > log.out 2>&1"来更改缺省的重定向文件名。

上面的试验演示了使用nohup/setsid加上&使进程在后台运行，同时不受当前shell退出的影响。那么对于已经在后台运行的进程，该怎么办呢？可以使用disown命令：
```bash
jobs
disown -h %1
ps -ef|grep rsync
```
效果与setid相同，但是disown后无法通过jobs命令查看了。

## Screen
还有一种更加强大的方式是使用screen，首先创建一个断开模式的虚拟终端，然后用-r选项重新连接这个虚拟终端，在其中执行的任何命令，都能达到nohup的效果，这在有多个命令需要在后台连续执行的时候比较方便。

GNU Screen是一款由GNU计划开发的用于命令行终端切换的自由软件。用户可以通过该软件同时连接多个本地或远程的命令行会话，并在其间自由切换，可以看作是窗口管理器的命令行界面版本。它提供了统一的管理多个会话的界面和相应的功能。

```bash
apt install screen    # install
screen -S docker-d    # 新建一个名叫docker-d的session，并马上进入
screen -dmS docker-d  # 新建一个名叫docker-d的session，但暂不进入，可用于系统启动脚本里
screen -ls            # 列出当前所有session
screen -r docker-d    # 恢复到zhouxiao这个session，前提是已经是断开状态（-d可以远程断开会话）
screen -x docker-d    # 连接到离线模式的会话（多窗口同步演示）

screen ./rsync.sh     # screen创建一个执行脚本的单窗口会话，可以attach进程ID
screen -wipe          # 检查目前所有的screen作业，并删除已经无法使用的screen作业
```
正常情况下，当你退出一个窗口中最后一个程序（通常是bash）后，这个窗口就关闭了。另一个关闭窗口的方法是使用C-a k，这个快捷键杀死当前的窗口，同时也将杀死这个窗口中正在运行的进程。

在每个screen session 下，所有命令都以 ctrl+a(C-a) 开始。
```bash
Ctrl-a w    # 显示所有窗口列表
Ctrl-a k    # 这个快捷键杀死当前的窗口，同时也将杀死这个窗口中正在运行的进程。 
Ctrl-a d    # detach，暂时离开当前session
```
需要了解的是，一个用户创建的screen，其他用户（甚至root）通过screen -ls是看不见的。另外，Ctrl+a在bash下是用来回到行开头，不幸与上面的组合快捷键冲突。