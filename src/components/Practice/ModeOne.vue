<template>
  <div class="mode-one-container" :style="{ fontSize: fontSize + 'px' }">
    <!-- 调试信息 -->
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; border-radius: 4px; font-size: 0.75em;">
      <div>文章总行数: {{ articleLines.length }}</div>
      <div>当前已完成: {{ lineInputs.filter(input => input && input.length > 0).length }} 行</div>
    </div>

    <div v-for="(line, lineIndex) in articleLines" :key="lineIndex" class="line-pair">
      <!-- 文章行 -->
      <div class="article-line">
        {{ line }}
      </div>

      <!-- 输入框行 -->
      <div class="input-line">
        <a-input
          v-model:value="lineInputs[lineIndex]"
          @input="handleInput(lineIndex, $event)"
          @keydown="handleKeydown(lineIndex, $event)"
          :ref="el => setInputRef(lineIndex, el)"
          :disabled="isSubmitted || (lineIndex > 0 && !lineInputs[lineIndex - 1])"
          class="line-input"
          :class="{
            'line-completed': isLineCompleted(lineIndex),
            'line-error': hasLineError(lineIndex) && lineInputs[lineIndex].length === line.length
          }"
          :style="{ fontSize: fontSize + 'px' }"
          placeholder="在此输入对应行的内容"
        />

        <!-- 状态图标 -->
        <span class="status-icon" v-if="lineInputs[lineIndex] && lineInputs[lineIndex].length > 0">
          <CheckCircleOutlined v-if="isLineCompleted(lineIndex) && !hasLineError(lineIndex)" class="icon-success" />
          <CloseCircleOutlined v-else-if="hasLineError(lineIndex) && lineInputs[lineIndex].length === line.length" class="icon-error" />
          <LoadingOutlined v-else class="icon-loading" />
        </span>

        <!-- 简洁的错误提示（只在有错误时显示） -->
        <div class="error-hint" v-if="hasLineError(lineIndex) && lineInputs[lineIndex].length > 0">
          <span class="error-count">{{ getErrorCount(lineIndex) }}个错误</span>
        </div>
      </div>
    </div>

    <!-- 完成提示 -->
    <div v-if="allLinesCompleted" class="completion-tip">
      <a-alert message="所有行已完成！请点击提交按钮查看成绩" type="success" show-icon />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, inject, defineEmits, watch, nextTick, onMounted } from 'vue';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import api from '../../api';
import PracticeUtils from './PracticeUtils.js';

// 注入数据
const articleInfo = ref(inject('articleInfo'));
const practiceInfo = ref(inject('practiceInfo'));
const inputContent = ref(inject('inputContent'));

// 响应式数据
const lineInputs = ref([]);
const inputRefs = ref([]);
const fontSize = ref(16);
const isStart = ref(false);
const isSubmitted = ref(false);

// 将文章按换行符分割成行
const articleLines = computed(() => {
  if (!articleInfo.value || !articleInfo.value.content) {
    return [];
  }

  const content = articleInfo.value.content;
  const maxCharsPerLine = 50; // 每行最多字符数

  console.log('原始文章长度:', content.length);
  console.log('原始文章前100字符:', content.substring(0, 100));

  // 先按多种换行符分割成段落（\n, \r\n, \r）
  const paragraphs = content.split(/\r?\n|\r/);

  console.log('按换行符分割后段落数:', paragraphs.length);

  // 对每个段落进行处理
  const resultLines = [];

  paragraphs.forEach((paragraph, index) => {
    // 过滤空行
    if (paragraph.trim() === '') {
      return; // 跳过空段落
    }

    console.log(`段落${index + 1}长度:`, paragraph.length);

    // 如果段落长度不超过一行，保持原样
    if (paragraph.length <= maxCharsPerLine) {
      resultLines.push(paragraph);
      console.log(`段落${index + 1}保持为一行`);
    } else {
      // 如果段落超过一行，智能分割成多行
      console.log(`段落${index + 1}需要分割`);
      const splitLines = splitIntoLines(paragraph, maxCharsPerLine);
      resultLines.push(...splitLines);
      console.log(`段落${index + 1}分割为${splitLines.length}行`);
    }
  });

  console.log('最终总行数:', resultLines.length);
  console.log('最终结果:', resultLines);

  return resultLines;
});

// 智能分割函数：按字符数分割，但尽量在标点符号处换行
const splitIntoLines = (text, maxCharsPerLine) => {
  const lines = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // 计算当前行的结束位置
    let endIndex = Math.min(startIndex + maxCharsPerLine, text.length);

    // 如果还没到文本末尾，尝试在标点符号处分割
    if (endIndex < text.length) {
      const punctuations = ['。', '！', '？', '，', '；', '：', '.', '!', '?', ',', ';', ':', ' '];

      // 从后向前查找标点符号（在行长的60%-100%范围内）
      for (let i = endIndex; i >= startIndex + Math.floor(maxCharsPerLine * 0.6); i--) {
        if (punctuations.includes(text[i])) {
          endIndex = i + 1; // 包含标点符号
          break;
        }
      }
    }

    // 提取当前行
    const line = text.substring(startIndex, endIndex);
    lines.push(line);

    // 移动到下一行
    startIndex = endIndex;
  }

  return lines;
};

// 检查某行是否完成（输入长度等于文章行长度）
const isLineCompleted = (lineIndex) => {
  return lineInputs.value[lineIndex] && lineInputs.value[lineIndex].length === articleLines.value[lineIndex].length;
};

// 检查某行是否有错误
const hasLineError = (lineIndex) => {
  const input = lineInputs.value[lineIndex];
  const line = articleLines.value[lineIndex];
  if (!input || !line) return false;

  for (let i = 0; i < Math.min(input.length, line.length); i++) {
    if (input[i] !== line[i]) {
      return true;
    }
  }
  return false;
};

// 计算某行的错误数量
const getErrorCount = (lineIndex) => {
  const input = lineInputs.value[lineIndex];
  const line = articleLines.value[lineIndex];
  if (!input || !line) return 0;

  let errorCount = 0;
  for (let i = 0; i < Math.min(input.length, line.length); i++) {
    if (input[i] !== line[i]) {
      errorCount++;
    }
  }
  // 如果输入超过了行长度，超出的也算错误
  if (input.length > line.length) {
    errorCount += (input.length - line.length);
  }
  return errorCount;
};

// 检查所有行是否都已完成
const allLinesCompleted = computed(() => {
  if (articleLines.value.length === 0) return false;
  return articleLines.value.every((line, index) =>
    lineInputs.value[index] && lineInputs.value[index].length === line.length
  );
});

// 获取所有输入的合并内容
const combinedInput = computed(() => {
  return lineInputs.value.filter(input => input).join('\n');
});

// 计算正确率
const accuracy = computed(() => {
  return PracticeUtils.calculateAccuracy(articleInfo.value, combinedInput.value);
});

// 计算输入进度
const inputProgress = computed(() => {
  return PracticeUtils.calculateInputProgress(articleInfo.value, combinedInput.value);
});

// 设置输入框引用
const setInputRef = (index, el) => {
  if (el) {
    inputRefs.value[index] = el;
  }
};

// 处理键盘事件（实现跨行删除、Enter跳转、Ctrl+Enter提交）
const handleKeydown = (lineIndex, event) => {
  // 处理 Enter 键：跳转到下一行
  if (event.key === 'Enter') {
    // Ctrl+Enter：触发提交
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      // 触发提交事件
      emit('submitExercise');
    } else {
      // 单独 Enter：跳转到下一行
      event.preventDefault();
      if (lineIndex < articleLines.value.length - 1) {
        nextTick(() => {
          const nextInputRef = inputRefs.value[lineIndex + 1];
          if (nextInputRef && nextInputRef.focus) {
            nextInputRef.focus();
            // 光标设置到行首
            const nextInputElement = nextInputRef.$el?.querySelector('input');
            if (nextInputElement) {
              nextInputElement.setSelectionRange(0, 0);
            }
          }
        });
      }
    }
    return;
  }

  // 处理 Backspace 键：跨行删除
  if (event.key !== 'Backspace') {
    return;
  }

  const currentInput = lineInputs.value[lineIndex];

  // 获取光标位置
  const inputElement = event.target;
  const cursorPosition = inputElement.selectionStart;

  // 判断是否应该跨行删除：
  // 1. 当前行为空，或
  // 2. 光标在行首（位置为0）
  if (lineIndex > 0 && (currentInput.length === 0 || cursorPosition === 0)) {
    const prevLineInput = lineInputs.value[lineIndex - 1];

    // 如果上一行有内容
    if (prevLineInput && prevLineInput.length > 0) {
      // 阻止默认行为
      event.preventDefault();

      // 删除上一行的最后一个字符
      lineInputs.value[lineIndex - 1] = prevLineInput.substring(0, prevLineInput.length - 1);

      // 删除后立即跳转到上一行末尾
      nextTick(() => {
        const prevInputRef = inputRefs.value[lineIndex - 1];
        if (prevInputRef && prevInputRef.focus) {
          prevInputRef.focus();
          // 将光标设置到上一行末尾
          const prevInputElement = prevInputRef.$el?.querySelector('input');
          if (prevInputElement) {
            const newCursorPos = lineInputs.value[lineIndex - 1].length;
            prevInputElement.setSelectionRange(newCursorPos, newCursorPos);
          }
        }
      });

      // 触发状态更新
      emit('updataTimeRangeStatus', practiceInfo.value.selectedTimeRange, combinedInput.value, isStart.value, {
        accuracy: accuracy,
        inputProgress: inputProgress,
      });
    }
  }
};

// 处理输入
const handleInput = (lineIndex, event) => {
  const currentInput = lineInputs.value[lineIndex];
  const currentLine = articleLines.value[lineIndex];

  // 首次输入时启动计时
  if (!isStart.value && currentInput && currentInput.length > 0) {
    isStart.value = true;
    api.practiceApi.start({
      id: practiceInfo.value.practiceId,
    }).then(res => {
      console.log('练习已开始', res);
    });
  }

  // 处理逆向流入：当在行首输入时，先填充上一行
  // 注意：这个逻辑只在用户手动点击到行首时触发
  // 删除后光标会自动跳到上一行，所以不会触发这个逻辑
  if (lineIndex > 0 && event && event.target && currentInput.length > 0) {
    const inputElement = event.target;
    const cursorPosition = inputElement.selectionStart;

    // 只有当光标在行首（位置0）且当前行有内容时才考虑逆向流入
    if (cursorPosition === 0) {
      const prevLineInput = lineInputs.value[lineIndex - 1];
      const prevLine = articleLines.value[lineIndex - 1];

      // 如果上一行未满，将当前行的第一个字符移到上一行
      if (prevLineInput && prevLineInput.length < prevLine.length) {
        // 计算可以流入的字符数
        const availableSpace = prevLine.length - prevLineInput.length;
        const charsToMove = Math.min(currentInput.length, availableSpace);

        if (charsToMove > 0) {
          // 将字符移动到上一行
          lineInputs.value[lineIndex - 1] = prevLineInput + currentInput.substring(0, charsToMove);

          // 更新当前行（移除已移动的字符）
          const remainingChars = currentInput.substring(charsToMove);
          lineInputs.value[lineIndex] = remainingChars;

          // 如果当前行被清空了，跳转到上一行
          if (remainingChars.length === 0) {
            nextTick(() => {
              const prevInputRef = inputRefs.value[lineIndex - 1];
              if (prevInputRef && prevInputRef.focus) {
                prevInputRef.focus();
                // 设置光标到上一行末尾
                const prevInputElement = prevInputRef.$el?.querySelector('input');
                if (prevInputElement) {
                  prevInputElement.setSelectionRange(lineInputs.value[lineIndex - 1].length, lineInputs.value[lineIndex - 1].length);
                }
              }
            });
          }

          // 触发状态更新后返回
          emit('updataTimeRangeStatus', practiceInfo.value.selectedTimeRange, combinedInput.value, isStart.value, {
            accuracy: accuracy,
            inputProgress: inputProgress,
          });
          return; // 提前返回，不继续处理溢流
        }
      }
    }
  }

  // 处理输入超出当前行长度的情况（正向溢流）
  if (currentInput && currentInput.length > currentLine.length) {
    const overflowChars = currentInput.substring(currentLine.length);

    // 将当前行截断为正确长度
    lineInputs.value[lineIndex] = currentInput.substring(0, currentLine.length);

    // 将多余字符移动到下一行
    if (lineIndex < articleLines.value.length - 1) {
      // 将溢出字符添加到下一行
      lineInputs.value[lineIndex + 1] = overflowChars + (lineInputs.value[lineIndex + 1] || '');

      // 立即跳转到下一行
      nextTick(() => {
        const nextInputRef = inputRefs.value[lineIndex + 1];
        if (nextInputRef && nextInputRef.focus) {
          nextInputRef.focus();
        }

        // 递归处理下一行（如果下一行也溢出了）
        handleInput(lineIndex + 1, null);
      });
    }
  } else {
    // 当输入长度正好达到该行长度时，自动跳转到下一行
    if (currentInput && currentInput.length === currentLine.length && lineIndex < articleLines.value.length - 1) {
      nextTick(() => {
        const nextInputRef = inputRefs.value[lineIndex + 1];
        if (nextInputRef && nextInputRef.focus) {
          nextInputRef.focus();
        }
      });
    }
  }

  // 触发状态更新
  emit('updataTimeRangeStatus', practiceInfo.value.selectedTimeRange, combinedInput.value, isStart.value, {
    accuracy: accuracy,
    inputProgress: inputProgress,
  });
};

// 字体缩放
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

// 定义暴露的方法
const updateIsSideBySide = () => {
  // 模式一固定上下布局，不支持切换
  console.log('模式一不支持切换布局');
};

// 提交时获取输入内容
const getContentForSubmit = () => {
  return combinedInput.value;
};

// 暴露给父组件的方法
defineExpose({
  updateIsSideBySide,
  increaseFontSize,
  decreaseFontSize,
  getContentForSubmit,
  isAllCompleted: allLinesCompleted
});

const emit = defineEmits(['updataTimeRangeStatus', 'submitExercise']);

// 组件挂载时初始化输入数组
onMounted(() => {
  lineInputs.value = new Array(articleLines.value.length).fill('');
});

// 监听已提交内容
watch(inputContent, () => {
  if (inputContent.value) {
    isSubmitted.value = true;
    // 这里可以处理已提交内容的显示
  }
});

// 监听文章变化
watch(articleLines, (newLines) => {
  lineInputs.value = new Array(newLines.length).fill('');
}, { immediate: true });
</script>

<style scoped>
.mode-one-container {
  padding: 10px;
  max-height: 31.875rem;
  overflow-y: auto;
}

.line-pair {
  margin-bottom: 15px;
}

.article-line {
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  /* 字体大小继承父容器 */
  font-size: inherit;
}

.input-line {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.line-input {
  flex: 1;
  font-family: 'Courier New', Courier, monospace;
  transition: all 0.3s;
  /* 字体大小继承父容器 */
  font-size: inherit;
}

.line-input.line-completed {
  border-color: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.line-input.line-error {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.status-icon {
  min-width: 24px;
  display: flex;
  align-items: center;
  /* 图标大小随字体缩放 */
  font-size: 1.25em;
}

.icon-success {
  color: #52c41a;
}

.icon-error {
  color: #ff4d4f;
}

.icon-loading {
  color: #1890ff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-hint {
  margin-left: 8px;
  /* 错误提示文字大小随字体缩放，但稍微小一点 */
  font-size: 0.75em;
  color: #ff4d4f;
  white-space: nowrap;
}

.error-count {
  padding: 2px 8px;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.completion-tip {
  margin-top: 20px;
  padding: 10px;
  text-align: center;
}

/* 滚动条样式 */
.mode-one-container::-webkit-scrollbar {
  width: 8px;
}

.mode-one-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.mode-one-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.mode-one-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
