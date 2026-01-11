<template>
  <div class="home-container">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-title">
          <h1 class="main-title">
            <span class="title-part">极速指尖</span>
            <span class="title-divider">·</span>
            <span class="title-part highlight">竞技对决</span>
          </h1>
          <p class="subtitle">实时对战 · 多种练习模式 · 全球排行榜</p>
        </div>

        <!-- 打字动画效果 -->
        <div class="typing-animation">
          <span class="typed-text">{{ typedText }}</span>
          <span class="cursor">|</span>
        </div>

        <!-- CTA 按钮组 -->
        <div class="cta-buttons">
          <a-button type="primary" size="large" class="cta-primary" @click="startGuestExperience">
            <template #icon>
              <PlayCircleOutlined />
            </template>
            立即体验
          </a-button>
          <a-button size="large" class="cta-secondary" @click="goToRegister">
            注册账号
          </a-button>
        </div>
      </div>

      <!-- 装饰性背景元素 -->
      <div class="bg-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </section>

    <!-- 核心功能展示区 -->
    <section class="features-section">
      <div class="features-container">

        <!-- 练习功能卡片 -->
        <div class="feature-card practice-card" @click="goToPractice">
          <div class="card-icon">
            <EditOutlined />
          </div>
          <h3 class="card-title">专业练习系统</h3>
          <p class="card-description">三种练习模式，从基础到进阶，针对性提升</p>
          <div class="card-modes">
            <div class="mode-item">模式一: 标准练习</div>
            <div class="mode-item">模式二: 代码专项</div>
            <div class="mode-item">模式三: 盲打训练</div>
          </div>
          <div class="card-action">
            <span>开始练习</span>
            <RightOutlined />
          </div>
        </div>

        <!-- 对战功能卡片 -->
        <div class="feature-card battle-card" @click="goToBattle">
          <div class="card-icon">
            <ThunderboltOutlined />
          </div>
          <h3 class="card-title">1v1实时对战</h3>
          <p class="card-description">与全球玩家实时PK，基于语言智能匹配同水平对手</p>
          <div class="card-tags">
            <span class="tag">🏆 实时排名</span>
            <span class="tag">⚡ 毫秒级响应</span>
            <span class="tag">🌍 多语言支持</span>
          </div>
          <div class="card-action">
            <span>开始匹配</span>
            <RightOutlined />
          </div>
        </div>

        <!-- 排行榜功能卡片 -->
        <div class="feature-card ranking-card" @click="goToRanking">
          <div class="card-icon">
            <TrophyOutlined />
          </div>
          <h3 class="card-title">全球排行榜</h3>
          <p class="card-description">实时排名，见证每一次进步</p>
          <div class="ranking-preview">
            <div class="top-player">
              <a-avatar :size="32" icon="user" />
              <span>查看完整排名</span>
            </div>
          </div>
          <div class="card-action">
            <span>查看排行</span>
            <RightOutlined />
          </div>
        </div>
      </div>
    </section>

    <!-- 工具箱入口 -->
    <div class="toolbox-toggle" @click="toggleToolbox">
      <a-tooltip placement="left" title="实用工具">
        <a-button type="primary" shape="circle" :icon="h(ToolOutlined)" size="large" />
      </a-tooltip>
    </div>

    <!-- 工具箱弹窗 -->
    <a-modal v-model:open="showToolbox" title="实用工具箱" :footer="null" width="90%" :style="{ maxWidth: '800px' }">
      <ToolboxComponent />
    </a-modal>

    <!-- 游客体验弹窗 -->
    <a-modal v-model:open="showGuestModal" title="快速体验" :footer="null" width="90%"
      :style="{ maxWidth: '900px', top: '20px' }">
      <GuestExperience @close="showGuestModal = false" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import {
  PlayCircleOutlined,
  ThunderboltOutlined,
  EditOutlined,
  TrophyOutlined,
  RightOutlined,
  ToolOutlined
} from '@ant-design/icons-vue';
import ToolboxComponent from '../components/Toolbox/ToolboxComponent.vue';
import GuestExperience from '../components/Home/GuestExperience.vue';

const router = useRouter();
const store = useStore();

// 响应式数据
const showToolbox = ref(false);
const showGuestModal = ref(false);
const typedText = ref('');

// 打字动画文字
const typingTexts = [
  '超越极限，挑战巅峰',
  '每秒击键，成就荣耀',
  '实时竞技，一触即发',
  '专业训练，快速提升'
];
let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

// 打字动画效果
const typeEffect = () => {
  const currentText = typingTexts[currentTextIndex];

  if (isDeleting) {
    typedText.value = currentText.substring(0, currentCharIndex - 1);
    currentCharIndex--;
    typingSpeed = 50;
  } else {
    typedText.value = currentText.substring(0, currentCharIndex + 1);
    currentCharIndex++;
    typingSpeed = 100;
  }

  if (!isDeleting && currentCharIndex === currentText.length) {
    isDeleting = true;
    typingSpeed = 2000; // 停顿2秒
  } else if (isDeleting && currentCharIndex === 0) {
    isDeleting = false;
    currentTextIndex = (currentTextIndex + 1) % typingTexts.length;
    typingSpeed = 500;
  }

  setTimeout(typeEffect, typingSpeed);
};

// 切换工具箱
const toggleToolbox = () => {
  showToolbox.value = !showToolbox.value;
};

// 游客体验
const startGuestExperience = () => {
  showGuestModal.value = true;
};

// 跳转注册
const goToRegister = () => {
  router.push({ name: 'login' });
};

// 跳转对战（需要登录）
const goToBattle = () => {
  if (store.state.user.isLogin) {
    router.push({ name: 'test' });
  } else {
    message.warning('请先登录后再进行对战');
    router.push({ name: 'login' });
  }
};

// 跳转练习（需要登录）
const goToPractice = () => {
  if (store.state.user.isLogin) {
    router.push({ name: 'practice' });
  } else {
    message.info('游客模式可直接体验练习功能');
    startGuestExperience();
  }
};

// 跳转排行榜（无需登录）
const goToRanking = () => {
  if (store.state.user.isLogin) {
    router.push({ name: 'ranking' });
  } else {
    message.info('查看排行榜无需登录，点击首页"注册"即可创建账号');
  }
};

onMounted(() => {
  // 启动打字动画
  setTimeout(typeEffect, 1000);

  // 清除body背景样式（使用CSS背景）
  document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundPosition = '';
});

onBeforeUnmount(() => {
  // 清理工作
  document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundPosition = '';
});
</script>

<style scoped>
/* 主容器 */
.home-container {
  min-height: calc(100vh - 3.5rem);
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 50%, #f0f4f8 100%);
  position: relative;
  overflow: hidden;
}

/* Hero 区域 */
.hero-section {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
}

.hero-content {
  text-align: center;
  z-index: 2;
  max-width: 900px;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  margin-bottom: 2rem;
}

.main-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 50%, #13c2c2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-part {
  display: inline-block;
}

.title-divider {
  color: #52c41a;
  -webkit-text-fill-color: #52c41a;
}

.subtitle {
  font-size: 1.5rem;
  color: #5a6c7d;
  margin-top: 1rem;
  font-weight: 300;
}

/* 打字动画 */
.typing-animation {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 2rem 0;
  min-height: 3rem;
  font-weight: 500;
  letter-spacing: 2px;
}

.typed-text {
  color: #52c41a;
}

.cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #52c41a;
  margin-left: 2px;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

/* CTA 按钮组 */
.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.cta-primary {
  height: 56px;
  padding: 0 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.5);
}

.cta-secondary {
  height: 56px;
  padding: 0 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px solid #1890ff;
  color: #1890ff;
  background: transparent;
  transition: all 0.3s ease;
}

.cta-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
  background: rgba(24, 144, 255, 0.08);
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.08) 0%, rgba(24, 144, 255, 0.08) 100%);
  animation: float 20s infinite;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 10%;
  animation-delay: 10s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 功能展示区 */
.features-section {
  padding: 4rem 2rem;
  position: relative;
  z-index: 2;
}

.features-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #52c41a 0%, #1890ff 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #d9d9d9;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #52c41a 0%, #1890ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 1rem 0;
  font-weight: 600;
}

.card-description {
  color: #5a6c7d;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.card-modes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.mode-item {
  background: #f5f7fa;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #5a6c7d;
  font-size: 0.9rem;
  border: 1px solid #e8e8e8;
}

.ranking-preview {
  margin-bottom: 1.5rem;
}

.top-player {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #5a6c7d;
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #52c41a;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-card:hover .card-action {
  color: #1890ff;
}

/* 工具箱入口 */
.toolbox-toggle {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.toolbox-toggle .ant-btn {
  width: 56px;
  height: 56px;
  font-size: 24px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
}

.toolbox-toggle .ant-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .typing-animation {
    font-size: 1.3rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    max-width: 300px;
  }

  .features-container {
    grid-template-columns: 1fr;
  }

  .hero-section {
    padding: 1rem;
    min-height: 60vh;
  }
}
</style>
