---
title: 恢复windows下右键的从vs code中打开工程
date: 2017-02-28 15:36:02
tags:
 - vscode
categories:
 - tools
---

本来`vs code`在安装的时候可以勾选上`Add open with Code`，可是不知道怎么突然消失了，可能某一天QQ管家作死把它弄掉了吧。`vs code`在文件夹中打开的功能非常好用，因此还是得找回来。具体方法如下：

```reg
Windows Registry Editor Version 5.00

; Open files
[HKEY_CLASSES_ROOT\*\shell\Open with VS Code]
@="Edit with VS Code"
"Icon"="C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe,0"

[HKEY_CLASSES_ROOT\*\shell\Open with VS Code\command]
@="\"C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe\" \"%1\""

; This will make it appear when you right click ON a folder
; The "Icon" line can be removed if you don't want the icon to appear

[HKEY_CLASSES_ROOT\Directory\shell\vscode]
@="Open Folder as VS Code Project"
"Icon"="\"C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe\",0"

[HKEY_CLASSES_ROOT\Directory\shell\vscode\command]
@="\"C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe\" \"%1\""

; This will make it appear when you right click INSIDE a folder
; The "Icon" line can be removed if you don't want the icon to appear

[HKEY_CLASSES_ROOT\Directory\Background\shell\vscode]
@="Open Folder as VS Code Project"
"Icon"="\"C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe\",0"

[HKEY_CLASSES_ROOT\Directory\Background\shell\vscode\command]
@="\"C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe\" \"%V\""
```

保存成.reg文件，运行即可找回丢失的右键选项了。

{% blockquote this DaveJ http://thisdavej.com/right-click-on-windows-folder-and-open-with-visual-studio-code/ — Right click on Windows folder and open with Visual Studio Code Marketing %}
{% endblockquote %}