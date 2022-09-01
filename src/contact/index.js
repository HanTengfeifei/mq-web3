import { getDataSignature } from '../utils';
import {
  searchContactRequest,
  getContactListRequest,
  sendFriendRequest,
  getMyFriendListRequset,
  getRreceiveFriendListRequests,
  operationFriendRequest,
} from '../api';

export class Contact {
  _client;
  _keys;
  contactList;
  myFriendRequestList;
  receiveFriendRequestList;

  constructor(client) {
    this._client = client;
    this._keys = client.keys;
    this.contactList = null;
    this.myFriendRequestList = null;
    this.receiveFriendRequestList = null;
  }

  async searchContact(walletAddress) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + walletAddress + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await searchContactRequest({
      web3mq_signature,
      userid,
      timestamp,
      keyword: walletAddress,
    });
    return data;
  }

  async getContactList(option) {
    const { emit } = this._client;

    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getContactListRequest({
      web3mq_signature,
      userid,
      timestamp,
      ...option,
    });
    this.contactList = data.result;
    emit('contact.getList', { type: 'contact.getList' });
  }

  async sendFriend(target_userid) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + target_userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await sendFriendRequest({ web3mq_signature, userid, timestamp, target_userid });
    return data;
  }

  async getMyFriendRequestList(option) {
    const { emit } = this._client;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getMyFriendListRequset({
      web3mq_signature,
      userid,
      timestamp,
      ...option,
    });
    this.myFriendRequestList = data.result;
    emit('contact.friendList', { type: 'contact.friendList' });
    // return data;
  }

  async getReceiveFriendRequestList(option) {
    const { emit } = this._client;

    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getRreceiveFriendListRequests({
      web3mq_signature,
      userid,
      timestamp,
      ...option,
    });
    this.receiveFriendRequestList = data.result;
    emit('contact.reviceList', { type: 'contact.reviceList' });
    // return data;
  }

  async operationFriend(target_userid, action = 'agree') {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + action + target_userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await operationFriendRequest({
      web3mq_signature,
      userid,
      timestamp,
      target_userid,
      action,
    });
    return data;
  }
}
