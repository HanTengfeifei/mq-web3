/*
 * @Author: HanTengfeifei 1157123521@qq.com
 * @Date: 2022-09-02 20:41:14
 * @LastEditors: HanTengfeifei 1157123521@qq.com
 * @LastEditTime: 2022-09-13 20:11:43
 * @FilePath: /mq-web3/src/connect/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Client } from '../client';
import { sendConnectCommand, GetContactBytes } from '../utils';
import { PbTypeConnectRespCommand, PbTypePingCommand, PbTypePongCommand } from '../core/pbType';
import { ConnectCommand, WebsocketPingCommand } from '../pb';
export class Connect {
  _client;
  timeout;
  timeoutObj;
  ws;
  nodeId;

  constructor(client) {
    this._client = client;
    this.ws = null;
    this.nodeId = '';
    this.timeout = 55000;
    this.timeoutObj = null;
    this.init();
  }
  init() {
    console.log(Client.wsUrl, 'Client.wsUrl');
    if (!('WebSocket' in window)) {
      throw new Error('Browser not supported WebSocket');
    }
    if (!Client.wsUrl) {
      throw new Error('The url is required!');
    }
    const wsconn = new WebSocket(Client.wsUrl);
    wsconn.binaryType = 'arraybuffer';

    wsconn.onopen = async () => {
      console.log('connection is successful');
      this.start();
      const concatArray = await sendConnectCommand(this._client.keys);
      wsconn.send(concatArray);
    };

    wsconn.onmessage = (event) => {
      this.reset();
      var respData = new Uint8Array(event.data);
      const PbType = respData[0];
      const bytes = respData.slice(1, respData.length);
      this.onMessageCallback(PbType, bytes);
    };
    this.ws = wsconn;
  }
  onMessageCallback(PbType, bytes) {
    switch (PbType) {
      case PbTypeConnectRespCommand:
        const { nodeId } = ConnectCommand.fromBinary(bytes);
        this.nodeId = nodeId;
        break;
      case PbTypePongCommand:
        return WebsocketPingCommand.fromBinary(bytes);
      default:
        this.receive(PbType, bytes);
        break;
    }
  }
  sendPing() {
    const { userid } = this._client.keys;
    if (this.ws === null) {
      throw new Error('WebSocket is not initialized');
    }
    if (userid == null) {
      throw new Error('GenreateAndSaveKeyPair first');
    }
    const timestamp = Date.now();
    const reqCommand = {
      timestamp: BigInt(timestamp),
    };
    let bytes = WebsocketPingCommand.toBinary(reqCommand);

    const concatArray = GetContactBytes(PbTypePingCommand, bytes);

    this.ws.send(concatArray);
  }
  reset() {
    if (this.timeoutObj !== null) {
      clearTimeout(this.timeoutObj);
      this.start();
    }
  }
  start() {
    this.timeoutObj = setTimeout(() => {
      this.sendPing();
    }, this.timeout);
  }
  send(arr) {
    if (!this.ws) {
      throw new Error('websocket Initialization failed');
    }
    return this.ws.send(arr);
  }
  // eslint-disable-next-line no-unused-vars
  receive(pbType, bytes) {}
}
