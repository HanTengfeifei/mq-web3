import * as ed from '@noble/ed25519';
import { Web3MQRequestMessage } from './pb/index';
const ByteArrayToHexString = (byteArray) => {
  return Array.from(byteArray, (byte) => ('0' + (byte & 0xff).toString(16)).slice(-2)).join('');
};
export const GenerateEd25519KeyPair = async () => {
  let privateObj = ed.utils.randomPrivateKey();
  let pubkeyObj = await ed.getPublicKey(privateObj);
  let PrivateKey = ByteArrayToHexString(privateObj);
  let PublicKey = ByteArrayToHexString(pubkeyObj);
  return {
    PrivateKey,
    PublicKey,
  };
};
export const selectUrl = (type = 'http', url = 'us-west-2.web3mq.com') => {
  let Domain = url;
  // Domain = 'ap-singapore-1.web3mq.com';

  const BASE_URL = `https://${Domain}`;
  const BASE_WS = `ws://${Domain}/messages`;

  if (type === 'ws') {
    return BASE_WS;
  }
  return BASE_URL;
};
export const getCurrentDate = () => {
  const d = new Date();
  return (
    ('0' + d.getDate()).slice(-2) +
    '/' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '/' +
    d.getFullYear() +
    ' ' +
    ('0' + d.getHours()).slice(-2) +
    ':' +
    ('0' + d.getMinutes()).slice(-2)
  );
};
const Uint8ToBase64String = (u8a) => {
  return btoa(String.fromCharCode.apply(null, u8a));
};
const GenerateMessageID = async (from, topic, timestamp, payload) => {
  return sha3_224.update(from).update(topic).update(timestamp.toString()).update(payload).hex();
};
export const getDataSignature = async (PrivateKey, signContent) => {
  if (!PrivateKey) {
    throw new Error('Ed25519PrivateKey not found');
  }
  const signature = await ed.sign(new TextEncoder().encode(signContent), PrivateKey);
  return Uint8ToBase64String(signature);
};
export const GetContactBytes = (command, bytes) => {
  const concatArray = new Uint8Array(bytes.length + 1);
  concatArray[0] = command;
  for (let i = 0; i < bytes.length; i++) {
    concatArray[i + 1] = bytes[i];
  }
  return concatArray;
};
export const sendMessageCommand = async (keys, topic, msg, nodeId) => {
  const { userid, PrivateKey } = keys;
  const timestamp = Date.now();
  const cipherSuite = 'NONE';
  var byteData = new TextEncoder().encode(msg);

  const msgid = await GenerateMessageID(userid, topic, timestamp, byteData);

  const signContent = msgid + userid + topic + nodeId + timestamp.toString();
  const fromSign = await getDataSignature(PrivateKey, signContent);

  const needStore = true;

  const msgReq = {
    payload: byteData,
    contentTopic: topic,
    version: 1,
    comeFrom: userid,
    fromSign,
    payloadType: 'text/plain; charset=utf-8',
    cipherSuite: cipherSuite,
    needStore: needStore,
    timestamp: BigInt(timestamp),
    messageId: msgid,
    nodeId,
  };

  const bytes = Web3MQRequestMessage.toBinary(msgReq);

  const concatArray = GetContactBytes(PbTypeMessage, bytes);
  return concatArray;
};

export const renderMessagesList = async (msglist) => {
  return msglist.map((msg, idx) => {
    let content = '';
    if (msg.cipher_suite == 'NONE') {
      content = decodeURIComponent(escape(window.atob(msg.payload)));
    }
    // else if (msg.cipher_suite == 'RSA_OAEP') {
    //   if (msg.payload) {
    //     let byteContent = Uint8Array.from(atob(msg.payload), (c) => c.charCodeAt(0));

    //     let decodeBytes = await getRsaDecryptData(RsaPrivateKeyStr ?? '', byteContent);
    //     content = new TextDecoder().decode(decodeBytes);
    //   } else {
    //     content = '';
    //   }
    // }
    else {
      content = '不支持的加密类型 ' + msg.cipher_suite;
    }
    let date = new Date(msg.timestamp);

    let timestampStr = date.getHours() + ':' + date.getMinutes();

    let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    let message = {
      _id: idx + 1,
      id: idx + 1,
      indexId: idx + 1,
      content: content,
      senderId: msg.from,
      username: '',
      avatar: 'assets/imgs/doe.png',
      // date: "13 November",
      // timestamp: "10:20",
      date: dateStr,
      timestamp: timestampStr,
      system: false,
      saved: false,
      distributed: true,
      seen: true,
      failure: false,
    };
    return message;
  });
};
