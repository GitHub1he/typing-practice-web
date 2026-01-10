<template>
  <div :class="{ 'flex-container': isSideBySide }">
    <!-- <a-textarea :value="articleInfo.content" class="custom-textarea" readonly
      :style="{ margin: isSideBySide ? '0px 10px' : '10px 0', fontSize: fontSize + 'px', ...textareaAutoSize }" /> -->
    <div class="update"
      :style="{ margin: isSideBySide ? '0px 10px' : '10px 0', fontSize: fontSize + 'px', ...textareaAutoSize }">
      <span v-for="(char, index) in articleInfo.content" :key="index" :style="comparisonStyles[index]">
        {{ char }}
      </span>
    </div>
    <a-textarea v-model:value="value2" placeholder="请输入您的文字" class="custom-textarea"
      :style="{ margin: isSideBySide ? '0px 10px' : '10px 0', fontSize: fontSize + 'px', ...textareaAutoSize }"
      @keydown="handleKeydown"
      v-if="!inputContent" />
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
const isStart = ref(false);
// 计算正确率
const accuracy = computed(() => PracticeUtils.calculateAccuracy(articleInfo.value, value2.value));
//计算输入进度
const inputProgress = computed(() => PracticeUtils.calculateInputProgress(articleInfo.value, value2.value));
const contentContainer = ref(null);

const emit = defineEmits(['updataTimeRangeStatus', 'submitExercise']);
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

// 处理键盘事件（Ctrl+Enter 提交）
const handleKeydown = (event) => {
  // 检测 Ctrl+Enter 或 Cmd+Enter（Mac）
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    // 触发提交事件
    emit('submitExercise');
  }
};

defineExpose({
  updateIsSideBySide,
  increaseFontSize,
  decreaseFontSize,
});

// const handleText = () => {
//   if (!typingStartTime.value) {
//     typingStartTime.value = Date.now();
//   }
//   const currentTime = Date.now();
//   const elapsedTime = parseInt((currentTime - typingStartTime.value) / 1000); // 转换为秒
//   const typedCharacters = value2.value.length;
//   let typingSpeeds = 0;

//   // 计算输入速度（字符/分钟）
//   if (elapsedTime !== 0) {
//     typingSpeeds = parseInt((typedCharacters / elapsedTime) * 60);

//   } else {
//     typingSpeeds = typedCharacters * 60;
//   }
//   // 更新输入速度
//   const timeSpeedObj = {
//     time: elapsedTime, // 或者你想要存入的时间值
//     speed: typingSpeeds
//   };

//   // 将对象存入数组
//   // 这里假设你有一个名为 timeSpeedArray 的 ref，用于存储时间和速度的数组
//   timeSpeedArray.value.push(timeSpeedObj);
//   console.log(timeSpeedArray.value);
//   typingSpeed.value = typingSpeeds;
// };

const comparisonStyles = computed(() => {
  const originalText = articleInfo.value.content;
  const styles = {};

  for (let i = 0; i < Math.min(originalText.length, value2.value.length); i++) {
    if (originalText[i] !== value2.value[i]) {
      styles[i] = { color: 'red' };
    }
  }

  return styles;
});
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
