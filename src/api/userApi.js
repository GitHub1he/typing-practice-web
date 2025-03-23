/**
 * 用户模块接口列表
 */

import axios from './utils/httpUtil'; // 导入http中创建的axios实例
import store from '../store/index';


const userApi = {
  // 账密登录
  login(params) {
    return axios.post(`/user/login`, params);
  },
  // 获取用户信息
  getInfo(id) {
    if (id) {
      return axios.get(`/user/getInfo?id=${id}`);
    } else {
      return axios.get(`/user/getInfo`);
    }
  },
  // 验证码登录
  loginByYzm(params) {
    return axios.post(`/user/loginByYzm`, params);
  },
  // github登录
  loginByGithub(code) {
    return axios.get(`/user/loginByGithub?code=${code}`);
  },
  // 注册
  register(params) {
    return axios.post(`/user/account/register`, params);
  },
  //忘记密码
  forgetPassword(params) {
    return axios.post(`/user/password/forget`, params);
  },
  // 刷新access
  refreshAccess() {
    return axios.post('/user/refresh', {}, { headers: { 'REFRESH': store.state.user.refresh } });
  },
  //修改个人信息
  updateInfo(params) {
    return axios.post(`/user/updateOwn`, params);
  },
};

export default userApi;
