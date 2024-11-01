<template>
  <a-config-provider :locale="locale">
    <NavBar />
    <div class="main-content">
      <router-view />
    </div>
    <div class="footer">
      <div class="filing">
        ©工信部备案：
        <a href="https://beian.miit.gov.cn" target="_blank">冀ICP备2023045812号-1</a><br>
        <img src="./assets/images/batb.png">
        <a href="https://beian.mps.gov.cn/#/query/webSearch?code=13072202000097\" rel="noreferrer"
          target="_blank">冀公网安备13072202000097</a>
      </div>
    </div>
    <div class="overlay"></div>
  </a-config-provider>
</template>


<script>
import NavBar from "./components/NavBar.vue";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
export default {
  components: {
    NavBar,
  },
  data() {
    return {
      locale: zhCN,
    };
  },
};
</script>


<style>
a {
  color: #9e9d9d;
}

body {
  font-family: 'SmileySans', sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  /* background-image: url('./assets/images/background/1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative; */
}

.ant-card-body {
  font-family: 'SmileySans', sans-serif !important;
}

.ant-list {
  font-family: 'SmileySans', sans-serif !important;
}

p {
  font-family: 'SmileySans', sans-serif !important;
}


::-webkit-scrollbar {
  width: 0.375rem;
}

/* 滚动条轨道背景颜色 */
::-webkit-scrollbar-track {
  /* background-color: #f1f1f1; */
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

/* 滚动条滑块样式 */
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  cursor: pointer;
}

/* 滚动条滑块悬停时颜色 */
::-webkit-scrollbar-thumb:hover {
  background-color: #888;
}

.main-content {
  margin-top: 3.5rem;
  /* border: 1px solid transparent; */
  width: 100%;
  min-height: calc(100vh - 3.5rem - 3.5rem);
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.filing {
  width: 100%;
  text-align: center;
  color: #9e9d9d;
  font-size: 14px;
  padding: 10px;
  box-sizing: border-box;
  min-height: 3.5rem;
}

.filing img {
  width: 14px;
  height: 14px;
  margin-right: 3px;
  vertical-align: middle;
}



.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.06);
  pointer-events: none;
  z-index: -1
}
</style>
