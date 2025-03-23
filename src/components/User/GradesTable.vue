<template>
  <div class="grades-container">
    <div class="table-header">
      <div class="title">
        <h2>成绩记录</h2>
        <div class="title-divider"></div>
      </div>
      <div class="scene-selector">
        <span>场景筛选：</span>
        <a-select v-model:value="selectedScene" style="width: 120px" @change="onSceneChange">
          <a-select-option value="0">练习</a-select-option>
          <a-select-option value="1">对战</a-select-option>
          <a-select-option value="2">挑战</a-select-option>
        </a-select>
      </div>
    </div>
    
    <a-table 
      class="grades-table" 
      :dataSource="dataSource" 
      :columns="columns" 
      :pagination="pagination"
      :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" 
      :loading="loading"
      v-if="!status">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'res'">
          <span :class="getResultClass(record)">{{ record.res }}</span>
        </template>
        <template v-if="column.key === 'speed'">
          <span class="speed-value">{{ record.speed }}</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="viewDetails(record.exerciseId)">
            <template #icon><eye-outlined /></template>
            查看详情
          </a-button>
        </template>
      </template>
      <template #emptyText>
        <a-empty description="暂无成绩记录" />
      </template>
    </a-table>
    
    <div v-else class="detail-view">
      <div class="header" @click="back">
        <ArrowLeftOutlined />&nbsp; 返回成绩列表
      </div>
      <AfterPracticeView />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, defineEmits, onMounted, provide } from 'vue';
import utils from '../../api/utils/generalUtil';
import api from '../../api';
import AfterPracticeView from '../../views/Practice/AfterPracticeView.vue';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons-vue';

const props = defineProps(['listData', 'currentScene']);
const dataSource = ref(props.listData);
const scoreInfo = ref();
const status = ref(false);
const selectedScene = ref(props.currentScene || "0");
const loading = ref(false);

// 监听父组件传入的当前场景变化
watch(() => props.currentScene, (newScene) => {
  selectedScene.value = newScene;
});

const sceneMapping = {
  0: (item) => item.result + '分',
  1: (item) => item.result + ' / ' + item.baseResult,
  2: (item) => {
    if (item.result > item.baseResult) {
      return "胜";
    } else if (item.result < item.baseResult) {
      return "败";
    } else {
      return "平";
    }
  }
};

// 根据结果返回对应的CSS类名
const getResultClass = (record) => {
  if (record.scene === "对战" || record.scene === "挑战") {
    if (record.res === "胜") return "result-win";
    if (record.res === "败") return "result-lose";
    return "result-draw";
  }
  return "result-score";
};

watch(() => props.listData, (newListData) => {
  loading.value = false;
  if (newListData) {
    dataSource.value = newListData.list.map((item) => {
      // 确保 scene 是数字类型
      const sceneNum = parseInt(item.scene);
      if (typeof sceneMapping[sceneNum] === 'function') {
        item.res = sceneMapping[sceneNum](item);
      } else {
        item.res = '未知';
      }
      item.scene = sceneNum === 0 ? "练习" : sceneNum === 1 ? "对战" : "挑战";
      item.mode = item.mode === 1 ? "一" : item.mode === 2 ? "二" : "三";
      return item;
    });
    // 更新分页信息
    pagination.value.total = newListData.total;
    // 保持当前选择的每页条数
    if (pageData.value.pageSize) {
      pagination.value.pageSize = pageData.value.pageSize;
    }
  } else {
    utils.tip('无数据', "error");
  }
});


const pagination = ref({
  pageSize: 10,
  total: 0,
  current: 1,  // 使用 current 而不是 page
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],  // 添加页码大小选项
  onChange: (page, pageSize) => {
    pageData.value.page = page;
    pageData.value.pageSize = pageSize;
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    ziChuanFu();
  },
  onShowSizeChange: (current, size) => {
    pageData.value.page = current;
    pageData.value.pageSize = size;
    pagination.value.current = current;
    pagination.value.pageSize = size;
    ziChuanFu();
  }
});
const pageData = ref({
  pageSize: pagination.value.pageSize,
  total: pagination.value.total,
  page: pagination.value.page,
});
const emit = defineEmits(['pageData', 'sceneChange']);
const ziChuanFu = () => {
  emit('pageData', pageData.value);
};

const onSceneChange = (value) => {
  loading.value = true;
  emit('sceneChange', value);
};

onMounted(() => {
  ziChuanFu();
});

const viewDetails = (id) => {
  api.practiceApi.scoreGetInfo(id).then(res => {
    if (res.data.success) {
      scoreInfo.value = res.data.data;
      status.value = true;
    } else {
      utils.tip("成绩有误", "error");
    }
  });
};
provide('scoreInfo', scoreInfo);

const back = () => {
  status.value = false;
};
const columns = [
  {
    title: '结果',
    dataIndex: 'res',
    key: 'res',
    width: '10%',
    align: 'center',
  },
  {
    title: '场景',
    dataIndex: 'scene',
    key: 'scene',
    width: '10%',
    align: 'center',
  },
  {
    title: '模式',
    dataIndex: 'mode',
    key: 'mode',
    width: '10%',
    align: 'center',
  },
  {
    title: '均速(字/分)',
    dataIndex: 'speed',
    key: 'speed',
    width: '15%',
    align: 'center',
    sorter: (a, b) => a.speed - b.speed,
  },
  {
    title: '用时(秒)',
    dataIndex: 'actualDuration',
    key: 'actualDuration',
    width: '15%',
    align: 'center',
  },
  {
    title: '评分',
    dataIndex: 'ranking',
    key: 'ranking',
    width: '10%',
    align: 'center',
  },
  {
    title: '时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: '15%',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: '15%',
    align: 'center',
  },
];
</script>

<style scoped>
.grades-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  display: flex;
  flex-direction: column;
}

.title h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.title-divider {
  width: 40px;
  height: 3px;
  background-color: #1890ff;
  margin-top: 8px;
}

.scene-selector {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
}

.scene-selector span {
  margin-right: 8px;
  font-weight: 500;
}

.grades-table {
  border-radius: 8px;
  overflow: hidden;
}

[data-doc-theme='light'] .ant-table-striped :deep(.table-striped) td {
  background-color: #f9f9f9;
}

[data-doc-theme='dark'] .ant-table-striped :deep(.table-striped) td {
  background-color: rgb(29, 29, 29);
}

.header {
  margin: 10px 0;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #1890ff;
  transition: color 0.3s;
}

.header:hover {
  color: #40a9ff;
}

.detail-view {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
}

/* 结果样式 */
.result-win {
  color: #52c41a;
  font-weight: bold;
}

.result-lose {
  color: #f5222d;
  font-weight: bold;
}

.result-draw {
  color: #faad14;
  font-weight: bold;
}

.result-score {
  color: #1890ff;
  font-weight: bold;
}

.speed-value {
  font-family: 'Consolas', monospace;
  font-weight: 500;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f0f5ff;
  font-weight: 600;
}

:deep(.ant-pagination-item-active) {
  border-color: #1890ff;
}

:deep(.ant-pagination-item-active a) {
  color: #1890ff;
}

:deep(.ant-table-row:hover > td) {
  background-color: #e6f7ff !important;
}
</style>
