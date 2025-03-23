# Typing-web

一个基于 Vue 3 + Ant Design Vue 的在线打字练习和竞赛平台。

在线体验：http://totry.vip

## 功能特点

- 🎯 个人练习模式

  - 支持多种编程语言文本练习
  - 实时显示打字速度和准确率
  - 支持中英文混合输入
  - 打字进度实时统计

- 🏆 竞赛模式

  - 1v1 实时对战
  - 实时排名显示
  - 匹配系统

- 💫 其他特性
  - WebSocket 实时通信
  - Protobuf 消息编解码
  - 响应式布局设计
  - 用户成绩统计

## 技术栈

- 前端框架：Vue 3
- UI 组件库：Ant Design Vue
- 状态管理：Vuex
- 路由管理：Vue Router
- 网络请求：Axios
- 实时通信：WebSocket
- 消息协议：Protocol Buffers

## 开发环境搭建

1. 克隆项目

```bash
git clone https://github.com/yourusername/typing-web.git
cd typing-web
```

2. 安装依赖（建议使用国内镜像）

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

3. 启动开发服务器

```bash
npm run serve
```

4. 构建生产版本

```bash
npm run build
```

## Protobuf 开发说明

项目使用 protobuf.js 处理 \*.proto 文件。生成 JavaScript 代码：

```bash
npx pbjs -t json-module -w commonjs -o src/proto/resProto.js src/proto/ResponseProtobuf.proto
npx pbjs -t json-module -w commonjs -o src/proto/message.js src/proto/message.proto
```

````

调试工具：

- Protobuf 在线解析： https://www.ontools.top/pages/protoDeserialize.html
- WebSocket 在线测试： https://wstool.js.org/


## 项目结构
```plaintext
typing-web/
├── src/
│   ├── api/          # API 接口
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── js/          # 工具类
│   ├── proto/       # Protobuf 相关
│   ├── router/      # 路由配置
│   ├── store/       # Vuex 状态管理
│   ├── views/       # 页面组件
│   └── App.vue      # 根组件
├── public/          # 公共资源
└── package.json     # 项目配置
````

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## License

MIT License

欢迎 Star ⭐️
