# Typing-web

网站：http://totry.vip

欢迎**star**~~~

## Project setup

1. 更换 npm 镜像(网络不稳定可选)

```bash
npm config set registry https://registry.npmmirror.com
```

2. 自动安装所有的依赖包

```bash
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

#### 用 protobuf.js 这个库将*.proto 处理成*.js 或\*.json，然后再利用库提供的方法来解析数据，最后得到数据对象。

使用该网站确认是后端返回的数据有问题还是前端解析的有问题：
protobuf 格式在线解析：https://www.ontools.top/pages/protoDeserialize.html
长连接在线测试：https://wstool.js.org/

```
npx pbjs -t json-module -w commonjs -o src/proto/resProto.js  src/proto/ResponseProtobuf.proto
npx pbjs -t json-module -w commonjs -o src/proto/message.js  src/proto/message.proto
```

卸载不需要的依赖：

```
npm uninstall package-name
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
