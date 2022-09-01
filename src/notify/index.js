import { changeNotificationStatusRequest } from '../api';
import { getDataSignature } from '../utils';

export class Notify {
  _client;
  _keys;
  notificationList;
  constructor(client) {
    this._client = client;
    this._keys = client.keys;
    this.notificationList = null;
  }

  async changeNotificationStatus(messages, status = 'delivered') {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + status + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await changeNotificationStatusRequest({
      web3mq_signature,
      userid,
      timestamp,
      messages,
      status,
    });
    return data;
  }

  receiveNotify(notificationList) {
    console.log('notify class -------', notificationList);
    this.notificationList = notificationList;
    this._client.emit('notification.getList', { type: 'notification.getList' });
  }
}
