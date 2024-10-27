<!-- 这个组件是一个练习打字的文本输入模块，具有显示文章内容、实时更新打字速度和准确率等功能。它的作用主要是提供一个双文本框布局，其中一个显示文章内容，另一个用于输入，并在输入过程中动态计算速度和准确率等信息。 -->
<template>
  <div :class="{ 'flex-container': isSideBySide }">
    <a-textarea :value="articleInfo.content" class="custom-textarea" readonly
      :style="{ margin: isSideBySide ? '0px 10px' : '10px 0', fontSize: fontSize + 'px', ...textareaAutoSize }" />
    <a-textarea v-model:value="value2" placeholder="请输入您的文字" class="custom-textarea"
      :style="{ margin: isSideBySide ? '0px 10px' : '10px 0', fontSize: fontSize + 'px', ...textareaAutoSize }"
      @input="handleText" v-if="!inputContent" />
    <div ref="contentContainer" v-html="inputContent" v-else class="update"
      :style="{ margin: isSideBySide ? '0px 10px' : '10px 0', fontSize: fontSize + 'px', ...textareaAutoSize }">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, inject, defineEmits, watch, nextTick } from 'vue';
import api from '../../api';
import PracticeUtils from './PracticeUtils.js';
const articleInfo = ref(inject('articleInfo'));
const practiceInfo = ref(inject('practiceInfo'));
const inputContent = ref(inject('inputContent'));
const value2 = ref('');
const isSideBySide = ref(false);
const fontSize = ref(16);
const typingStartTime = ref();
const typingSpeed = ref();
const isStart = ref(false);
// 计算正确率
const accuracy = computed(() => PracticeUtils.calculateAccuracy(articleInfo.value, value2.value));
//计算输入进度
const inputProgress = computed(() => PracticeUtils.calculateInputProgress(articleInfo.value, value2.value));
const contentContainer = ref(null);

const emit = defineEmits(['updataTimeRangeStatus']);
watch(value2, () => {
  if (!isStart.value) {
    isStart.value = true;
    api.practiceApi.start({
      id: practiceInfo.value.practiceId,
    }).then(res => {
      console.log(res);
    });
  }
  emit('updataTimeRangeStatus', practiceInfo.value.selectedTimeRange, value2.value, isStart.value, {
    typingSpeed: typingSpeed.value,
    accuracy: accuracy,
    inputProgress: inputProgress,
  },);
});

watch(inputContent, () => {
  nextTick(() => {
    PracticeUtils.setContentToTextarea(contentContainer.value);
  });
});

const textareaAutoSize = computed(() => {
  return {
    height: isSideBySide.value ? '31.875rem' : '16.25rem',
    minHeight: isSideBySide.value ? '31.875rem' : '16.25rem',
    maxHeight: isSideBySide.value ? '31.875rem' : '16.25rem',
  };
});
const updateIsSideBySide = () => {
  isSideBySide.value = !isSideBySide.value;
};
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

defineExpose({
  updateIsSideBySide,
  increaseFontSize,
  decreaseFontSize,
});

const handleText = () => {
  if (!typingStartTime.value) {
    typingStartTime.value = Date.now();
  }
  const currentTime = Date.now();
  const elapsedTime = parseInt((currentTime - typingStartTime.value) / 1000); // 转换为秒
  const typedCharacters = value2.value.length;
  let typingSpeeds = 0;

  // 计算输入速度（字符/分钟）
  if (elapsedTime !== 0) {
    typingSpeeds = parseInt((typedCharacters / elapsedTime) * 60);
  } else {
    typingSpeeds = typedCharacters * 60;
  }
  // 更新输入速度
  typingSpeed.value = typingSpeeds;
};

</script>

<style scoped>
.custom-textarea {
  font-size: 18px;
  box-sizing: border-box;
}

.flex-container {
  display: flex;
}

.update {
  border: 1px solid #d9d9d9;
  margin: 10px 0px;
  font-size: 16px;
  min-height: 260px;
  width: 100%;
  overflow-y: hidden;
  resize: none;
  box-sizing: border-box;
  line-height: 1.5714285714285714;
  vertical-align: bottom;
  transition: all 0.3s, height 0s;
  border-radius: 6px;
  padding: 4px 11px;
  overflow: auto;
}
</style>
