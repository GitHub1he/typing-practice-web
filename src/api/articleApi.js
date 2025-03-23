/**
 * 用户模块接口列表
 */

import axios from './utils/httpUtil'; // 导入http中创建的axios实例


const articleApi = {
  // 新闻列表    
  // articleList () {        
  // 	return axios.get(`${base.sq}/topics`);    
  // },    
  // 新闻详情,演示    
  // articleDetail (id, params) {        
  // 	return axios.get(`${base.sq}/topic/${id}`, {            
  // 		params: params        
  // 	});    
  // },
  // post提交    
  // login (params) {        
  // 	return axios.post(`${base.sq}/api/user/login`, qs.stringify(params));    
  // }
  // 其他接口…………


  //搜索个人文章
  search(params) {
    return axios.post(`/article/search`, params);
  },
  searchNotAudited(params) {
    return axios.post(`/article/notAudited`, params);
  },
  //收藏文章
  star(articleId) {
    return axios.post(`/article/pack?articleId=${articleId}`);
  },
  //点赞文章

  like(articleId) {
    return axios.post(`/article/star?articleId=${articleId}`);
  },
  //获取文章详情
  desc(articleId) {
    return axios.get(`/article/desc`, {
      params: {
        articleId: articleId
      }
    });
  },
  getNextArticle(articleId) {
    return axios.get(`/article/getNextArticleId`, {
      params: {
        articleId: articleId
      }
    });
  },
  //增加文章浏览量
  view(articleId) {
    return axios.post(`/article/view?articleId=${articleId}`);
  },
  //创建文章
  create(params) {
    return axios.post(`/article/create`, params);
  },
  //获取用户点赞或收藏文章列表
  starOrPack(params) {
    return axios.post(`/article/searchByUserStarOrPack`, params);
  },
  //获取用户创建文章列表
  userIdList(params) {
    return axios.post(`/article/searchByUserId`, params);
  },
  //删除文章
  delete(params) {
    return axios.post(`/article/del?articleId=${params}`);
  },
  //修改文章
  updata(params) {
    return axios.post(`/article/upd`, params);
  },
};

export default articleApi;
