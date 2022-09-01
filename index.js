const connectButton = document.querySelector('button.connect');
const sendInAppButton = document.querySelector('button.sendInApp');
const sendNativeButton = document.querySelector('button.sendNative');
const send1Button = document.querySelector('button.send1');

connectButton.addEventListener('click', connect);
sendInAppButton.addEventListener('click', () => send('inApp'));
sendNativeButton.addEventListener('click', () => send('native'));
send1Button.addEventListener('click', () => send('web3-mq'));

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
async function send(method) {
  console.log('method', method);
  try {
    const res = await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [
        snapId,
        {
          method,
        },
      ],
    });
    console.log('res', res);
  } catch (err) {
    console.error(err);
    alert(`Problem happened: ${err.message}` || err);
  }
}
