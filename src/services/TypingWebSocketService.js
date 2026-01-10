import WebSocketService from './WebSocketService';
import utils from '@/api/utils/generalUtil';

class TypingWebSocketService {
  constructor() {
    this.callbacks = {
      onModeChange: null,
      onContentUpdate: null,
      onMatchUpdate: null,
      onScoreUpdate: null
    };
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // 初始化WebSocket服务
  init() {
    WebSocketService.setCallbacks({
      onMessage: (res) => this.handleMessage(res),

      onDisconnect: () => {
        // 处理断连后的模式重置
        if (this.callbacks.onModeChange) {
          // 获取当前模式，判断是否需要重置
          // 这里需要通过回调获取当前模式
          if (this.callbacks.getCurrentMode) {
            const currentMode = this.callbacks.getCurrentMode();
            if (currentMode !== 'MODE_INDIVIDUAL_TEST_END' && 
                currentMode !== 'MODE_ONE_ON_ONE_END') {
              this.callbacks.onModeChange('MODE_CHANGE_MODE');
            }
          }
        }
      }
    });
  }

  // 处理业务相关消息
  handleMessage(res) {
    switch (res.code) {
      case 'C0006':
        // 提示消息
        if (this.callbacks.onTipMessage) {
          this.callbacks.onTipMessage(res.msg);
        } else {
          utils.tip(res.msg, "warning");
        }
        break;
      case 'C4000':
        // 个人测试相关消息
        this.handleIndividualTestMessage(res);
        break;
      case 'C4100':
        // 个人测试初始化
        if (res.msg === 'INIT' && this.callbacks.onIndividualTestInit) {
          this.callbacks.onIndividualTestInit();
        }
        break;
      case 'C5000':
        // 匹配相关消息
        this.handleMatchMessage(res);
        break;
      case 'C5100':
        // 准备相关消息
        this.handleReadyMessage(res);
        break;
      case 'C6000':
        // 一对一对战相关消息
        this.handleOneOnOneMessage(res);
        break;
      default:
        console.log("未处理的消息类型:", res);
        break;
    }
  }

  // 处理个人测试消息
  handleIndividualTestMessage(res) {
    if (res.msg === 'INIT') {
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('MODE_INDIVIDUAL_TEST_INIT');
      }
      if (this.callbacks.onContentUpdate) {
        this.callbacks.onContentUpdate(res.data);
      }
    } else if (res.msg === 'ING') {
      const parseDate = JSON.parse(res.data);
      if (this.callbacks.onProgressUpdate) {
        this.callbacks.onProgressUpdate(parseDate);
      }
    } else if (res.msg === 'COLLECT') {
      const parseDate = JSON.parse(res.data);
      if (this.callbacks.onCollectUpdate) {
        this.callbacks.onCollectUpdate(parseDate);
      }
    } else if (res.msg === 'END') {
      if (this.callbacks.onTestEnd) {
        this.callbacks.onTestEnd('MODE_INDIVIDUAL_TEST_END', JSON.parse(res.data));
      }
    }
  }

  // 处理匹配消息
  handleMatchMessage(res) {
    if (res.msg === 'MATCHING') {
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('MODE_MATCH_ING');
      }
      // 解析匹配状态数据（包含playerCount）
      if (res.data && this.callbacks.onMatchingStatusUpdate) {
        try {
          const matchingStatus = JSON.parse(res.data);
          this.callbacks.onMatchingStatusUpdate(matchingStatus);
        } catch (e) {
          console.error('解析匹配状态失败:', e);
        }
      }
    } else if (res.msg === 'CANCEL_MATCH') {
      utils.tip("取消匹配", "info");
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('MODE_CHANGE_MODE');
      }
    } else if (res.msg === 'MATCH_SUCCESS') {
      utils.tip("匹配成功", "info");
      const parseDate = JSON.parse(res.data);
      if (this.callbacks.onMatchSuccess) {
        this.callbacks.onMatchSuccess(parseDate);
      }
    } else if (res.msg === 'MATCH_FAIL') {
      utils.tip("匹配失败", "error");
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('MODE_CHANGE_MODE');
      }
    }
  }

  // 处理准备消息
  handleReadyMessage(res) {
    if (res.msg === 'READY') {
      const parseDate = JSON.parse(res.data);
      if (this.callbacks.onReadyUpdate) {
        this.callbacks.onReadyUpdate(parseDate);
      }
    } else if (res.msg === 'NONROOM') {
      utils.tip("准备失败，房间不存在", "error");
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('MODE_CHANGE_MODE');
      }
    }
  }

  // 处理一对一对战消息
  handleOneOnOneMessage(res) {
    if (res.msg === 'START') {
      if (this.callbacks.onModeChange) {
        this.callbacks.onModeChange('MODE_ONE_ON_ONE_WAIT');
      }
      if (this.callbacks.onContentUpdate) {
        this.callbacks.onContentUpdate(res.data);
      }
      if (this.callbacks.onCountdownStart) {
        this.callbacks.onCountdownStart();
      }
    } else if (res.msg === 'ING') {
      const parseDate = JSON.parse(res.data);
      if (this.callbacks.onProgressUpdate) {
        this.callbacks.onProgressUpdate(parseDate);
      }
    } else if (res.msg === 'COLLECT') {
      const parseDate = JSON.parse(res.data);
      if (this.callbacks.onCollectUpdate) {
        this.callbacks.onCollectUpdate(parseDate);
      }
    } else if (res.msg === 'END') {
      if (this.callbacks.onTestEnd) {
        this.callbacks.onTestEnd('MODE_ONE_ON_ONE_END', JSON.parse(res.data));
      }
    }
  }

  // 开始个人测试
  startIndividualTest(language) {
    WebSocketService.sendMessage(WebSocketService.getMsg('TEST_INDIVIDUAL', 'INIT', `${language}`));
  }

  // 发送个人测试进度
  sendIndividualProgress(content) {
    WebSocketService.sendMessage(WebSocketService.getMsg('TEST_INDIVIDUAL', 'ING', content));
  }

  // 请求收集数据
  requestCollect() {
    WebSocketService.sendMessage(WebSocketService.getMsg('TEST_INDIVIDUAL', 'COLLECT', ''));
  }

  // 结束个人测试
  endIndividualTest(content) {
    WebSocketService.sendMessage(WebSocketService.getMsg('TEST_INDIVIDUAL', 'END', content));
  }

  // 开始匹配
  startMatch(matchConfig) {
    // matchConfig: { matchMode: '0', language: '1' | '2' | '3' | '' }
    const payload = {
      matchMode: matchConfig.matchMode,
      language: matchConfig.language || ''
    };
    WebSocketService.sendMessage(WebSocketService.getMsg('MATCH', 'START', JSON.stringify(payload)));
  }

  // 取消匹配
  cancelMatch() {
    WebSocketService.sendMessage(WebSocketService.getMsg('MATCH', 'CANCEL'));
  }

  // 扩大匹配范围
  expandMatchRange() {
    WebSocketService.sendMessage(WebSocketService.getMsg('MATCH', 'EXPAND'));
  }

  // 请求匹配状态更新（用于刷新当前匹配人数）
  requestMatchingStatus() {
    WebSocketService.sendMessage(WebSocketService.getMsg('MATCH', 'STATUS'));
  }

  // 准备对战
  readyForBattle(roomId) {
    WebSocketService.sendMessage(WebSocketService.getMsg('PKONEONONE', 'READY', JSON.stringify({
      roomId: roomId
    }), roomId.toString()));
  }

  // 发送对战进度
  sendBattleProgress(content, roomId) {
    WebSocketService.sendMessage(WebSocketService.getMsg('PKONEONONE', 'ING', content, roomId.toString()));
  }

  // 请求对战数据收集
  requestBattleCollect(roomId) {
    WebSocketService.sendMessage(WebSocketService.getMsg('PKONEONONE', 'COLLECT', '', roomId.toString()));
  }

  // 结束对战
  endBattle(content, roomId) {
    WebSocketService.sendMessage(WebSocketService.getMsg('PKONEONONE', 'END', content, roomId.toString()));
  }
}

export default new TypingWebSocketService();