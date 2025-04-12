<template>
    <div class="match-success-container">
        <div class="match-overlay">
            <div class="match-content">
                <div class="players-container">
                    <div class="player-card" :class="{ 'ready': props.matchInfo?.player1?.ready }">
                        <div class="player-avatar">
                            <a-avatar :size="100" :src="getAvatarSrc(props.matchInfo?.player1?.avatar || '1')">
                            </a-avatar>
                        </div>
                        <div class="player-name">{{ props.matchInfo?.player1?.nickName || '玩家1' }}</div>
                        <div class="ready-status">{{ props.matchInfo?.player1?.ready ? '已准备' : '未准备' }}</div>
                    </div>
                    <div class="vs-text">VS</div>
                    <div class="player-card" :class="{ 'ready': props.matchInfo?.player2?.ready }">
                        <div class="player-avatar">
                            <a-avatar :size="100"
                                :src="getAvatarSrc(props.matchInfo?.player2?.avatar || '1')"></a-avatar>
                        </div>
                        <div class="player-name">{{ props.matchInfo?.player2?.nickName || '玩家2' }}</div>
                        <div class="ready-status">{{ props.matchInfo?.player2?.ready ? '已准备' : '未准备' }}</div>
                    </div>
                </div>

                <template v-if="props.currentMatchMode === '0'">
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
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import utils from '@/api/utils/generalUtil';

const props = defineProps({
    matchInfo: {
        type: Object,
        default: () => ({})
    },
    currentMatchMode: {
        type: String,
        default: '0'
    }
});

const emit = defineEmits(['ready']);

const isReady = ref(false); // 准备状态
const handleReady = () => {
    isReady.value = true;
    emit('ready');
};

const getAvatarSrc = (avatar) => {
    return utils.getAvatarSrc(avatar);
};
</script>

<style scoped>
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