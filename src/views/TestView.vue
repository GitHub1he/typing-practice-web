<template>
  <a-button type="dashed" v-if="wsStatus === 'connected'" @click="wsLogout()">登出</a-button>
  <a-button type="dashed" v-else @click="connectWebSocket()">登录</a-button>
  <div>
    <h2>WebSocket Connection Status</h2>
    <!-- 动态显示 WebSocket 连接状态 -->
    <label>webSocket Status: {{ wsStatus }}</label>

    <h2>WebSocket Messages</h2>
    <!-- 显示收到的消息列表 -->
    <ul>
      <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
    </ul>

    <h2>Send Message</h2>
    <!-- 输入框用于输入要发送的消息 -->
    <a-select ref="select" v-model:value="msgContentType" style="width: 120px">
      <a-select-option value="start">start</a-select-option>
      <a-select-option value="ing">ing</a-select-option>
      <a-select-option value="collect">collect</a-select-option>
      <a-select-option value="end">end</a-select-option>
    </a-select>
    <input v-model="msgBodyData" placeholder="Enter your message" />
    <button @click="sendInputMessage">Send</button>
  </div>

  <a-button type="dashed" @click="handleIndividualTest()">个人测试</a-button>


  <a-modal v-model:open="confirmReConnect" title="是否确认登录" :confirm-loading="confirmLoading" @ok="handleConfirmReConnect"
    @cancel="cancelConfirmReConnect">
    <p>{{ modalText }}</p>
  </a-modal>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { useStore } from 'vuex';
// import protobuf from 'protobufjs';
import baseUrl from '@/api/base';
import resProtoRoot from '../js/resProto.js';
import reqProtoRoot from '../js/reqProto.js';
// import msgProtoRoot from '../js/message.js';
import { ReqMsg } from '../js/ReqMsg';

const modalText = ref('是否确认重新登录');
const confirmReConnect = ref(false);
const confirmLoading = ref(false);
const store = useStore();
let ws = null; // 用来保存 WebSocket 实例
const messages = ref([]); // 用来保存收到的消息
const msgBodyData = ref(''); // 保存输入框中的消息内容
const msgContentType = ref(''); // 保存输入框中的消息类型
let wsStatus = ref('init'); // 连接状态：'init', 'connected', 'connecting', 'disconnected'
let webSocketPingTimer = null; // 心跳定时器
const webSocketPingTime = 9000; // 心跳的间隔，当前为9秒,
const heartbeat = '[0513]';
let retryCount = 0;
const maxRetries = 1;
let confirmCode;

// 获取消息类型
const reqType = reqProtoRoot.lookupType("RequestMsg");
const resType = resProtoRoot.lookupType("RespMsg");
// const msgType = msgProtoRoot.lookupType("Msg");

// 编码函数,使用请求报文编码
const encodeMessage = (msgObj) => {
  messages.value.push(`You: `, JSON.stringify(msgObj));
  // 验证消息对象
  const errMsg = reqType.verify(msgObj);
  if (errMsg) throw Error(errMsg);

  // 编码消息
  const message = reqType.create(msgObj); // 创建消息实例
  const buffer = reqType.encode(message).finish(); // 编码为字节数组
  return buffer;
};

// 解码消息
const decodeMessage = (buffer) => {
  const message = resType.decode(buffer);
  return resType.toObject(message);
};

// 在组件卸载时关闭 WebSocket 连接
onBeforeUnmount(() => {
  wsLogout();
});

const connectWebSocket = () => {
  // todo 刷新access时机
  wsStatus.value = 'connecting'
  ws = new WebSocket(`${baseUrl.wsUrl}?a=${store.state.user.access}`);
  ws.onopen = handleOnOpen;
  ws.onclose = handleOnClose;
  ws.onmessage = handleOnMessage;
  ws.onerror = handleOnError;
};

const handleOnOpen = () => {
  sendMessage(getMsg('CONNECT'));

  console.log('WebSocket connection established');
};

const handleOnMessage = (event) => {
  // 如果收到 CONFIRM_HEARTBEAT，则立即发送心跳
  if (event.data === 'CONFIRM_HEARTBEAT') {
    sendMessage(heartbeat);
    return;
  }
  if (event.data === '[1128]') {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const buffer = new Uint8Array(e.target.result); // 将结果转换为 Uint8Array

    try {
      const res = decodeMessage(buffer); // 调用 decode 函数
      console.log("Decoded message:", res);
      messages.value.push(res);
      switch (res.code) {
        case 'C0001':
          // 连接成功
          startHeartbeat();
          wsStatus.value = 'connected';
          break;
        case 'C00011':
          // 确认重新登录
          confirmCode = res.data;
          confirmReConnect.value = true;
          console.log('确认是否重新登录', confirmCode)

          break;
        case 'C0002':
          // 连接失败
          ws.close();
          break;
        case 'C0003':
          // 被重连
          ws.close();
          console.log('异地登录')
          break;
        case 'C0004':
          // 登出
          wsStatus.value = 'disconnected';
          break;
        default:
          // 其他
          console.log("接收到消息：", res)
          break;
      }
    } catch (error) {
      console.error("Error decoding message:", error);
    }
  };

  reader.readAsArrayBuffer(event.data);// 确保读取的是 ArrayBuffer
};

// WebSocket 发生错误时的处理方法
const handleOnError = (error) => {
  wsStatus.value = 'disconnected'; // 更新状态为未连接
  console.error('WebSocket connection error:', error);
  retryCount++;
  if (retryCount <= maxRetries) {
    setTimeout(connectWebSocket, 2000); // 每2秒重试连接
  }
};

// WebSocket 关闭连接时的处理方法
const handleOnClose = (event) => {
  wsLogout()
  console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
};

const wsLogout = () => {
  if (ws) {
    sendMessage(getMsg('LOGIN_OUT'));
    ws.close();
  }
  clearTimeout(webSocketPingTimer);
  wsStatus.value = 'disconnected'; // 更新状态为未连接
};

const startHeartbeat = () => {
  webSocketPingTimer = setTimeout(() => {
    if (wsStatus.value !== 'connected') {
      return false;
    }
    // console.log("心跳", heartbeat);
    sendMessage(heartbeat);
    clearTimeout(webSocketPingTimer);
    // 重新执行
    startHeartbeat();
  }, webSocketPingTime);
};

// 发送消息到 WebSocket 服务器
const sendMessage = (data) => {
  ws.send(data); // 发送输入框中的消息
};

const sendInputMessage = (data) => {
  if (data) {
    data = getMsg('TEST_INDIVIDUAL', msgContentType.value, msgBodyData.value);
    ws.send(data);
  }
};

/**
 * 获取不同类型的报文
 */
const getMsg = (type, contentType, data) => {
  const reqMsg = new ReqMsg();
  reqMsg.head.userId = store.state.user.user.userId;
  reqMsg.head.access = store.state.user.access;
  reqMsg.head.timestamp = Math.floor(Date.now() / 1000);
  switch (type) {
    case 'CONNECT':
      // 建立连接
      reqMsg.head.msgType = 1
      break
    case 'RECONNECT':
      // 建立连接
      reqMsg.head.msgType = 2
      reqMsg.body.data = confirmCode;
      break;
    case 'LOGIN_OUT':
      // 登出
      reqMsg.head.msgType = -2
      break;
    case 'TEST_INDIVIDUAL':
      // 个人测试
      reqMsg.head.msgType = 4
      reqMsg.head.msgContentType = contentType;
      reqMsg.body.data = data;
      break;
    default:
      // 其他
      reqMsg.head.msgType = 9
      break;
  }

  console.log('msg:', reqMsg)
  return encodeMessage(reqMsg);
}

const handleConfirmReConnect = () => {
  modalText.value = '正在连接...';
  confirmLoading.value = true;

  sendMessage(getMsg('RECONNECT'));

  confirmReConnect.value = false;
  confirmLoading.value = false;
};
const cancelConfirmReConnect = () => {
  ws.close();
  confirmReConnect.value = false;
  confirmLoading.value = false;
}
const handleIndividualTest = () => {
  sendMessage(getMsg('TEST_INDIVIDUAL', 'start'));
}
</script>

<style scoped></style>
