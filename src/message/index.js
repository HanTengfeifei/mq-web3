import { sendMessageCommand, getDataSignature, renderMessagesList } from '../utils';
import { getMessageListRequest, changeMessageStatusRequest } from '../api';
import {
  PbTypeNotificationListResp,
  PbTypeMessageStatusResp,
  PbTypeMessageChangeStatus,
} from '../core/pbType';
import {
  Web3MQChangeMessageStatus,
  Web3MQMessageListResponse,
  Web3MQMessageStatusResp,
} from '../pb/message';

export class Message {
  _client;
  _keys;
  messageList;

  constructor(client) {
    this._client = client;
    this._keys = client.keys;
    client.connect.receive = this.receive;
    this.messageList = null;
  }

  async getMessageList(option) {
    const topic = this._client.channel.activeChannel?.topic;
    if (topic) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const msg = userid + topic + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, msg);
      const {
        data: { result = [] },
      } = await getMessageListRequest({ userid, timestamp, web3mq_signature, topic, ...option });
      const data = await renderMessagesList(result);
      this.messageList = data.reverse() ?? [];
      this._client.emit('message.getList', { type: 'message.getList' });
      // return data;
    }
  }

  /**
   * if message from group chat: topic = group id
   * if message from one chat: topic = userid
   */
  async changeMessageStatus(messages, status = 'delivered') {
    const topic = this._client.channel.activeChannel?.topic;
    if (topic) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + status + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await changeMessageStatusRequest({
        topic,
        web3mq_signature,
        timestamp,
        userid,
        messages,
        status,
      });
      return data;
    }
  }

  async sendMessage(msg) {
    const { keys, connect, channel } = this._client;
    if (channel.activeChannel) {
      const { topic } = channel.activeChannel;
      const concatArray = await sendMessageCommand(keys, topic, msg, connect.nodeId);
      connect.send(concatArray);
    }
  }
  receive(pbType, bytes) {
    if (pbType === PbTypeNotificationListResp) {
      console.log('Receive notification');
      const notificationList = Web3MQMessageListResponse.fromBinary(bytes);
      console.log('Receive notification----------', notificationList);
      this._client.notify.receiveNotify(notificationList);
    }
    if (pbType === PbTypeMessageStatusResp) {
      const resp = Web3MQMessageStatusResp.fromBinary(bytes);
      console.log('msgStatus:', resp);
      this._client.emit('message.delivered', { type: 'message.delivered', data: resp });
    }
    if (pbType === PbTypeMessageChangeStatus) {
      const resp = Web3MQChangeMessageStatus.fromBinary(bytes);
      console.log('changeMsgStatus:', resp);
    }
  }
}
