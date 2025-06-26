<template>
    <a-card title="对战详情" :headStyle="{ textAlign: 'center' }" class="battle-card">
        <div class="battle-header">
            <div class="battle-title">
                <trophy-outlined v-if="winner" class="trophy-icon" />
                <h2>{{ battleInfo.list[0]?.title || '对战记录' }}</h2>
            </div>
            <a-tag color="#108ee9">{{ formatMode(battleInfo.list[0]?.mode) }}</a-tag>
        </div>

        <!-- 胜利者展示 -->
        <div v-if="winner" class="winner-section">
            <div class="winner-badge">
                <crown-outlined class="crown-icon" />
                <span>胜利者: {{ winner.nickName }}</span>
            </div>
        </div>

        <!-- 对战图表 -->
        <div class="chart-container">
            <div class="chart-header">
                <h3>速度对比图</h3>
                <div class="chart-tools">
                    <a-tooltip title="重置缩放">
                        <button class="tool-button" @click="resetZoom">
                            <fullscreen-outlined />
                        </button>
                    </a-tooltip>
                </div>
            </div>
            <div class="chart-wrapper">
                <div ref="battleChart" class="battle-chart"></div>
            </div>
        </div>

        <!-- 对战选手列表 -->
        <div class="players-section">
            <h3>对战选手</h3>
            <a-list :dataSource="battleInfo.list" :grid="{ gutter: 16, column: battleInfo.list.length > 1 ? 2 : 1 }">
                <template #renderItem="{ item }">
                    <a-list-item>
                        <a-card :class="['player-card', item === winner ? 'winner-card' : '']">
                            <template #title>
                                <div class="player-header">
                                    <div @click="routeUserInfo(item.userId)" style="cursor: pointer;">
                                        <a-avatar :src="utils.getAvatarSrc(item.avatar)">
                                        </a-avatar>{{ item.nickName }}
                                    </div>
                                    <div v-if="item === winner" class="winner-tag">
                                        <crown-outlined /> 胜利者
                                    </div>
                                </div>
                            </template>
                            <div class="player-stats">
                                <div class="stat-item">
                                    <div class="stat-label">速度</div>
                                    <div class="stat-value">{{ item.speed }} 字/分</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">正确率</div>
                                    <div class="stat-value">{{ item.accuracy }}%</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">用时</div>
                                    <div class="stat-value">{{ item.actualDuration }} 秒</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">总字数</div>
                                    <div class="stat-value">{{ item.totalWc }} 字</div>
                                </div>
                            </div>
                        </a-card>
                    </a-list-item>
                </template>
            </a-list>
        </div>

        <!-- 错误详情折叠面板 -->
        <a-collapse class="error-collapse" ghost>
            <a-collapse-panel v-for="(item, index) in battleInfo.list" :key="index" :header="`${item.nickName} 的错误详情`">
                <!-- 错字信息展示 -->
                <div v-if="getReplacements(item).length > 0" class="error-section">
                    <div class="section-title">错字详情：</div>
                    <a-table :dataSource="formatReplacements(item)" :columns="replacementColumns" :pagination="false"
                        size="small" />
                </div>

                <!-- 少字信息展示 -->
                <div v-if="getMissingChars(item).length > 0" class="error-section">
                    <div class="section-title">少字详情：</div>
                    <a-tag v-for="char in getMissingChars(item)" :key="char" color="orange" style="margin: 4px">
                        {{ getSpecialCharName(char) }}
                    </a-tag>
                </div>

                <!-- 多字信息展示 -->
                <div v-if="getMoreChars(item).length > 0" class="error-section">
                    <div class="section-title">多字详情：</div>
                    <a-tag v-for="char in getMoreChars(item)" :key="char" color="red" style="margin: 4px">
                        {{ getSpecialCharName(char) }}
                    </a-tag>
                </div>

                <div v-if="getReplacements(item).length === 0 && getMissingChars(item).length === 0 && getMoreChars(item).length === 0"
                    class="perfect-section">
                    <check-circle-outlined /> 完美无错误！
                </div>
            </a-collapse-panel>
        </a-collapse>
    </a-card>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import utils from '@/api/utils/generalUtil';
import * as echarts from 'echarts';
import router from '@/router';
import {
    TrophyOutlined,
    CrownOutlined,
    UserOutlined,
    FullscreenOutlined,
    CheckCircleOutlined
} from '@ant-design/icons-vue';

const battleInfo = inject('battleInfo');
const battleChart = ref(null);
let myChart = null;

// 特殊字符映射表
const specialCharMap = {
    '\n': '换行符',
    ' ': '空格',
    '\t': '制表符',
    '\r': '回车符',
    '\f': '换页符',
    '\v': '垂直制表符'
};

// 获取特殊字符的中文名称
const getSpecialCharName = (char) => {
    return specialCharMap[char] || char;
};

// 格式化模式
const formatMode = (mode) => {
    const modeMap = {
        1: '模式一',
        2: '模式二',
        3: '模式三',
        4: '1v1'
    };
    return modeMap[mode] || `模式${mode}`;
};

// 计算胜利者
const winner = computed(() => {
    if (!battleInfo.value || !battleInfo.value.list || battleInfo.value.list.length <= 1) {
        return null;
    }

    // 按速度排序，速度最快的为胜利者
    return [...battleInfo.value.list].sort((a, b) => b.speed - a.speed)[0];
});

// 解析错字信息
const getReplacements = (item) => {
    if (!item.replacements) return [];
    try {
        return JSON.parse(item.replacements);
    } catch (e) {
        console.error('解析replacements失败', e);
        return [];
    }
};

// 格式化错字信息，将特殊字符替换为中文描述
const formatReplacements = (item) => {
    return getReplacements(item).map(rep => ({
        ...rep,
        sourceChar: getSpecialCharName(rep.sourceChar),
        inputChar: getSpecialCharName(rep.inputChar)
    }));
};

// 解析少字信息
const getMissingChars = (item) => {
    if (!item.missingChars) return [];
    try {
        return JSON.parse(item.missingChars);
    } catch (e) {
        console.error('解析missingChars失败', e);
        return [];
    }
};

// 解析多字信息
const getMoreChars = (item) => {
    if (!item.moreChars) return [];
    try {
        return JSON.parse(item.moreChars);
    } catch (e) {
        console.error('解析moreChars失败', e);
        return [];
    }
};

// 错字表格列定义
const replacementColumns = [
    {
        title: '原字符',
        dataIndex: 'sourceChar',
        key: 'sourceChar',
        width: '40%',
        align: 'center',
    },
    {
        title: '输入字符',
        dataIndex: 'inputChar',
        key: 'inputChar',
        width: '40%',
        align: 'center',
    },
];

// 重置图表缩放
const resetZoom = () => {
    if (myChart) {
        myChart.dispatchAction({
            type: 'dataZoom',
            start: 0,
            end: 100
        });
    }
};

// 路由到用户信息页面
const routeUserInfo = (id) => {
    router.push({
        name: "user",
        query: {
            userId: id,
        }
    });
};

onMounted(() => {
    if (battleChart.value) {
        myChart = echarts.init(battleChart.value);

        // 准备图表数据
        const series = battleInfo.value.list.map(item => {
            return {
                name: item.nickName,
                type: 'line',
                data: JSON.parse(item.axisYData),
                smooth: true,
                emphasis: {
                    focus: 'series'
                },
                // 为胜利者添加特殊样式
                lineStyle: item === winner.value ? {
                    width: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    shadowBlur: 10
                } : {}
            };
        });

        // 设置图表选项
        const option = {
            title: {
                text: '对战速度曲线',
                left: 'center',
                top: 0
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    let result = `时间: ${params[0].axisValue}秒<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${param.value} 字/分<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: battleInfo.value.list.map(item => item.nickName),
                top: 30
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: 80,
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: JSON.parse(battleInfo.value.list[0].axisXData),
                name: '时间(秒)'
            },
            yAxis: {
                type: 'value',
                name: '速度(字/分)'
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    start: 0,
                    end: 100
                }
            ],
            series: series
        };

        myChart.setOption(option);

        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    }
});
</script>

<style scoped>
.battle-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.battle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.battle-title {
    display: flex;
    align-items: center;
}

.trophy-icon {
    font-size: 24px;
    color: #faad14;
    margin-right: 10px;
}

.winner-section {
    background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    text-align: center;
    border: 1px solid #ffe58f;
}

.winner-badge {
    display: inline-flex;
    align-items: center;
    background-color: #fff;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.crown-icon {
    color: #faad14;
    font-size: 20px;
    margin-right: 8px;
}

.chart-container {
    margin: 20px 0;
    background-color: #fafafa;
    border-radius: 8px;
    padding: 16px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.chart-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.chart-tools {
    display: flex;
    gap: 8px;
}

.tool-button {
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tool-button:hover {
    color: #1890ff;
    border-color: #1890ff;
}

.chart-wrapper {
    position: relative;
}

.battle-chart {
    height: 400px;
    width: 100%;
}

.players-section {
    margin: 20px 0;
}

.player-card {
    border-radius: 8px;
    transition: all 0.3s;
}

.winner-card {
    border: 2px solid #faad14;
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.2);
}

.player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.winner-tag {
    color: #faad14;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.player-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 16px;
}

.stat-item {
    text-align: center;
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 6px;
}

.stat-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.error-collapse {
    margin-top: 20px;
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
}

.error-section {
    margin: 12px 0;
}

.section-title {
    font-weight: 500;
    margin-bottom: 8px;
    color: #333;
}

.perfect-section {
    text-align: center;
    color: #52c41a;
    font-size: 16px;
    padding: 16px;
    background-color: #f6ffed;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
</style>