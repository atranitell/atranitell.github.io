---
title: c++ 小技巧汇总
date: 2017-06-15 10:59:08
tags:
 - c++
categories:
 - c++
---

### 如何获取.cpp文件行号与文件名
先介绍几个编译器内置的宏定义，这些宏定义不仅可以帮助我们完成跨平台的源码编写，灵活使用也可以巧妙地帮我们输出非常有用的调试信息。ANSI C标准中有几个标准预定义宏（也是常用的）：
- __LINE__：在源代码中插入当前源代码行号；
- __FILE__：在源文件中插入当前源文件名；
- __DATE__：在源文件中插入当前的编译日期
- __TIME__：在源文件中插入当前编译时间；
- __STDC__：当要求程序严格遵循ANSI C标准时该标识被赋值为1；
- __cplusplus：当编写C++程序时该标识符被定义。

```c++
#include <stdio.h>  
int main() {  
  char file[16];  
  char func[16];  
  int line;   
  sprintf(file,__FILE__); //文件名  
  sprintf(func,__FUNCTION__); //函数名  
  printf("file=%s\n",file);  
  printf("func=%s\n",func);  
  printf("%05d\n",__LINE__); //行号   
  return 0;  
}
```

### 如何跨平台编写
操作系统判定： 
- Windows: WIN32 
- Linux: linux 
- Solaris: __sun
编译器判定： 
- VC: _MSC_VER 
- GCC/G++: __GNUC__ 
- SunCC: __SUNPRO_C 和 __SUNPRO_CC

```c++
#include <iostream>
using namespace std;
void print1(){
  cout << "this is window" << endl;
}
void print2(){
  cout << "this is linux" << endl;
}
int main() {
#ifdef WIN32
  print1();
#elif linux
  print1();
#else
  cout << "unknown os" << endl;
#endif
  return 0;
}
```

