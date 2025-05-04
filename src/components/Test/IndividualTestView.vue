<template>
    <div class="common-card" @paste.capture.prevent=false @copy.capture.prevent=false @keydown="handleKeydown"
        tabindex="0">
        <div class="test-header">
            <div class="font-change">
                <a-button type="dashed" @click="increaseFontSize">+</a-button>
                <a-button type="dashed" @click="decreaseFontSize">-</a-button>
            </div>
            <div class="showing-data">
                <label>{{ inputContent.length }}/{{ sourceContent.length }}</label>
                <label>正确率:{{ Number(scoreInfo.accuracy) * 100 }}% </label>
                <label>速度:{{ scoreInfo.speed }}字/秒 </label>
                <label>用时:{{ scoreInfo.actualDuration }}秒 </label>
                <label style="color: red;">{{ scoreInfo.tipMsg }} </label>
            </div>
            <div class="option-btn">
                <a-button type="dashed" @click="updateIsSideBySide">改变布局</a-button>
                <a-button type="primary" @click="individualSubmit">提交成绩(Ctrl+Enter)</a-button>
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
</template>

<script setup>
import { computed, ref, inject } from 'vue';
import utils from '@/api/utils/generalUtil';

const props = defineProps({
    sourceContent: {
        type: String,
        required: true
    },
    inputContent: {
        type: String,
        required: true
    },
    currentModeSelect: {
        type: String,
        required: true
    },
    scoreInfo: {  // 添加 scoreInfo prop
        type: Object,
        required: true
    }
});

const emit = defineEmits([
    'update:inputContent',
    'update:currentModeSelect',
    'individualInputData',
    'individualSubmit',
    'isComposingChange'
]);

const fontSize = ref(16);
const isSideBySide = ref(false);
const isComposing = ref(false);

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
    emit('isComposingChange', true);
};

const handleCompositionEnd = () => {
    isComposing.value = false;
    emit('isComposingChange', false);
};

// 将handleKeydown方法提取到组件内部
const handleKeydown = (event) => {
    // 监听 Ctrl+Enter 的方法
    if (props.currentModeSelect === 'MODE_INDIVIDUAL_TEST_ING'
        && event.ctrlKey && event.key === 'Enter') {
        individualSubmit();
    }
};

const individualInputData = (event) => {
    emit('individualInputData', event);
};

const individualSubmit = () => {
    if (props.currentModeSelect === 'MODE_INDIVIDUAL_TEST_ING') {
        emit('individualSubmit');
    } else {
        utils.tip("输入文字开始", "warning");
    }
};
</script>

<style scoped>
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
</style>