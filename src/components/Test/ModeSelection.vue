<template>
  <div class="mode-select">
    <a-card class="mode-select-item" :hoverable="true" title="个人练习">
      <div v-for="(item, index) in languages" :key="item.itemCode || index">
        <a-card class="language-card" :title="item.itemName" @click="startIndividual(item.itemCode)"
          style="margin-bottom: 5px;" hoverable></a-card>
      </div>
      <a-card class="language-card" title="随机" @click="startIndividual('')" hoverable></a-card>
    </a-card>

    <a-card class="mode-select-item" :hoverable="true" title="竞赛">
      <div v-for="(item, index) in matchSelect" :key="item.itemCode || index">
        <a-card class="language-card" :title="item.itemName" @click="startMatch(item.itemCode)"
          style="margin-bottom: 5px;" hoverable></a-card>
      </div>
    </a-card>

    <a-card class="mode-select-item" title="其他模式">
      <p>暂未开放</p>
    </a-card>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';


const store = useStore();
const languages = store.state.article.articleLanguage;
const matchSelect = [
  {
    "itemCode": '0',
    "itemName": "激情1V1"
  }
];

// 定义emit事件，用于向父组件传递事件
const emit = defineEmits(['start-individual', 'start-match']);

// 个人练习模式选择处理方法
const startIndividual = (languageCode) => {
  console.log('选择个人练习模式:', languageCode);
  // 触发事件通知父组件
  emit('start-individual', languageCode);
};

// 竞赛模式选择处理方法
const startMatch = (matchCode) => {
  console.log('选择竞赛模式:', matchCode);
  // 触发事件通知父组件
  emit('start-match', matchCode);
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