---
title: c++ 模板类的使用
date: 2017-04-16 18:52:08
tags:
 - c++
 - template
categories:
 - c++
---
今天实现了一个很简单的模板类。一开始的思路就和编写普通类一样，定义和实现分离。首先在`calculate.h`文件中定义了模板类类型。
```c++
// 在calculate.h文件中
#pragma once
#include <iostream>

template <typename T>
class Calculate {
public:
	T add(T a, T b);
};
```
然后在`calculate.cpp`中定义实现。
```c++
#include "calculate.h"

template <typename T>
T Calculate<T>::add(T a, T b) {
	return a + b;
}
```
在主函数中调用。
```c++
#include "calculate.h"

int main() {
	Calculate<int> c1;
	std::cout << c1.add(5, 6) << std::endl;
}
```
之后便是理所当然的报错。
> error LNK2019: 无法解析的外部符号 "public: int __thiscall Calculate<int>::add(int,int)" (?add@?$Calculate@H@@QAEHHH@Z)，该符号在函数 _main 中被引用
> fatal error LNK1120: 1 个无法解析的外部命令

** 解决方案：模板不支持分离编译, 把你模板类的声明和实现放到.h文件里面 **

### C++的编译过程
首先是`c++`编译的一个简单的过程：
- 一个`编译单元（translation unit）`指一个`.cpp`文件以及它所#include的所有`.h`文件
- `.h`文件代码将被扩展并包含到`.cpp`文件。
- 该`.cpp`文件被编译器编译成`.obj`文件，该文件具备`可执行`属性，为二进制。因为不保证有`main`函数接口，所以不一定可以被执行。
- 工程内所有的`.cpp`文件被分离编译完成后，再由`连接器（linker）`进行连接成为一个.exe文件。

举例来说：
```c++
//---------------test.h-------------------//
void f();//这里声明一个函数f

//---------------test.cpp--------------//
#include”test.h”
void f() {
…//do something
}  //这里实现出test.h中声明的f函数

//---------------main.cpp--------------//
#include”test.h”
int main() {
	f(); //调用f，f具有外部连接类型
}
```
在这个例子中，`test. cpp`和`main.cpp`各自被编译成不同的`.obj`文件（姑且命名为test.obj和main.obj），在`main.cpp`中，调用了`f`函数，然而当编译器编译`main.cpp`时，它所仅仅知道的只是`main.cpp`中所包含的`test.h`文件中的一个关于`void f()`的声明，所以，编译器将这里的f看作外部连接类型，即认为它的函数实现代码在另一个`.obj`文件中，本例也就是`test.obj`，也就是说，`main.obj`中实际没有关于f函数的哪怕一行二进制代码，而这些代码实际存在于`test.cpp`所编译成的`test.obj`中。在`main.obj`中对`f`的调用只会生成一行`call`指令，像这样`call addr_f`。

在编译时，这个`call`指令显然是错误的，因为`main.obj`中并无一行`f`的实现代码。那怎么办呢？这就是连接器的任务，连接器负责在其它的`.obj`中（本例为test.obj）寻找`f`的实现代码，找到以后将`call addr_f`这个指令的调用地址换成实际的`f`的函数进入点地址。需要注意的是：连接器实际上将工程里的`.obj`连接成了一个`.exe`文件，而它最关键的任务就是上面说的，寻找一个外部连接符号在另一个`.obj`中的地址，然后替换原来的虚假地址。

更细致的讲，`call addr_f`这行指令其实并不是这样的，它实际上是所谓的`stub`，也就是一个`jmp 0xABCDEF`。这个地址可能是任意的，然而关键是这个地址上有一行指令来进行真正的`call addr_f`动作。也就是说，这个`.obj`文件里面所有对f的调用都`jmp`向同一个地址。这样做的好处就是连接器修改地址时只要对后者的`call XXX`地址作改动就行了。但是，连接器是如何找到`f`的实际地址的呢（在本例中这处于test.obj中），因为`.obj`与`.exe`的格式是一样的，在这样的文件中有一个符号导入表和符号导出表（`import table`和`export table`）其中将所有符号和它们的地址关联起来。这样连接器只要在test.obj的符号导出表中寻找符号f（当然C++对f作了mangling）的地址就行了，然后作一些偏移量处理后（因为是将两个.obj文件合并，当然地址会有一定的偏移，这个连接器清楚）写入`main.obj`中的符号导入表中`f`所占有的那一项即可。

### 模板类的问题所在
而对于模板类来说，举前面`calculate`代码的例子。由于C++标准明确表示**当一个模板不被用到的时侯它就不该被实例化出来**(因为编译器根本不知道要实例化为哪一种类型)，所以对`calculate.cpp`的编译不会生成任何代码。而对`main.cpp`编译时，发现存在`add<int>`函数，于是寄予希望给连接器，希望它能在其他的`.obj`文件中找到接口。而`calculate.obj`因为模板从来没有实例化过，所以就会提示链接错误。

如果将模板的定义和实现放到`.h`文件中，那么在`main.cpp`中就会就地展开，并实例化为`Calculate<int>`类，从而能够顺利进行调用。所以归其根本在于这种`分离式编译`的方法，导致我们必须要在`.h`中实现模板类的所有定义。

*注：在boost中，能看到很多`.hpp`文件，该文件就是大量的模板类。*