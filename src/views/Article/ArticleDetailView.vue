<template>
  <a-space direction="vertical" :style="{ width: '100%', background: '#f5f7fa' }" :size="[0, 48]">
    <a-layout class="article-container">
      <!-- 文章头部区域 -->
      <header class="article-header" role="banner">
        <div class="header-content">
          <h1 class="article-title" tabindex="0">{{ detail.title }}</h1>
          <div class="article-meta" tabindex="0">
            <span class="author-info hover-effect" @click="routeUserInfo(detail.authorId)" role="button" tabindex="0">
              <a-avatar :size="40" :src="utils.getAvatarSrc(detail.avatar)" :alt="detail.authorName + '的头像'" />
              <span class="author-name">{{ detail.authorName }}</span>
            </span>
            <div class="meta-divider"></div>
            <time :datetime="detail.updateTime" class="meta-item">
              <calendar-outlined class="meta-icon" />
              {{ detail.updateTime }}
            </time>
            <div class="meta-divider"></div>
            <span class="meta-item">
              <read-outlined class="meta-icon" />
              字数：{{ detail.wordNums }}
            </span>
          </div>

          <div class="article-tags">
            <tags-outlined class="meta-icon" />
            <a-tag v-for="tag in detail.tags" :key="tag" class="custom-tag" :color="getTagColor(tag)">
              {{ getDict.getTagItemName(tag) }}
            </a-tag>
          </div>
        </div>

        <!-- 文章工具栏 -->
        <div class="article-toolbar glass-effect" role="toolbar">
          <a-button-group>
            <a-button @click="decreaseFontSize" title="减小字号">
              <template #icon><minus-outlined /></template>
            </a-button>
            <a-button @click="increaseFontSize" title="增大字号">
              <template #icon><plus-outlined /></template>
            </a-button>
            <a-button @click="toggleTheme" title="切换主题">
              <template #icon><bulb-outlined /></template>
            </a-button>
          </a-button-group>
          <a-button-group>
            <a-button @click="routePractice(detail.id, detail.title, detail.language)" type="primary">
              去练习
            </a-button>
            <!-- 添加编辑文章按钮，仅当当前用户是作者时显示 -->
            <a-button v-if="isAuthor" @click.stop="updateArticle(detail.id)" type="primary" ghost>
              <template #icon><edit-outlined /></template>
              编辑文章
            </a-button>
            <a-button @click="getNextArticle(detail.id)">下一篇</a-button>
            <a-button>创建比赛</a-button>
          </a-button-group>
        </div>
      </header>

      <!-- 文章主体 -->
      <main class="article-main" role="main">
        <a-row>
          <a-col :xs="24" :sm="24" :md="24" :lg="15" :xl="15">
            <!-- 添加互动栏 -->
            <!-- 修改互动栏部分 -->
            <div class="interaction-bar" role="complementary">
              <div class="interaction-item">
                <a-button shape="circle" @click="toggleStar" :class="['action-button', { 'active': detail.isPacked }]"
                  :aria-label="detail.isPacked ? '取消收藏' : '收藏文章'">
                  <template #icon>
                    <star-outlined />
                  </template>
                </a-button>
                <span class="interaction-count" :class="{ 'active': detail.isPacked }">
                  {{ detail.packs }}
                </span>
              </div>
              <div class="interaction-item">
                <a-button shape="circle" @click="toggleLike" :class="['action-button', { 'active': detail.isStared }]"
                  :aria-label="detail.isStared ? '取消点赞' : '点赞文章'">
                  <template #icon>
                    <like-outlined />
                  </template>
                </a-button>
                <span class="interaction-count" :class="{ 'active': detail.isStared }">
                  {{ detail.stars }}
                </span>
              </div>
            </div>

            <!-- 文章内容 -->
            <article class="article-content" :class="{ 'dark-mode': isDarkMode }" :style="{ fontSize: fontSize + 'px' }"
              tabindex="0">
              {{ detail.content }}
              <div class="article-disclaimer">
                声明：以上文章均为用户自行添加，仅供打字交流使用，不代表本站观点，本站不承担任何法律责任，特此声明！如果有侵犯到您的权利，请及时联系我们删除。
              </div>
            </article>
          </a-col>

          <!-- 侧边栏 -->
          <a-col :xs="24" :sm="24" :md="24" :lg="9" :xl="9" class="sidebar">
            <rankings-list :rank-list="rankList" />
          </a-col>
        </a-row>
      </main>

      <!-- 评论区 -->
      <footer class="article-footer" role="contentinfo">
        <article-comment />
      </footer>

    </a-layout>
  </a-space>
  <UpdataArticle ref="childRef" :updataId="updataId" @refreshArticleList="refreshArticleList" />
</template>

<script setup>
// 添加新的图标引入
import {
  StarOutlined,
  LikeOutlined,
  MinusOutlined,
  PlusOutlined,
  BulbOutlined,
  CalendarOutlined,
  ReadOutlined,
  TagsOutlined,
  EditOutlined // 添加编辑图标
} from '@ant-design/icons-vue';
import RankingsList from '../../components/Ranking/RankingsList.vue';
import ArticleComment from '@/components/Article/ArticleComment.vue';
import UpdataArticle from '@/components/Article/UpdataArticle.vue';
import { useRoute } from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue'; // 添加 computed
import utils from '../../api/utils/generalUtil';
import api from '@/api';
import { useDebounce } from '@/api/utils/debounce';
import getDict from '../../api/utils/dict';
import router from '../../router';
import { useStore } from 'vuex'; // 添加 useStore

const store = useStore(); // 获取 store
const route = useRoute();
const detail = ref({});
const { debounce } = useDebounce();
let rankList = ref();
const childRef = ref();


// 判断当前用户是否是文章作者
const isAuthor = computed(() => {
  return detail.value.authorId === store.state.user.user.userId;
});

// 编辑文章方法
const updataId = ref();
const updateArticle = (id) => {
  childRef.value.showDrawer();
  updataId.value = id;
};

const loadArticle = (articleId) => {
  api.articleApi.desc(articleId).then(res => {
    detail.value = res.data.data;
  });
  api.rankApi.getArticleRanking(articleId).then(res => {
    rankList.value = res.data.list;
  });
  view(articleId);
};

onMounted(() => {
  loadArticle(route.params.articleId);
});
watch(
  () => route.params.articleId,
  (newArticleId) => {
    if (newArticleId) {
      loadArticle(newArticleId);
    }
  }
);
const view = async (id) => {
  await api.articleApi.view(id);
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

const getNextArticle = (articleId) => {
  api.articleApi.getNextArticle(articleId).then(res => {
    if (res.data.success) {
      routeArticleDetailInfo(res.data.data);
    }
  });
};
// 切换文章的收藏状态
// 创建一个防抖函数，延迟 1000 毫秒
const toggleStar = debounce(() => {
  // 在这里执行点击逻辑
  detail.value.isPacked = !detail.value.isPacked;
  if (detail.value.isPacked) {
    detail.value.packs++;
  } else {
    detail.value.packs--;
  }
  // 在这里可以发送收藏请求，将收藏状态同步到服务器
  api.articleApi.star(detail.value.id).then(res => {
    console.log(res);
  });
  console.log('按钮被点击了！');
}, 1000);


// 切换文章的点赞状态
const toggleLike = debounce(() => {
  detail.value.isStared = !detail.value.isStared;
  if (detail.value.isStared) {
    detail.value.stars++;
  } else {
    detail.value.stars--;
  }
  // 在这里可以发送点赞请求，将点赞状态同步到服务器
  // const formdata = new FormData();
  // formdata.append("articleId", detail.value.id);
  api.articleApi.like(detail.value.id).then(res => {
    console.log(res);
  });
  console.log('按钮被点击了！');
}, 1000);

// 字体大小控制
const fontSize = ref(16);
const increaseFontSize = () => fontSize.value = Math.min(fontSize.value + 2, 24);
const decreaseFontSize = () => fontSize.value = Math.max(fontSize.value - 2, 12);

// 暗色模式
const isDarkMode = ref(false);
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode');
};
// 修改标签颜色函数
const getTagColor = (tag) => {
  const colors = ['#108ee9', '#87d068', '#2db7f5', '#f50', '#f90'];
  // 将 tag 转换为字符串并计算哈希值
  const tagStr = String(tag);
  const hash = tagStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
</script>

<style scoped>
/* 修改和新增的样式 */
.article-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.header-content {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  background: linear-gradient(120deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.meta-divider {
  width: 1px;
  height: 20px;
  background: #e8e8e8;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.hover-effect:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.author-name {
  font-weight: 500;
  color: #1a1a1a;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 1.1rem;
  color: #1890ff;
}

.article-tags {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.custom-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.custom-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1rem;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #2c3e50;
  padding: 2.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.interaction-bar {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.interaction-bar .ant-btn {
  width: 44px;
  height: 44px;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
}

.interaction-bar .ant-btn:hover {
  transform: scale(1.1);
}

.interaction-count {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.2rem;
}

/* 暗色模式优化 */
.dark-mode {
  background: #1a1a1a;
  color: #e0e0e0;
}

.dark-mode .article-title {
  background: linear-gradient(120deg, #81ecec, #74b9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .article-container {
    margin: 0;
    padding: 1rem;
    border-radius: 0;
  }

  .header-content {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .interaction-bar {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    top: auto;
    transform: none;
    flex-direction: row;
    padding: 0.5rem;
  }
}

.interaction-bar {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 1.2rem 0.8rem;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  z-index: 100;
}

.interaction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.action-button {
  width: 48px !important;
  height: 48px !important;
  font-size: 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.action-button:hover {
  transform: scale(1.1);
  background: #f0f5ff;
  border-color: #1890ff;
}

.action-button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.interaction-count {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  transition: all 0.3s ease;
}

.interaction-count.active {
  color: #1890ff;
  transform: scale(1.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .interaction-bar {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    top: auto;
    transform: none;
    flex-direction: row;
    padding: 0.8rem;
    gap: 1rem;
  }

  .action-button {
    width: 42px !important;
    height: 42px !important;
  }
}

.article-disclaimer {
  margin-top: 3rem;
  padding: 1rem;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #eee;
  line-height: 1.6;
}

/* 暗色模式适配 */
.dark-mode .article-disclaimer {
  color: #999;
  border-top-color: #333;
}

.dark-mode .interaction-bar {
  background: rgba(30, 30, 30, 0.95);
}

.dark-mode .action-button:hover {
  background: #1f1f1f;
  border-color: #1890ff;
}

.dark-mode .interaction-count {
  color: #999;
}
</style>