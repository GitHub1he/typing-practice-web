<template>
  <a-card title="练习文章" :headStyle="{ textAlign: 'center' }">
    <div>
      <a-row>
        <a-col :span="4">
          选择文章：
        </a-col>
        <a-col :span="12">
          <a-button v-if="articleInfo.articleName" type="link" @click="route">{{ articleInfo.articleName }}</a-button>
          <a-button v-else type="link" @click="route">点击选择文章</a-button>
          <span>{{ getDict.getLanguageName(articleInfo.articleLanguage) }}</span>
          <a-button type="dashed" @click="random">随机选</a-button>
        </a-col>
      </a-row>
    </div>
    <div>
      <a-row>
        <a-col :span="4">
          时间：
        </a-col>
        <a-col :span="10">
          <a-slider v-model:value="inputValue" :min="1" :max="120" :disabled="checked" />
        </a-col>
        <a-col :span="5">
          <a-input-number v-model:value="inputValue" :min="1" :max="120" style="margin-left: 16px" :disabled="checked"
            :addonAfter="addonAfterText" />
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="12" :offset="4">
          <a-checkbox v-model:checked="checked">不限时间</a-checkbox>
        </a-col>
      </a-row>
    </div>
    <div>
      <a-row>
        <a-col :span="4">
          模式：
        </a-col>
        <a-col :span="8">
          <a-select v-model:value="value" style="width: 90%" :options="options" @change="handleChange"></a-select>
        </a-col>
        <a-col :span="11">
          {{ tip }}
        </a-col>
      </a-row>
    </div>
    <div class="button">
      <a-button type="primary" @click="init">开始练习</a-button>
    </div>
  </a-card>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue';
import router from '@/router/';
import { useRoute } from 'vue-router';
import api from '@/api/index.js';
import utils from '../../api/utils/generalUtil';
import getDict from '../../api/utils/dict';


const inputValue = ref(1);
const value = ref('模式一');
const checked = ref(false);
const addonAfterText = 'min';
const tip = ref('模式一为行行对照');
const currentOption = ref(1);
const emit = defineEmits(['beforePracticeInfo']);

const routes = useRoute();
const articleInfo = reactive({
  articleId: routes.query.articleId || null,
  articleName: routes.query.articleName || "点击选择文章",
  articleLanguage: routes.query.articleLanguage || null,
});
console.log(articleInfo);
const random = () => {
  api.practiceApi.random().then(res => {
    console.log(res);
    if (res.data.success) {
      articleInfo.articleId = res.data.data.id;
      articleInfo.articleName = res.data.data.title;
      articleInfo.articleLanguage = res.data.data.language;
    }
  });
};

const options = ref([
  {
    value: 1,
    label: '模式一',
  },
  {
    value: 2,
    label: '模式二',
  },
  {
    value: 3,
    label: '模式三',
  },
]);
const handleChange = value => {
  // { key: "lucy", label: "Lucy (101)" }
  currentOption.value = value;
  if (value === 1) {
    tip.value = '模式一为行行对照';
  } else if (value === 2) {
    tip.value = '模式二为自由排版且标出错误';
  } else if (value === 3) {
    tip.value = '模式三为自由排版且不标出错误';
  }
};

const route = () => {
  router.push({
    name: 'article',
  });
};

const init = () => {
  if (checked.value) {
    inputValue.value = -1;
  }
  if (articleInfo.articleId && currentOption.value && inputValue.value) {
    api.practiceApi.init({
      articleId: articleInfo.articleId,
      mode: currentOption.value,
      selectedTimeRange: inputValue.value === -1 ? inputValue.value : inputValue.value * 60,
    }).then(res => {
      emit('beforePracticeInfo', {
        status: 1,
        practiceInfo: {
          articleId: articleInfo.articleId,
          mode: currentOption.value,
          selectedTimeRange: inputValue.value,
          practiceId: res.data.data.id
        },
      });
    });
  } else {
    utils.tip("请选择必填项", "error");
  }
};
</script>

<style scoped>
:where(.css-dev-only-do-not-override-1hsjdkk).ant-col-4 {
  text-align: right;
  margin-right: 10px;
  line-height: 2rem;
}

:where(.css-dev-only-do-not-override-1hsjdkk).ant-row {
  margin-bottom: 1rem;
}

.button {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.ant-checkbox-wrapper {
  margin-left: 9px;
}

:where(.css-dev-only-do-not-override-1hsjdkk).ant-col-11 {
  line-height: 2rem;
  color: #999;
  font-size: 12px;
}

:where(.css-dev-only-do-not-override-1hsjdkk).ant-btn-link {
  padding-left: 0;
}

:where(.css-dev-only-do-not-override-1hsjdkk).ant-btn-dashed {
  margin-left: 10px;
}
</style>
../../api/utils/dict
../../api/utils/generalUtil
