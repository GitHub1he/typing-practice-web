// 通用
import { notification } from 'ant-design-vue';
const utils = {
  /** 
   * 提示函数 
   * 禁止点击蒙层、显示一秒后关闭
   */
  tip(msg, type) {
    notification[type]({
      message: msg,
      showIcon: true
    });
  },

  /**
   * 获取是否有头像
   * @param {头像} avatar 
   * @returns true-有头像
   */
  isValidAvatar(avatar) {
    return ['1', '2', '3', '4'].includes(avatar);
  },

  /**
   * 获取头像imgPath
   * @param {头像} avatar 
   * @returns 头像imgPath
   */
  getAvatarSrc(avatar) {
    return utils.isValidAvatar(avatar) ? require(`@/assets/images/avatar/${avatar}.jpg`) : avatar;
  },

  objIsEmpty(obj) {
    return obj === null || obj === undefined;
  },

};
export default utils;
