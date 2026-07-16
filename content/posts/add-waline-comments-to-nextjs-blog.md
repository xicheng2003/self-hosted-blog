---
title: 为以Next.js为框架的博客网站植入评论系统
slug: add-waline-comments-to-nextjs-blog
date: '2023-10-05T00:00:00.000+08:00'
updated: '2023-10-07T08:24:17.725Z'
excerpt: 我的博客更新了评论功能！
category: 技术
tags:
  - Tech
  - Waline
  - Next.js
  - 日常分享
cover: /images/posts/add-waline-comments-to-nextjs-blog/cover.png
featured: true
draft: false
---
## 前言

回想起来，2023年1月，morlight.top开始正式运行，这是属于我自己的一个个人博客站。

个人博客网站本就越来越小众，我看待这个简易的小破站就如同自己小小的后花园，更多时候像是自娱自乐。偶尔心血来潮打理一下，使自己满意。这就足以达到了这个网站存在的意义。

在本站的关于页面，我也写清楚了本站的构建框架，并把源码存放于仓库中。

我本身也不是什么技术大佬，这样的架构易于搭建，并且以Notion作为我的后端平台，在撰写文章同步的过程不会过于繁琐。在建站之初就非常契合我自己的使用需求。

## 起因

虽然本站运行的时间不长，也在不断打理中变成了我满意的样子，但美中不足的是缺少评论系统。

尽管我的博客站没什么浏览量，自然也不会有很多评论。但我觉得没有评论系统的网站更像一个笔记网页，缺少博客中交流互动的内核。新增一个评论系统还是有必要的。

因此这篇文章就将我折腾的过程记录下来，供有需要的朋友参考。

## 实现过程

此前也有所了解，博客的评论系统无非就几种。当然也不需要重复造轮子，选择现有的成熟方案即可。我选择的是Waline，这个评论系统与Valine相似但功能更丰富，网上也能检索到很多详细介绍的文章，这里就不详细介绍了。相关的功能配置也可以参见其官网的技术文档。

[Waline](https://waline.js.org/)

> 完全的 Markdown 支持，同时包含表情、数学公式、HTML 嵌入

难点主要在于如何植入Next.js架构的网站，其官网文档并没有详细说明。

Next.js架构的优点就是模块化，方便操作。我也是刚刚接触这个架构，没有很了解，此过程也参考了很多相关的技术文章。我使用的平台的Windows，于是使用的Powershell进行操作。

### Step1

首先要先搭建好Waline的评论系统，搭建过程可以参考[官方文档](https://waline.js.org/guide/get-started/)（官方文档的步骤很详细，这里不过多赘述），搭建好之后将会得到一个自己的专属链接：（这个链接可以绑定到自己的域名上，以我自己为例）

- 评论系统：waline.morlight.top
- 评论管理：waline.morlight.top/ui

接着按照下面的步骤将评论系统植入你的网站。

### Step2

如果你和我一样，网站代码不在本地服务器，而是托管于Github并用Vercel部署的网页，首先要打包下载好源码于本地电脑上。然后使用yarn组件添加依赖。（关于yarn的相关介绍可以于官网查看[技术文档](https://yarnpkg.com/getting-started/install)）

上一步完成后，在源代码文件目录运行powershell，运行一下两个命令添加需要用到的依赖包。

```shell
yarn add @waline/client
yarn add sass
```

执行后会自动下载并安装，根据提示即可。

![屏幕截图 2023-10-05 020257.png](/images/posts/add-waline-comments-to-nextjs-blog/04e5eb7d-屏幕截图-2023-10-05-020257.png)

这样步骤完成后，源码中的`package.json`和`yarn.lock`文件也同步更新，并且新增了一个名为`node_modules`的文件夹。

### Step3

接着新建一个 `components/Comment.tsx` 作为我们的评论框组件。

这里放出我的代码供大家参考：

```typescript
import { init } from '@waline/client';
import '@waline/client/dist/waline-meta.css';
import '@waline/client/dist/waline.css';
import React, { useEffect, useRef } from 'react';

import type { WalineInitOptions, WalineInstance } from '@waline/client';

export type WalineOptions = Omit<WalineInitOptions, 'el'> & { path: string };

export const Waline = (props: WalineOptions) => {
  const walineInstanceRef = useRef<WalineInstance | null>(null);
  const containerRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    walineInstanceRef.current = init({
      ...props,
      el: containerRef.current,
    });

    return () => walineInstanceRef.current?.destroy();
  });

  useEffect(() => {
    walineInstanceRef.current?.update(props);
  }, [props]);

  return <div ref={containerRef} />;
};
```

然后在 `components/NotionPage.tsx` 新增一段代码调用我们上一步新增的评论框组件。

```shell
import { Waline } from './Comment'
// ...
      {block.id.replace(/-/g, '') !== site.rootNotionPageId ?
        <Waline
          serverURL='https://xxxxxxx'
//变量serverURL填上自己搭建的waline链接
          path={'/' + block.id.replace(/-/g, '')}
          emoji={[
            '//cdn.jsdelivr.net/gh/walinejs/emojis@1.1.0/tw-emoji'
          ]}
          dark={isDarkMode}
          meta={['nick', 'mail']}
          requiredMeta={['nick', 'mail']}
          imageUploader={false}
          copyright={false}
        /> : null}
// 放在这个结束标记前面
    </>
```

### Step4

完成后保存文件，将这些文件一并上传更新至GitHub。

等待片刻，前端重新部署好页面，到这里就大功告成了！

具体效果可以参考本片文章的下方评论区，可能略有些粗糙，我还没来得及细细打磨。

若不满意默认样式，可以参考Waline网站的官方文档配置自己喜欢的样式。

---

*本文部分内容参考：*[*我是如何将 Notion 作为博客后端的 - V2EX*](https://www.v2ex.com/t/912310)
