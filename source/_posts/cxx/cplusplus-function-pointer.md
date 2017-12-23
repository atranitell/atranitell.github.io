---
title: c++ 函数指针
date: 2017-04-14 22:48:20
tags:
 - c++
categories:
 - c++
---

函数对象也是一种变量，函数变量的值是函数的入口地址。函数指针是指向函数类型的指针。C++是强类型语言，因此该函数指针必须显示的声明其指向哪一类函数对象。决定函数对象的有两个部分，一个是`返回值`，一个是`形参类型`。

### 函数指针调用同类型的不同函数
```c++
float add(float a, float b) {
    return (a + b);
}

float minus(float a, float b) {
    return (a - b);
}

void test() {
    float (*p1)(float, float);
    float (*p2)(float, float);
    p1 = add;
    p2 = minus;
    std::cout << p1(1.0, 2.0) << std::endl;
    std::cout << p2(1.0, 2.0) << std::endl;
}
```

### 函数指针作为形参传递 - 接上面的代码
```c++
// use `using` to simplify the code
using ops = float(*)(float, float);

// surly, you also could use `float(*p)(float, float) to replace `ops p`
float calculate(float a, float b, ops p) {
    return p(a, b);
}

void test() {
    std::cout << calculate(1.0, 2.0, add) << std::endl;
    std::cout << calculate(1.0, 2.0, minus) << std::endl;
}
```