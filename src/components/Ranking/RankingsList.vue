<template>
  <div class="info">
    <div class="container" v-if="utils.objIsEmpty(rankList)">
      <a-empty />
    </div>
    <div class="container" v-else>
      <a-row class="title">
        <a-col :span="4">排名</a-col>
        <a-col :span="10">用户</a-col>
        <a-col :span="8">成绩</a-col>
      </a-row>
      <a-row v-for="item in rankList" :key=item class="itemlist">
        <a-col :span="4">
          <a-avatar :src="getAvatar(item.ranking)"
            v-if="Number(item.ranking) === 1 || Number(item.ranking) === 2 || Number(item.ranking) === 3"></a-avatar>
          <span v-else class="rank">{{ item.ranking }}</span>
        </a-col>
        <a-col :span="4">
          <a-avatar v-if="utils.isValidAvatar(item.avatar)" :src="utils.getAvatarSrc(item.avatar)">
          </a-avatar>
          <a-avatar v-else>
          </a-avatar>
        </a-col>
        <a-col :span="6">{{ item.nickName }}</a-col>
        <a-col :span="8">{{ item.rankValue }} {{ item.rankUnit }}</a-col>
      </a-row>

      <a-row class="userdata">
        <a-col :span="6">
          <span class="rank">排名位置</span>
        </a-col>
        <a-col :span="6">头像</a-col>
        <a-col :span="6">昵称</a-col>
        <a-col :span="6">分数</a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue';
import utils from '../../api/utils/generalUtil';

const props = defineProps({
  rankList: {
    type: Array,
    required: true
  },
  myRanking: {
    type: Object,
    require: false
  }
});

const rankList = ref(props.rankList);

watch(() => props.rankList, (newrankList) => {
  rankList.value = newrankList;
});

// const isEmpty = () => {
//   return utils.objIsEmpty(rankList.value);
// };
// const myRanking = ref(props.myRanking);

// onMounted(() => {
//   if (rankList.value == undefined) {
//     // 未上榜
//     myRanking.value = '未上榜';
//   }
//   console.log(rankList.value);
//   // if (route.params.articleId) {
//   //   api.articleApi.desc(route.params.articleId).then(res => {
//   //     detail.value = res.data.data;
//   //     console.log(detail.value);
//   //   });
//   // }
// });

const getAvatar = (rank) => {
  // 根据排名返回对应的头像 URL
  // 这里假设有一个函数根据排名获取对应的头像路径
  return require(`@/assets/images/ranking/${rank}.png`);
};
</script>

<style scoped>
.info {
  width: 100%;
  height: 100%;
  position: relative;
}

.container {
  width: 100%;
  height: calc(100% - 40px);
  overflow: auto;
}

.itemlist {
  width: 100%;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px dashed #999;
  margin: 10px 0;
}

.userdata {
  width: 99%;
  height: 40px;
  line-height: 40px;
  background-color: #dad3d3;
  position: absolute;
  bottom: 0;
}

.container :where(.css-dev-only-do-not-override-1hsjdkk).ant-avatar {
  height: auto;
}

.ant-row {
  padding-left: 10px;
}

.rank {
  display: inline-block;
  width: 32px;
  text-align: center;
}
</style>
