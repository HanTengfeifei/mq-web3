// import * as apis from './authorization/index';
import { Client } from './client';
import { savePublicKeyRequest, createRoomRequest } from './api';
import { isPlainObject } from './utils';
export * from './client';
export * from './authorization/index';
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_notify` call failed.
 */
async function saveClient(keys) {
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { keys: keys }],
  });
}
// async function getClient() {
//   const state = await wallet.request({
//     method: 'snap_manageState',
//     params: ['get'],
//   });
//   if (state === null || (typeof state === 'object' && state.keys === undefined)) {
//     return null;
//   }
//   return state.keys;
// }
export const onRpcRequest = async ({ origin, request }) => {
  // const state = await getClient();
  // if (!state) {
  //   await saveClient(keys));
  // }
  const payload = request.payload;

  switch (request.method) {
    case 'inApp':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inApp',
            message: `Hello, ${origin}!`,
          },
        ],
      });
    case 'native':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'native',
            message: `Hello, ${origin}!`,
          },
        ],
      });
    case 'web3-mq-init':
      const initOptions = request.initOptions;
      if (initOptions && isPlainObject(initOptions)) {
        return new Promise(async (r) => {
          const fastUrl = await Client.init({
            app_key: '',
            connectUrl: '',
            env: 'test',
            ...initOptions,
          });
          r(fastUrl);
        });
      } else {
        throw new Error('initOptions require a object.');
      }

    case 'web3-mq-register':
      const signContentURI = request.signContentURI;
      // const app_key = request.app_key;
      return new Promise(async (r) => {
        try {
          // await Client.init();
          const res = await Client.register.signMetaMask(signContentURI);
          // const res = await new apis.Register(app_key).signMetaMask(signContentURI);
          await saveClient(res);
          r(res);
        } catch (e) {
          r('9');
          throw new Error(e);
        }
      });
    case 'savePublicKeyRequest':
      return new Promise(async (r) => {
        try {
          const res = await savePublicKeyRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'createRoomRequest':
      return new Promise(async (r) => {
        try {
          const res = await createRoomRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'test':
      return {
        test: 'test',
      };
    default:
      throw new Error('Method not found.');
  }
};
