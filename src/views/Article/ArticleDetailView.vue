<template>
  <a-space direction="vertical" :style="{ width: '100%' }" :size="[0, 48]">
    <a-layout>
      <a-row>
        <a-col :xs="24" :sm="24" :md="24" :lg="15" :xl="15">
          <a-row :style="headerStyle">
            <a-col :span="15" :offset="1">
              <h2 class="title">{{ detail.title }}</h2>
            </a-col>
            <a-col :span="8">
              <a-button @click="routePractice(detail.id, detail.title, detail.language)">去练习</a-button>
              <a-button @click="getNextArticle(detail.id)">下一篇</a-button>
              <a-button>创建比赛</a-button>
              <a-button>去修改</a-button>
            </a-col>
          </a-row>
          <a-row :style="headerStyle">
            <a-col :xs="24" :sm="24" :md="24" :lg="17" :xl="17" :offset="1">
              <div class="info">
                <span @click="routeUserInfo(detail.authorId)" class="username">
                  <a-avatar v-if="utils.isValidAvatar(detail.avatar)" :src="utils.getAvatarSrc(detail.avatar)">
                  </a-avatar>
                  <a-avatar v-else>
                  </a-avatar>
                  {{ detail.authorName }}
                </span>
                <span>
                  {{ detail.updateTime }}
                </span>
                <span>
                  字数：{{ detail.wordNums }}
                </span>
                <span>
                  分类：
                  <span v-for="index in detail.tags" :key="index" class="tags">
                    {{ getDict.getTagItemName(index) }}
                    <!-- {{ index }} -->
                  </span>
                </span>
              </div>
            </a-col>
          </a-row>
          <a-row :style="contentStyle">
            <a-col :span="1">
              <div class="star">
                <div @click="toggleStar">
                  <StarOutlined :style="{ color: detail.isPacked ? '#FFB135' : 'inherit' }" /> <br>
                  {{ detail.packs }}
                </div>
                <div @click="toggleLike">
                  <LikeOutlined :style="{ color: detail.isStared ? '#F21212' : 'inherit' }" /> <br>
                  {{ detail.stars }}
                </div>
              </div>
            </a-col>
            <a-col :span="22">
              <p class="height-50">{{ detail.content }}</p>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="22" :offset="1">
              <div class="explain">
                声明：以上文章均为用户自行添加，仅供打字交流使用，不代表本站观点，本站不承担任何法律责任，特此声明！如果有侵犯到您的权利，请及时联系我们删除。
              </div>
            </a-col>
          </a-row>
        </a-col>
        <a-col :xs="20" :sm="20" :md="20" :lg="9" :xl="9">
          <a-row>
            <a-col :span="13" :offset="2">
              <p class="height-40" style="height: 20rem;">
                <RankingsList :rankList="rankList" />
              </p>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <a-layout-footer :style="footerStyle">
        <a-row>
          <a-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
            <ArticleComment />
          </a-col>
        </a-row>
      </a-layout-footer>
    </a-layout>
  </a-space>
</template>

<script setup>
import { StarOutlined, LikeOutlined } from '@ant-design/icons-vue';
import RankingsList from '../../components/Ranking/RankingsList.vue';
import ArticleComment from '@/components/Article/ArticleComment.vue';
import { useRoute } from 'vue-router';
import { ref, watch, onMounted } from 'vue';
import utils from '../../api/utils/generalUtil';
import api from '@/api';
import { useDebounce } from '@/api/utils/debounce';
import getDict from '../../api/utils/dict';
import router from '../../router';

const route = useRoute();
const detail = ref({});
const { debounce } = useDebounce();
let rankList = ref();


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

const headerStyle = {
  textAlign: 'initial',
  height: 'auto',
  paddingInline: 50,
  lineHeight: '64px',
  backgroundColor: 'transparent',
};
const contentStyle = {
  textAlign: 'initial',
  minHeight: 120,
  lineHeight: '40px',
  backgroundColor: 'transparent',
};
const footerStyle = {
  textAlign: 'initial',
  color: '#fff',
  backgroundColor: 'transparent',
};
</script>

<style scoped>
.css-dev-only-do-not-override-1hsjdkk .title {
  font-size: 24px;
  font-weight: 800;
}

:where(.css-dev-only-do-not-override-1hsjdkk).ant-layout {
  background-color: #fff;
}

.height-50 {
  white-space: pre-line;
  padding: 1.5rem 2rem;
  margin: 0;
  background-color: rgb(235, 235, 235);
  border-radius: 1.8rem 0 0 1.8rem;
  max-height: 32rem;
  min-height: 15rem;
  overflow: auto;
  font-size: 1.5rem;
  /* line-height: 10px; */

}

.height-40 {
  padding: 0.7rem 0.7rem 1.5rem 0.7rem;
  margin: 0;
  background-color: rgb(235, 235, 235);
  border-radius: 1.8rem;
}

.height-40 H4 {
  margin: 0;
  text-align: center;
}

.info span {
  margin-right: 1.2rem;
}

.info .ant-avatar {
  margin: 0;
}

.star {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  user-select: none;
  cursor: pointer;
}

.explain {
  font-size: 12px;
  color: #999;
}

.star span {
  margin: 0;
}

button {
  margin-right: 0.6rem;
}

.info .tags {
  margin-right: 5px;
}

.username {
  cursor: pointer;
}
</style>
