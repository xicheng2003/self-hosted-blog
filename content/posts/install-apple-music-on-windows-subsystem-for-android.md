---
title: 在适用于Android™的Windows子系统安装Apple Music
slug: install-apple-music-on-windows-subsystem-for-android
date: '2023-01-12T00:00:00.000+08:00'
updated: '2025-03-31T16:46:24.758Z'
excerpt: 既是体验分享，也是教程。记录一次富有冒险精神的探索学习
category: 技术
tags:
  - Tech
  - Apple
  - Windows
  - 体验分享
cover: /images/posts/install-apple-music-on-windows-subsystem-for-android/cover.jpg
featured: true
draft: false
---
> 💡 请注意，这是一篇已经创建超过 **365天** 的文章，其中的信息可能已经有所发展或是发生改变。

> 🛠️ 此*篇文章主要是以体验分享为主，不是纯教程。简要提到Windows子系统的使用方法及安装软件的方法，希望对大家有所帮助！*

# 起因

不能说我很喜欢音乐，但要是别人说我离不开音乐，我倒也不会否认。

刚刚经历完高中生活，想起刻苦的备考时光，音乐真的是我身心疲惫时的伙伴，不管处境如何，都能够找到一首契合你心情的歌。

我很喜欢Apple Music纯粹的音乐环境，没有广告，软件生态也没有渗透社交属性。

大一上学期，2022秋天的某天，我看到新闻称苹果将在2023年推出Apple Music Windows版。看到新闻我就按耐不住了，虽然已经确定Apple会推出桌面版，但还是按耐不住心情，想在PC电脑上体验Apple Music。

# 经过

虽然在已有的iTunes上可以访问和使用Apple Music上的资源，但iTunes的体验感并不好（没有专辑动画，滚动歌词等），我还是想要探索其他方法，能不能体验Mac般完美的Apple Music体验。

接着我在Apple官网发现Apple Music网页版已经支持滚动歌词，但很遗憾动画做得有阉割，最关键的是网页版只能依托浏览器打开，音质只能是最低要求。只好作罢。

在网络一番检索，发现又有一款名叫Cider的第三方软件，专门为了解决Apple Music还没有Windows版而开发的。我去微软商店下载，发现要RMB 19，作为没有收入的大学生，还是要发扬艰苦奋斗的精神，犹豫片刻后还是没有购买该软件。毕竟在PC上用Apple Music听音乐只能算是我在理想主义下的一点极客似的追求而已，也不是刚需，为此花钱好像就偏离了我最开始的目的。我还是想看看有没有其他办法，要是实在不行再购买此第三方软件。

继续在网上 ~~冲浪 ~~检索，忽然发现看到Windows11上的安卓子系统，便有了在Windows11上安装安卓版Apple Music的思路。并且似乎是可行的，而且并不复杂。

# **Windows 11 运行安卓子系统安装过程**

小时候为了玩手游，在PC上用过安卓模拟器。但这安卓子系统我可是第一次听，进一步了解得知这竟然是Windows11的特性之一，在发布Windows11时便作为Feature进行宣传，但由于它尚不稳定，并未出现在Windows11正式版。因此我继续冒险，将系统更新选项切换为预览版，接收Windows预览版推送并成功安装。这个安装过程还是要花费一点时间，毕竟是大版本更新。

当然安卓子系统也可以单独离线安装，这样就不需要将系统从正式版升级到预览版了。

**基于Android的Windows11子系统的安装大致可以分为两种**

> 第一种是由Windows11正式版更换为开发预览版，子系统包括于Windows11本身，升级后可直接使用。

> 第二种是不改变Windows11自身版本的情况下，下载子系统的相关模块，离线安装。

我在当时没有选择在原有的正式版系统离线安装，因为我之前在Win10时代升级过预览版，想着在预览版会更加方便，因此选择了第一种方法。

但实际上，在安装之后，我认为两种方法都差不多，安装的繁琐程度几乎不差，可以任选一种进行安装。

> 💡 由于我是通过第一种方法安装，所以下面不描述第二种安装过程，仅简单描述第一种安装过程。

**Android子系统的要求**

- 确保Windows 11版本为22000.xxx或更高版本。
- 硬件必须支持并启用BIOS/UEFI虚拟化
- 确保微软商店版本为22110.1402.6.0或更高版本，并单击“获取更新”按钮升级其版本。
- 安卓子系统默认会分配4G内存，建议16G内存以上的电脑使用。

Windows预览版成功安装之后，在系统设置 → 应用 → 可选功能 → 更多 Windows 功能，找到并勾选开启**「Hyper-V」**和**「虚拟机平台」**两个选项，安装完成后会提示重启系统。

![屏幕截图 2023-01-12 223748.png](/images/posts/install-apple-music-on-windows-subsystem-for-android/8d6eed81-屏幕截图-2023-01-12-223748.png)

重启完成后，可以在Windows开始菜单中找到「适用于Android™的Windows子系统设置」的应用图标。

![Untitled](/images/posts/install-apple-music-on-windows-subsystem-for-android/75cf6298-Untitled.png)

要是没有看到，可以到微软软件商店搜索「Windows Subsystem for Android」安装。

实在不行就采用离线安装的方法。

# **在Win11 安卓子系统安装 APK 软件包**

系统安装完成之后就应该安装软件了。

目前子系统自带的是亚马逊应用商店，但网友使用后纷纷说十分鸡肋，在国内基本无法使用。

于是使用ADB调试的方法安装apk软件。

（非常有安卓系统的特色，让我想起之前捣鼓安卓系统的时候）

我先下载Apple Music的apk放着备用，接着去网上查阅教程。

首先在子系统设置中 开发人员→开发人员模式 打开开发者模式

![Untitled](/images/posts/install-apple-music-on-windows-subsystem-for-android/e009fa2d-Untitled.png)

1. 记下上图设置项中显示出来的 WSA 的内部 IP 地址和端口号，如 `127.0.0.1:58526`
1. [下载安卓 ADB 命令行调试工具](https://link.zhihu.com/?target=https%3A//www.jianeryi.com/1346.html)，并参照文章教程，将 `adb` 命令加入到系统环境变量*（这里和安卓手机的教程是一模一样的，所以直接找到安卓ADB安装apk软件的教程，毕竟都是安卓系统）*
1. 打开 Windows 终端 (命令行)，输入以下命令：

```shell
# 第 0 步：确保已正确将 adb 命令加入到系统的环境变量
# 执行下面的命令能看到 adb 版本号则表示 ok
# 如有错误，请检查环境变量是否配置正确
adb version

# 第 1 步：连接 WSA
adb connect 127.0.0.1:58526
# 其中 127.0.0.1:58526 是刚才在 WSA 设置项中看到的 IP

# 第 2 步：安装 APK
# 连接成功之后，就能用下面命令来安装 APK 了
adb install //你的APK文件完整路径
# 注意 .apk 的路径最好无中文且无空格，否则需要用英文双引号包裹。
# 你可在资源管理器上右键点击 apk 文件选「复制文件地址」获取完整路径
#下面是例子：
adb install "D:\Downloads\Apple Music.apk"


# 最后按下回车即可安装，安装成功后会显示Success
# 安装完成后，在 Windows 开始菜单的“所有应用”里就能找到你安装的 Android 应用
```

我当时按照教程，试了好多次就是没有成功，当时已经是半夜12点，本来已经想要放弃，最后将安卓子系统重启一下就可以了，果然重启大法好。所以如果出现不成功，先检查自己有没有严格按照教程的步骤，再不行就将子系统重启，再进行安装。

![Untitled](/images/posts/install-apple-music-on-windows-subsystem-for-android/354dcc41-Untitled.jpg)

# Win11成功安装Apple Music for Android 应用

至此，我成功安装上了Android版的Apple Music！

搞了两个多小时，安装完以后已临近半夜，但还是让我挺兴奋的。

![Untitled](/images/posts/install-apple-music-on-windows-subsystem-for-android/7aa97d18-Untitled.png)

# 总结

经过折腾，总算是如愿安装Apple Music。

但这毕竟是一种折中办法。其实在PC上安装安卓版Apple Music并不是十分必要，和安卓版的操作体验几乎一致，只能说是我个人为了满足自己的一点小期待，才会这样做，我相信大多数人都不会这样干（哈哈）。

经过这次体验，我也进一步了解和体验了适用于Android的Windows子系统，算是一次不错的自我探索、自我学习过程！~~（同时也达到了娱乐消遣的效果）~~

安卓版始终和桌面版的体验是不同的，所以Apple才会有推出Apple Music for Windows的计划。截至这篇文章完成时，Apple Music for Windows仍未上线微软软件商店，等正式上线时，Apple Music全平台就可以有一个良好的体验了，让我们一起期待一下！

---
