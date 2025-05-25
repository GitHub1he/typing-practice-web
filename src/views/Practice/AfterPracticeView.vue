<template>
  <a-card title="成绩详情" :headStyle="{ textAlign: 'center' }">
    <a-row>
      <a-col :span="12" @click="routeUserInfo(scoreInfo.userId)" style="cursor: pointer;">
        用户：{{ scoreInfo.nickName }}
      </a-col>
      <a-col :span="12">
        模式：{{ scoreInfo.mode }}
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
    <!-- 图表展示 -->
    <ECharts :data="chartData1" />

    <!-- 错字信息展示 -->
    <a-row v-if="replacements.length > 0">
      <a-col :span="24">
        <div class="error-section">
          <div class="section-title">错字详情：</div>
          <a-table :dataSource="formattedReplacements" :columns="replacementColumns" :pagination="false" size="small" />
        </div>
      </a-col>
    </a-row>

    <!-- 少字信息展示 -->
    <a-row v-if="missingChars.length > 0">
      <a-col :span="24">
        <div class="error-section">
          <div class="section-title">少字详情：</div>
          <a-tag v-for="char in missingChars" :key="char" color="orange" style="margin: 4px">
            {{ getSpecialCharName(char) }}
          </a-tag>
        </div>
      </a-col>
    </a-row>

    <!-- 多字信息展示 -->
    <a-row v-if="moreChars.length > 0">
      <a-col :span="24">
        <div class="error-section">
          <div class="section-title">多字详情：</div>
          <a-tag v-for="char in moreChars" :key="char" color="red" style="margin: 4px">{{ getSpecialCharName(char)
            }}</a-tag>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import ECharts from '@/components/ECharts.vue';
import router from '@/router';

const scoreInfo = ref(inject('scoreInfo'));

// 特殊字符映射表
const specialCharMap = {
  '\n': '换行符',
  ' ': '空格',
  '\t': '制表符',
  '\r': '回车符',
  '\f': '换页符',
  '\v': '垂直制表符'
};

// 获取特殊字符的中文名称
const getSpecialCharName = (char) => {
  return specialCharMap[char] || char;
};

// 解析错字信息
const replacements = computed(() => {
  if (!scoreInfo.value.replacements) return [];
  try {
    return JSON.parse(scoreInfo.value.replacements);
  } catch (e) {
    console.error('解析replacements失败', e);
    return [];
  }
});

// 格式化错字信息，将特殊字符替换为中文描述
const formattedReplacements = computed(() => {
  return replacements.value.map(item => ({
    ...item,
    sourceChar: getSpecialCharName(item.sourceChar),
    inputChar: getSpecialCharName(item.inputChar)
  }));
});

// 解析少字信息
const missingChars = computed(() => {
  if (!scoreInfo.value.missingChars) return [];
  try {
    return JSON.parse(scoreInfo.value.missingChars);
  } catch (e) {
    console.error('解析missingChars失败', e);
    return [];
  }
});

// 解析多字信息
const moreChars = computed(() => {
  if (!scoreInfo.value.moreChars) return [];
  try {
    return JSON.parse(scoreInfo.value.moreChars);
  } catch (e) {
    console.error('解析moreChars失败', e);
    return [];
  }
});

// 错字表格列定义
const replacementColumns = [
  {
    title: '原字符',
    dataIndex: 'sourceChar',
    key: 'sourceChar',
    width: '40%',
    align: 'center',
  },
  {
    title: '输入字符',
    dataIndex: 'inputChar',
    key: 'inputChar',
    width: '40%',
    align: 'center',
  },
];

const chartData1 = computed(() => {
  return {
    xAxisData: scoreInfo.value.axisXData ? JSON.parse(scoreInfo.value.axisXData) : [],
    seriesData: scoreInfo.value.axisYData ? JSON.parse(scoreInfo.value.axisYData) : [],
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

.error-section {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background-color: #fafafa;
}

.section-title {
  margin-bottom: 5px;
  color: #7cb305;
  font-weight: bold;
  font-size: 15px;
}
</style>
