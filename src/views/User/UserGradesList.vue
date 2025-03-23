<template>
  <GradesTable :listData="listData" @pageData="pageData" @sceneChange="handleSceneChange" :currentScene="scene" />
</template>

<script setup>
import GradesTable from '../../components/User/GradesTable.vue';
import api from '../../api';
import { useStore } from 'vuex';
import { ref, inject, onMounted } from 'vue';

const store = useStore();
const listData = ref();
const page = ref({
  pageSize: 10,
  page: 1
});
const scene = ref("0"); // 默认场景为"练习"

const pageData = (value) => {
  console.log('收到分页数据:', value);
  page.value = value;
  query();
};

const handleSceneChange = (newScene) => {
  scene.value = newScene;
  query();
};

const userId = ref(inject('userId'));
const query = () => {
  api.practiceApi.query({
    userId: userId.value ? userId.value : store.state.user.user.userId,
    scene: scene.value,
    page: {
      pageSize: page.value.pageSize || 10,
      pageNo: page.value.page || 1
    }
  }).then(res => {
    if (res.data.success) {
      listData.value = res.data;
    }
  });
};

// 组件挂载时自动查询数据
onMounted(() => {
  query();
});
</script>

<style scoped></style>
