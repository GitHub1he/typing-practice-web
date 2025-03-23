/** 
 * api接口的统一出口
 */
// 文章模块接口
import userApi from '@/api/userApi';
import baseApi from './baseApi';
import articleApi from './articleApi';
import practiceApi from './practiceApi';
import rankApi from './rankApi';
// 其他模块的接口……

// 导出接口
export default {
  userApi,
  baseApi,
  articleApi,
  practiceApi,
  rankApi,
  // ……
};
