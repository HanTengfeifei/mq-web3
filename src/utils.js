import * as ed from '@noble/ed25519';
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
