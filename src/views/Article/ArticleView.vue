<template>
  <div class="article">
    <div class="search">
      <a-card>
        <ArticleSearch @searchData="searchData" />
      </a-card>
    </div>
    <div class="list">
      <a-card>
        <a-tabs v-model:activeKey="activeKey" @change="changeTab">
          <a-tab-pane key="1" tab="审核通过">
            <div class="header">
              <span>排列方式：</span>
              <a-space>
                <a-select ref="select" v-model:value="sortLabel" style="width: 120px" :options="sortArray"
                  @change="changeSort"></a-select>
              </a-space>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="审核中&未通过" force-render></a-tab-pane>
          <a-tab-pane key="3" tab="点赞" force-render></a-tab-pane>
          <a-tab-pane key="4" tab="收藏" force-render></a-tab-pane>
          <a-tab-pane key="5" tab="创建" force-render></a-tab-pane>
        </a-tabs>
        <a-button class="create-article-button" type="primary" @click="showDrawer">创建文章</a-button>

        <a-drawer :width="500" title="创建文章" :open="open" @close="onClose">
          <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
            <a-button type="primary" @click="submit">创建</a-button>
          </template>
          <a-form :model="articleData" layout="vertical" :rules="rules">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="文章标题" name="title">
                  <a-input v-model:value="articleData.title" placeholder="请输入你的标题" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="语言" name="language">
                  <a-select v-model:value="articleData.language" placeholder="请选择你的语言" :options="optionsLanguages">
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="是否公开" name="isPublic">
                  <a-select v-model:value="articleData.isPublic" placeholder="请选择是否公开">
                    <a-select-option value=1>公开</a-select-option>
                    <a-select-option value=0>私有</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="类型" name="tagMask">
                  <a-select v-model:value="articleData.tagMask" mode="tags" placeholder="请选择你的类型" :options="optionTags">
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="描述" name="summary">
                  <a-checkbox v-model:checked="articleData.autoGeneration">自动生成</a-checkbox>
                  <a-textarea v-model:value="articleData.summary" :rows="2" placeholder="请输入你的文章描述" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="正文" name="content">
                  <a-textarea v-model:value="articleData.content" :rows="4" placeholder="请输入文章正文" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-drawer>
        <ArticleList :listData="listData" @pageData="toSearch" />
      </a-card>
    </div>
  </div>
</template>

<script setup>
import ArticleList from '@/components/Article/ArticleList.vue';
import ArticleSearch from '@/components/Article/ArticleSearch.vue';
import api from '../../api';
import { useStore } from 'vuex';
import { ref, computed, createVNode } from 'vue';
import utils from '../../api/utils/generalUtil';
import { Modal } from 'ant-design-vue';

const store = useStore();
const activeKey = ref('1');
const optionsLanguages = store.state.article.articleLanguage.map(item => ({
  value: item.itemCode,
  label: item.itemName,
}));
const optionTags = store.state.article.articleTag.map(item => ({
  value: item.itemCode,
  label: item.itemName,
}));

const searchValue = ref({});
const sortordData = ref();
const page = ref({});

const sortLabel = ref('名称');
const sortArray = ref([
  { value: 0, label: '名称' },
  { value: 1, label: '最新' },
  { value: 2, label: '最热' },
]);

const searchData = (value) => {
  searchValue.value = value;
  search();
};

const changeSort = (value) => {
  sortordData.value = value;
  search();
};
const changeTab = () => {
  page.value.page = 1;
  page.value.pageSize = 10;
  search();
};

const toSearch = (value) => {
  page.value = value;
  search();
};

const listData = ref();
async function search() {
  try {
    let res = '';
    if (activeKey.value === '1') {
      res = await api.articleApi.search({
        title: searchValue.value.title,
        language: searchValue.value.language,
        tagMask: searchValue.value.tagMask,
        sortord: sortordData.value || 0,
        page: {
          pageSize: page.value.pageSize,
          pageNo: page.value.page,
        },
      });
    } else if (activeKey.value === '2') {
      res = await api.articleApi.searchNotAudited({
        title: searchValue.value.title,
        language: searchValue.value.language,
        tagMask: searchValue.value.tagMask,
        sortord: sortordData.value || 0,
        page: {
          pageSize: page.value.pageSize,
          pageNo: page.value.page,
        },
      });
    } else if (activeKey.value === '3') {
      res = await api.articleApi.starOrPack({
        userId: store.state.user.user.userId,
        type: 1,
        page: {
          pageSize: page.value.pageSize,
          pageNo: page.value.page,
        },
      });
    } else if (activeKey.value === '4') {
      res = await api.articleApi.starOrPack({
        userId: store.state.user.user.userId,
        type: 2,
        page: {
          pageSize: page.value.pageSize,
          pageNo: page.value.page,
        },
      });
    } else if (activeKey.value === '5') {
      res = await api.articleApi.userIdList({
        userId: store.state.user.user.userId,
        page: {
          pageSize: page.value.pageSize,
          pageNo: page.value.page,
        },
      });
    }
    if (res.data.success) {
      listData.value = res.data;
    } else {
      utils.tip(res.data.message, 'error');
    }
  } catch (error) {
    console.error('Error during search:', error);
  }
}

const open = ref(false);
const showDrawer = () => {
  console.log('创建');
  open.value = true;
  const createData = localStorage.getItem('CreateArticle');
  if (createData) {
    Modal.confirm({
      title: '是否恢复',
      content: createVNode('div', { style: 'color:red;' }, '是否恢复上次编辑的草稿？'),
      onOk() {
        articleData.value = JSON.parse(createData);
        localStorage.removeItem('CreateArticle');
      },
      onCancel() {
        localStorage.removeItem('CreateArticle');
        articleData.value.title = '';
        articleData.value.language = '';
        articleData.value.isPublic = '';
        articleData.value.tagMask = [];
        articleData.value.summary = '';
        articleData.value.content = '';
      },
      class: 'test',
    });
  }
};
const onClose = () => {
  const isFormEmpty = computed(() => {
    return (
      articleData.value.title === '' &&
      articleData.value.language === '' &&
      articleData.value.isPublic === '' &&
      articleData.value.tagMask.length === 0 &&
      articleData.value.summary === '' &&
      articleData.value.content === ''
    );
  });
  if (!isFormEmpty.value) {
    Modal.confirm({
      title: '确认关闭',
      content: createVNode('div', { style: 'color:red;' }, '是否将草稿保存？'),
      onOk() {
        localStorage.setItem('CreateArticle', JSON.stringify(articleData.value));
      },
      onCancel() {
        articleData.value.title = '';
        articleData.value.language = '';
        articleData.value.isPublic = '';
        articleData.value.tagMask = [];
        articleData.value.summary = '';
        articleData.value.content = '';
      },
      class: 'test',
    });
  }
  open.value = false;
};
const submit = () => {
  if (
    articleData.value.title === '' ||
    articleData.value.language === '' ||
    articleData.value.isPublic === '' ||
    articleData.value.tagMask.length === 0 ||
    articleData.value.content === ''
  ) {
    utils.tip('请填入必填项', 'warning');
  } else {
    open.value = false;
    api.articleApi.create(articleData.value).then(res => {
      console.log(res);
      utils.tip('创建成功', 'success');
      setTimeout(() => {
        search();
      }, 500); // 延迟1秒后刷新页面
    });
  }
};

const articleData = ref({
  title: '',
  language: '',
  isPublic: '',
  tagMask: [],
  summary: '',
  content: '',
  autoGeneration: false,
});

const rules = {
  title: [
    {
      required: true,
      message: '请输入您的标题',
    },
  ],
  language: [
    {
      required: true,
      message: '请选择您的语言',
    },
  ],
  isPublic: [
    {
      required: true,
      message: '请选择是否公开',
    },
  ],
  tagMask: [
    {
      required: true,
      message: '请选择您的类型',
    },
  ],
  content: [
    {
      required: true,
      message: '请输入您的文章内容',
    },
  ],
};
</script>

<style scoped>
.article {
  width: 90%;
  margin: 2rem auto;
  display: flex;
}

.search {
  flex: 1;
  margin-right: 1rem;
}

.search .ant-card-bordered {
  position: sticky;
  top: 4.3rem;
}

.list {
  flex: 3;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
}

.create-article-button {
  position: absolute;
  top: 32px;
  right: 24px;
  z-index: 900;
}
</style>
