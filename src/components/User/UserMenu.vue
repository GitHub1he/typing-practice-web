<template>
  <div class="userNavBar">
    <div class="avatar">
      <a-avatar :src="utils.getAvatarSrc(avatarNumber)">
      </a-avatar>
      <div>
        {{ user.nickName }}
      </div>
    </div>
    <div>
      <a-menu style="width: 256px" mode="inline" :open-keys="state.openKeys" v-model:selectedKeys="state.selectedKeys"
        @openChange="onOpenChange">
        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <MailOutlined />
              <span>用户信息</span>
            </span>
          </template>
          <a-menu-item key="info">
            <router-link :to="{ name: 'info' }">个人资料</router-link>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="sub2">
          <template #title>
            <span>
              <AppstoreOutlined />
              <span>文章管理</span>
            </span>
          </template>
          <a-menu-item key="2">
            <router-link :to="{ name: 'arlist' }">创建的文章</router-link>
          </a-menu-item>
          <a-menu-item key="3" v-if="user.userId === store.state.user.user.userId">收到的通知</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="sub3">
          <template #title>
            <span>
              <SettingOutlined />
              <span>成绩管理</span>
            </span>
          </template>
          <a-menu-item key="4">
            <router-link :to="{ name: 'grades' }">成绩列表</router-link>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </div>
    <div class="logout">
      <a-button type="primary" danger @click="showConfirm"
        v-if="user.userId === store.state.user.user.userId">退出登录</a-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, createVNode, inject, onMounted, ref } from 'vue';
import { MailOutlined, AppstoreOutlined, SettingOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Modal } from 'ant-design-vue';
import api from '../../api';
import utils from '../../api/utils/generalUtil';

const store = useStore();
const router = useRouter();

const userId = ref(inject('userId'));
const user = ref({ ...store.state.user.user });
const avatarNumber = ref(store.state.user.user.avatar);

const logout = () => {
  store.dispatch("logout");
  router.push({ name: 'home' });
};

const showConfirm = () => {
  Modal.confirm({
    title: '退出登录?',
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode(
      'div',
      {
        style: 'color:red;',
      },
      '是否要退出登录',
    ),
    onOk() {
      logout();
    },
    class: 'test',
  });
};
const state = reactive({
  rootSubmenuKeys: ['sub1', 'sub2', 'sub3'],
  openKeys: ['sub1'],
  selectedKeys: [],
});
const onOpenChange = openKeys => {
  const latestOpenKey = openKeys.find(key => state.openKeys.indexOf(key) === -1);
  if (state.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
    state.openKeys = openKeys;
  } else {
    state.openKeys = latestOpenKey ? [latestOpenKey] : [];
  }
};

onMounted(() => {
  if (userId.value) {
    api.userApi.getInfo(userId.value).then(res => {
      if (res.data.success) {
        user.value = res.data.data;
        avatarNumber.value = user.value.avatar;
      }
    });
  }

});
</script>

<style scoped>
.logout {
  margin: 10px 0;
  text-align: center;
}

.avatar {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.avatar .ant-avatar {
  width: 5rem;
  height: 5rem;
  margin: 20px 0 10px 0;
}
</style>
