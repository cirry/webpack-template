## 基于webpack5构建的一个简单的js开发环境
### 开始
使用方式：
开发环境： `npm run dev`  
生产发布： `npm run build`

### 入口文件
/src/index.html  
/src/index.js  

### 已有功能：
1. css | less | 图片 | 视频 的loader配置
2. 热更新功能（默认打开端口号：3000）
3. 生产环境代码压缩功能
4. css样式兼容性处理（postcss）和js代码兼容性处理（babel）
5. 已排除打包就jQuery，需要使用请在index.html中通过cdn引入，无需使用直接忽略


### 已知问题
1. 如果index.html中的body标签内容为空:  
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
</head>
<body>
<!--<p>webpack-config-js</p>-->
</body>
</html>

```
开发环境下会报错，如下:  
```
commons.js:87 Uncaught TypeError: Cannot read property 'src' of null
```

