<template>
  <div ref="chart" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';

import { defineProps } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});
const chart = ref(null);

let myChart;

onMounted(() => {
  myChart = echarts.init(chart.value);
  drawChart(myChart, props.data);
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
  }
});
// 监听数据变化并重绘图表
watch(() => props.data, (newData) => {
  if (myChart) {
    drawChart(myChart, newData);
  }
}, { deep: true });
const drawChart = (myChart, data) => {
  const option = {
    xAxis: {
      type: 'category',
      data: data.xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.seriesData,
      type: 'line',
      label: {
        show: true,
        position: 'bottom',
        textStyle: {
          fontSize: 12
        }
      },
      smooth: true
    }],

  };
  myChart.setOption(option);
};
</script>
