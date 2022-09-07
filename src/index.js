// import * as apis from './authorization/index';
import { Client } from './client';
import {
  savePublicKeyRequest,
  getRoomListRequest,
  createRoomRequest,
  getGroupMemberListRequest,
  inviteGroupMemberRequest,
  getMessageListRequest,
  changeMessageStatusRequest,
  searchUsersRequest,
  getMyProfileRequest,
  updateMyProfileRequest,
  searchContactRequest,
  getContactListRequest,
  sendFriendRequest,
  getMyFriendListRequset,
  getRreceiveFriendListRequests,
  operationFriendRequest,
} from './api';
import { isPlainObject, getDataSignature, renderMessagesList } from './utils';
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
    //Authorization
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
    //API Channel
    case 'getRoomListRequest':
      return new Promise(async (r) => {
        try {
          const res = await getRoomListRequest(payload);
          r(res);
        } catch (e) {
          return r(e.message);
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
    case 'getGroupMemberListRequest':
      return new Promise(async (r) => {
        try {
          const res = await getGroupMemberListRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'inviteGroupMemberRequest':
      return new Promise(async (r) => {
        try {
          const res = await inviteGroupMemberRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    //Message
    case 'getMessageListRequest':
      return new Promise(async (r) => {
        try {
          const {
            data: { result = [] },
          } = await getMessageListRequest(payload);
          const data = await renderMessagesList(result);
          let res = Array.isArray(data) ? data.reverse() : [];
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    // case 'getMessageListRequest':
    //   return new Promise(async (r) => {
    //     try {
    //       const res = await getMessageListRequest(payload);
    //       r(res);
    //     } catch (e) {
    //       return r({
    //         res: 'failed',
    //       });
    //     }
    //   });
    case 'changeMessageStatusRequest':
      return new Promise(async (r) => {
        try {
          const res = await changeMessageStatusRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    //User
    case 'searchUsersRequest':
      return new Promise(async (r) => {
        try {
          const res = await searchUsersRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'getMyProfileRequest':
      return new Promise(async (r) => {
        try {
          const res = await getMyProfileRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'updateMyProfileRequest':
      return new Promise(async (r) => {
        try {
          const res = await updateMyProfileRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    //Contact;
    case 'searchContactRequest':
      return new Promise(async (r) => {
        try {
          const res = await searchContactRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'getContactListRequest':
      return new Promise(async (r) => {
        try {
          const res = await getContactListRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'sendFriendRequest':
      return new Promise(async (r) => {
        try {
          const res = await sendFriendRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'getMyFriendListRequset':
      return new Promise(async (r) => {
        try {
          const res = await getMyFriendListRequset(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'getRreceiveFriendListRequests':
      return new Promise(async (r) => {
        try {
          const res = await getRreceiveFriendListRequests(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'operationFriendRequest':
      return new Promise(async (r) => {
        try {
          const res = await operationFriendRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    //Notification
    case 'changeNotificationStatusRequest':
      return new Promise(async (r) => {
        try {
          const res = await changeNotificationStatusRequest(payload);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    //Utils
    case 'getUserId':
      return new Promise(async (r) => {
        try {
          let keys = await getClient();
          if (!keys) return null;
          const res = `user:${keys.PublicKey}`;
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'getKeys':
      return new Promise(async (r) => {
        try {
          let keys = await getClient();
          if (!keys) return null;
          r(keys);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'getDataSignature':
      return new Promise(async (r) => {
        try {
          const res = await getDataSignature(payload.PrivateKey, payload.signContent);
          r(res);
        } catch (e) {
          return r({
            res: 'failed',
          });
        }
      });
    case 'renderMessagesList':
      return new Promise(async (r) => {
        try {
          const res = await renderMessagesList(payload.list);
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
