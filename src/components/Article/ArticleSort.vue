<template>
  <span>排列方式：</span>
  <a-space>
    <a-select ref="select" v-model:value="value" style="width: 120px" :options="options1"
      @change="handleChange"></a-select>
  </a-space>
  <a-button type="primary" @click="showDrawer">创建文章</a-button>
  <a-drawer :width="500" title="创建文章" :open="open" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
      <a-button type="primary" @click="submit">创建</a-button>
    </template>

    <a-form :model="form" layout="vertical" :rules="rules">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="文章标题" name="title">
            <a-input v-model:value="form.title" placeholder="请输入你的标题" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="语言" name="language">
            <a-select v-model:value="form.language" placeholder="请选择你的语言" :options="optionsLanguages">
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否公开" name="isPublic">
            <a-select v-model:value="form.isPublic" placeholder="请选择是否公开">
              <a-select-option value=1>公开</a-select-option>
              <a-select-option value=0>私有</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="类型" name="tagMask">
            <a-select v-model:value="form.tagMask" mode="tags" placeholder="请选择你的类型" :options="optionTags">
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="描述" name="summary">
            <a-textarea v-model:value="form.summary" :rows="2" placeholder="请输入你的文章描述" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="正文" name="content">
            <a-textarea v-model:value="form.content" :rows="4" placeholder="请输入文章正文" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

  </a-drawer>
</template>
<script setup>
import { ref, defineEmits, computed, createVNode } from 'vue';
import api from '../../api';
import utils from '@/api/utils/componentUtil';
import router from '../../router';
import { useStore } from 'vuex';
import { Modal } from 'ant-design-vue';

const store = useStore();


const optionsLanguages = store.state.article.articleLanguage.map(item => {
  return {
    value: item.itemCode,
    label: item.itemName,
  };
});
const optionTags = store.state.article.articleTag.map(item => {
  return {
    value: item.itemCode,
    label: item.itemName,
  };
});
const sortord = ref(0);
const emit = defineEmits(['sortord']);
const ziChuanFu = () => {
  emit('sortord', sortord.value);
};
const value = ref('名称');
const options1 = ref([
  {
    value: 0,
    label: '名称',
  },
  {
    value: 1,
    label: '最新',
  },
  {
    value: 2,
    label: '最热',
  },
]);
const handleChange = value => {
  sortord.value = value;
  ziChuanFu();
};

const open = ref(false);
const showDrawer = () => {
  open.value = true;
  const createData = localStorage.getItem('CreateArticle');
  if (createData) {
    Modal.confirm({
      title: '是否恢复',
      content: createVNode('div', {
        style: 'color:red;',
      }, '是否恢复上次编辑的草稿？'),
      onOk() {
        form.value = JSON.parse(createData);
        localStorage.removeItem('CreateArticle');
      },
      onCancel() {
        localStorage.removeItem('CreateArticle');
        form.value.title = '';
        form.value.language = '';
        form.value.isPublic = '';
        form.value.tagMask = [];
        form.value.summary = '';
        form.value.content = '';
      },
      class: 'test',
    });
  }
};
const onClose = () => {
  const isFormEmpty = computed(() => {
    return (
      form.value.title === '' &&
      form.value.language === '' &&
      form.value.isPublic === '' &&
      form.value.tagMask.length === 0 &&
      form.value.summary === '' &&
      form.value.content === ''
    );
  });
  if (!isFormEmpty.value) {
    Modal.confirm({
      title: '确认关闭',
      content: createVNode('div', {
        style: 'color:red;',
      }, '是否将草稿保存？'),
      onOk() {
        localStorage.setItem('CreateArticle', JSON.stringify(form.value));
      },
      onCancel() {
        form.value.title = '';
        form.value.language = '';
        form.value.isPublic = '';
        form.value.tagMask = [];
        form.value.summary = '';
        form.value.content = '';
      },
      class: 'test',
    });
  }
  open.value = false;
};
const submit = () => {
  if (form.value.title === '' ||
    form.value.language === '' ||
    form.value.isPublic === '' ||
    form.value.tagMask.length === 0 ||
    form.value.content === '') {
    utils.tip('请填入必填项', "warning");
  } else {
    open.value = false;
    api.articleApi.create(form.value).then(res => {
      console.log(res);
      utils.tip('创建成功', "success");
      setTimeout(() => {
        router.go(0);
      }, 900); // 延迟1秒后刷新页面
    });
  }

};

const form = ref({
  title: '',
  language: '',
  isPublic: '',
  tagMask: [],
  summary: '',
  content: '',
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
* {
  user-select: none;
}

.ant-btn {
  float: right;
}
</style>
