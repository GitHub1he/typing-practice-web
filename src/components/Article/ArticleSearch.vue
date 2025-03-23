<template>
  <a-input-search v-model:value="value" placeholder="请输入文章标题" enter-button @search="onSearch" />
  <!-- <a-card> -->
  <a-card>
    <div>
      <div class="tags">
        语言：
        <span v-for="(language, index) in selectedLanguage" :key="index">
          {{ language.itemName }}
          <CloseOutlined :style="{ fontSize: '12px' }" @click="deleteLanguage(index)" />
        </span>
      </div>
      <span v-for="(language, index) in languages" :key="index" @click="selectLanguage(index)"
        :class="{ 'selected': selectedLanguage.includes(language) }" class="tag">
        {{ language.itemName }}
      </span>
    </div>
  </a-card>
  <a-card>
    <div>
      <div class="tags">
        类型：
        <span v-for="(type, index) in selectedType" :key="index">
          {{ type.itemName }}
          <CloseOutlined :style="{ fontSize: '12px' }" @click="deleteType(index)" />
        </span>
      </div>
      <span v-for="(type, index) in types" :key="index" @click="selectType(index)"
        :class="{ 'selected': selectedType.includes(type) }" class="tag">
        {{ type.itemName }}
      </span>
    </div>
  </a-card>

</template>


<script setup>
import { ref, defineEmits, watch } from 'vue';
import utils from '../../api/utils/generalUtil';
import { CloseOutlined } from '@ant-design/icons-vue';
import { useStore } from 'vuex';

const store = useStore();
const value = ref('');
const types = store.state.article.articleTag;
const languages = store.state.article.articleLanguage;
const selectedType = ref([]);
const selectedLanguage = ref([]);

const searchData = ref({
  title: '',
  language: null,
  tagMask: [],
});

const emit = defineEmits(['searchData']);
const ziChuanFu = () => {
  emit('searchData', searchData.value);
};

const onSearch = value => {
  searchData.value.title = value;
  ziChuanFu();
};
watch(value, (val) => {
  searchData.value.title = val;
  ziChuanFu();
});


const selectType = index => {
  if (selectedType.value.length <= 2) {
    if (selectedType.value.includes(types[index])) {
      utils.tip('不能重复选择', "warning");
    } else {
      selectedType.value.push(types[index]);
      searchData.value.tagMask.push(types[index].itemCode);
      ziChuanFu();
    }
  } else {
    utils.tip('最多只能选择三个', "warning");
  }
};
const selectLanguage = index => {
  if (selectedLanguage.value.includes(languages[index])) {
    utils.tip('不能重复选择', "warning");
  } else {
    selectedLanguage.value.splice(0, 1, languages[index]);
    searchData.value.language = languages[index].itemCode;
    ziChuanFu();
  }
};
const deleteType = (index) => {
  selectedType.value.splice(index, 1);
  searchData.value.tagMask.splice(index, 1);
  ziChuanFu();
};
const deleteLanguage = index => {
  selectedLanguage.value.splice(index, 1);
  searchData.value.language = null;
  ziChuanFu();
};


</script>

<style scoped>
* {
  user-select: none;
}

.tag,
.tags span {
  display: inline-block;
  margin: 0.2rem;
  padding: 0.1rem 0.8rem;
  background-color: #DDF4FF;
  border-radius: 2rem;
  color: #298AE6;
  line-height: 1.5714285714285714;
  cursor: pointer;
}

.tags {
  min-height: 2.2rem;
  line-height: 2rem;
}

.selected {
  background-color: rgb(184, 231, 248);
  font-weight: bold;
}

.ant-card-bordered {
  margin-top: 1rem;
}

.tags .anticon-close {
  margin: 0;
  padding: 0;
}

.userLike {
  text-align: center;
  padding: 0;
}
</style>
