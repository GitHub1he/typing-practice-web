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
        <a-button type="primary" class="cancel-match-btn" @click="cancelMatching">取消匹配</a-button>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 内部状态
const matchingTime = ref(0);
let timerInterval = null;
let startTime = 0;

// 组件挂载时开始计时
onMounted(() => {
    startTimer();
});

// 组件卸载前清除计时器
onBeforeUnmount(() => {
    clearTimer();
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

const emit = defineEmits(['cancel-matching']);

const cancelMatching = () => {
    clearTimer(); // 取消匹配时清除计时器
    emit('cancel-matching');
};
</script>

<style scoped>
.matching-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70vh;
    background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
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
    0% { opacity: 0; }
    25% { opacity: 0.3; content: '.'; }
    50% { opacity: 0.6; content: '..'; }
    75% { opacity: 1; content: '...'; }
    100% { opacity: 0; }
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
</style>