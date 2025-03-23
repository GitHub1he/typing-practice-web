<template>
  <a-list v-if="listData" item-layout="vertical" size="middle" :pagination="pagination" :data-source="listData.list"
    :loading="initLoading">
    <template #renderItem="{ item }">
      <a-list-item key="item.title" @click="routeInfo(item.id)">
        <!-- 下方图标 -->
        <template #actions>
          <!-- 文字图标 -->
          <a-avatar size="small" :style="{ backgroundColor: '#7265e6', verticalAlign: 'middle' }">
            {{ getDict.getLanguageName(item.language) }}
          </a-avatar>
          <!-- 字数 -->
          <span style="user-select:none;">
            <component :is="component.bar" />
            {{ item.wordNums }}字
          </span>
          <!-- 日期 -->
          {{ item.updateTime }}
          <!-- 收藏图标 -->
          <span @click.stop="toggleStar(item.id)" style=" user-select:none;">
            <component :is="component.star"
              :style="{ marginRight: '8px', color: isStar(item.id) ? '#FFB135' : 'inherit' }" />
            {{ articleStatus[item.id].stars }}
          </span>
          <!-- 点赞图标 -->
          <span @click.stop="toggleLike(item.id)" style="user-select:none;">
            <component :is="component.like"
              :style="{ marginRight: '8px', color: isLike(item.id) ? '#F21212' : 'inherit' }" />
            {{ articleStatus[item.id].likes }}
          </span>
          <!-- 过审状态图标 -->
          <span style="user-select:none;">
            <a-tooltip title="审核通过">
              <component v-if="item.auditedStatus === 1" :is="component.audited" style="color: green" />
            </a-tooltip>
            <a-tooltip title="未审核">
              <component v-if="item.auditedStatus === 0" :is="component.initAudited" style="color: orange" />
            </a-tooltip>
            <a-tooltip title="审核未通过">
              <component v-if="item.auditedStatus === 2" :is="component.noAudited" style="color: red" />
            </a-tooltip>
          </span>
        </template>

        <!-- 描述 -->
        <a-list-item-meta>
          <template #description>
            <span v-for="text in item.tags" :key="text">
              {{ getDict.getTagItemName(text) }}
              <!-- {{ text }} -->
            </span>
          </template>
          <!-- 标题 -->
          <template #title>
            <!-- <a :href="item.href" @click="routeInfo(item.id)">{{ item.title }}</a> -->
            <router-link :to="{ name: 'detail', params: { articleId: item.id } }" @click="view(item.id)">{{
              item.title }}</router-link>
            <!-- <a-avatar size="middle" :style="{ backgroundColor: '#609DBF', verticalAlign: 'middle' }">
              {{ item.authorName }}
            </a-avatar> -->
            <span>
              <a-button @click.stop="routePractice(item.id, item.title, item.language)">去练习</a-button>
              <a-button>去比赛</a-button>
              <a-button v-if="item.authorId === store.state.user.user.userId"
                @click.stop="updateArticle(item.id)">编辑文章</a-button>
              <a-button danger v-if="item.authorId === store.state.user.user.userId"
                @click.stop="showConfirm(item.id)">删除文章</a-button>
            </span>
          </template>
        </a-list-item-meta>
        <!-- 内容 -->
        {{ item.summary }}
      </a-list-item>
    </template>
  </a-list>
  <UpdataArticle ref="childRef" :updataId="updataId" @refreshArticleList="refreshArticleList" />
</template>
<script setup>
import { useDebounce } from '../../api/utils/debounce';
import { StarOutlined, LikeOutlined, BarChartOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import { ref, defineProps, defineEmits, watch, createVNode } from 'vue';
import api from '../../api/index.js';
import { useStore } from 'vuex';
import router from '../../router';
import utils from '../../api/utils/generalUtil';
import getDict from '../../api/utils/dict';
import { Modal } from 'ant-design-vue';
import UpdataArticle from './UpdataArticle.vue';

const childRef = ref();
const props = defineProps(['listData']);
const listData = ref(props.listData);
const store = useStore();
const initLoading = ref(true);
const component = {
  star: StarOutlined,
  like: LikeOutlined,
  bar: BarChartOutlined,
  audited: CheckCircleOutlined,
  initAudited: ExclamationCircleOutlined,
  noAudited: CloseCircleOutlined,
};

const articleStatus = ref({});
const { debounce } = useDebounce();

watch(() => props.listData, (newListData) => {
  console.log(newListData);
  if (newListData) {
    listData.value = newListData;
    //执行你的逻辑;
    pagination.total = listData.value.total;
    initLoading.value = false;
    listData.value.list.forEach(article => {
      // 初始化文章状态字典，将每篇文章的点赞状态设为 false
      articleStatus.value[article.id] = {
        isStarred: article.isPacked,
        isLiked: article.isStared,
        stars: article.packs,
        likes: article.stars,
      };
    });
  } else {
    utils.tip('无数据', "error");
  }
});

const pagination = {
  pageSize: 10,
  total: 0,
  page: 1,
  onChange: page => {
    pageData.value.page = page;
    refreshArticleList();
  },
};
const pageData = ref({
  pageSize: pagination.pageSize,
  total: pagination.total,
  page: pagination.page,
});
const emit = defineEmits(['pageData']);
const refreshArticleList = () => {
  emit('pageData', pageData.value);
};
if (store.state.user.isLogin) {
  refreshArticleList();
}

// 切换文章的收藏状态
// 创建一个防抖函数，延迟 500 毫秒
const toggleStar = debounce(articleId => {
  // 在这里执行点击逻辑
  articleStatus.value[articleId].isStarred = !articleStatus.value[articleId].isStarred;
  if (articleStatus.value[articleId].isStarred) {
    articleStatus.value[articleId].stars++;
  } else {
    articleStatus.value[articleId].stars--;
  }
  // 在这里可以发送收藏请求，将收藏状态同步到服务器
  api.articleApi.star(articleId).then(res => {
    console.log(res);
  });
  console.log('按钮被点击了！');
}, 500);

// 切换文章的点赞状态
// 创建一个防抖函数，延迟500 毫秒
const toggleLike = debounce(articleId => {
  // 在这里执行点击逻辑
  articleStatus.value[articleId].isLiked = !articleStatus.value[articleId].isLiked;
  if (articleStatus.value[articleId].isLiked) {
    articleStatus.value[articleId].likes++;
  } else {
    articleStatus.value[articleId].likes--;
  }
  // 在这里可以发送点赞请求，将点赞状态同步到服务器
  api.articleApi.like(articleId).then(res => {
    console.log(res);
  });
  console.log('按钮被点击了！');
}, 500);


// 判断文章的收藏点赞状态
const isStar = articleId => articleStatus.value[articleId].isStarred;
const isLike = articleId => articleStatus.value[articleId].isLiked;

const routeInfo = (params) => {
  router.push({
    name: 'detail',
    params: {
      articleId: params,
    }
  });
};


const routePractice = (id, title, language) => {
  console.log(id, title);
  router.push({
    name: "practice",
    query: {
      articleId: id,
      articleName: title,
      articleLanguage: language,
    }
  });
};

const showConfirm = (id) => {
  Modal.confirm({
    title: '是否删除文章?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '是否要删除文章，删除文章后不可恢复',
    onOk() {
      del(id);
    },
  });
};

const del = (id) => {
  api.articleApi.delete(id).then(res => {
    if (res.data.success) {
      setTimeout(() => {
        utils.tip('删除成功', "success");
      }, 200);
      setTimeout(() => {
        refreshArticleList();
      }, 500); // 延迟1秒后刷新页面
    }
  });
};
const updataId = ref();
const updateArticle = (id) => {
  childRef.value.showDrawer();
  updataId.value = id;
};
</script>

<style scoped>
* {
  font-family: 'SmileySans', sans-serif;
}

:where(.css-dev-only-do-not-override-hkh161).ant-list-vertical .ant-list-item .ant-list-item-meta {
  margin-block-end: 0;
  align-items: center;
}

.ant-list-item-meta-title a:nth-child(1) {
  margin-right: 10px;
}

.ant-list-item-meta-description span {
  display: inline-block;
  background-color: rgb(221, 244, 255);
  color: rgb(41, 138, 230);
  min-width: 70px;
  text-align: center;
  border-radius: 2rem;
  margin-right: 10px;
  margin-bottom: 10px;
}

.ant-list-item .ant-list-item-meta .ant-list-item-meta-title span {
  float: right;
}

.ant-list-item:hover {
  transition: all 0.3s ease 0s;
  box-shadow: 5px 7px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

:where(.css-dev-only-do-not-override-hkh161).ant-list-split .ant-list-item {
  padding-top: 0;
  border: 1px solid rgba(5, 5, 5, 0.06);
  border-radius: 20px;
  margin-top: 10px;
}

:where(.css-dev-only-do-not-override-hkh161).ant-list {
  margin-top: 10px;
}
</style>
