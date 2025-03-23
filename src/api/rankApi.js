/**
 * 排行榜模块接口列表
 */

import axios from './utils/httpUtil'; // 导入http中创建的axios实例


const rankApi = {
  //获取文章排行榜
  getArticleRanking(articleId) {
    return axios.get(`/rank/getArticle/${articleId}`, articleId);
  },
  //获取时长排行榜
  getTimeRanking() {
    return axios.get(`/rank/getTime`);
  },
};

export default rankApi;
