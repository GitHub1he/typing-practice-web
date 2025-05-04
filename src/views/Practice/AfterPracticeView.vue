<template>
  <a-card title="成绩详情" :headStyle="{ textAlign: 'center' }">
    <a-row>
      <a-col :span="12" @click="routeUserInfo(props.scoreInfo.userId)" style="cursor: pointer;">
        用户：{{ props.scoreInfo.nickName }}
      </a-col>
      <a-col :span="12">
        模式：{{ props.scoreInfo.mode }}
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="12" @click="routeArticleDetailInfo(scoreInfo.articleId)" style="cursor: pointer;">
        文章：{{ scoreInfo.title }}
      </a-col>
      <a-col :span="12">
        练习时间：{{ scoreInfo.startTime }}
      </a-col>
    </a-row>
    <a-divider style="border-color: #7cb305" dashed />
    <a-row>
      <a-col :span="8">
        总字数：{{ scoreInfo.totalWc }}
      </a-col>
      <a-col :span="8">
        正确率：{{ scoreInfo.accuracy }}%
      </a-col>
      <a-col :span="8">
        用时：{{ scoreInfo.actualDuration }}秒
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
        分数：{{ scoreInfo.rate }}
      </a-col>
      <a-col :span="8">
        速度：{{ scoreInfo.speed }}/分
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <div v-if="scoreInfo.incorrectWords">
          错字：
          <span v-for="word in scoreInfo.incorrectWords" :key="word"> {{ word }} &nbsp;</span>
        </div>
        <div v-else>
          错字：无
        </div>
      </a-col>
    </a-row>
    <ECharts :data="chartData1" />
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import ECharts from '@/components/ECharts.vue';
import router from '@/router';

// 将 inject 改为 props
const props = defineProps({
  scoreInfo: {
    type: Object,
    required: true
  }
});

const chartData1 = computed(() => {
  return {
    xAxisData: props.scoreInfo.axisXData ? JSON.parse(props.scoreInfo.axisXData) : [],
    seriesData: props.scoreInfo.axisYData ? JSON.parse(props.scoreInfo.axisYData) : [],
  };
});

const routeUserInfo = (id) => {
  console.log(id);
  router.push({
    name: "user",
    query: {
      userId: id,
    }
  });
};

const routeArticleDetailInfo = (params) => {
  router.push({
    name: 'detail',
    params: {
      articleId: params,
    }
  });
};
</script>

<style scoped>
.ant-row {
  margin: 1rem;
}

.ant-card {
  min-height: 30rem;
}

.ant-col {
  font-size: 15px;
}
</style>
