import * as apis from './authorization/index';
import { Client } from './client';
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
async function getClient() {
  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  if (state === null || (typeof state === 'object' && state.keys === undefined)) {
    return null;
  }
  return state.keys;
}
export const onRpcRequest = async ({ origin, request }) => {
  // const state = await getClient();
  // if (!state) {
  //   await saveClient(keys));
  // }
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
    case 'web3-mq':
      return new Promise(async (r) => {
        await Client.init();
        const res = await new apis.Register('vAUJTFXbBZRkEDRE').signMetaMask();
        await saveClient(res);
        r(res);
      });
    case 'instance':
      return new Promise(async (r) => {
        try {
          const keys = await getClient();
          if (keys) {
            r({
              name: 'test',
            });
          }
        } catch (e) {
          return r({
            name: 'test',
          });
        }
      });
    default:
      throw new Error('Method not found.');
  }
};
