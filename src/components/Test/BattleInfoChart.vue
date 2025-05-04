<template>
    <div class="battle-info">

        <div id="speedChart" class="chart-container"></div>
        <div class="player-info">
            <div v-for="player in otherPlayerShowMap" :key="player.userId" class="player-card">
                <h3>{{ player.nickName }}</h3>
                <div class="stats">
                    <p>速度: {{ player.speed }}字/分</p>
                    <p>正确率: {{ Number(player.accuracy) * 100 }}%</p>
                    <p>用时: {{ player.actualDuration }}秒</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import {
    DatasetComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    TransformComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    DatasetComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    TransformComponent,
    LineChart,
    CanvasRenderer,
    LabelLayout,
    UniversalTransition
]);

const props = defineProps({
    otherPlayerShowMap: {
        type: Array,
        required: true
    }
});

let myChart = null;
// 修改数据结构，为每个用户存储历史数据
const speedData = ref({
    playerHistory: new Map() // 使用 Map 存储每个用户的历史数据
});

onMounted(() => {
    const chartDom = document.getElementById('speedChart');
    myChart = echarts.init(chartDom);
    initChart();

    // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
        myChart && myChart.resize();
    });
});

// 组件卸载时清理
onUnmounted(() => {
    window.removeEventListener('resize', () => {
        myChart && myChart.resize();
    });
    myChart && myChart.dispose();
});

watch(() => props.otherPlayerShowMap, (newVal) => {
    if (newVal && newVal.length > 0) {
        updateChartData(newVal);
    }
}, { deep: true });

const initChart = () => {
    const option = {
        title: {
            text: '实时速度对比'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                return params.map(param => {
                    return `${param.seriesName}: ${param.value[1]}字/分 (${param.value[0]}秒)`;
                }).join('<br/>');
            }
        },
        legend: {
            data: [],
            top: 25
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '时间(秒)',
            boundaryGap: false,
            axisLabel: {
                formatter: '{value}s'
            }
        },
        yAxis: {
            type: 'value',
            name: '速度(字/分)',
            axisLabel: {
                formatter: '{value}字/分'
            }
        },
        series: []
    };
    myChart.setOption(option);
};

const updateChartData = (players) => {
    if (!myChart) return;

    // 更新每个玩家的历史数据
    players.forEach(player => {
        const axisData = JSON.parse(player.axis);
        const nickname = axisData.nickname;

        if (!speedData.value.playerHistory.has(nickname)) {
            speedData.value.playerHistory.set(nickname, []);
        }

        const playerData = speedData.value.playerHistory.get(nickname);
        // 添加新的数据点
        playerData.push([Number(axisData.time), Number(axisData.speed)]);

        // 保持数据点按时间排序
        playerData.sort((a, b) => a[0] - b[0]);
    });

    // 生成图表数据
    const series = Array.from(speedData.value.playerHistory.entries()).map(([nickname, data]) => ({
        name: nickname,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data,
        emphasis: {
            focus: 'series'
        }
    }));

    const legendData = Array.from(speedData.value.playerHistory.keys());

    // 更新图表
    myChart.setOption({
        legend: {
            data: legendData
        },
        series: series
    });
};
</script>

<style scoped>
.battle-info {
    margin: 20px 0;
}

.player-info {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.player-card {
    background: #f0f2f5;
    padding: 15px;
    border-radius: 8px;
    min-width: 200px;
}

.player-card h3 {
    margin: 0 0 10px 0;
    color: #1890ff;
}

.stats p {
    margin: 5px 0;
}

.chart-container {
    height: 300px;
    width: 100%;
}
</style>