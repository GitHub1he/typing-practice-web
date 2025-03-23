<template>
  <div :style="randomPosition" class="shici">
    <img src="https://v1.jinrishici.com/all.svg">
  </div>

</template>

<script setup>


import { proxyAxios } from '../api/utils/httpUtil';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const data = ref();
const url = ref();
const randomPosition = ref();


const fetchImage = () => {
  proxyAxios
    .get('/bing/HPImageArchive.aspx?format=js&idx=0&n=1') // 替换为你的 API URL
    .then(response => {
      // console.log(response.data)
      data.value = response.data.images[0].url
      // console.log(data.value)
      url.value = `https://cn.bing.com/${data.value}`;

      document.body.style.backgroundImage = `url(${url.value})`;
      document.body.style.backgroundSize = 'cover';    // 填充整个区域
      document.body.style.backgroundPosition = 'center'; // 居中显示
      document.body.style.overflow = 'hidden';         // 隐藏滚动条

      // 设置初始透明度为 0
      document.body.style.opacity = '0';

      // 延迟后将透明度设置为 1
      setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease-in-out'; // 设置过渡效果
        document.body.style.opacity = '1'; // 渐变到完全显示
      }, 100);  // 延迟时间，以确保背景图片加载
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
}

const setRandomPosition = () => {
  // 获取随机的 top 和 left 值，范围在 0% 到 80% 之间，确保不超出窗口
  const top = Math.random() * 80;
  const left = Math.random() * 80;

  // 设置随机位置
  randomPosition.value = {
    position: 'absolute',  // 确保 div 是绝对定位
    top: `${top}%`,
    left: `${left}%`
  };
}

onMounted(() => {
  fetchImage();
  setRandomPosition();
});

// 在组件卸载前清理样式
onBeforeUnmount(() => {
  document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundPosition = '';
  document.body.style.overflow = '';
});
</script>

<style scoped>
.shici {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.7);
  /* 半透明白色背景 */
  border-radius: 0.325rem;
  /* 圆角效果 */
  overflow: hidden;
  /* 确保图片不会溢出圆角区域 */
}
</style>
