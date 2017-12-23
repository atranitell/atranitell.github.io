---
title: 为github配置ssh
date: 2017/11/19 11:48:28
categories:
 - tools
tags:
 - git
 - github
---

### Generating a new SSH key
``` bash
git config --global user.name "xxx"
git config --global user.email "xxx@example.com"
ssh-keygen -t rsa -b 4096 -C "xxx@example.com"
xclip -selection c  ~/.ssh/id_rsa.pub
```

将内容直接粘贴进github中，测试
```bash
ssh -T git@github.com
# 如果出现 ...can't established. 输入 `yes`
```
