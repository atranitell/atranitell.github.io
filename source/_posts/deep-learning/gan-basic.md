---
title: GAN的理论基础
date: 2017-12-22 09:50:31
tags:
 - gan
 - theory
categories:
 - deep learning
---

### 最大似然估计 Maximum Likelihood Estimation
考虑一个给定的数据分布 $P\_{d}(x)$ 和一个已知的分布 $P\_g(x;\theta)$ 由 $\theta$ 参数化。我们希望优化 $\theta$ 使得 $P\_g(x;\theta)$ 接近 $P\_{d}(x)$。然后，我们从 $P\_{d}(x)$ 采样 $\\{x^1, x^2, \dots, x^m\\}$，生成样本的似然度定义为: $$ L = \prod\limits\_{i=1}^{m}P\_g(x;\theta) $$ 找到一个 $\theta^\*$ 最大化这个似然估计: 
\begin{align}
\theta^\*&=\arg\max\_\theta\prod\limits\_{i=1}^{m}P\_g(x^i;\theta)=\arg\max\_\theta\log\prod\limits\_{i=1}^{m}P\_g(x^i;\theta) \\\\
&=\arg\max\_{\theta}\sum\limits\_{i=1}^{m}\log P\_g(x^i;\theta), x \sim P\_{d}(x) \\\\
&\approx\arg\max\_\theta\mathbb{E}\_{x\sim P\_{d}}[\log P\_g(x;\theta)]
\end{align}

这里, 为进一步说明，我们需要引入一个概念 `KL散度`, 或 `Kullback–Leibler divergence`.

### KL 散度
KL散度又称为相对熵，首先信息熵反映了一个系统的有序程度，一个系统越是有序，它的信息熵就越低，反之越高。如果一个随机变量 $X$ 的可能取值为 $X=\\{x\_1,x\_2,\dots,x\_n\\}$，对应的概率为 $p(X=x\_i) (i=1,2,\dots,n)$，则随机变量 $X$ 的熵定义为: $$ H(X)=-\sum\limits\_{i=1}^{n}p(x\_i)\log p(x\_i) $$ 

相对熵又称互熵，交叉熵，鉴别信息，Kullback熵，Kullback-Leible散度等。设 $p(x)$ 和 $q(x)$ 是 $X$ 取值的两个概率分布，则 $p$ 对 $q$ 的相对熵为：$$D(p\\|q)=\sum\limits\_{i=1}^{n}p(x)\log\frac{p(x)}{q(x)} = \sum\limits\_{i=1}^{n}p(x)\log p(x) - \sum\limits\_{i=1}^{n}p(x)\log q(x)$$ 在一定程度上，熵可以度量两个随机变量的距离。KL散度是两个概率分布 $P$ 和 $Q$ 差别的非对称性的度量。KL散度是用来度量使用基于 $Q$ 的编码来编码来自 $P$ 的样本平均所需的额外的位元数。典型情况下，$P$ 表示数据的真实分布，$Q$ 表示数据的理论分布，模型分布，或 $P$ 的近似分布。

好的，回归GAN的主题。刚刚我们已经推导出最大似然估计下的参数 $\theta^\*$ 的表示。然而，在网络中，我们需要最小化去优化这个参数。因此，我们需要利用`KL散度`完成这件事情。$$ \theta^\*\approx\arg\max\_\theta\mathbb{E}\_{x\sim P\_{d}}[\log P\_g(x;\theta)] = \arg\max\_\theta\int\_x P\_d(x)\log P\_g(x;\theta)dx $$

上式恰好表示的是从 $d$ 中采样的样本基于 $G$ 的编码的度量。为凑成 `KL散度` 的形式，我们增加一项 $ \mathbb{E}\_{x\sim P\_d}[\log P\_d(x;\theta)] $。考虑到其为一个定值，$\theta^\*$的优化目标可以转化为：
\begin{align}
\theta^\*&\approx\arg\max\_\theta(\mathbb{E}\_{x\sim P\_{d}}[\log P\_g(x;\theta)] - \mathbb{E}\_{x\sim P\_d}[\log P\_d(x;\theta)]) \\\\
&=\arg\max\_\theta(\int\_x P\_{d}(x)\log P\_g(x;\theta)dx-\int\_x P\_{d}(x)\log P\_{d}(x)dx) \\\\
&=\arg\min\_\theta(\int\_x P\_{d}(x)\log P\_{d}(x)dx-\int\_x P\_{d}(x)\log P\_g(x;\theta)dx) \\\\
&=\arg\min\_\theta \rm{KL}(P\_{d}(x)\\|P\_g(x;\theta))
\end{align}

### Basic idea of GAN
既然说我们是很难优化 $P\_g(x;\theta)$ 这个分布 (因为很难找到这样一个函数)。那么GAN是如何解决这个问题的呢？
- `Generator`: G 是一个函数，输入$z$，输出$x$。给定一个先验分布 $P\_{prior}(z)$，G 定义了一个概率分布 $P\_g(x)$
- `Discrimnator`: 衡量 $P\_g(x)$ 与 $P\_d(x)$ 之间的差距大小。输入 $x$，输出一个标量。

我们定义一个函数：$$ G^\*=\arg\min\limits\_G\max\limits\_DV(G, D) $$ 上面的式子该怎么理解呢？如下图。我们首先先选定一个 $G\_i$ 对应一个 $D$ 的分布，$\max\limits\_D V$ 从中选取该分布上值最大的点加入集合。最后，我们在所有 $G\_i$ 的点中选取值最小的 $G_i$ 作目标输出。
<center><img src="/image/basic-gan-maxmin.png" width="70%" /></center>

是不是还有点困惑，是的，我们具体定义下式：
$$ V=\mathbb{E}\_{x\sim P\_{d}}[\log D(x)] + \mathbb{E}\_{x\sim P\_g}[\log(1-D(x))] $$ 给定一个`G`，$\max\limits\_D V(G,D)$表示的是 $P\_g$ 和 $P\_d$的差值。这样对于每一个 $G\_i$相当于与目标分布的最大差值，在这一系列差值中找到最小的，也就是说最好的那个 $G\_i$。换言之，在所有最差(差值最大的情况下)的情况下找一个最好的。

既然我们已经有了这样一个定义，那么给定一个 $V$ 和 $G\_i$ 我们该如何寻找一个最大的 $D^\*$ 呢？
\begin{align}
V&=\mathbb{E}\_{x\sim P\_{d}}[\log D(x)] + \mathbb{E}\_{x\sim P\_g}[\log(1-D(x))] \\\\
&=\int\_x P\_d(x)\log D(x)dx + \int\_x P\_g(x)\log(1-D(x))dx \\\\
&=\int\_x [P\_d(x)\log D(x) +P\_g(x)\log(1-D(x))]dx
\end{align}

给定一个 $x$ 的情况下，为使上式积分内部项最大，$D^\*$ 应该是多少呢？首先，$P\_d(x)$ 是给定的，$P\_g(x)$ 也是给定的(在某个$G\_i$的情况下)，那么上式将转变为：
\begin{align}
f(D) &= P\_d\log(D) + P\_g\log(1-D) \\\\
f'(D) &= \frac{P\_d}{D} - \frac{P\_g}{1-D} = 0 \\\\
D^*(x) &= \frac{P\_d(x)}{P\_d(x)+P\_g(x)}
\end{align}

我们所求得的 $D^*$ 便是上文所说的最大差值(maximum divergence)，将其带入 $V$ 中：
\begin{align}
V &= \mathbb{E}\_{x\sim P\_d}[\log\frac{P\_d(x)}{P\_d(x)+P\_g(x)}] + \mathbb{E}\_{x\sim P\_g}[\log\frac{P\_g(x)}{P\_d(x)+P\_g(x)}] \\\\
&= \int\_x P\_d(x)\log\frac{\frac{1}{2}P\_d(x)}{\frac{1}{2}(P\_d(x)+P\_g(x))}dx + \int\_x P\_g(x)\log\frac{\frac{1}{2}P\_g(x)}{\frac{1}{2}(P\_d(x)+P\_g(x))}dx \\\\
&= -2\log2+\int\_x P\_d(x)\log\frac{P\_d(x)}{\frac{1}{2}(P\_d(x)+P\_g(x))}dx + \int\_x P\_g(x)\log\frac{P\_g(x)}{\frac{1}{2}(P\_d(x)+P\_g(x))}dx \\\\
&= -2\log2 + \rm{KL}[P\_d(x)\\|\frac{1}{2}(P\_d(x)+P\_g(x))] + \rm{KL}[P\_g(x)\\|\frac{1}{2}(P\_d(x)+P\_g(x))] 
\end{align}

这个结果很有意思，上式最后两项互相对称。换言之，它衡量了两个分布之间的距离（无关顺序）。此外，这个Divergence叫做 `Jensen-Shanno divergence` 简称 `JSD`，定义如下：$$ \rm{JSD}(P\\|Q) = \frac{1}{2}D(P\\|\frac{1}{2}(P+Q)) + \frac{1}{2}D(Q\\|\frac{1}{2}(P+Q)) $$

因此，原始的GAN实际上的目标是一个JSD。因此，对于给定的 $G\_i$，最大化 $D$ 的结果为： $$\max\limits_D V(G, D) = -2\log2 + 2\rm{JSD}(P\_d(x)\\|P\_g(x))$$

JSD的值域在 $(0, \log2)$，当 $P\_g(x)=P\_d(x)$ 时，JSD的值为 $0$；反之两个分布完全不相干时，JSD的值为 $log2$。因此，要找到最小的 $G\_i$，那么我们就需要使 $G\_i$ 尽可能接近 $P\_d(x)$。

### Practice
