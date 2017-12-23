---
title: c++中的内存分配方式
date: 2017-04-21 14:17:23
tags:
 - c++
 - memory
categories:
 - c++
---

一个由`C/C++`编译程序占用的内存分为以下几个部分：
- **栈区 stack:** 由编译器自动分配释放，存放函数的参数值，局部变量值等。
- **堆区 heap:** 由程序员分配释放。
- **全局静态区 static:** 全局变量和静态变量存储是放在一起的，初始化全局变量和静态变量在一块区域，未初始化的全局变量和静态变量在另一块区域。分别是`data`区和`bbs`区。
- **文字常量区:** 常量字符串就放在这里，程序结束后系统统一释放`comment`区。
- **程序代码区:** 存放函数体二进制代码`code`区。

### 函数栈的空间分配方式
```c++
void test(int a, int b, int c, int d) {
    int e = a;
    int f = b;
    int g = c;
    int h = d;
}

int main() {
    test(1, 2, 3, 4);
    return 0;
}
```

上面是一段非常简单的C++代码，现在来详细解释一下函数的内存分配问题。在`main()`函数中调用`test(1, 2, 3, 4)`函数。在这个过程中，参数以此逆序压入栈中。
- `push 4`  // 010A1A8E
- `push 3`  // 010A1A90
- `push 2`  // 010A1A92
- `push 1`  // 010A1A94
- `call func_addr` // 010A1A96 -> 010A11D6

那么`010A11D6`是哪里呢，实际上在这是一个函数表，如下：
```asm
_RaiseException@16:
010A11CC  jmp         _RaiseException@16 (010A4DFAh)  
___raise_securityfailure:
010A11D1  jmp         __raise_securityfailure (010A48E0h)  
test:
010A11D6  jmp         test (010A17F0h)  
___report_securityfailureEx:
010A11DB  jmp         __report_securityfailureEx (010A4B90h)  
__vcrt_va_start_verify_argument_type<char const * const>:
010A11E0  jmp         __vcrt_va_start_verify_argument_type<char const * const> (010A22A0h)  
```

很明显，函数表里储存了`test`函数的具体入口地址`010A17F0`，继续分析。
```asm
void test(int a, int b, int c, int d) {
008217F0  push        ebp                    // 备份调用方EBP指针
008217F1  mov         ebp,esp                // 建立被调用方的栈底
008217F3  sub         esp,0F0h               // 为局部变量分配空间
008217F9  push        ebx  
008217FA  push        esi  
008217FB  push        edi  
008217FC  lea         edi,[ebp-0F0h]  
00821802  mov         ecx,3Ch  
00821807  mov         eax,0CCCCCCCCh  
0082180C  rep stos    dword ptr es:[edi]      
	int e = a;
0082180E  mov         eax,dword ptr [a]      // 注意这里是利用数组索引
	int e = a;
00821811  mov         dword ptr [e],eax 
	int f = b;
00821814  mov         eax,dword ptr [b]  
00821817  mov         dword ptr [f],eax  
	int g = c;
0082181A  mov         eax,dword ptr [c]  
0082181D  mov         dword ptr [g],eax  
	int h = d;
00821820  mov         eax,dword ptr [d]  
00821823  mov         dword ptr [h],eax  
}
00821826  pop         edi  
00821827  pop         esi  
00821828  pop         ebx  
00821829  mov         esp,ebp  
0082182B  pop         ebp  
0082182C  ret  
```

回到主函数，继续执行：
```asm
00C21A9B  add         esp,10h                  // 释放参数空间，恢复调用前的函数栈
```

### 变量的存储机制
```c++
#include <string>
int a=0;    // 全局初始化区
char *p1;   // 全局未初始化区
void main()
{
    int b;                      // 栈
    char s[]="abc";             // 栈
    char *p2;                   // 栈
    char *p3="123456";          // 123456\0在常量区，p3在栈上。
    static int c=0;             // 全局（静态）初始化区
    p1 = (char*)malloc(10);
    p2 = (char*)malloc(20);     // 分配得来的10和20字节的区域就在堆区。
    strcpy(p1,"123456");        // 123456\0放在常量区，编译器可能会将它与p3所向"123456\0"优化成一个地方。
}
```