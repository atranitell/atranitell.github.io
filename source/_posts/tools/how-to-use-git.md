---
title: git使用指南
date: 2017/2/25 08:48:28
categories:
 - tools
tags:
 - git
 - github
---

### 提交到远程服务器
{% codeblock lang:bash %}
touch README.md # 新建说明文件
git init # 在当前项目目录中生成本地git管理,并建立一个隐藏.git目录
git add . # 添加当前目录中的所有文件到索引
git commit -m "first commit" # 提交到本地源码库，并附加提交注释
git remote add origin https://github.com/chape/test.git # 添加到远程项目，别名为origin
git push -u origin master # 把本地源码库push到github 别名为origin的远程项目中，确认提交
{% endcodeblock %}

### 从服务器初始化仓库
{% codeblock lang:bash %}
touch README.md # 新建说明文件
git init
git remote add origin https://github.com/chape/test.git
git pull
{% endcodeblock %}

### 修改文件并上传
{% codeblock lang:bash %}
git add .
git commit -m "update test" # 检测文件改动并附加提交注释
git push -u origin master # 提交修改到项目主线
{% endcodeblock %}

### 删除历史提交中的大文件
在不懂事的时候上传了一些.txt的大数据文件，最近突然发现git大了很多，经过反复核对，发现过去有一次提交了数据文件。因此，需要将那一次的提交的数据文件从git history中全部删除。
{% codeblock lang:bash %}
# 查看当前git的容量 `size-pack`
git count-objects -v
# 显示最大的20个文件
git verify-pack -v .git/objects/pack/pack-*.idx | sort -k 3 -n | tail -20 #
# 查看具体该文件名
git rev-list --objects --all | grep {HASH}
# 从历史中删除该文件(
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch issue/*.txt' \
--prune-empty --tag-name-filter cat -- 1f243d1..
# --1f243d1 指修改从该次提交后的所有历史 或者输入 -- --all 修改全部历史
# 更新远程仓库
git push --force
# 删除历史引用等
rm -Rf .git/refs/original
rm -Rf .git/logs/
git gc
# 查看当前仓库大小
git count-objects -v
{% endcodeblock %}

### 其它的一些
{% codeblock lang:bash %}
git push origin master # 把本地源码库push到Github上
git pull origin master # 从Github上pull到本地源码库
git config --list # 查看配置信息
git status # 查看项目状态信息
git branch # 查看项目分支
git checkout -b host# 添加一个名为host的分支
git checkout master # 切换到主干
git merge host # 合并分支host到主干
git branch -d host # 删除分支host
{% endcodeblock %}