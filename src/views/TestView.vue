<template>
  <!-- 右上角状态显示 -->
  <WebSocketStatus />

  <!-- 模式选择 -->
  <ModeSelection v-if="currentModeSelect === 'MODE_CHANGE_MODE'" @start-individual="StartIndividualTest"
    @start-match="StartMatch" />

  <!-- 匹配中 -->
  <div class="common-card" v-if="currentModeSelect === 'MODE_MATCH_ING'">
    <MatchingView ref="matchingViewRef" @cancel-matching="cancelMatching" @expand-range="handleExpandRange" :match-language="currentMatchLanguage" />
  </div>

  <!-- 匹配成功 -->
  <div class="common-card" v-if="currentModeSelect === 'MODE_MATCH_SUCCESS'">
    <MatchSuccessView :match-info="matchInfo" :current-match-mode="currentMatchMode" @ready="handleReady" />
  </div>

  <!-- 个人测试 -->
  <IndividualTestView
    v-if="currentModeSelect === 'MODE_INDIVIDUAL_TEST_INIT' || currentModeSelect === 'MODE_INDIVIDUAL_TEST_ING'"
    :source-content="sourceContent" :input-content="inputContent" :current-mode-select="currentModeSelect"
    :score-info="scoreInfo" @individual-input-data="individualInputData" @individual-submit="individualSubmit"
    @is-composing-change="handleIsComposingChange" />

  <!-- 一对一对战 -->
  <div class="battle-container" v-if="currentModeSelect === 'MODE_ONE_ON_ONE_ING'">
    <div class="battle-main">
      <OneOnOneView :source-content="sourceContent" :input-content="inputContent"
        :current-mode-select="currentModeSelect" :score-info="scoreInfo" @one-on-one-input-data="oneOnOneInputData"
        @one-on-one-submit="oneOnOneSubmit" @is-composing-change="handleIsComposingChange" />
    </div>
    <!-- 对战图表信息 -->
    <div class="battle-sidebar">
      <BattleInfoChart :other-player-show-map="scoreInfo.otherPlayerShowMap" />
    </div>
  </div>

  <!-- 对战倒计时组件 -->
  <div class="common-card" v-if="currentModeSelect === 'MODE_ONE_ON_ONE_WAIT'">
    <div class="countdown-container">
      <div class="countdown-circle">
        <div class="countdown-number">{{ countdownTime }}</div>
        <div class="countdown-text">对战即将开始</div>
      </div>
    </div>
  </div>

  <div class="common-card"
    v-if="currentModeSelect === 'MODE_INDIVIDUAL_TEST_END' || currentModeSelect === 'MODE_ONE_ON_ONE_END'">
    <AfterPracticeView />
  </div>
</template>

<script setup>
import BattleInfoChart from '@/components/Test/BattleInfoChart.vue';
import WebSocketStatus from '@/components/Common/WebSocketStatus.vue';
import ModeSelection from '@/components/Test/ModeSelection.vue';
import MatchingView from '@/components/Test/MatchingView.vue';
import MatchSuccessView from '@/components/Test/MatchSuccessView.vue';
import IndividualTestView from '@/components/Test/IndividualTestView.vue';
import OneOnOneView from '@/components/Test/OneOnOneView.vue';
import AfterPracticeView from './Practice/AfterPracticeView.vue';
import { onMounted, ref, provide } from 'vue';
import { Modal } from 'ant-design-vue';
import utils from '@/api/utils/generalUtil';
import WebSocketService from '@/services/WebSocketService';
import TypingWebSocketService from '@/services/TypingWebSocketService';

// 状态变量
const matchInfo = ref(null); // 存储匹配信息
const currentMatchMode = ref(''); // 存储当前比赛模式
const currentMatchLanguage = ref(''); // 存储当前匹配语言
const matchingViewRef = ref(null); // MatchingView组件引用
const userChoseToWait = ref(false); // 用户是否选择了继续等待（不再自动提示超时）
const sourceContent = ref('');
const inputContent = ref('');
const sequence = ref(0); // 个人测试接收消息次序
const individualAppendIndex = ref(0); // 个人测试追加文章数据
const bufferData = ref({ individualAppendData: "", accuracy: "", speed: "", actualDuration: "", otherPlayerShowMap: "" }); // 个人测试追加文章数据
const typingInterval = 100; // 设置打字机字符显示间隔（毫秒）
const isComposing = ref(false); // 当前是否中文输入状态
const currentModeSelect = ref('MODE_CHANGE_MODE'); // 当前模式
const scoreInfo = ref({});
const countdownTime = ref(3); // 倒计时初始值
let countdownTimer = null; // 倒计时定时器
let individualTestIngTimer = null;
let individualTestCollectTimer = null;
let individualTestAppendTimer = null;
let matchTimeoutTimer = null; // 匹配超时定时器
provide('scoreInfo', scoreInfo);

// 初始化WebSocket服务
onMounted(() => {
  setupWebSocketCallbacks();
});

// 设置WebSocket回调
const setupWebSocketCallbacks = () => {
  TypingWebSocketService.setCallbacks({
    onModeChange: (mode) => {
      currentModeSelect.value = mode;
    },
    onContentUpdate: (content) => {
      sourceContent.value = content;
    },
    onProgressUpdate: (data) => {
      bufferData.value.speed = data.speed;
      bufferData.value.accuracy = data.accuracy;
      bufferData.value.actualDuration = data.actualDuration;
      if (data.otherPlayerShowMap) {
        bufferData.value.otherPlayerShowMap = JSON.parse(data.otherPlayerShowMap);
        console.log('bufferData.value.otherPlayerShowMap', bufferData.value.otherPlayerShowMap);
      }

      if (Number(sequence.value) + 1 === Number(data.sequence)) {
        sequence.value = Number(data.sequence);
        bufferData.value.individualAppendData += data.appendData;
      } else {
        console.log('次序不同,发送COLLECT报文');
        if (currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_ING') {
          TypingWebSocketService.requestCollect();
        } else if (currentModeSelect.value === 'MODE_ONE_ON_ONE_ING') {
          TypingWebSocketService.requestBattleCollect(matchInfo.value.roomId.toString());
        }
      }
    },
    onCollectUpdate: (data) => {
      sourceContent.value = data.appendData;
      sequence.value = Number(data.sequence);
      bufferData.value.individualAppendData = '';
      individualAppendIndex.value = 0;
    },
    onTestEnd: (mode, data) => {
      clearTimers();
      scoreInfo.value = data;
      currentModeSelect.value = mode;
      WebSocketService.logout();
    },
    onMatchSuccess: (data) => {
      // 清除超时定时器
      if (matchTimeoutTimer) {
        clearTimeout(matchTimeoutTimer);
        matchTimeoutTimer = null;
      }

      matchInfo.value = {
        roomId: data.roomId,
        player1: {
          ...data.players[0],
          ready: false
        },
        player2: {
          ...data.players[1],
          ready: false
        }
      };
      currentModeSelect.value = 'MODE_MATCH_SUCCESS';
    },
    onReadyUpdate: (data) => {
      matchInfo.value = {
        ...matchInfo.value,
        player1: {
          ...matchInfo.value.player1,
          ready: data.players[0].ready
        },
        player2: {
          ...matchInfo.value.player2,
          ready: data.players[1].ready
        }
      };
    },
    onCountdownStart: () => {
      startCountdown();
    },
    onTipMessage: (msg) => {
      if (currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_ING' || currentModeSelect.value === 'MODE_ONE_ON_ONE_ING') {
        scoreInfo.value.tipMsg = msg;
      } else {
        utils.tip(msg, "warning");
      }
    },
    // 添加匹配状态更新回调（用于更新匹配人数）
    onMatchingStatusUpdate: (matchingStatus) => {
      if (matchingViewRef.value && matchingStatus.playerCount !== undefined) {
        matchingViewRef.value.updatePlayerCount(matchingStatus.playerCount);
      }
    },
    // 添加获取当前模式的回调
    getCurrentMode: () => {
      return currentModeSelect.value;
    }
  });
};

// 开始个人测试
const StartIndividualTest = async (language) => {
  if (WebSocketService.status !== 'connected') {
    try {
      await WebSocketService.connect();
    } catch (error) {
      console.error('WebSocket 连接失败，无法发送消息');
      return;
    }
  }
  TypingWebSocketService.startIndividualTest(language);
};

// 开始匹配
const StartMatch = async (matchConfig) => {
  // matchConfig: { matchMode: '0', language: '1' | '2' | '3' | '' }
  if (WebSocketService.status !== 'connected') {
    try {
      await WebSocketService.connect();
    } catch (error) {
      console.error('WebSocket 连接失败，无法发送消息');
      return;
    }
  }
  currentModeSelect.value = 'MODE_MATCH_ING';
  currentMatchMode.value = matchConfig.matchMode; // 保存比赛模式
  currentMatchLanguage.value = matchConfig.language || ''; // 保存选择的语言

  // 启动30秒超时检查
  startMatchTimeoutCheck();

  TypingWebSocketService.startMatch(matchConfig);
};

// 启动匹配超时检查
const startMatchTimeoutCheck = () => {
  // 如果当前语言已经是随机，则不需要启动超时检查
  if (currentMatchLanguage.value === '' || currentMatchLanguage.value === null) {
    console.log('当前语言为随机，不启动超时检查');
    return;
  }

  // 如果用户已经选择了继续等待，则不再自动提示
  if (userChoseToWait.value) {
    console.log('用户已选择继续等待，不再自动提示超时');
    return;
  }

  // 清除可能存在的旧定时器
  if (matchTimeoutTimer) {
    clearTimeout(matchTimeoutTimer);
  }

  // 30秒后触发超时提示
  matchTimeoutTimer = setTimeout(() => {
    if (currentModeSelect.value === 'MODE_MATCH_ING') {
      // 再次检查语言是否为随机（防止用户中途切换到随机）
      if (currentMatchLanguage.value !== '' && currentMatchLanguage.value !== null) {
        showExpandMatchModal();
      }
    }
  }, 30000);
};

// 显示扩大匹配范围的弹窗
const showExpandMatchModal = () => {
  Modal.confirm({
    title: '匹配超时',
    content: '选择该语言的对手较少，是否扩大到所有语言进行匹配？',
    okText: '扩大范围',
    cancelText: '继续等待',
    onOk: () => {
      // 用户选择扩大匹配范围
      TypingWebSocketService.expandMatchRange();
      // 更新前端状态为随机语言
      currentMatchLanguage.value = '';
      // 清除定时器，不再提示（因为已经是随机匹配了）
      if (matchTimeoutTimer) {
        clearTimeout(matchTimeoutTimer);
        matchTimeoutTimer = null;
      }
      utils.tip("已扩大到所有语言匹配", "info");
    },
    onCancel: () => {
      // 用户选择继续等待，标记为已选择等待，后续不再自动提示
      userChoseToWait.value = true;
      utils.tip("将继续等待当前语言匹配", "info");
    }
  });
};

// 处理扩大匹配范围（从MatchingView手动触发）
const handleExpandRange = () => {
  TypingWebSocketService.expandMatchRange();
  // 更新前端状态为随机语言
  currentMatchLanguage.value = '';
  // 清除定时器
  if (matchTimeoutTimer) {
    clearTimeout(matchTimeoutTimer);
    matchTimeoutTimer = null;
  }
};

// 取消匹配
const cancelMatching = () => {
  if (currentModeSelect.value === 'MODE_MATCH_ING') {
    // 清除超时定时器
    if (matchTimeoutTimer) {
      clearTimeout(matchTimeoutTimer);
      matchTimeoutTimer = null;
    }
    TypingWebSocketService.cancelMatch();
    currentModeSelect.value = 'MODE_CHANGE_MODE';
  } else {
    utils.tip("当前非匹配中状态", "warning");
  }
};

// 处理中文输入状态变化
const handleIsComposingChange = (value) => {
  isComposing.value = value;
};

// 个人测试-输入文字处理
const individualInputData = (event) => {
  if (WebSocketService.status === 'connected' && currentModeSelect.value === 'MODE_INDIVIDUAL_TEST_INIT') {
    console.log('个人测试-输入文字处理开始');
    currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_ING';
    startIndividualTestIngTimer();
    startIndividualTestCollectTimer();
    startIndividualTestAppendTimer();
  }
  currentModeSelect.value = 'MODE_INDIVIDUAL_TEST_ING';
  inputContent.value = event.target.value;
};

// 个人测试-发送当前用户输入数据
const startIndividualTestIngTimer = () => {
  individualTestIngTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_INDIVIDUAL_TEST_ING') {
      clearIndividualTestTimer();
      return;
    }
    // 使用TypingWebSocketService发送消息
    TypingWebSocketService.sendIndividualProgress(inputContent.value);
    clearTimeout(individualTestIngTimer);
    startIndividualTestIngTimer();
  }, 3000);
};

const startIndividualTestCollectTimer = () => {
  individualTestCollectTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_INDIVIDUAL_TEST_ING') {
      clearIndividualTestTimer();
      return;
    }
    // 使用TypingWebSocketService请求收集
    TypingWebSocketService.requestCollect();
    clearTimeout(individualTestCollectTimer);
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
    // 使用TypingWebSocketService结束个人测试
    TypingWebSocketService.endIndividualTest(inputContent.value);
  } else {
    utils.tip("输入文字开始", "warning");
  }
}

// 添加倒计时函数
const startCountdown = () => {
  countdownTime.value = 3;

  // 清除可能存在的旧定时器
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  // 创建新的倒计时定时器
  countdownTimer = setInterval(() => {
    if (countdownTime.value > 1) {
      countdownTime.value--;
    } else {
      clearInterval(countdownTimer);
      // 倒计时结束，自动开始对战
      // 模拟一个空的输入事件触发oneOnOneInputData
      // 模拟一个空的输入事件触发oneOnOneInputData
      oneOnOneInputData({ target: { value: '' } });
    }
  }, 1000);
};
// 添加清除所有定时器的函数
const clearTimers = () => {
  clearIndividualTestTimer();
  clearOneOnOneTimer();
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
};

/** 1v1-输入文字处理 */
const oneOnOneInputData = (event) => {
  if (WebSocketService.status === 'connected' && currentModeSelect.value === 'MODE_ONE_ON_ONE_WAIT') {
    console.log('1v1-开始')
    currentModeSelect.value = 'MODE_ONE_ON_ONE_ING';
    startOneOnOneIngTimer();
    startOneOnOneCollectTimer();
    startOneOnOneAppendTimer();
  }
  currentModeSelect.value = 'MODE_ONE_ON_ONE_ING';
  inputContent.value = event.target.value;
}
/** 1v1-发送当前用户输入数据 */
const startOneOnOneIngTimer = () => {
  individualTestIngTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_ONE_ON_ONE_ING') {
      clearOneOnOneTimer();
      return;
    }
    // 使用TypingWebSocketService发送对战进度
    TypingWebSocketService.sendBattleProgress(inputContent.value, matchInfo.value.roomId.toString());
    clearTimeout(individualTestIngTimer);
    startOneOnOneIngTimer();
  }, 3000);
};

const startOneOnOneCollectTimer = () => {
  individualTestCollectTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_ONE_ON_ONE_ING') {
      clearOneOnOneTimer();
      return;
    }
    // 使用TypingWebSocketService请求对战收集
    TypingWebSocketService.requestBattleCollect(matchInfo.value.roomId.toString());
    clearTimeout(individualTestCollectTimer);
    startOneOnOneCollectTimer();
  }, 20000);
};
const startOneOnOneAppendTimer = () => {
  const textarea = document.getElementById('oneOnOne_source_text');
  individualTestAppendTimer = setTimeout(() => {
    if (currentModeSelect.value !== 'MODE_ONE_ON_ONE_ING') {
      clearOneOnOneTimer();
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
      scoreInfo.value.otherPlayerShowMap = bufferData.value.otherPlayerShowMap;
      // 添加对textarea是否存在的检查
      if (textarea) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
    clearTimeout(individualTestAppendTimer)
    startOneOnOneAppendTimer();
  }, typingInterval);
};

const clearOneOnOneTimer = () => {
  clearTimeout(individualTestIngTimer);
  clearTimeout(individualTestCollectTimer);
  clearTimeout(individualTestAppendTimer);
}

/** 1v1-提交数据 */
const oneOnOneSubmit = () => {
  if (currentModeSelect.value === 'MODE_ONE_ON_ONE_ING') {
    currentModeSelect.value = 'MODE_ONE_ON_ONE_END';
    clearOneOnOneTimer();
    // 使用TypingWebSocketService结束对战
    TypingWebSocketService.endBattle(inputContent.value, matchInfo.value.roomId.toString());
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
  // 使用TypingWebSocketService准备对战
  TypingWebSocketService.readyForBattle(matchInfo.value.roomId);
};

</script>

<style scoped>
a-card {
  cursor: pointer;
}


.common-card {
  width: 60%;
  /* 默认宽度 */
  margin: 0 auto 0 auto;
}

/* 当屏幕宽度小于 992px 时 */
@media (max-width: 991.98px) {
  .common-card {
    width: 80%;
    /* 调整宽度为 80% */
  }
}

/* 当屏幕宽度小于 768px 时 */
@media (max-width: 767.98px) {
  .common-card {
    width: 95%;
    /* 调整宽度为 100% */
    margin-top: 1rem;
    /* 在非常窄的屏幕上可以适当减小上边距 */
    /* 可以考虑移除左右 auto边距，如果需要完全贴边 */
    /* margin-left: 0; */
    /* margin-right: 0; */
  }
}


/* 去除全局滚动条 */
:root {
  overflow: hidden;
}


/* 倒计时样式 */
.countdown-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.countdown-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(24, 144, 255, 0.3);
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(24, 144, 255, 0.3);
  }

  to {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(24, 144, 255, 0.4);
  }
}

.countdown-number {
  font-size: 5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.countdown-text {
  font-size: 1.2rem;
  color: white;
  margin-top: 0.5rem;
}

/* 添加对战信息图表的容器样式 */
.battle-info-container {
  width: 60%;
  /* 默认宽度，与 common-card 保持一致 */
  margin: 1rem auto;
}

/* 响应式调整 battle-info-container 的宽度 */
@media (max-width: 991.98px) {
  .battle-info-container {
    width: 80%;
  }
}

@media (max-width: 767.98px) {
  .battle-info-container {
    width: 100%;
  }
}

/* 对战布局容器 */
.battle-container {
  width: 90%;
  margin: 2rem auto;
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: flex-start;
  /* 顶部对齐 */
  gap: 1rem;
}

/* 对战主区域 */
.battle-main {
  min-width: 50%;
}

/* 对战侧边栏 */
.battle-sidebar {
  min-width: 25%;
}

/* 在小屏幕上调整布局 */
@media (max-width: 991.98px) {
  .battle-container {
    width: 95%;
    flex-direction: column;
  }

  .battle-main,
  .battle-sidebar {
    width: 100%;
  }
}
</style>
