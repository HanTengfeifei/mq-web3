import {
  createRoomRequest,
  getRoomListRequest,
  getGroupMemberListRequest,
  inviteGroupMemberRequest,
} from '../api';
import { getDataSignature } from '../utils';

export class Channel {
  _client;
  _keys;
  channelList;
  activeChannel;

  constructor(client) {
    this._client = client;
    this._keys = client.keys;
    this.channelList = null;
    this.activeChannel = null;
  }

  setActiveChannel(channel) {
    this.activeChannel = channel;
    this._client.emit('channel.activeChange', { type: 'channel.activeChange' });
  }

  async queryChannels(option) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const {
      data: { result = [] },
    } = await getRoomListRequest({ web3mq_signature, userid, timestamp, ...option });
    if (this.channelList && option.page !== 1) {
      this.channelList = [...this.channelList, ...result];
    } else {
      this.channelList = result;
    }
    if (Array.isArray(this.channelList) && this.channelList.length > 0) {
      this.setActiveChannel(this.channelList[0]);
    }
    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  async createRoom() {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data = { groupid: '' } } = await createRoomRequest({
      web3mq_signature,
      userid,
      timestamp,
    });
    if (!this.channelList) {
      return;
    }
    this.channelList = [{ topic: data.groupid, topic_type: 'group' }, ...this.channelList];
    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  async getGroupMemberList(option) {
    const groupid = this.activeChannel.topic;
    if (groupid) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await getGroupMemberListRequest({
        web3mq_signature,
        userid,
        timestamp,
        groupid,
        ...option,
      });
      return data;
    }
  }

  async inviteGroupMember(members) {
    const groupid = this.activeChannel.topic;
    if (groupid) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await inviteGroupMemberRequest({
        web3mq_signature,
        userid,
        timestamp,
        groupid,
        members,
      });
      return data;
    }
  }
}
