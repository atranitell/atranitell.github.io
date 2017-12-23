---
title: 泛型编程
date: 2017-05-02 09:04:25
tags:
 - c++
 - STL
categories:
 - c++
---
最近在学习`算法导论`，顺便温习一下以前的C++概念，确实很久很久没有接触过C++了。现在回头重新看这些知识点发现自己真的是只掌握了一丢丢的皮毛而已。这部分是关于`STL`的系列，回头将这些内容慢慢补齐。

现代C++中STL有六大组件：
- 容器 
- 配置器
- 迭代器
- 算法
- 配接器
- 仿函数

## 迭代器
一般而言，我们针对`数据`抽象出其中的共性，构建成`数据结构`来表示一个通用的数据概念。而`泛型编程`是通过抽象可重用的`算法`来表示一种通用方法。简单说，链表、数组、队列等等都具有不同的数据结构，但遍历的操作、读取某一元素的操作往往是相似的，这时候我们利用迭代器`iterator`来完成。

简单来说，迭代器就是一个可控的指针，可以有一些列的操作方式：
- 为了能够对迭代器执行**解引用操作**，访问其指向的元素，需要定义`*p`
- 为了能够将一个迭代器的指向位置**赋值**给另一个，需要定义`p=q`
- 为了能够实现**比较操作**，需要定义`p==q`或者`p!=q`
- 为了能够实现**遍历操作**，至少需要定义`++p`或者`p++`操作

#### for(:)的实现
对于`for(:)`是C++11的新语法，我们可以通过实现迭代器来实现对自定义数据结构的循环遍历。为实现for(:)我们需要定义以下：
- `begin()`和`end()`获取第一个元素的指针和超尾指针。
- 重载`++`操作以满足遍历需求。
- 重载`!=`操作以在达到`end()`时终止操作。
- 重载`*`操作以读取该元素的值。

```c++
template<typename T>
class DLinkNode {
public:
    T data;
    DLinkNode *prev;
    DLinkNode *next;
};

template<typename T>
class DLinkList {
public:
    class iterator {
    public:
        iterator();
        iterator(DLinkNode<T> *s);
        iterator(const iterator &s);

        DLinkNode<T> operator*() const;
        iterator& operator++();	
        bool operator!=(const iterator& p);	
    private:
        DLinkNode<T> *_cur;
    };

public:
    DLinkList();
    DLinkList(const DLinkList& s);
    ~DLinkList();

    // iterator
    iterator begin();
    iterator end();

protected:
    DLinkNode<T> *_head;
};
```
首先我们定义了一个双向链表(这里省去了双向链表的插入、删除等操作)，只是一个结构上的示意。`iterator`定义为`嵌套类`或`内部类`。下面是一些内部实现的具体细节：
```c++
template<typename T>
inline typename DLinkList<T>::iterator DLinkList<T>::begin() {
    return typename DLinkList<T>::iterator(_head);
}
```
这里需要注意的是，类`iterator`是从属于类`DlinkList<T>`，因此在类外需要用`typename`关键词声明该类型为`嵌套从属类型`。

> 完整的实现可以访问：
> https://github.com/atranitell/startup/blob/master/startup/structure/doubly_linked_list.hpp