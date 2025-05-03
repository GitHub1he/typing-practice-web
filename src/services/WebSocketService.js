import baseUrl from '@/api/base';
import api from '@/api/index.js';
import utils from '@/api/utils/generalUtil';
import resProtoRoot from '../js/resProto.js';
import reqProtoRoot from '../js/reqProto.js';
import { ReqMsg } from '../js/ReqMsg';
import store from '@/store'; // 直接导入 store 实例

class WebSocketService {
  constructor() {
    this.ws = null;
    this.status = 'init'; // 'init', 'connected', 'connecting', 'disconnected'
    this.pingTimer = null;
    this.pingTime = 12000; // 心跳间隔，12秒
    this.heartbeat = '[0513]';
    this.retryCount = 0;
    this.maxRetries = 1;
    this.confirmCode = null;
    this.callbacks = {
      onStatusChange: null,
      onMessage: null,
      onError: null,
      onReconnect: null,
      onDisconnect: null  // 添加断连回调
    };
    
    // 获取消息类型
    this.reqType = reqProtoRoot.lookupType("RequestMsg");
    this.resType = resProtoRoot.lookupType("RespMsg");
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // 更新状态并触发回调
  updateStatus(status) {
    this.status = status;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status);
    }
  }

  // 连接WebSocket
  connect() {
    return new Promise((resolve, reject) => {
      api.baseApi.getWsAddr()
        .then(() => {
          this.updateStatus('connecting');
          // 使用导入的 store 实例
          this.ws = new WebSocket(`${baseUrl.wsUrl}?a=${store.state.user.access}`);
          
          this.ws.onopen = () => {
            this.sendMessage(this.getMsg('CONNECT'));
          };
  
          this.ws.onmessage = (event) => this.handleMessage(event, resolve);
          
          this.ws.onerror = (error) => {
            this.updateStatus('disconnected');
            console.error('WebSocket connection error:', error);
            this.retryCount++;
            if (this.retryCount <= this.maxRetries) {
              setTimeout(() => this.connect(), 2000);
            } else {
              if (this.callbacks.onError) {
                this.callbacks.onError(error);
              }
              reject(error);
            }
          };

          this.ws.onclose = () => {
            this.logout();
            console.log('WebSocket connection closed');
          }
        })
        .catch(error => {
          console.error('获取WebSocket地址失败:', error);
          reject(error);
        });
    });
  }

  // 处理接收到的消息
  handleMessage(event, resolve) {
    // 处理心跳消息
    if (event.data === 'CONFIRM_HEARTBEAT') {
      this.sendMessage(this.heartbeat);
      return;
    }
    if (event.data === '[1128]') {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = new Uint8Array(e.target.result);

      try {
        const res = this.decodeMessage(buffer);
        console.log("Decoded message:", res);
        
        // 处理基础连接相关的消息
        switch (res.code) {
          case 'C0001':
            // 连接成功
            this.startHeartbeat();
            this.updateStatus('connected');
            resolve();
            break;
          case 'C00011':
            // 确认重新登录
            this.confirmCode = res.data;
            if (this.callbacks.onReconnect) {
              this.callbacks.onReconnect(res.data);
            }
            break;
          case 'C0002':
            // 连接失败
            this.ws.close();
            break;
          case 'C0003':
            // 被重连
            this.ws.close();
            utils.tip('异地登录', 'warning');
            break;
          case 'C0004':
            // 登出
            this.updateStatus('disconnected');
            break;
          default:
            // 其他业务消息交给回调处理
            if (this.callbacks.onMessage) {
              this.callbacks.onMessage(res);
            }
            break;
        }
      } catch (error) {
        console.error("Error decoding message:", error);
      }
    };

    reader.readAsArrayBuffer(event.data);
  }

  // 登出
  logout() {
    if (this.ws) {
      this.sendMessage(this.getMsg('LOGIN_OUT'));
      this.ws.onclose = null;
      this.ws.close();
    }
    clearTimeout(this.pingTimer);
    this.updateStatus('disconnected');

    // 通知断连事件，让回调处理模式重置
    if (this.callbacks.onDisconnect) {
      this.callbacks.onDisconnect();
    }
  }

  // 开始心跳
  startHeartbeat() {
    this.pingTimer = setTimeout(() => {
      if (this.status !== 'connected') {
        return false;
      }
      this.sendMessage(this.heartbeat);
      clearTimeout(this.pingTimer);
      this.startHeartbeat();
    }, this.pingTime);
  }

  // 发送消息
  sendMessage(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }

  // 重新连接确认
  confirmReconnect() {
    this.sendMessage(this.getMsg('RECONNECT'));
  }

/**
 * 获取不同类型的报文
 * @param type 消息类型：'CONNECT'、'RECONNECT'、'LOGIN_OUT'、'TEST_INDIVIDUAL'、'MATCH'
 * @param contentType head.msgContentType
 * @param data body.data
 */
  getMsg(type, contentType, data, roomId) {
    const reqMsg = new ReqMsg();
    // 使用导入的 store 实例
    reqMsg.head.userId = store.state.user.user.userId;
    reqMsg.head.timestamp = Math.floor(Date.now() / 1000);
    
    switch (type) {
      case 'CONNECT':
        reqMsg.head.msgType = 1;
        break;
      case 'RECONNECT':
        reqMsg.head.msgType = 2;
        reqMsg.body.data = this.confirmCode;
        break;
      case 'LOGIN_OUT':
        reqMsg.head.msgType = -2;
        break;
      case 'TEST_INDIVIDUAL':
        reqMsg.head.msgType = 4;
        reqMsg.head.msgContentType = contentType;
        reqMsg.body.data = data;
        break;
      case 'MATCH':
        reqMsg.head.msgType = 5;
        reqMsg.head.msgContentType = contentType;
        reqMsg.body.data = data;
        break;
      case 'PKONEONONE':
        reqMsg.head.msgType = 6;
        reqMsg.head.roomId = roomId;
        reqMsg.head.msgContentType = contentType;
        reqMsg.body.data = data;
        break;
      default:
        reqMsg.head.msgType = 9;
        break;
    }

    console.log('msg:', reqMsg);
    return this.encodeMessage(reqMsg);
  }

  // 编码函数,使用请求报文编码
  encodeMessage(msgObj) {
    const errMsg = this.reqType.verify(msgObj);
    if (errMsg) throw Error(errMsg);

    const message = this.reqType.create(msgObj);
    const buffer = this.reqType.encode(message).finish();
    return buffer;
  }

  // 解码消息
  decodeMessage(buffer) {
    const message = this.resType.decode(buffer);
    return this.resType.toObject(message);
  }
}

export default new WebSocketService();