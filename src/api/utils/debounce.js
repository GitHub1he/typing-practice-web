// 防抖
import { ref } from 'vue';
import utils from './generalUtil';
export function useDebounce() {
  const isDebounced = ref(false);

  function debounce(func, delay) {
    return (...args) => {
      if (isDebounced.value) {
        utils.tip('点击太快了', "warning");
        return;
      }

      isDebounced.value = true;
      func(...args);

      setTimeout(() => {
        isDebounced.value = false;
      }, delay);
    };
  }

  return {
    debounce,
  };
}
