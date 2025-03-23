import api from '../api/index.js';

const ModuleArticle = {
  state: {
    articleLanguage: JSON.parse(localStorage.getItem('articleLanguage')) || [],
    articleTag: JSON.parse(localStorage.getItem('articleTag')) || [],
  },
  getters: {
  },
  mutations: {
    setarticleLanguage(state, language) {
      state.articleLanguage = language;
    },
    setarticleTag(state, tag) {
      state.articleTag = tag;
    },
  },
  actions: {
    fetchDictionary(context, data) {
      data.forEach(element => {
        api.baseApi.getDictionary(element)
          .then(res => {
            if (res.data.success) {
              context.commit(`set${element}`, res.data.list);
              localStorage.setItem(element, JSON.stringify(res.data.list));
            }
          }).catch(e => {
            context.commit(`set${element}`, []);
            console.log(e);
          });
      });

    },
  },
  modules: {
  }
};
export default ModuleArticle;
