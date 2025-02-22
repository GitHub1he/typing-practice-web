<template>
  <!-- 右上角状态显示 -->
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

  <!-- 模式选择 -->
  <div class="mode-select" v-if="currentModeSelect === 'MODE_CHANGE_MODE'">

    <a-card class="mode-select-item" :hoverable="true" title="个人练习">
      <div v-for="(item, index) in languages" :key="item.itemCode || index">
        <a-card class="language-card" :title="item.itemName" @click="StartIndividualTest(item.itemCode)"
          style="margin-bottom: 5px;" hoverable></a-card>
      </div>
      <a-card class="language-card" title="随机" @click="StartIndividualTest('')" hoverable></a-card>
    </a-card>

    <a-card class="mode-select-item" :hoverable="true" title="竞赛">
      <div v-for="(item, index) in matchSelect" :key="item.itemCode || index">
        <a-card class="language-card" :title="item.itemName" @click="StartMatch(item.itemCode)"
          style="margin-bottom: 5px;" hoverable></a-card>
      </div>
    </a-card>

    <a-card class="mode-select-item" title="其他模式">
      <p>暂未开放</p>
    </a-card>
  </div>


  <div class="test-individual" @paste.capture.prevent=false @copy.capture.prevent=false @keydown="handleKeydown"
    tabindex="0"
    v-if="currentModeSelect === 'MODE_INDIVIDUAL_TEST_INIT' || currentModeSelect === 'MODE_INDIVIDUAL_TEST_ING'">
    <div class="test-header">
      <div class="font-change">
        <a-button type="dashed" @click="increaseFontSize()">+</a-button>
        <a-button type="dashed" @click="decreaseFontSize()">-</a-button>
      </div>
      <div class="showing-data">
        <label>{{ inputContent.length }}/{{ sourceContent.length }}</label>
        <label>正确率:{{ Number(scoreInfo.accuracy) * 100 }}% </label>
        <label>速度:{{ scoreInfo.speed }}字/秒 </label>
        <label>用时:{{ scoreInfo.actualDuration }}秒 </label>
        <label style="color: red;">{{ scoreInfo.tipMsg }} </label>
      </div>
      <div class="option-btn">
        <a-button type="dashed" @click="updateIsSideBySide()">改变布局</a-button>
        <a-button type="primary" @click="individualSubmit()">提交成绩(Ctrl+Enter)</a-button>
      </div>
    </div>

    <div :class="{ 'flex-container': isSideBySide }">
      <a-textarea :value="sourceContent" id="individual_source_text" class="custom-textarea" readonly
        :style="{ fontSize: fontSize + 'px', ...textareaAutoSize }" />
      <a-textarea :value="inputContent" @input="individualInputData" @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd" placeholder="请输入您的文字" class="custom-textarea"
        :style="{ fontSize: fontSize + 'px', ...textareaAutoSize }" />
    </div>
  </div>

  <div class="test-individual" v-if="currentModeSelect === 'MODE_INDIVIDUAL_TEST_END'">
    <AfterPracticeView />
  </div>

  <div class="test-individual" v-if="currentModeSelect === 'MODE_MATCH_ING'">
    <div class="matching-container">
      <div class="matching-circle">
        <div class="circle-dots">
          <span v-for="i in 4" :key="i" class="dot"></span>
        </div>
        <div class="matching-text">
          <div class="matching-number">{{ matchingTime }}</div>
          <div class="matching-status">匹配中...</div>
        </div>
      </div>
      <a-button type="primary" class="cancel-match-btn" @click="cancelMatching">取消匹配</a-button>
    </div>
  </div>

  <div class="test-individual" v-if="currentModeSelect === 'MODE_MATCH_SUCCESS'">
    <div class="match-success-container">
      <div class="match-overlay">
        <div class="match-content">
          <div class="players-container">
            <div class="player-card" :class="{ 'ready': matchInfo?.player1?.ready }">
              <div class="player-avatar">
                <a-avatar :size="100" :src="utils.getAvatarSrc(matchInfo?.player1?.avatar || '1')">
                </a-avatar>
              </div>
              <div class="player-name">{{ matchInfo?.player1?.nickName || '玩家1' }}</div>
              <div class="ready-status">{{ matchInfo?.player1?.ready ? '已准备' : '未准备' }}</div>
            </div>
            <div class="vs-text">VS</div>
            <div class="player-card" :class="{ 'ready': matchInfo?.player2?.ready }">
              <div class="player-avatar">
                <a-avatar :size="100" :src="utils.getAvatarSrc(matchInfo?.player2?.avatar || '1')"></a-avatar>
              </div>
              <div class="player-name">{{ matchInfo?.player2?.nickName || '玩家2' }}</div>
              <div class="ready-status">{{ matchInfo?.player2?.ready ? '已准备' : '未准备' }}</div>
            </div>
          </div>

          <template v-if="currentMatchMode === '0'">
            <a-button type="primary" class="ready-btn" :disabled="isReady" @click="handleReady">
              {{ isReady ? '已准备' : '准备' }}
            </a-button>
          </template>
          <template v-else>
            <div class="other-mode-info">
              <p>其他比赛模式正在开发中...</p>
            </div>
          </template>
        </div>
      </div>
    </div>
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
import api from '@/api/index.js';
import utils from '@/api/utils/generalUtil';
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
const webSocketPingTime = 12000; // 心跳的间隔，当前为12秒,
const heartbeat = '[0513]';
let retryCount = 0;
const maxRetries = 1;
let confirmCode;
let selectLanguages = null;
const matchingTime = ref(0);
let matchingTimer = null;
const matchInfo = ref(null); // 存储匹配信息
const isReady = ref(false); // 准备状态
const currentMatchMode = ref(''); // 存储当前比赛模式

const languages = store.state.article.articleLanguage;
const matchSelect = [
  {
    "itemCode": '0',
    "itemName": "激情1V1"
  }
];
const fontSize = ref(16);
const isSideBySide = ref(false);//视图，文本框上下/左右分布
const sourceContent = ref('');
const inputContent = ref('');
const sequence = ref(0); // 个人测试接收消息次序
let individualTestIngTimer = null;
let individualTestCollectTimer = null;
let individualTestAppendTimer = null;
const individualAppendIndex = ref(0); // 个人测试追加文章数据
const bufferData = ref({ individualAppendData: "", accuracy: "", speed: "", actualDuration: "", });// 个人测试追加文章数据,防止直接更新sourceContent会组件刷新，导致中文未确认字符丢失
const typingInterval = 100; // 设置打字机字符显示间隔（毫秒）
const isComposing = ref(false); // 当前是否中文输入状态
const currentModeSelect = ref('MODE_CHANGE_MODE'); // 个人测试是否已开始
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
              currentModeSelect.value = 'MODE_CHANGE_MODE';
              break;
            case 'C0003':
              // 被重连
              ws.close();
              utils.tip('异地登录', 'warning')
              currentModeSelect.value = 'MODE_CHANGE_MODE';
              break;
            case 'C0004':
              // 登出
              wsStatus.value = 'disconnected';
              break;
            case 'C0006':
              // 提示
              if (currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_ING') {
                scoreInfo.value.tipMsg = res.msg;
              } else {
                utils.tip(res.msg, "warning");
              }
              break;
            case 'C4000':
              // sourceContent 值替换会触发视图的重新渲染
              if (res.msg === 'INIT') {
                currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_INIT'
                sourceContent.value = res.data
              } if (res.msg === 'ING') {
                const parseDate = JSON.parse(res.data);
                bufferData.value.speed = parseDate.speed;
                bufferData.value.accuracy = parseDate.accuracy;
                bufferData.value.actualDuration = parseDate.actualDuration;
                if (Number(sequence.value) + 1 === Number(parseDate.sequence)) {
                  sequence.value = Number(parseDate.sequence);
                  bufferData.value.individualAppendData += parseDate.appendData;
                } else {
                  console.log('次序不同,发送COLLECT报文')
                  sendMessage(getMsg('TEST_INDIVIDUAL', 'COLLECT', ''))
                }
              } else if (res.msg === 'COLLECT') {
                const parseDate = JSON.parse(res.data);
                sourceContent.value = parseDate.appendData;
                sequence.value = Number(parseDate.sequence);
                bufferData.value.individualAppendData = '';
                individualAppendIndex.value = 0;
              } else if (res.msg === 'END') {
                // 展示练习情况
                clearIndividualTestTimer();
                scoreInfo.value = JSON.parse(res.data);
                currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_END'
                wsLogout();
              }
              break;
            case 'C4100':
              if (res.msg === 'INIT') {
                StartIndividualTest(selectLanguages);
              }
              break;
            case 'C5000':
              if (res.msg === 'MATCHING') {
                currentModeSelect.value = 'MODE_MATCH_ING'
              } else if (res.msg === 'CANCEL_MATCH') {
                utils.tip("取消匹配", "info");
                currentModeSelect.value = 'MODE_CHANGE_MODE'
              } else if (res.msg === 'MATCH_SUCCESS') {
                utils.tip("匹配成功", "info");
                const parseDate = JSON.parse(res.data);
                console.log("匹配成功：", parseDate)
                matchInfo.value = {
                  roomId: parseDate.roomId,
                  player1: {
                    ...parseDate.players[0],
                    ready: false
                  },
                  player2: {
                    ...parseDate.players[1],
                    ready: false
                  }
                };
                currentModeSelect.value = 'MODE_MATCH_SUCCESS'
              } else if (res.msg === 'MATCH_FAIL') {
                utils.tip("匹配失败", "error");
                currentModeSelect.value = 'MODE_CHANGE_MODE'
              }
              break;
            case 'C5100':
              if (res.msg === 'READY') {
                // 处理玩家准备状态更新
                const parseDate = JSON.parse(res.data);
                console.log("准备：", parseDate);
                // 更新整个玩家列表的状态
                matchInfo.value = {
                  ...matchInfo.value,
                  player1: {
                    ...matchInfo.value.player1,
                    ready: parseDate.players[0].ready
                  },
                  player2: {
                    ...matchInfo.value.player2,
                    ready: parseDate.players[1].ready
                  }
                };
              } else if (res.msg === 'NONROOM') {
                utils.tip("准备失败，房间不存在", "error");
                currentModeSelect.value = 'MODE_CHANGE_MODE'
              }
              break;
            case 'C6000':
              if (res.msg === 'START') {
                currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_INIT'
                sourceContent.value = res.data
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
      } else {
        reject(error);  // 连接失败后 reject Promise
      }
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
 * @param type 消息类型：'CONNECT'、'RECONNECT'、'LOGIN_OUT'、'TEST_INDIVIDUAL'、'MATCH'
 * @param contentType head.msgContentType
 * @param data body.data
 */
const getMsg = (type, contentType, data, roomId) => {
  const reqMsg = new ReqMsg();
  reqMsg.head.userId = store.state.user.user.userId;
  // reqMsg.head.access = store.state.user.access;
  reqMsg.head.timestamp = Math.floor(Date.now() / 1000);
  switch (type) {
    case 'CONNECT':
      // 建立连接
      reqMsg.head.msgType = 1
      break;
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
    case 'MATCH':
      // 匹配
      reqMsg.head.msgType = 5
      reqMsg.head.msgContentType = contentType;
      reqMsg.body.data = data;
      break;
    case 'PKONEONONE':
      // 一对一
      reqMsg.head.msgType = 6
      reqMsg.head.roomId = roomId;
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

const StartIndividualTest = async (language) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    try {
      console.info('WebSocket 开始连接');
      await api.baseApi.getWsAddr();
      await connectWebSocket();  // 等待 WebSocket 连接成功
    } catch (error) {
      console.error('WebSocket 连接失败，无法发送消息');
      return;
    }
  }
  selectLanguages = language;
  sendMessage(getMsg('TEST_INDIVIDUAL', 'INIT', `${language}`));
}

const StartMatch = async (matchMode) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    try {
      console.info('WebSocket 开始连接');
      await api.baseApi.getWsAddr();
      await connectWebSocket();  // 等待 WebSocket 连接成功
    } catch (error) {
      console.error('WebSocket 连接失败，无法发送消息');
      return;
    }
  }
  currentModeSelect.value = 'MODE_MATCH_ING';
  currentMatchMode.value = matchMode.toString(); // 保存比赛模式
  // 开始计时
  matchingTime.value = 0;
  matchingTimer = setInterval(() => {
    matchingTime.value++;
  }, 1000);

  sendMessage(getMsg('MATCH', 'START', JSON.stringify({ "matchMode": `${matchMode}` })));
}

const cancelMatching = () => {
  if (currentModeSelect.value === 'MODE_MATCH_ING') {
    clearInterval(matchingTimer);
    sendMessage(getMsg('MATCH', 'CANCEL'));
    currentModeSelect.value = 'MODE_CHANGE_MODE';
  } else {
    utils.tip("当前非匹配中状态", "warning");
  }
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
  if (currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_ING' && event.ctrlKey && event.key === 'Enter') {
    individualSubmit();
  }
};

/** 个人测试-输入文字处理 */
const individualInputData = (event) => {

  if (ws && currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_INIT') {
    console.log('个人测试-输入文字处理开始')
    startIndividualTestIngTimer();
    startIndividualTestCollectTimer();
    startIndividualTestAppendTimer();
  }
  currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_ING';
  inputContent.value = event.target.value;
}
/** 个人测试-发送当前用户输入数据 */
const startIndividualTestIngTimer = () => {
  individualTestIngTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_INDIVIDUAL_TEST_ING') {
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
    if (currentModeSelect.value !== 'MODE_INDIVIDUAL_TEST_ING') {
      clearIndividualTestTimer();
      return;
    }
    sendMessage(getMsg('TEST_INDIVIDUAL', 'COLLECT', ''));
    clearTimeout(individualTestCollectTimer)
    startIndividualTestCollectTimer();
  }, 20000);
};
const startIndividualTestAppendTimer = () => {
  const textarea = document.getElementById('individual_source_text');
  individualTestAppendTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_INDIVIDUAL_TEST_ING') {
      clearIndividualTestTimer();
      return;
    }
    if (!isComposing.value) {
      if (individualAppendIndex.value < bufferData.value.individualAppendData.length) {
        // 当拼音在未确认的情况下，不更新sourceContent的值，否则会刷新元素，导致拼音未确认数据不显示
        sourceContent.value += bufferData.value.individualAppendData[individualAppendIndex.value];
        individualAppendIndex.value++;
        scoreInfo.value.tipMsg = '';
      }
      scoreInfo.value.speed = bufferData.value.speed;
      scoreInfo.value.accuracy = bufferData.value.accuracy;
      scoreInfo.value.actualDuration = bufferData.value.actualDuration;
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
  if (currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_ING') {
    currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_END';
    clearIndividualTestTimer();
    sendMessage(getMsg('TEST_INDIVIDUAL', 'END', inputContent.value));
  } else {
    utils.tip("输入文字开始", "warning");
  }
}

/** 匹配成功后准备 */
const handleReady = () => {
  if (!matchInfo.value?.roomId) {
    utils.tip("房间信息获取失败", "error");
    return;
  }
  isReady.value = true;
  sendMessage(getMsg('PKONEONONE', 'READY', JSON.stringify({
    roomId: matchInfo.value.roomId
  }), matchInfo.value.roomId.toString()));
};

</script>

<style scoped>
a-card {
  cursor: pointer;
}

.mode-select {
  width: 100%;
  margin: 5rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  min-height: 70vh;
}

.mode-select-item {
  width: 30%;
  height: auto
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

.test-individual {
  width: 80%;
  margin: 4rem auto 0 auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.font-change,
.showing-data,
.option-btn {
  display: inline-block;
}

.flex-container {
  display: flex;
}

.custom-textarea {
  font-size: 18px;
  box-sizing: border-box;
  user-select: none;
}

@media (max-width: 768px) {
  .mode-select {
    flex-direction: column;
  }

  .mode-select-item {
    width: 70%;
    height: auto
  }
}

.matching-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
}

.matching-circle {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #3f51b5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.circle-dots {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: rotate 4s linear infinite;
}

.dot {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot:nth-child(1) {
  top: 10%;
  left: 50%;
}

.dot:nth-child(2) {
  top: 50%;
  right: 10%;
}

.dot:nth-child(3) {
  bottom: 10%;
  left: 50%;
}

.dot:nth-child(4) {
  top: 50%;
  left: 10%;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.matching-text {
  text-align: center;
  color: white;
  z-index: 1;
}

.matching-number {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.matching-status {
  font-size: 1.2rem;
}

.cancel-match-btn {
  font-size: 1.2rem;
  padding: 0.5rem 2rem;
  height: auto;
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.cancel-match-btn:hover {
  background-color: #45a049;
  border-color: #45a049;
}

/* 去除全局滚动条 */
:root {
  overflow: hidden;
}

.match-success-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.match-overlay {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.match-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

.players-container {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

.player-card.ready {
  background: rgba(82, 196, 26, 0.15);
  box-shadow: 0 8px 32px rgba(82, 196, 26, 0.2);
}

.player-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.player-card.ready .player-avatar {
  border-color: rgba(82, 196, 26, 0.6);
}

.player-name {
  color: white;
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.ready-status {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.player-card.ready .ready-status {
  color: #52c41a;
  font-weight: bold;
}

.vs-text {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.ready-btn {
  padding: 0.8rem 4rem;
  font-size: 1.3rem;
  height: auto;
  border-radius: 2rem;
  border: none;
  background: linear-gradient(45deg, #1890ff, #40a9ff);
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.ready-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
  background: linear-gradient(45deg, #40a9ff, #69c0ff);
}

.ready-btn:disabled {
  background: linear-gradient(45deg, #52c41a, #73d13d);
  opacity: 0.8;
  cursor: not-allowed;
}
</style>
