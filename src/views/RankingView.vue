<template>
  <a-card>
    <a-tabs v-model:activeKey="activeKey" tab-position="left" @change="getTimeRanking()"
      :style="{ minHegigt: '46rem' }">
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <RankingsList :rankList="rankList" />
      </a-tab-pane>
    </a-tabs>

  </a-card>
</template>

<script setup>
import RankingsList from '@/components/Ranking/RankingsList.vue';
import { ref } from 'vue';
import api from '@/api';

const panes = ref([
  {
    title: '所用时长排行榜',
    key: 'timeRanking',
    closable: false,
  },
  {
    title: '积分排行榜',
    key: 'scoreRanking',
    closable: false,
  },
  {
    title: '文章正确率排行榜',
    key: 'accuracyRanking',
    closable: false,
  },
]);

let rankList = ref();
const activeKey = ref(panes.value[0].key);

const getTimeRanking = () => {
  console.log(activeKey.value);
  switch (activeKey.value) {
    case 'timeRanking': {
      api.rankApi.getTimeRanking().then(res => {
        rankList.value = res.data.list;
      }).catch(() => {
        rankList.value = [];
      });
      break;
    }
    case 'scoreRanking': {
      rankList.value = [];
      break;
    }
    case 'accuracyRanking': {
      rankList.value = [];
      break;
    }
  }
};


getTimeRanking(activeKey.value);
</script>

<style scoped>
.ant-card {
  width: 80%;
  height: 46rem;
  margin: 2rem auto;
}

.ant-tabs-tabpane {
  height: 43rem;
}
</style>
