---
title: Softmax vs. Sotmax-Loss 数值稳定性
date: 2017-04-17 10:09:14
tags:
 - cnn
categories:
 - deep learning
---

最近一直在和学校的老师做Deep Learning有关的课题，虽然说是在做学术上的事情，可是大多数仍然是工程方面的。现在Deep Learning的一个很大的趋势是工程化。虽然学术界有很多看起来很漂亮的理论和方法，但在实际使用中，用的往往不多，反倒是经过历史检验的那么几种简单朴素的方法却是用途最为广泛。这也是一件挺有意思的事情，越复杂的问题反倒需要越简单的想法去解决，比如`SGD`，`Dropout`，`BN`等等，都不是很复杂的模型，但却是用途最为广泛的技巧。另一个方面是，算法的变革所提升的精度远远不如数据集的扩增，网络的增大收益来的快和简单。因此，工业界往往喜欢boost网络的训练速度，增大数据集，然后不断的调参。

只是最近的一些感慨，我还是蛮喜欢数学上精巧的东西。有意思的事情，前两天一个初中小女孩问我数学题，本来以为信手捏来，结果愣生生把一道简单的集合题做成了解析几何，还需要求高次方程，汗颜。不要问我结果，我已经让那个孩子去问老师了，回来给我讲一讲。这两天把以前保存的文章拿出来，好好咀嚼一下。过去看到一篇好的文章总爱收藏起来却很久再也没有翻开过，似乎看了很多文章，实际上没有经历过真正的推敲和实践就是在自欺欺人。

### Softmax
> http://freemind.pluskid.org/machine-learning/softmax-vs-softmax-loss-numerical-stability/

Softmax一般会出现在网络的最后一层，用于输出目标类的概率分布，往往用于分类问题。它的定义如下：$ \sigma(z)=(\sigma\_1(z),\dots,\sigma\_m(z)) $
$$ \sigma\_i(z)=\frac{\exp(z\_i)}{\sum\_{j=1}^{m}\exp(z\_j)}, \quad i=1,\dots,m $$
它在`Logistic Regression`里起到的作用是`线性预测值`转化为类别概率：假设 $z\_i=w\_i^T+b\_i$ 是第 $i$ 个类别的线性预测结果，再将其归一化到 $(0, 1)$ 区间，现在每个 $o\_i=\sigma\_i(z)$ 就可以解释成观察到的数据 $x$ 属于类别 $i$ 的概率，或者称作似然 (Likelihood)。

然后Logistic Regression的目标函数是根据最大似然原则来建立的，假设数据 $x$ 所对应的类别为 $y$ ，则根据我们刚才的计算最大似然就是要最大化 $o\_y$ 的值(或者说，最小化 $-\log(o\_y)$ 也叫做`negative log-likelihood`)，如下：
$$ l(y, o) = -\log(o\_y) $$

而`Softmax-loss`就是将两者结合起来，把 $o\_y$ 的定义展开即可：
$$ \tilde{l}(y,z) = -\log\left(\frac{e^{z\_y}}{\sum\_{j=1}^{m}e^{z\_j}} \right) = \log\left(\sum\_{j=1}^{m}e^{z\_j}\right) - z\_y $$

没有任何fancy的东西，比如如果我们要写一个Logistic Regression的solver，那么因为要处理的就是这个东西，比较自然地就可以将整个东西合在一起来考虑，或者甚至将$z\_i=w\_i^T+b\_i$的定义直接一起带进去然后对$w$和$b$进行求导来得到Gradient Descent的update rule，例如我们之前介绍Gradient Descent的时候举的两类Logistic Regression的例子就是这样做的。

### Back Prop
假设存在一个三层的神经网络，如下图：
<center><img src="/image/3nn.png" width="70%" /></center>

除了最开始的数据层 $L^0$ 之外，每一层都有输入节点和输出节点，我们用 $I\_2^1$ 表示第一层的第二个输入节点，$O_3^1$ 表示第一层的第三个输出节点，每一层的输入和输出节点数量并不一定要一样多，但通常情况上一层的输出往往就是下一层结点输入的复制，比如 $I\_3^2 = O\_3^1$，因为所有的计算都是发生在每一层的内部。所以对普通的神经网络，通常每一层进行的计算都是一个线性映射再加一个`activation function`，例如`sigmoid`：
$$ O\_i^1 = S(\sum\_{j=1}^{3}w\_{ij}^{1}I\_{j}^{1}+b\_i^1) = S\left(\left\langle w\_i^1, I^1 \right\rangle+b\_i^1\right) $$
现在要对参数 $w\_{ij}^1$ 进行求导计算它的gradient来进行gradient descent一类的参数优化，利用链式法则如下：
$$ \frac{\partial{f}}{\partial{w\_{ij}^1}} = \sum\_{k=1}^{3}\frac{\partial{O\_k^1}}{\partial{w\_{ij}^1}}\cdot\frac{\partial{f}}{\partial{O\_k^1}} $$
注意到 $ \partial{O\_k^1}/\partial{w\_{ij}^1} $ 这一项只是和网络的第一层结构有关，只需要知道该结构内部的参数即可计算，而后面一部分相当于 $ \partial{f}/\partial{O\_k^1} = \partial{f}/\partial{I\_k^2} $ 即这一层的输出等于下一层的输入。因此，后一项只和下一层的结构和参数有关，不需要知道任何第一层有关的信息。

因此整个网络的参数的gradient的计算方式是从顶层出发，在 $L^p$ 层的时候，会拿到从 $L^{p+1}$ 得到的$\partial{f}/\partial{I^{p+1}}$ 也就是 $\partial{f}/{\partial{O^p}}$， 然后需要做两个计算：一个是自己层内的参数的gradient，比如是一个不同的`full connect layer`，则会像上文那样计算，如果没有则继续向下传递。根据链式规则，我们可以计算：
$$ \frac{\partial{f}}{\partial{O\_i^{p-1}}} = \frac{\partial{f}}{\partial{I\_i^p}} = \sum\_{k=1}^{n}\frac{\partial{O\_k^p}}{\partial{I\_i^p}}\cdot\frac{\partial{f}}{\partial{O\_k^p}} $$

### Softmax-Loss
搞清楚Back Prop之后让我们回到Softmax-Loss层，由于该层没有参数，我们只需要计算向后传递的导数就可以了，此外由于该层是最顶层，所以不使用链式法则就可以计算对于最终输出(loss)的导数。我们用 $\tilde{l}(y,z)$ 表示，其中一个是true label $y$，一个是网络层的输出值 $z$。由于链式法则的缘故，我们只需要计算 $\partial{\tilde{l}}/\partial{z}$ 然后丢给下一层即可。因此：
$$ \frac{\partial\tilde{l}(y,z)}{\partial{z\_k}} = \frac{\exp(z\_k)}{\sum\_{j=1}^m\exp(z\_j)} - \delta\_{ky} = \sigma\_{k}(z)-\delta\_{ky} $$
其中 $\sigma\_{k}(z)$ 是Softamx-Loss的中间步骤计算的结果，而 $\delta\_{ky}$，当 $k=y$ 时为 $1$，当 $k \ne y$ 时为 $0$，其实就是是否作为变量(常数)对 $z\_k$ 求导。