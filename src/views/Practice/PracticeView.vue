<template>
  <div class="beforePractice" v-if="status === 0">
    <BeforePracticeView @beforePracticeInfo="beforePracticeInfo" />
  </div>
  <div class="practicing" v-if="status === 1">
    <PracticingView @beforePractice="beforePractice" />
  </div>
  <div class="afterPractice" v-if="status === 2">
    <AfterPracticeView />
  </div>
</template>

<script setup>
import BeforePracticeView from './BeforePracticeView.vue';
import PracticingView from './PracticingView.vue';
import AfterPracticeView from './AfterPracticeView.vue';
import api from '@/api/index.js';
import { ref, provide } from 'vue';

const status = ref(0);
const practiceInfo = ref({});
const articleInfo = ref({});
const scoreInfo = ref({});

const beforePracticeInfo = async (newValue) => {
  status.value = newValue.status;
  practiceInfo.value = newValue.practiceInfo;
  if (newValue.practiceInfo.articleId) {
    try {
      const res = await api.articleApi.desc(newValue.practiceInfo.articleId);
      articleInfo.value = res.data.data;
    } catch (error) {
      // 处理错误情况
      console.error('Failed to fetch article info', error);
    }

    // api.articleApi.desc(newValue.practiceInfo.articleId).then(res => {
    //   articleInfo.value = res.data.data;
    // });
  }
};
const beforePractice = (newValue, score) => {
  status.value = newValue;
  scoreInfo.value = score;
  console.log(scoreInfo.value);
};
provide('practiceInfo', practiceInfo);
provide('articleInfo', articleInfo);
provide('scoreInfo', scoreInfo);
</script>

<style scoped>
.beforePractice {
  width: 60%;
  margin: 5rem auto;
}

.practicing {
  position: relative;
}

.afterPractice {
  width: 80%;
  margin: 0 auto;
}
</style>
