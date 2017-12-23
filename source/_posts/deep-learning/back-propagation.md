---
title: 深度学习中的反向传播算法
date: 2017-10-21 00:44:32
tags:
 - cnn
 - math
categories:
 - deep learning
---

反向传播算法直观上理解似乎很容易，但具体到每一个细节，每一个层面就变得很奇怪了。一直都没有正视这个问题，今天打算认真推导一遍这些公式。

### Back-Propagation
考虑深度网络中的任意一层，其中 $a^{(l)}$ 表示第 $l$ 层的输入数据，$a^{(l+1)}$ 表示该层的输出，同时也是 $(l+1)$ 层的输入数据：
- 线性映射输出：$ z^{(l+1)}=W^{(l)}a^{(l)}+b^{(l)}$
- 非线性映射输出：$ a^{(l+1)} = f(z^{(l+1)})$

如果 $J(W,b)$ 是顶层的损失函数，那么我们想直到该损失对神经网络的每一层的影响是怎样的？只需要求出该损失值相应 $W$ 和 $b$ 的变化即可。根据链式求导法则，如果我们想要求损失值对第 $l$ 层的 $W^{(l)}$ 的影响，可以中间增加 $z^{(l)} 项。**注意：这一项的选取恰好是线性变换的输出。**

$$ \nabla_{W^{(l)}}J(W,b) = \frac{\partial J(W,b)}{\partial z^{(l+1)}} \frac{\partial z^{(l+1)}}{\partial W^{(l)}} = \delta^{(l+1)}(a^{(l)})^T $$

$$ \nabla_{b^{(l)}}J(W,b) = \frac{\partial J(W,b)}{\partial z^{(l+1)}} \frac{\partial z^{(l+1)}}{\partial b^{(l)}} = \delta^{(l+1)} $$

那么现在的问题是如何求我们定义的新符号 $\frac{\partial J(W,b)}{\partial z^{(l+1)}} = \delta^{(l+1)}$ 呢？事实上，在这里，我们需要找到的其实是 $\delta^{(l)}$ 与 $\delta^{(l+1)}$ 的一个**关系**。只要找到这个关系，我们通过初始条件，像递推数列一样依次推导而出。

\begin{align}
  \delta^{(l)} &= \frac{\partial J(W,b)}{\partial z^{(l)}} = \frac{\partial J(W,b)}{\partial z^{(l+1)}} \frac{\partial z^{(l+1)}}{\partial z^{(l)}} \\\\
   &= \delta^{(l+1)} \frac{\partial (W^{(l)}a^{(l)}+b^{(l)})}{\partial z^{(l)}} \\\\
   &= \delta^{(l+1)} \frac{\partial (W^{(l)}f(z^{(l)})+b^{(l)})}{\partial z^{(l)}} \\\\
   &= \delta^{(l+1)} W^{(l)}f'(z^{(l)})
\end{align}

通常而言，我们在顶层的`全连接层`后不增加激活函数。因此，顶层的输出 $z^{(top)} 直接进入`softmax-loss`层(如果是回归问题)计算`损失值`。

举个例子来说。假设网络共有 $n$ 层，如果顶层返回的 $loss=3.27$ ，第 $n$ 层(`全连接层`)的输出为4.2(某个维度)。那么$\delta^{(n)}=\frac{3.27}{4.2}=0.7786$。后面，就按照公式依次往下推即可。

### 梯度消失问题

如果我们采用`SGD`方法优化模型，那么权重的更新方法为：
$$ W^{(n+1)} = W^{(n)} - \epsilon\nabla J^{(n)} $$

梯度消失是在网络反向传播过程中，从顶层向顶层传播的值越来越小，以致于无限趋近于零，这将导致底层的网络无法学习到有效的内容。

我们考虑网络存在第 $l$ 层 和 $l+k$ 层，考虑上述公式：$ \delta^{(l)}= \delta^{(l+1)} W^{(l)}f'(z^{(l)}) $

那么，从 $l$ 项递推到 $l+k$ 项：
\begin{align} 
  \delta^{(l)} &= \delta^{(l+1)} W^{(l)}f'(z^{(l)}) \\\\
  &= \delta^{(l+2)} (W^{(l+1)}f'(z^{(l+1)})) (W^{(l)}f'(z^{(l)})) \\\\
  &= \delta^{(l+k)} \prod\_{m=l}^{l+k-1}W^{(m)}f'(z^{(m)})
\end{align}

注意，在这一步，我们推导出了第 $l+k$ 层与 $l$ 层属于连乘关系。那么如果我们的激活函数是`sigmoid：`$ S(x) = \frac{1}{1+\mathrm{e}^{-x}}$ ，情况会变得怎样呢?
$$ S'(x) = \frac{\mathrm{e}^{-x}}{(1+\mathrm{e}^{-x})^2} = S(x)(1-S(x)) $$

我们需要知道对于 $S(x)$ 函数的值域在$(-1, 1)$。因此，$S'(x)$ 的第一项 $S(x)$ 在递推公式中经过连乘会不断变小，最终趋于零。

### ResNet如何解决梯度消失

ResNet是有主干网络和分支网络。主干网络路线中gate仅仅包含5个，而每一个block包含若干个residual unit。我们通常认为Resnet解决了深度的问题，而事实上它是另一种ensemble模型，改变了深度网络的优化模式，并没有从本质上解决梯度消失的问题（由反向传播的连乘本质决定的）。那么Resnet的残差模式为什么能够起作用呢？

考虑 $F(x^{(l)}, W^{(l)})$ 为第 $l$ 层的残差输出，其中 $x^{(l)}$ 为第 $l$ 层的输入，$W^{(l)}$ 是残差单元中一系列变换的集合。那么，残差单元的激活公式可由下式表示：
- 第 $l$ 层的输出： $ y^{(l)} = x^{(l)} + F(x^{(l)}, W^{(l)}) $
- 映射关系： $ x^{(l+1)} = f(y^{(l)}) $

如果采用`identity map`方式进行映射，那么进行element-wise addition操作，即：
$$ x^{(l+1)} = x^{(l)} + F(x^{(l)}, W^{(l)}) $$

假设我们有 $L$ 个residual unit在一个block中，那么第 $L$ 层的输出可以用下式表示：
$$ x^{(L)} = x^{(l)} + \sum_{i=l}^{L-1}F(x^{(i)}, W^{(i)}) $$

对其中任意 $l$ 层求梯度，其中 $\varepsilon$ 是loss function：
$$ \frac{\partial \varepsilon}{\partial x^{(l)}} = \frac{\partial \varepsilon}{\partial x^{(L)}} \frac{\partial x^{(L)}}{\partial x^{(l)}} = \frac{\partial \varepsilon}{\partial x^{(L)}}\left(1+\frac{\partial}{\partial x^{(l)}}\sum_{i=1}^{L-1}F(x^{(i)}, W^{(i)}) \right) $$

因此，我们可以看到因为有 $\frac{\partial \varepsilon}{\partial x^{(L)}} $ 这一项的存在，任意 $l$ 层总能接受到一定的信息。通过这种机制，我们可以充分利用浅层网络的优势从而训练深层网络。