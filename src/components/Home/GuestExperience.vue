<template>
  <div class="guest-experience">
    <!-- 体验说明 -->
    <div class="intro-section">
      <h3>🎮 快速体验模式</h3>
      <p>无需登录，立即体验我们的练习系统！</p>
      <p class="hint">提示：完成后注册账号可保存成绩并解锁更多功能</p>
    </div>

    <!-- 文章显示区域 -->
    <div class="practice-area">
      <!-- 统计信息 -->
      <div class="article-header">
        <span class="article-title">📝 体验文章</span>
        <span class="article-stats">
          <span class="stat-item">
            <ClockCircleOutlined /> {{ formatTime }} | {{ wpm }} 字/分
          </span>
          <span class="stat-item">
            错误: <span :class="{ 'error-high': errorCount > 5 }">{{ errorCount }}</span>
          </span>
        </span>
      </div>

      <!-- 实时对比显示 -->
      <div class="comparison-area">
        <div class="comparison-title">实时对比（绿色正确 · 红色错误）</div>
        <div class="comparison-content">
          <div
            v-for="(char, index) in articleContent"
            :key="index"
            class="char-compare"
            :class="{
              'correct': userInput[index] === char,
              'wrong': userInput[index] && userInput[index] !== char,
              'pending': !userInput[index]
            }"
          >
            {{ char }}
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-label">请在下方输入框中输入上方文章内容：</div>
        <a-textarea
          v-model:value="userInput"
          :rows="10"
          placeholder="在此处输入上方文章内容..."
          :disabled="isCompleted"
          @input="handleInput"
          @paste="handlePaste"
          class="practice-input"
          :class="{ 'completed': isCompleted }"
        />

        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">完成度: {{ progress.toFixed(1) }}%</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <a-button v-if="!isStarted && !isCompleted" type="primary" size="large" @click="startPractice">
        <template #icon><PlayCircleOutlined /></template>
        开始练习
      </a-button>

      <a-button v-if="isStarted && !isCompleted" type="primary" danger size="large" @click="resetPractice">
        <template #icon><ReloadOutlined /></template>
        重新开始
      </a-button>

      <div v-if="isCompleted" class="completion-area">
        <a-result
          status="success"
          title="练习完成！"
          :sub-title="`最终成绩: ${wpm} 字/分钟 | 错误数: ${errorCount} | 用时: ${formatTime}`"
        >
          <template #extra>
            <a-space :size="12">
              <a-button type="primary" size="large" @click="goToRegister">
                <template #icon><UserAddOutlined /></template>
                注册账号保存成绩
              </a-button>
              <a-button size="large" @click="resetPractice">
                <template #icon><ReloadOutlined /></template>
                再来一次
              </a-button>
            </a-space>
          </template>
        </a-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  UserAddOutlined
} from '@ant-design/icons-vue';

const emit = defineEmits(['close']);
const router = useRouter();

// 预设体验文章
const demoArticle = '欢迎来到打字练习平台！这是一个专业在线打字训练网站，提供多种练习模式和实时对战功能。通过持续练习，你可以显著提高打字速度和准确率。现在就开始体验吧！';

// 响应式数据
const articleContent = ref(demoArticle);
const userInput = ref('');
const isStarted = ref(false);
const isCompleted = ref(false);
const startTime = ref(null);
const elapsedTime = ref(0);
const timer = ref(null);

// 计算属性
const progress = computed(() => {
  if (!articleContent.value.length) return 0;
  return (userInput.value.length / articleContent.value.length) * 100;
});

const errorCount = computed(() => {
  let errors = 0;
  for (let i = 0; i < userInput.value.length; i++) {
    if (userInput.value[i] !== articleContent.value[i]) {
      errors++;
    }
  }
  return errors;
});

const wpm = computed(() => {
  if (elapsedTime.value === 0) return 0;
  const minutes = elapsedTime.value / 60;
  const words = userInput.value.length / 5; // 标准WPM计算：每5个字符算一个词
  return Math.round(words / minutes);
});

const formatTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60);
  const seconds = elapsedTime.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// 方法
const startPractice = () => {
  isStarted.value = true;
  startTime.value = Date.now();
  startTimer();
};

const handleInput = () => {
  if (!isStarted.value) {
    startPractice();
  }

  // 检查是否完成
  if (userInput.value.length >= articleContent.value.length) {
    completePractice();
  }
};

const handlePaste = (e) => {
  e.preventDefault();
  // 禁止粘贴，鼓励用户手动输入
};

const startTimer = () => {
  timer.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const completePractice = () => {
  isCompleted.value = true;
  stopTimer();
};

const resetPractice = () => {
  userInput.value = '';
  isStarted.value = false;
  isCompleted.value = false;
  startTime.value = null;
  elapsedTime.value = 0;
  stopTimer();
};

const goToRegister = () => {
  emit('close');
  router.push({ name: 'login' });
};

onMounted(() => {
  // 可以在这里加载更多体验文章
});

// 组件卸载时清理计时器
const { onBeforeUnmount } = require('vue');
onBeforeUnmount(() => {
  stopTimer();
});
</script>

<style scoped>
.guest-experience {
  padding: 1.5rem;
}

.intro-section {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(24, 144, 255, 0.08) 100%);
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.intro-section h3 {
  font-size: 1.5rem;
  color: #52c41a;
  margin: 0 0 0.5rem 0;
}

.intro-section p {
  color: #5a6c7d;
  margin: 0.5rem 0;
}

.hint {
  font-size: 0.9rem;
  color: #1890ff;
}

.practice-area {
  margin-bottom: 2rem;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.article-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.article-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  color: #5a6c7d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.error-high {
  color: #ff4d4f;
  font-weight: 600;
}

.comparison-area {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.comparison-title {
  color: #52c41a;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.comparison-content {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 2;
}

.char-compare {
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.char-compare.correct {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.12);
  font-weight: 600;
}

.char-compare.wrong {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.12);
  text-decoration: line-through;
}

.char-compare.pending {
  color: #5a6c7d;
}

.input-area {
  margin-bottom: 1rem;
}

.input-label {
  color: #52c41a;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.practice-input {
  font-size: 1.1rem;
  line-height: 1.8;
  letter-spacing: 1px;
  background: #ffffff;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.practice-input:focus {
  border-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.15);
  background: #ffffff;
}

.practice-input.completed {
  border-color: #52c41a;
  background: rgba(82, 196, 26, 0.05);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-text {
  text-align: right;
  color: #5a6c7d;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.action-buttons {
  text-align: center;
  margin-bottom: 2rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .guest-experience {
    padding: 1rem;
  }

  .practice-input,
  .comparison-content {
    font-size: 1rem;
  }

  .article-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 全局样式覆盖 */
:deep(.ant-input) {
  color: #2c3e50 !important;
  background-color: #ffffff !important;
}

:deep(.ant-input::placeholder) {
  color: rgba(90, 108, 125, 0.6) !important;
}

:deep(.ant-input-textarea-show-count::after) {
  color: #5a6c7d;
}

:deep(.ant-result-title) {
  color: #2c3e50;
}

:deep(.ant-result-subtitle) {
  color: #5a6c7d;
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
}

/* 确保输入框获得焦点时文字也可见 */
:deep(.ant-input:focus) {
  color: #2c3e50 !important;
}

/* 禁用状态的输入框 */
:deep(.ant-input:disabled) {
  color: #5a6c7d !important;
  background-color: #f5f7fa !important;
}
</style>
