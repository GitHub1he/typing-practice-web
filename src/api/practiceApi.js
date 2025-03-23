/**
 * 练习模块接口列表
 */

import axios from './utils/httpUtil'; // 导入http中创建的axios实例


const practiceApi = {

  //练习随机选择文章
  random() {
    return axios.post(`/article/random`);
  },
  init(params) {
    return axios.post(`/exercise/init`, params);
  },
  start(params) {
    return axios.post(`/exercise/start`, params);
  },
  submit(params) {
    return axios.post(`/exercise/submit`, params);
  },
  view(params) {
    return axios.post(`/exercise/view`, params);
  },
  //查看成绩详情
  scoreGetInfo(practiceId) {
    return axios.get(`/score/getInfo/${practiceId}`);
  },
  //查看成绩列表
  query(params) {
    return axios.post(`/score/query`, params);
  },
};

export default practiceApi;
