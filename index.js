/*
 * @Author: HanTengfeifei 1157123521@qq.com
 * @Date: 2022-09-06 20:48:44
 * @LastEditors: HanTengfeifei 1157123521@qq.com
 * @LastEditTime: 2022-09-13 15:06:47
 * @FilePath: /mq-web3/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const connectButton = document.querySelector('button.connect');
const sendInAppButton = document.querySelector('button.sendInApp');
const sendNativeButton = document.querySelector('button.sendNative');
const send1Button = document.querySelector('button.send1');
const send2Button = document.querySelector('button.send2');
const savekeysButton = document.querySelector('button.savekeys');
const testButton = document.querySelector('button.test');
const getUserIdButton = document.querySelector('button.getUserId');
const getKeysButton = document.querySelector('button.getKeys');

connectButton.addEventListener('click', connect);
sendInAppButton.addEventListener('click', () => send('inApp'));
sendNativeButton.addEventListener('click', () => send('native'));
send1Button.addEventListener('click', () => send('web3-mq-init'));
send2Button.addEventListener('click', () => send('web3-mq-register'));
savekeysButton.addEventListener('click', () => send('savePublicKeyRequest'));
testButton.addEventListener('click', () => send('test'));
getUserIdButton.addEventListener('click', () => send('getUserId'));
getKeysButton.addEventListener('click', () => send('getKeys'));

['saveTargetOrigin', 'getInstance'].forEach((item) => {
  let ele = document.createElement('button');
  ele.addEventListener('click', () => send(item));
  ele.textContent = item;
  document.body.appendChild(ele);
});
/**
 * Get permission to interact with and install the snap.
 */
const snapId = `local:${window.location.href}`;
async function connect() {
  await ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          [snapId]: {},
        },
      },
    ],
  });
}

/**
 * Call the snap's `inApp` or `native` method. This function triggers an alert
 * if the call failed.
 *
 * @param method - The method to call. Must be one of `inApp` or `native`.
 */
// function render(event) {
//   var origin = event.origin;
//   console.log('----------render----------', event, origin);
// }
// window.addEventListener('message', render, false);
async function send(method) {
  console.log('method', method);
  let payload = {
    // render: render,
    userid: 'user:cd96666ba0cded1e22a233769a0f0b638d00f5e00298590c5eb3051d039b078c',
    app_key: 'vAUJTFXbBZRkEDRE',
    metamask_signature:
      '0x6a4f202fa303270677fb4dadb979429570507525f405320b28fbc8c82217819643c3a7ba350a2b512ca26dd3e18a80cec90a523ad4cdb7fd969ffae6501b5dfc1c',
    pubkey: 'cd96666ba0cded1e22a233769a0f0b638d00f5e00298590c5eb3051d039b078c',
    sign_content:
      'Web3MQ wants you to sign in with your Ethereum account:\n    0x3c75b4f1fe09559c98f09066c0c09831d8d4fc0f\n    For Web3MQ registration\n    URI: https://www.web3mq.com\n    Version: 1\n    Nonce: 4be25c1f1ecfeba53d22b6cbf19f650060e4b3b6e01d0f68aa8106e2\n    Issued At: 06/09/2022 18:14',
    timestamp: 1662459243257,
    userid: 'user:cd96666ba0cded1e22a233769a0f0b638d00f5e00298590c5eb3051d039b078c',
    wallet_address: '0x3c75b4f1fe09559c98f09066c0c09831d8d4fc0f',
    wallet_type: 'eth',
  };
  if (method === 'saveTargetOrigin') {
    payload = {
      targetOrigin: window.origin,
    };
  }
  try {
    const res = await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        snapId,
        {
          method,
          signContentURI: 'https://www.web3mq.com',
          // app_key: 'vAUJTFXbBZRkEDRE',
          initOptions: {
            env: 'test',
            app_key: 'vAUJTFXbBZRkEDRE',
          },
          payload,
        },
      ],
    });
    console.log('res', res);
  } catch (err) {
    console.error(err);
    alert(`Problem happened: ${err.message}` || err);
  }
}
const init = async () => {
  const timestamp = Date.now();

  // let userid = await send('getUserId');
  // let keys = await send('getkeys');
  // const signContent = userid + timestamp;
  let payload = {
    //具体params参考https://docs.web3messaging.online/docs/Web3MQ-API/Intro
  };
  let res = await send('changeNotificationStatusRequest', payload);
  console.log('res', res);
};
