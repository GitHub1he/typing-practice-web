<template>
    <div>正在处理 GitHub 登录...</div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import utils from '@/api/utils/generalUtil';

const store = useStore();
const router = useRouter();

onMounted(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    // 校验 state，防止 CSRF 攻击
    const savedState = localStorage.getItem('github_oauth_state');
    if (state !== savedState) {
        console.error('State validation failed!');
        return;
    }

    if (code) {
        try {
            await store.dispatch("loginByGithub", {
                code,
                success() {
                    console.log(store.state.user.user);
                    router.push({ name: 'home' });
                },
                error(e) {
                    console.error("登录报错：", e);
                    utils.tip("github登录失败,请重试或尝试其他登录方式", "error");
                    router.push({ name: 'login' });
                }
            });
        } catch (e) {
            console.error('调用 loginByGithub 出错:', e);
        }
    } else {
        console.error('GitHub 回调中未找到 code 参数');
    }
});

</script>