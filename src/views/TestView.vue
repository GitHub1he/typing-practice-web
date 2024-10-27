<template>

  <div style="float: right;">
    <a-tag color="success" v-if="wsStatus === 'connected'" @click="wsLogout()">
      <template #icon>
        <check-circle-outlined />
      </template>
      {{ wsStatus }}
    </a-tag>
    <a-tag color="processing" v-if="wsStatus === 'connecting'">
      <template #icon>
        <sync-outlined :spin="true" />
      </template>
      {{ wsStatus }}
    </a-tag>
    <a-tooltip placement="bottom">
      <template #title>
        <span>点击登录</span>
      </template>
      <a-tag color="default" v-if="wsStatus === 'disconnected' || wsStatus === 'init'" @click="connectWebSocket()">
        <template #icon>
          <close-circle-outlined v-if="wsStatus === 'disconnected'" />
          <exclamation-circle-outlined v-if="wsStatus === 'init'" />
        </template>
        {{ wsStatus }}
      </a-tag>
    </a-tooltip>
  </div>

  <div div class="mode-select" v-if="individualTestStatus === 'CHANGE_MODE'">
    <a-row gutter="16">
      <a-col :span="4"></a-col>
      <a-col :span="8">
        <a-card :hoverable="true" title="个人练习">
          <div>
            <a-list :grid="{ gutter: 16, column: 1 }" :data-source="languages">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card :title="item.itemName" hoverable class="language-card"
                    @click="individualTest(item.itemCode)"></a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="其他模式">
          <p>暂未开放</p>
        </a-card>
      </a-col>
      <a-col :span="4"></a-col>
    </a-row>
  </div>


  <div class="test-individual" @keydown="handleKeydown" tabindex="0"
    v-if="individualTestStatus === 'INIT' || individualTestStatus === 'ING'">
    <a-button type="dashed" @click="increaseFontSize()">+</a-button>
    <a-button type="dashed" @click="decreaseFontSize()">-</a-button>
    <a-button type="dashed" @click="updateIsSideBySide()">改变布局</a-button>
    <a-button type="dashed" @click="individualSubmit()">提交成绩(Ctrl+Enter)</a-button>
    <label>{{ inputContent.length }}/{{ sourceContent.length }}</label>
    <div :class="{ 'flex-container': isSideBySide }">
      <a-textarea :value="sourceContent" id="individual_source_text" class="custom-textarea" readonly
        :style="{ fontSize: fontSize + 'px', ...textareaAutoSize }" />
      <a-textarea :value="inputContent" @input="individualInputData" @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd" placeholder="请输入您的文字" class="custom-textarea"
        :style="{ fontSize: fontSize + 'px', ...textareaAutoSize }" />
    </div>
  </div>

  <!-- v-if="individualTestStatus === 'END'" -->
  <div class="test-individual" v-if="individualTestStatus === 'END'">
    <AfterPracticeView />
  </div>

  <a-modal v-model:open="confirmReConnect" title="是否确认登录" :confirm-loading="confirmLoading" @ok="handleConfirmReConnect"
    @cancel="cancelConfirmReConnect">
    <p>{{ modalText }}</p>
  </a-modal>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, ref, provide } from 'vue';
import { useStore } from 'vuex';
import baseUrl from '@/api/base';
import AfterPracticeView from './Practice/AfterPracticeView.vue';
import resProtoRoot from '../js/resProto.js';
import reqProtoRoot from '../js/reqProto.js';
import { ReqMsg } from '../js/ReqMsg';
import { CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';

const store = useStore();
// 控制语言选项显示与隐藏
const modalText = ref('是否确认重新登录');
const confirmReConnect = ref(false);
const confirmLoading = ref(false);

let ws = null; // 用来保存 WebSocket 实例
let wsStatus = ref('init'); // 连接状态：'init', 'connected', 'connecting', 'disconnected'
let webSocketPingTimer = null; // 心跳定时器
const webSocketPingTime = 9000; // 心跳的间隔，当前为9秒,
const heartbeat = '[0513]';
let retryCount = 0;
const maxRetries = 1;
let confirmCode;

const languages = store.state.article.articleLanguage;
const fontSize = ref(16);
const isSideBySide = ref(false);//视图，文本框上下/左右分布
const sourceContent = ref('');
const inputContent = ref('');
const sequence = ref(0); // 个人测试接收消息次序
let individualTestIngTimer = null;
let individualTestCollectTimer = null;
let individualTestAppendTimer = null;
const individualAppendIndex = ref(0); // 个人测试追加文章数据
const individualAppendData = ref(''); // 个人测试追加文章数据,防止直接更新sourceContent会组件刷新，导致中文未确认字符丢失
const typingInterval = 100; // 设置打字机字符显示间隔（毫秒）
const isComposing = ref(false); // 当前是否中文输入状态
const individualTestStatus = ref('CHANGE_MODE'); // 个人测试是否已开始
const scoreInfo = ref({});
provide('scoreInfo', scoreInfo);

// 获取消息类型
const reqType = reqProtoRoot.lookupType("RequestMsg");
const resType = resProtoRoot.lookupType("RespMsg");
// const msgType = msgProtoRoot.lookupType("Msg");

// 编码函数,使用请求报文编码
const encodeMessage = (msgObj) => {
  // messages.value.push(`You: `, JSON.stringify(msgObj));
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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

// 在组件卸载时关闭 WebSocket 连接
onBeforeUnmount(() => {
  wsLogout();
  window.removeEventListener('keydown', handleKeydown);
});

const connectWebSocket = () => {
  return new Promise((resolve, reject) => {
    // todo 刷新access时机
    wsStatus.value = 'connecting'
    ws = new WebSocket(`${baseUrl.wsUrl}?a=${store.state.user.access}`);
    ws.onopen = () => {
      sendMessage(getMsg('CONNECT'));
    }

    ws.onmessage = (event) => {
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
          // messages.value.push(res);
          switch (res.code) {
            case 'C0001':
              // 连接成功
              startHeartbeat();
              wsStatus.value = 'connected';
              resolve();
              break;
            case 'C00011':
              // 确认重新登录
              confirmCode = res.data;
              confirmReConnect.value = true;
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
            case 'C4000':
              // sourceContent 值替换会触发视图的重新渲染
              if (res.msg === 'INIT') {
                individualTestStatus.value = 'INIT'
                sourceContent.value = res.data
              } if (res.msg === 'ING') {
                const parseDate = JSON.parse(res.data);
                if (Number(sequence.value) + 1 === Number(parseDate.sequence)) {
                  sequence.value = Number(parseDate.sequence);
                  individualAppendData.value += parseDate.appendData;
                } else {
                  console.log('次序不同,发送COLLECT报文')
                  sendMessage(getMsg('TEST_INDIVIDUAL', 'COLLECT', ''))
                }
              } else if (res.msg === 'COLLECT') {
                const parseDate = JSON.parse(res.data);
                sourceContent.value = parseDate.appendData;
                sequence.value = Number(parseDate.sequence);
                individualAppendData.value = '';
                individualAppendIndex.value = 0;
              } else if (res.msg === 'END') {
                // 展示练习情况
                clearIndividualTestTimer();
                scoreInfo.value = JSON.parse(res.data);
                individualTestStatus.value = 'END'
              }

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
    ws.onerror = (error) => {
      wsStatus.value = 'disconnected'; // 更新状态为未连接
      console.error('WebSocket connection error:', error);
      retryCount++;
      if (retryCount <= maxRetries) {
        setTimeout(connectWebSocket, 2000); // 每2秒重试连接
      }
      reject(error);  // 连接失败后 reject Promise
    };
    ws.onclose = () => {
      wsLogout();
    };
  })
};

const wsLogout = () => {
  if (ws) {
    sendMessage(getMsg('LOGIN_OUT'));
    ws.close();
  }
  clearTimeout(webSocketPingTimer);
  clearIndividualTestTimer();
  wsStatus.value = 'disconnected'; // 更新状态为未连接
};

const startHeartbeat = () => {
  webSocketPingTimer = setTimeout(() => {
    if (wsStatus.value !== 'connected') {
      return false;
    }
    sendMessage(heartbeat);
    clearTimeout(webSocketPingTimer);
    // 重新执行
    startHeartbeat();
  }, webSocketPingTime);
};

// 发送消息到 WebSocket 服务器
const sendMessage = (data) => {
  ws.send(data);
};


/**
 * 获取不同类型的报文
 */
const getMsg = (type, contentType, data) => {
  const reqMsg = new ReqMsg();
  reqMsg.head.userId = store.state.user.user.userId;
  // reqMsg.head.access = store.state.user.access;
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

const individualTest = async (language) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    try {
      console.info('WebSocket 开始连接');
      await connectWebSocket();  // 等待 WebSocket 连接成功
    } catch (error) {
      console.error('WebSocket 连接失败，无法发送消息');
      return;
    }
  }
  // todo 重新连接 为等待是否连接直接进行下一步问题
  sendMessage(getMsg('TEST_INDIVIDUAL', 'INIT', `${language}`));
}

const textareaAutoSize = computed(() => {
  return {
    height: isSideBySide.value ? '31.875rem' : '16.25rem',
    minHeight: isSideBySide.value ? '31.875rem' : '16.25rem',
    maxHeight: isSideBySide.value ? '31.875rem' : '16.25rem',
    margin: isSideBySide.value ? '4px 8px' : '8px 4px'
  };
});
const increaseFontSize = () => {
  if (fontSize.value < 30) {
    fontSize.value += 2;
  }
};
const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2;
  }
};
const updateIsSideBySide = () => {
  isSideBySide.value = !isSideBySide.value;
};

const handleCompositionStart = () => {
  isComposing.value = true;
};

const handleCompositionEnd = () => {
  isComposing.value = false;
};
const handleKeydown = (event) => {
  // 监听 Ctrl+Enter 的方法
  if (individualTestStatus.value === 'ING' && event.ctrlKey && event.key === 'Enter') {
    individualSubmit();
  }
  // 监听 Ctrl+C (复制)
  if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
    console.log('复制操作');
    // 在这里执行复制相关的操作
  }

  // 监听 Ctrl+V (粘贴)
  if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
    console.log('粘贴操作');
    // 在这里执行粘贴相关的操作
  }
};

/** 个人测试-输入文字处理 */
const individualInputData = (event) => {

  if (individualTestStatus.value === 'INIT') {
    console.log('个人测试-输入文字处理开始')
    startIndividualTestIngTimer();
    startIndividualTestCollectTimer();
    startIndividualTestAppendTimer();
  }
  individualTestStatus.value = 'ING';
  inputContent.value = event.target.value;
}
/** 个人测试-发送当前用户输入数据 */
const startIndividualTestIngTimer = () => {
  individualTestIngTimer = setTimeout(() => {
    if (individualTestStatus.value !== 'ING') {
      clearIndividualTestTimer();
      return;
    }
    sendMessage(getMsg('TEST_INDIVIDUAL', 'ING', inputContent.value));
    clearTimeout(individualTestIngTimer)
    startIndividualTestIngTimer();
  }, 3000);
};
const startIndividualTestCollectTimer = () => {
  individualTestCollectTimer = setTimeout(() => {
    if (individualTestStatus.value !== 'ING') {
      clearIndividualTestTimer();
      return;
    }
    sendMessage(getMsg('TEST_INDIVIDUAL', 'COLLECT', ''));
    clearTimeout(individualTestCollectTimer)
    startIndividualTestCollectTimer();
  }, 10000);
};
const startIndividualTestAppendTimer = () => {
  const textarea = document.getElementById('individual_source_text');
  individualTestAppendTimer = setTimeout(() => {
    if (individualTestStatus.value !== 'ING') {
      clearIndividualTestTimer();
      return;
    }
    if (!isComposing.value && individualAppendIndex.value < individualAppendData.value.length) {
      // 当拼音在未确认的情况下，不更新sourceContent的值，否则会刷新元素，导致拼音未确认数据不显示
      sourceContent.value += individualAppendData.value[individualAppendIndex.value];
      individualAppendIndex.value++;

      textarea.scrollTop = textarea.scrollHeight;
    }
    clearTimeout(individualTestAppendTimer)
    startIndividualTestAppendTimer();
  }, typingInterval);
};

const clearIndividualTestTimer = () => {
  clearTimeout(individualTestIngTimer);
  clearTimeout(individualTestCollectTimer);
  clearTimeout(individualTestAppendTimer);
}

/** 个人测试-提交数据 */
const individualSubmit = () => {
  console.log("个人测试-提交数据")
  if (individualTestStatus.value === 'ING') {
    individualTestStatus.value = 'END';
    clearIndividualTestTimer();
    sendMessage(getMsg('TEST_INDIVIDUAL', 'END', inputContent.value));
    // todo 跳转下一个展示数据的页面
  }
}

</script>

<style scoped>
a-card {
  cursor: pointer;
}

/* 语言卡片样式 */
.language-card {
  text-align: center;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.language-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.test-individual,
.mode-select {
  width: 80%;
  margin: 5rem auto;
}

.flex-container {
  display: flex;
}

.custom-textarea {
  font-size: 18px;
  box-sizing: border-box;
}
</style>