import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import { setupAntd } from '../src/ant-design-vue/index';
import index from './api/index'; // 导入api接口
import './assets/font/fonts.css';

const app = createApp(App);
app.use(router);
app.use(store);
setupAntd(app);
app.use(index);
// Vue.prototype.$api = index; // 将api挂载到vue的原型上

app.mount('#app');
