import { searchUsersRequest, getMyProfileRequest, updateMyProfileRequest } from '../api';
import { getDataSignature } from '../utils';

export class User {
  _client;
  _keys;
  constructor(client) {
    this._client = client;
    this._keys = client.keys;
  }

  async searchUsers(walletAddress) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + walletAddress + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await searchUsersRequest({
      web3mq_signature,
      userid,
      timestamp,
      keyword: walletAddress,
    });
    return data;
  }

  async getMyProfile() {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await getMyProfileRequest({ web3mq_signature, userid, timestamp });
    return data;
  }

  async updateMyProfile(nickname, avatar_url) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await updateMyProfileRequest({
      web3mq_signature,
      userid,
      timestamp,
      nickname,
      avatar_url,
    });
    return data;
  }
}
