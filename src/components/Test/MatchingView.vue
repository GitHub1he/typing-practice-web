<template>
    <div class="matching-container">
        <div class="matching-circle">
            <div class="circle-dots">
                <span v-for="i in 4" :key="i" class="dot"></span>
            </div>
            <div class="pulse-ring"></div>
            <div class="matching-text">
                <div class="matching-number">{{ matchingTime }}</div>
                <div class="matching-status">匹配中<span class="dot-animation">...</span></div>
            </div>
        </div>

        <!-- 匹配信息卡片 -->
        <div class="matching-info-card">
            <div class="info-item">
                <span class="info-label">匹配语言：</span>
                <span class="info-value">
                    <span class="language-icon">{{ getLanguageIcon(matchLanguage) }}</span>
                    <span class="language-name">{{ getLanguageName(matchLanguage) }}</span>
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">当前匹配人数：</span>
                <span class="info-value player-count">{{ playerCount }} 人</span>
            </div>
            <!-- 扩大匹配范围按钮 -->
            <a-button
                v-if="showExpandButton"
                type="primary"
                size="small"
                @click="handleExpandRange"
                class="expand-range-btn"
            >
                扩大匹配范围
            </a-button>
        </div>

        <a-button type="primary" class="cancel-match-btn" @click="cancelMatching">取消匹配</a-button>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, computed } from 'vue';
import { Modal } from 'ant-design-vue';
import TypingWebSocketService from '@/services/TypingWebSocketService';
import utils from '@/api/utils/generalUtil';

const props = defineProps({
    matchLanguage: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['cancel-matching', 'expand-range']);

// 内部状态
const matchingTime = ref(0);
const playerCount = ref(1); // 默认为1（包括自己）
let timerInterval = null;
let refreshInterval = null;
let startTime = 0;

// 计算是否显示扩大范围按钮（只有当语言不是随机时才显示）
const showExpandButton = computed(() => {
    return props.matchLanguage !== '' && props.matchLanguage !== null;
});

// 获取语言图标
const getLanguageIcon = (language) => {
    const iconMap = {
        '1': '🇨🇳',  // 中文
        '2': '🇺🇸',  // English
        '3': '🇯🇵',  // 日本語
        '': '🎲'     // 随机
    };
    return iconMap[language] || '🎲';
};

// 获取语言名称
const getLanguageName = (language) => {
    const nameMap = {
        '1': '中文',
        '2': 'English',
        '3': '日本語',
        '': '随机'
    };
    return nameMap[language] || '随机';
};

// 处理扩大匹配范围
const handleExpandRange = () => {
    Modal.confirm({
        title: '扩大匹配范围',
        content: '是否扩大到所有语言进行匹配？扩大后将可以匹配到任何语言的玩家。',
        okText: '确认扩大',
        cancelText: '取消',
        onOk: () => {
            // 触发扩大范围事件
            emit('expand-range');
            utils.tip("已扩大到所有语言匹配", "info");
        }
    });
};

// 请求匹配状态更新
const requestMatchingStatusUpdate = () => {
    // 发送一个MATCHING消息来获取最新的匹配状态
    // 这会触发后端返回包含playerCount的消息
    TypingWebSocketService.requestMatchingStatus();
};

// 组件挂载时开始计时和刷新
onMounted(() => {
    startTimer();
    // 每3秒请求一次匹配状态更新
    refreshInterval = setInterval(() => {
        requestMatchingStatusUpdate();
    }, 3000);
});

// 组件卸载前清除计时器
onBeforeUnmount(() => {
    clearTimer();
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
});

// 开始计时函数
const startTimer = () => {
    matchingTime.value = 0;
    startTime = Date.now();

    timerInterval = setInterval(() => {
        // 计算实际经过的秒数，而不是简单地递增
        matchingTime.value = Math.floor((Date.now() - startTime) / 1000);
    }, 500); // 更新频率可以适当降低，减少渲染压力
};

// 清除计时器函数
const clearTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
};

const cancelMatching = () => {
    clearTimer(); // 取消匹配时清除计时器
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    emit('cancel-matching');
};

// 暴露方法供父组件调用
defineExpose({
    updatePlayerCount: (count) => {
        playerCount.value = count;
    }
});
</script>

<style scoped>
.matching-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70vh;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.matching-circle {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0% {
        transform: translateY(0px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    50% {
        transform: translateY(-10px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    100% {
        transform: translateY(0px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
}

.pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(63, 81, 181, 0.4);
    animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        opacity: 0.7;
    }

    50% {
        transform: scale(1.05);
        opacity: 0.3;
    }

    100% {
        transform: scale(0.95);
        opacity: 0.7;
    }
}

.circle-dots {
    position: absolute;
    width: 100%;
    height: 100%;
    animation: rotate 8s linear infinite;
}

.dot {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
}

.dot:nth-child(1) {
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    animation: pulse-dot 2s ease-in-out infinite;
}

.dot:nth-child(2) {
    top: 50%;
    right: 10%;
    transform: translateY(-50%);
    animation: pulse-dot 2s ease-in-out infinite 0.5s;
}

.dot:nth-child(3) {
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    animation: pulse-dot 2s ease-in-out infinite 1s;
}

.dot:nth-child(4) {
    top: 50%;
    left: 10%;
    transform: translateY(-50%);
    animation: pulse-dot 2s ease-in-out infinite 1.5s;
}

@keyframes pulse-dot {
    0% {
        transform: scale(1);
        opacity: 0.7;
    }

    50% {
        transform: scale(1.2);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 0.7;
    }
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
    animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
    0% {
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }

    50% {
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }

    100% {
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }
}

.matching-number {
    font-size: 3.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, #fff, #c5cae9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.matching-status {
    font-size: 1.2rem;
    position: relative;
}

.dot-animation {
    display: inline-block;
    animation: dot-animation 1.5s infinite;
}

@keyframes dot-animation {
    0% {
        opacity: 0;
    }

    25% {
        opacity: 0.3;
        content: '.';
    }

    50% {
        opacity: 0.6;
        content: '..';
    }

    75% {
        opacity: 1;
        content: '...';
    }

    100% {
        opacity: 0;
    }
}

.matching-info-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 3rem;
    animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-label {
    font-size: 1rem;
    color: #666;
    font-weight: 500;
}

.info-value {
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.language-icon {
    font-size: 1.5rem;
}

.language-name {
    font-size: 1rem;
}

.player-count {
    color: #3f51b5;
    font-size: 1.3rem;
    font-weight: bold;
}

.expand-range-btn {
    margin-left: auto;
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    border: none;
    border-radius: 1.5rem;
    color: white;
    font-weight: 600;
    padding: 0.4rem 1.2rem;
    height: auto;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(255, 152, 0, 0.3);
    animation: pulse-button 2s ease-in-out infinite;
}

@keyframes pulse-button {
    0%, 100% {
        box-shadow: 0 3px 10px rgba(255, 152, 0, 0.3);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 5px 15px rgba(255, 152, 0, 0.5);
        transform: scale(1.05);
    }
}

.expand-range-btn:hover {
    background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(245, 124, 0, 0.5);
}

.expand-range-btn:active {
    transform: translateY(0);
    box-shadow: 0 3px 10px rgba(255, 152, 0, 0.3);
}

.cancel-match-btn {
    font-size: 1.2rem;
    padding: 0.8rem 3rem;
    height: auto;
    background: linear-gradient(45deg, #4CAF50, #8BC34A);
    border: none;
    border-radius: 2rem;
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.cancel-match-btn:hover {
    background: linear-gradient(45deg, #43A047, #7CB342);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.6);
}

.cancel-match-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.cancel-match-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.5s ease;
}

.cancel-match-btn:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

@media (max-width: 768px) {
    .matching-info-card {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 1.5rem;
    }

    .info-item {
        justify-content: space-between;
        width: 100%;
    }
}
</style>
