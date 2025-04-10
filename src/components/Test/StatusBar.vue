<template>
    <div style="float: right;">
        <a-tag color="success" v-if="wsStatus === 'connected'" @click="wsLogout">
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
            <a-tag color="default" v-if="wsStatus === 'disconnected' || wsStatus === 'init'" @click="connectWebSocket">
                <template #icon>
                    <close-circle-outlined v-if="wsStatus === 'disconnected'" />
                    <exclamation-circle-outlined v-if="wsStatus === 'init'" />
                </template>
                {{ wsStatus }}
            </a-tag>
        </a-tooltip>
    </div>
</template>

<script setup>
import { CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';

defineProps({
    wsStatus: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['logout', 'connect']);

const wsLogout = () => {
    emit('logout');
};

const connectWebSocket = () => {
    emit('connect');
};
</script>