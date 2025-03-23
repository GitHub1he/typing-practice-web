<template>
  <div class="user-center">
    <UserMenu />
    <div class="user-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import UserMenu from '../../components/User/UserMenu.vue';
import { useRoute } from 'vue-router';
import { ref, provide, onBeforeUnmount } from 'vue';

const routes = useRoute();
const userId = ref(routes.query.userId);
provide('userId', userId,);
onBeforeUnmount(() => {
  userId.value = ''; // 在组件销毁前将 userId 的值设置为空
});
</script>

<style scoped>
.user-center {
  width: 80%;
  background-color: #fff;
  margin: 0 auto;
  height: 87vh;
  display: flex;
  /* 设置最小高度为视窗高度 */
}

.user-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
