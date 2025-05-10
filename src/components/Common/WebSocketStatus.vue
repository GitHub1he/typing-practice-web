<template>
  <div class="ws-status">
    <a-tag color="success" v-if="status === 'connected'" @click="logout">
      <template #icon>
        <check-circle-outlined />
      </template>
      {{ status }}
    </a-tag>
    <a-tag color="processing" v-if="status === 'connecting'">
      <template #icon>
        <sync-outlined :spin="true" />
      </template>
      {{ status }}
    </a-tag>
    <a-tooltip placement="bottom">
      <template #title>
        <span>点击登录</span>
      </template>
      <a-tag color="default" v-if="status === 'disconnected' || status === 'init'" @click="connect">
        <template #icon>
          <close-circle-outlined v-if="status === 'disconnected'" />
          <exclamation-circle-outlined v-if="status === 'init'" />
        </template>
        {{ status }}
      </a-tag>
    </a-tooltip>

    <a-modal v-model:open="showReconnectModal" title="重新登录确认" :confirm-loading="confirmLoading"
      @ok="handleConfirmReConnect" @cancel="cancelConfirmReConnect">
      <p>检测到您在其他地方登录，是否在此处重新登录？</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import WebSocketService from '@/services/WebSocketService';
import TypingWebSocketService from '@/services/TypingWebSocketService';

const status = ref('init');
const showReconnectModal = ref(false);
const confirmLoading = ref(false);
const modalText = ref('是否确认重新登录');

// 初始化WebSocket服务
onMounted(() => {
  WebSocketService.setCallbacks({
    onStatusChange: (newStatus) => {
      status.value = newStatus;
    },
    onReconnect: () => {
      showReconnectModal.value = true;
    }
  });

  TypingWebSocketService.init();
});

// 组件卸载时关闭WebSocket连接
onBeforeUnmount(() => {
  logout();
});

// 连接WebSocket
const connect = async () => {
  try {
    await WebSocketService.connect();
  } catch (error) {
    console.error('WebSocket连接失败:', error);
  }
};

// 登出
const logout = () => {
  WebSocketService.logout();
};

// 确认重连
const handleConfirmReConnect = () => {
  modalText.value = '正在重新连接...';
  confirmLoading.value = true;

  WebSocketService.confirmReconnect();

  setTimeout(() => {
    showReconnectModal.value = false;
    confirmLoading.value = false;
  }, 1000);
};

// 取消重连
const cancelConfirmReConnect = () => {
  showReconnectModal.value = false;
  confirmLoading.value = false;
  WebSocketService.logout();
};
</script>

<style scoped>
.ws-status {
  float: right;
  display: contents;
}
</style>