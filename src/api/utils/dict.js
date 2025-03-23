// 字典
import store from "../../store";

const articleLanguage = store.state.article.articleLanguage;
const articleTag = store.state.article.articleTag;

const getDict = {
  getLanguageName(itemCode) {
    if (Array.isArray(articleLanguage) && articleLanguage.length) {
      const item = articleLanguage.find(entry => entry.itemCode === Number(itemCode));
      return item ? item.itemName : '其他';
    } else {
      return '其他';
    }

  },
  getTagItemName(itemCode) {
    if (Array.isArray(articleTag) && articleTag.length) {
      const item = articleTag.find(entry => entry.itemCode === Number(itemCode));
      return item ? item.itemName : '其他';
    } else {
      return '其他';
    }
  }
};

export default getDict;
