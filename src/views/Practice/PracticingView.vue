<template>
  <div class="header" @click="back">
    <ArrowLeftOutlined />&nbsp; 返回
  </div>
  <a-card>
    文章进度
    <a-progress :stroke-color="{
      '0%': '#108ee9',
      '100%': '#87d068',
    }" :percent=defaultPercent />
    <div class="title">
      <p>{{ articleInfo.title }}</p>&nbsp;
      <span>字数：{{ articleInfo.wordNums }}</span>
    </div>
    <ModeThree ref="childComp" v-if="practiceInfo.mode === 3" @updataTimeRangeStatus="updataTimeRangeStatus" />
    <ModeTwo ref="childComp" v-if="practiceInfo.mode === 2" @updataTimeRangeStatus="updataTimeRangeStatus" />
    <ModeOne ref="childComp" v-if="practiceInfo.mode === 1" @updataTimeRangeStatus="updataTimeRangeStatus" />
  </a-card>
  <div class="other">
    <div>
      <DashboardOutlined />
      时间：<span v-if="timeRangeStatus === 0">{{ practiceInfo.selectedTimeRange }}&nbsp;分&nbsp;00&nbsp;秒</span>
      <span v-else-if="timeRangeStatus === -1">不限</span>
      <PracticeTimer v-else :practiceContent="practiceContent" :selectedTimeRange="practiceInfo.selectedTimeRange"
        :style="{ display: 'inline-block' }" @onFinish="onFinish" @typing="typing" ref="TimerComp" />
    </div>
    <div>
      <LineChartOutlined />
      速度：{{ speedTpying }}字/分
    </div>
    <div>
      <CarryOutOutlined />
      正确率：{{ accuracy }}%
    </div>
    <div>
      <MonitorOutlined />
      字体：
      <PlusSquareTwoTone @click="largeFontSize" />&nbsp;
      <MinusSquareTwoTone @click="smallFontSize" />
    </div>
    <div>
      <a-button @click="onTry">切换视图</a-button>
    </div>
  </div>
  <div class="submit">
    <a-button type="primary" @click="submit" v-if="isJump">提交</a-button>
    <a-button type="primary" @click="handleOk2" v-else>查看成绩</a-button>
  </div>
  <a-modal v-model:open="open1" title="是否提交文章" @ok="handleOk1">
    <p>是否提交文章，提交后将无法再进行打字</p>
  </a-modal>
  <a-modal v-model:open="open2" title="练习结束" @ok="handleOk2" @cancel="handleCancel" cancelText="返回" okText="查看成绩"
    :closable=false :keyboard=false :maskClosable=false
    :bodyStyle="{ textAlign: 'left', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px', fontSize: '16px' }"
    :style="{ textAlign: 'center' }">
    <p>文章：{{ articleInfo.title }}</p>
    <p>速度：{{ grades.speed }}字/分</p>
    <p>正确率：{{ grades.accuracy }}%</p>
    <p>实际用时：{{ grades.actualDuration }}秒</p>
    <p>分数：{{ grades.rate }}</p>
    <p>错字数：{{ grades.incorrectWc }}</p>
    <p>多字数：{{ grades.moreCount }}</p>
    <p>少字数：{{ grades.missingWc }}</p>
    <p>完成率：{{ defaultPercent }}%</p>
  </a-modal>
</template>

<script setup>
import { ref, defineEmits, inject, onMounted, provide } from 'vue';
import { LineChartOutlined, CarryOutOutlined, DashboardOutlined, MonitorOutlined, PlusSquareTwoTone, MinusSquareTwoTone, ArrowLeftOutlined } from '@ant-design/icons-vue';
import ModeThree from '@/components/Practice/ModeThree.vue';
import ModeTwo from '../../components/Practice/ModeTwo.vue';
import ModeOne from '../../components/Practice/ModeOne.vue';
import api from '../../api';
import { useStore } from 'vuex';
import PracticeTimer from '../../components/Practice/PracticeTimer.vue';
import utils from '../../api/utils/generalUtil';


const defaultPercent = ref(0);
const emit = defineEmits(['beforePractice']);
const practiceInfo = ref(inject('practiceInfo'));
const articleInfo = ref(inject('articleInfo'));
const timeRangeStatus = ref(0);
const open1 = ref(false);
const open2 = ref(false);
const isJump = ref(true);
const practiceContent = ref();
const store = useStore();
const scoreInfo = ref({});
const grades = ref({
  speed: '',
  accuracy: '',
  actualDuration: '',
  rate: '',
  incorrectWc: '',
  moreCount: '',
  missingWc: '',
});
const isStarted = ref(false);
const submitStatus = ref();
const speedTpying = ref(0);
const accuracy = ref(0);
const timeSpeedArray = ref([]);

const inputContent = ref('');

const updataTimeRangeStatus = (newValue, practiceCon, isStart, typingInfo) => {
  if (newValue === -1) {
    timeRangeStatus.value = -1;
  } else {
    timeRangeStatus.value = newValue;
  }
  practiceContent.value = practiceCon;
  isStarted.value = isStart;
  accuracy.value = Number(typingInfo.accuracy.value);
  defaultPercent.value = Number(typingInfo.inputProgress.value);
};
onMounted(() => {
  if (practiceInfo.value.selectedTimeRange === -1) {
    timeRangeStatus.value = -1;
  }
});
const childComp = ref();
const onTry = () => {
  childComp.value.updateIsSideBySide();
};
const largeFontSize = () => {
  childComp.value.increaseFontSize();
};
const smallFontSize = () => {
  childComp.value.decreaseFontSize();
};
const back = () => {
  if (!isStarted.value || !isJump.value) {
    emit('beforePractice', 0);
  } else {
    utils.tip("练习过程中不能退出，请提交成绩后退出", "error");
  }
};
const submit = () => {
  open1.value = true;
};

const typing = (val1, val2) => {
  speedTpying.value = val1;
  timeSpeedArray.value = val2;
  console.log(speedTpying.value, timeSpeedArray.value);
};
const onFinish = (val1, val2) => {
  if (val1 || val2) {
    speedTpying.value = val1;
    timeSpeedArray.value = val2;
    console.log(speedTpying.value, timeSpeedArray.value);
  } else {
    const times = ref(timeSpeedArray.value.map(item => item.time));
    const speeds = ref(timeSpeedArray.value.map(item => item.speed));
    if (practiceContent.value) {
      submitStatus.value = 1;
    } else {
      submitStatus.value = 2;
    }
    open2.value = true;
    api.practiceApi.submit({
      id: practiceInfo.value.practiceId,
      content: practiceContent.value,
      status: submitStatus.value,
      axisXData: JSON.stringify(times.value),
      axisYData: JSON.stringify(speeds.value),
    }).then(res => {
      if (res.data.success) {
        if (res.data.data) {
          grades.value = res.data.data;
        }
      } else {
        emit('beforePractice', 0);
      }
    });
    if (submitStatus.value === 2) {
      emit('beforePractice', 0);
      utils.tip("此次练习不计入成绩", "error");
    }
  }

};
const TimerComp = ref();
const handleOk1 = () => {
  open1.value = false;
  if (timeRangeStatus.value !== -1 && practiceContent.value !== '') {
    if (TimerComp.value && TimerComp.value.stopCountdown) {
      TimerComp.value.stopCountdown();
    } else {
      onFinish();
    }
  } else {
    onFinish();
  }
};
const handleOk2 = () => {
  open2.value = false;
  api.practiceApi.scoreGetInfo(practiceInfo.value.practiceId).then(res => {
    if (res.data.success) {
      scoreInfo.value = res.data.data;
      emit('beforePractice', 2, scoreInfo.value);
    } else {
      utils.tip("成绩有误", "error");
    }
  });
};
const handleCancel = () => {
  //调返回的接口
  //提交变成查看成绩按钮
  isJump.value = false;
  api.practiceApi.view({
    id: practiceInfo.value.practiceId,
    content: practiceContent.value,
    userId: store.state.user.user.userId,
  }).then(res => {
    if (res.data.success) {
      inputContent.value = res.data.data.inputContent;
    }
  });
};
provide('inputContent', inputContent,);
</script>

<style scoped>
.other {
  width: 12%;
  height: 25rem;
  position: absolute;
  top: 2rem;
  right: 1rem;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 1.25rem;
  box-sizing: border-box;
  background-color: #fff;
}

.other>div {
  margin: 1rem 0;
}

.ant-card {
  width: 70%;
  margin: 1rem auto;
}

.title {
  text-align: center;
}

.title p {
  margin: 5px 0;
}

.other div:last-child {
  text-align: center;
}

.header {
  font-size: 18px;
  position: absolute;
  left: 10px;
  cursor: pointer;
}

.submit {
  position: absolute;
  right: 4rem;
  top: 40rem;
}

.ant-statistic {
  display: inline-block;
}
</style>
