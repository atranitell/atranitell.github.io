---
title: 损失函数概览
date: 2017-12-23 11:48:31
tags:
 - entropy
 - loss
 - theory
categories:
 - deep learning
---

### KL散度和交叉熵的区别
在上一篇关于`GAN`理论的文章中提到了`KL`散度以及说它也可以称为交叉熵。但实际上，交叉熵与它有一些微小的差异。我们先回顾一下`KL`散度的公式：$$D(p\\|q)=\sum\limits\_{i=1}^{n}p(x)\log\frac{p(x)}{q(x)} = \sum\limits\_{i=1}^{n}p(x)\log p(x) - \sum\limits\_{i=1}^{n}p(x)\log q(x)$$ 我们注意到，其实前半部分在实际中相当于一个常数项，在给定 $p$ 分布的情况下。后半部分我们称为交叉熵，它衡量了分布 $p$ 和 $q$ 的距离。然而，在深度学习优化过程中，常数项不影响优化的结果，所以我们往往采用简化的形式。

正式的说，交叉熵(cross entropy)定义为：$$H(p,q)=-\int p(x)\log q(x)dx $$ 其中，$p(x$) 是数据的真实分布的概率，$q(x)$ 是由数据计算得到的概率分布。我们期望计算得到的分布尽可能的接近真实分布。下面，我们将正式的介绍损失函数，它的变化形式，以及在DNN中的来源，影响，和作用。

### 损失函数
在以前的一篇文章中介绍了反向传播算法的公式推导，然而Loss Function往往位于网络的顶层。因此，我们在这里只考虑顶层设计以及前一层的前向传播和方向传播。假设网络最后一层 $l$ 的线性输出为 $a^{(l+1)}=W^{(l)}x^{(l)}+b^{(l)}$，非线性映射函数为 $\widetilde{y}=f(a^{(l+1)})$。Loss Function是衡量预测分布与真实分布的一种度量手段，这里我们用 $L=D(y, \widetilde{y})$ 表示与目标分布的距离。在反向传播阶段，我们需要求出前层梯度值：
\begin{align}
\nabla\_{W^{(l)}}L=\frac{\partial L}{\partial a^{(l+1)}}\frac{\partial a^{(l+1)}}{\partial W^{(l)}}=\delta^{(l+1)}x^{(l)} \\\\
\nabla\_{b^{(l)}}L=\frac{\partial L}{\partial a^{(l+1)}}\frac{\partial a^{(l+1)}}{\partial b^{(l)}}=\delta^{(l+1)}
\end{align}

### L2 Loss
现在，我们考虑一种传统的损失函数，比如 `l2-loss`，其距离分布定义为：$$D\_{l2}(y, \widetilde{y})=\\|y-\widetilde{y}\\|\_2^2$$ 在这里 $y$ 和 $\widetilde{y}$ 可以是一个标量也可以是一个向量。将该损失函数代入至反向传播过程中，易得：
\begin{align} 
\delta^{(l+1)} &= \frac{\partial D\_{l2}}{\partial a^{(l+1)}} = \frac{\partial D\_{l2}}{\partial \widetilde{y}}\frac{\partial \widetilde{y}}{\partial a^{(l+1)}} \\\\
&= -2(y-\widetilde{y})f'(a^{(l+1)})
\end{align}

如果考虑网络的目标输出采用`sigmoid`激活函数，$a^{(l+1)}$ 简化为 $x$，即：$$ \widetilde{y} = {\rm sigmoid}(x) = \frac{1}{1+e^{-x}} $$ 那么其微分形式为：$$f'(x)= \frac{e^{-x}}{(1+e^{-x})^2}=f(x)(1-f(x)) $$ 将其代入至反向传播过程中：$$ \delta^{(l+1)} = -2(y-f(a^{(l+1)}))f(a^{(l+1)})(1-f(a^{(l+1)})) $$

那么，对于每一个线性输出，最终梯度的更新量是多少呢？在这里，我们假定一个二分类问题，即 $y\in{1, 0}$，结果如下图所示。
<center><img src="/image/loss-function-l2-weight.png" width="100%" /></center>

这是一个很有趣的结果，我们可以看到 $y=1, y=0$ 在 $W$ 的梯度值是关于 $y$ 轴对称。也就是说对任意的 $x$，接近 $1$ 即远离 $0$，对于前者更新值为正，对于后者为负，非常的reasonable。这里，我看到网上有些博客说因为`l2-loss`会导致收敛变慢，所以采用交叉熵作为损失函数，我觉得是有一些问题的，在这里持保留态度。

### Cross-Entropy Loss
刚刚提到了`l2-loss`，我们从其推导出交叉熵损失函数的公式。考虑梯度的一般形式： $$\delta^{(l+1)}=\frac{\partial L}{\partial \widetilde{y}}\widetilde{y}(1-\widetilde{y})$$ 在`l2-loss`的形式下，$$\delta^{(l+1)}=-2(y-\widetilde{y})\widetilde{y}(1-\widetilde{y})$$ 那么我们是否有可能通过某种手段，消去后面的 $\widetilde{y}(1-\widetilde{y})$。也就是说，我们希望构造一个 $D\_e$，它满足：$\delta^{(l+1)} = -2(y-\widetilde{y})$。这样，代入到梯度的一般形式中，可得：$$ \frac{\partial D\_{e}}{\partial \widetilde{y}}\widetilde{y}(1-\widetilde{y}) = -2(y-\widetilde{y}) $$

下面，我们需要解 $D\_e$，相当于一个不定积分。证明如下：
\begin{align}
D\_e &= -2\int\frac{y-\widetilde{y}}{\widetilde{y}(1-\widetilde{y})}d\widetilde{y} \\\\
& = -2\int[\frac{y}{\widetilde{y}}+\frac{y-1}{1-\widetilde{y}}]d\widetilde{y} \\\\
& = -2[\int yd\log\widetilde{y}+\int(1-y)d\log(1-\widetilde{y})] \\\\
& = -2[y\log\widetilde{y}+(1-y)\log(1-\widetilde{y})] + C \\\\
& \approx -y\log\widetilde{y}-(1-y)\log(1-\widetilde{y})
\end{align}

注意，以上结果都是在激活函数为sigmoid的情况下推导而出。我们将线性输出值 $\widetilde{y}=\frac{1}{1+e^a} $ 代入：
\begin{align}
D\_e &= -y\log\widetilde{y}-(1-y)\log(1-\widetilde{y}) \\\\
&= -y\log\frac{1}{1+e^{-a}} - (1-y)\log(1-\frac{1}{1+e^{-a}})  \\\\
&= \log(1+e^{-a})+a(1-y)
\end{align}

上式便是在tensorflow中的简化求解形式。尽管观察直接的更新率，由 $-2(y-\widetilde{y})\widetilde{y}(1-\widetilde{y})$ 变成了 $-(y-\widetilde{y})$ 增加了反向传播的梯度值。