import { sha3_224 } from 'js-sha3';
import ed from '@noble/ed25519';

const getEd25519SharedKey = async (myEd25519PrivateKey, targetUserPubkey) => {
  const sharedKey = await ed.getSharedSecret(myEd25519PrivateKey, targetUserPubkey);

  return sharedKey;
};

const urlsafe2arr = (b64) => {
  b64 = b64.replace(/_/g, '/').replace(/-/g, '+');
  b64 += '==='.slice((b64.length + 3) % 4);
  var b = atob(b64)
    .split('')
    .map((s) => s.charCodeAt(0));
  return new Uint8Array(b);
};

const importKeyB64 = async (b64) => {
  return await crypto.subtle.importKey('raw', urlsafe2arr(b64), 'HKDF', false, ['deriveKey']);
};

const hexToBase64 = (hexstring) => {
  return btoa(
    hexstring
      .match(/\w{2}/g)
      .map((a) => {
        return String.fromCharCode(parseInt(a, 16));
      })
      .join(''),
  );
};

const arr2b64 = (arr) => {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)));
};

const makeAesGCMEncKey = async (key, info) => {
  const opt = {
    name: 'HKDF',
    salt: new Uint8Array(),
    info: new TextEncoder().encode(info),
    hash: 'SHA-256',
  };
  const dkey = await window.crypto.subtle.deriveKey(
    opt,
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  var keyBytes = await crypto.subtle.exportKey('raw', dkey);
  return arr2b64(keyBytes);
};

const stringToArrayBuffer = (str) => {
  let buf = new ArrayBuffer(str.length);
  let bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

const importSecretKey = async (rawKey, aesName) => {
  return await window.crypto.subtle.importKey('raw', rawKey, aesName, true, ['encrypt', 'decrypt']);
};

const aesDecrypt = async (aesName, keyStr, keySize, iv, encoded) => {
  const alg = {
    name: aesName,
    iv,
    length,
  };

  let key = await importSecretKey(stringToArrayBuffer(atob(keyStr)), aesName);

  let result = await window.crypto.subtle.decrypt(alg, key, encoded);

  return result;
};

const aesEncrypt = async (aesName, keyStr, keySize, iv, encoded) => {
  const alg = {
    name: aesName,
    iv,
    length,
  };
  let key = await importSecretKey(stringToArrayBuffer(atob(keyStr)), aesName);
  let result = await window.crypto.subtle.encrypt(alg, key, encoded);
  return result;
};

export const getMessageSharedSecret = async (
  myEd25519PrivateKey,
  targetUserPubkey,
  msg_timestamp,
) => {
  const sharedKey = await getEd25519SharedKey(myEd25519PrivateKey, targetUserPubkey);
  const hashKey = sha3_224(sharedKey + msg_timestamp);
  const masterKey = await importKeyB64(hexToBase64(hashKey));
  const aesKey = await makeAesGCMEncKey(masterKey, msg_timestamp.toString());
  return aesKey;
};

export const aesGCMEncrypt = async (keyStr, iv, inputByteData) => {
  const keySize = 256;
  return await aesEncrypt('AES-GCM', keyStr, keySize, iv, inputByteData);
};

export const aesGCMDecrypt = async (keyStr, iv, encoded) => {
  const keySize = 256;
  return await aesDecrypt('AES-GCM', keyStr, keySize, iv, encoded);
};
