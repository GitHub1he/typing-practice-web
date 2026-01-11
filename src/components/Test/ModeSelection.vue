<template>
  <div class="mode-select">
    <!-- 个人练习 -->
    <a-card class="mode-select-item" :hoverable="true">
      <template #title>
        <a-tooltip placement="top" title="个人竞速模式中，使用盲打进行竞速，尽情超越自我吧！">
          <span class="card-title-with-tip">个人竞速</span>
        </a-tooltip>
      </template>
      <div v-for="(item, index) in languages" :key="item.itemCode || index">
        <a-card class="language-card" :title="item.itemName" @click="startIndividual(item.itemCode)"
          style="margin-bottom: 5px;" hoverable></a-card>
      </div>
      <a-card class="language-card" title="随机" @click="startIndividual('')" hoverable></a-card>
    </a-card>

    <!-- 竞赛 -->
    <a-card class="mode-select-item" title="竞赛">
      <a-card class="language-card battle-card" title="激情1V1" @click="showMatchLanguageModal" hoverable>
        <div class="card-content">
          <div class="card-icon">⚔️</div>
          <div class="card-title">激情1V1</div>
          <div class="card-desc">选择语言开始对战</div>
        </div>
      </a-card>
    </a-card>

    <!-- 语言选择弹窗 -->
    <a-modal v-model:open="matchLanguageModalVisible" title="选择对战语言" :width="500" :closable="true" :maskClosable="true">
      <div class="language-selection">
        <a-radio-group v-model:value="selectedMatchLanguage" size="large">
          <a-row :gutter="[16, 16]">
            <!-- 动态渲染语言选项 -->
            <a-col :span="12" v-for="(item, index) in languages" :key="item.itemCode || index">
              <a-radio :value="String(item.itemCode)" class="language-option">
                <span class="lang-icon">{{ getLanguageIcon(String(item.itemCode)) }}</span>
                <span class="lang-name">{{ item.itemName }}</span>
              </a-radio>
            </a-col>
            <!-- 随机选项 -->
            <a-col :span="12">
              <a-radio value="" class="language-option">
                <span class="lang-icon">🎲</span>
                <span class="lang-name">随机</span>
              </a-radio>
            </a-col>
          </a-row>
        </a-radio-group>

        <a-alert message="💡 提示" description="选择相同语言的玩家才会匹配到一起。选择'随机'可以匹配到任何语言的玩家。" type="info" show-icon
          style="margin-top: 20px;" />
      </div>

      <template #footer>
        <a-button @click="matchLanguageModalVisible = false">
          取消
        </a-button>
        <a-button type="primary" @click="confirmStartMatch">
          开始匹配
        </a-button>
      </template>
    </a-modal>

    <a-card class="mode-select-item" title="其他模式">
      <p>暂未开放</p>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import utils from '@/api/utils/generalUtil';

const store = useStore();

// 使用computed确保响应式
const languages = computed(() => store.state.article.articleLanguage || []);

// 新增状态
const matchLanguageModalVisible = ref(false);
const selectedMatchLanguage = ref(''); // 默认为空字符串（随机）

// 显示语言选择弹窗
const showMatchLanguageModal = () => {
  selectedMatchLanguage.value = ''; // 重置为随机
  matchLanguageModalVisible.value = true;
};

// 确认开始匹配
const confirmStartMatch = () => {
  // 根据itemCode查找语言名称（需要转换类型进行比较）
  const selectedLang = languages.value.find(lang => String(lang.itemCode) === selectedMatchLanguage.value);
  const langName = selectedMatchLanguage.value === '' ? '随机' : (selectedLang?.itemName || '未知语言');

  if (selectedMatchLanguage.value === '') {
    utils.tip("随机模式：将匹配任何语言的玩家", "info");
  } else {
    utils.tip(`将为您匹配选择【${langName}】的玩家`, "info");
  }

  matchLanguageModalVisible.value = false;
  emit('start-match', {
    matchMode: '0',
    language: selectedMatchLanguage.value
  });
};

// 获取语言图标（国旗emoji）
const getLanguageIcon = (itemCode) => {
  const iconMap = {
    '0': '🇨🇳',
    '1': '🇺🇸',
    '2': '🇯🇵',
  };
  return iconMap[itemCode] || '🌐';
};

// 定义emit事件，用于向父组件传递事件
const emit = defineEmits(['start-individual', 'start-match']);

// 个人练习模式选择处理方法
const startIndividual = (languageCode) => {
  console.log('选择个人练习模式:', languageCode);
  // 触发事件通知父组件
  emit('start-individual', languageCode);
};
</script>

<style scoped>
.mode-select {
  width: 100%;
  margin: 5rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  min-height: 70vh;
}

.card-title-with-tip {
  cursor: help;
  border-bottom: 1px dashed #999;
}

.mode-select-item {
  width: 30%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.mode-select-item:hover {
  transform: translateY(-5px);
}

.language-card {
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  border-radius: 8px;
}

.language-card:hover {
  background-color: #f0f0f0;
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 对战卡片特殊样式 */
.battle-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.battle-card :deep(.ant-card-head-title) {
  color: white !important;
}

.battle-card :deep(.ant-card-body) {
  padding: 20px;
}

.card-content {
  text-align: center;
  padding: 10px 0;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 语言选项样式 */
.language-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
  height: 60px;
}

.language-option:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
  transform: translateY(-2px);
}

.lang-icon {
  font-size: 1.8rem;
  margin-right: 12px;
}

.lang-name {
  font-size: 1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .mode-select {
    flex-direction: column;
  }

  .mode-select-item {
    width: 70%;
    height: auto;
  }
}
</style>