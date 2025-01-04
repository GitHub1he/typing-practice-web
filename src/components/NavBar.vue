<template>
  <div class="menu-container">
    <a-menu mode="horizontal">
      <li v-if="!loginStatus">
        <a-menu-item key="home">
          <router-link :to="{ name: 'home' }">
            <img src="@/assets/images/home.png" style="height: 3.5rem; display: block;">
          </router-link>
        </a-menu-item>
      </li>
      <li v-else>
        <a-menu-item key="home">
          <router-link :to="{ name: 'home' }">
            <img src="@/assets/images/home.png" style="height: 3.5rem; display: block;">
          </router-link>
        </a-menu-item>
        <a-menu-item key="article">
          <router-link :to="{ name: 'article' }">文章管理</router-link>
        </a-menu-item>
        <a-menu-item key="practice">
          <router-link :to="{ name: 'practice' }">练习</router-link>
        </a-menu-item>
        <a-menu-item key="test">
          <router-link :to="{ name: 'test' }">测试</router-link>
        </a-menu-item>
        <a-menu-item key="ranking">
          <router-link :to="{ name: 'ranking' }">排行榜</router-link>
        </a-menu-item>
        <a-menu-item key="other">
          <router-link :to="{ name: 'other' }">其他</router-link>
        </a-menu-item>
      </li>
      <li v-if="!loginStatus">
        <a-menu-item key="login">
          <router-link :to="{ name: 'login' }">登录</router-link>
        </a-menu-item>
      </li>
      <li v-else>
        <router-link :to="{ name: 'user' }">
          <a-menu-item key="user">
            <a-badge dot>
              <a-avatar :src="avatarSrc">
              </a-avatar>
            </a-badge>
          </a-menu-item>
        </router-link>
      </li>
    </a-menu>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { computed } from 'vue';
import utils from '@/api/utils/generalUtil';
export default {
  setup() {
    const current = ref(['mail']);
    const store = useStore();
    const loginStatus = computed(() => store.state.user.isLogin);
    const avatar = store.state.user.user.avatar;
    const avatarSrc = utils.getAvatarSrc(avatar);
    return {
      current,
      loginStatus,
      store,
      avatarSrc
    };
  },
};
</script>

<style scoped>
* {
  text-decoration: none;
  font-family: 'SmileySans', sans-serif;
  font-size: medium;
  font-weight: 600;
}

.ant-menu-overflow>li:nth-child(2) {
  position: absolute;
  right: 0;
}

.ant-menu {
  height: 100%;
  line-height: 3.5rem;
}

.menu-container {
  position: fixed;
  top: 0;
  width: 100%;
  height: 3.5rem;
  z-index: 999;
}

:where(.css-dev-only-do-not-override-hkh161).ant-menu-light {
  height: 100%;
  line-height: 56px;
}

:where(.css-dev-only-do-not-override-1hsjdkk).ant-menu-light .ant-menu-item a:hover {
  color: brown;
}
</style>
