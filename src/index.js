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
async function saveClient(keyName, value) {
  if (!keyName || typeof keyName != 'string') {
    return;
  }
  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  if (state) {
    state[keyName] = value;
    await wallet.request({
      method: 'snap_manageState',
      params: ['update', { ...state }],
    });
    return;
  }
  let obj = {};
  obj[keyName] = value;
  await wallet.request({
    method: 'snap_manageState',
    params: ['update', obj],
  });
}
async function getClient(keyName) {
  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  if (typeof keyName != 'string') {
    return null;
  }
  let targetValue = state[keyName];
  if (state === null || (typeof state === 'object' && targetValue === undefined)) {
    return null;
  }
  if (!keyName) {
    return state;
  }
  return targetValue;
}
async function handleEvent(event) {
  if (event.type === 'channel.getList') {
    console.log(wallet.instance.channel.channelList);
  }
  if (event.type === 'channel.activeChange') {
    console.log(wallet.instance.channel.activeChannel);
    wallet.instance.message.getMessageList({
      page: 1,
      size: 20,
    });
  }
  if (event.type === 'message.getList') {
    console.log(wallet.instance.message.messageList);
  }
  if (event.type === 'message.new') {
    const list = wallet.instance.message.messageList || [];
    let text = event.data.msg;
    wallet.instance.message.messageList = [...list, { content: text, id: list.length + 1 }];
    console.log([...list, { content: text, id: list.length + 1 }]);
  }
}
async function addListeners() {
  wallet.instance.on('channel.getList', handleEvent);
  wallet.instance.on('channel.activeChange', handleEvent);
  wallet.instance.on('message.getList', handleEvent);
  wallet.instance.on('message.new', handleEvent);
}
var instance = null;
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
      if (payload && isPlainObject(payload)) {
        return new Promise(async (r) => {
          const fastUrl = await Client.init({
            app_key: '',
            connectUrl: '',
            env: 'test',
            ...payload,
          });
          r(fastUrl);
        });
      } else {
        throw new Error('payload require a object.');
      }

    case 'web3-mq-register':
      const { signContentURI } = payload;
      // const app_key = request.app_key;
      return new Promise(async (r) => {
        try {
          // await Client.init();
          const res = await Client.register.signMetaMask(signContentURI);
          // const res = await new apis.Register(app_key).signMetaMask(signContentURI);
          await saveClient('keys', res);
          r(res);
        } catch (e) {
          r('9');
          throw new Error(e);
        }
      });
    case 'getInstance':
      // const { keys } = payload;
      // const app_key = request.app_key;
      return new Promise(async (r) => {
        try {
          let savedKeys = await getClient('keys');
          let targetKeys = savedKeys;
          wallet.instance = Client.getInstance(targetKeys);
          r('success');
          // r(targetKeys);
        } catch (e) {
          throw new Error(e);
        }
      });
    case 'addInstanceListeners':
      return new Promise(async (r) => {
        try {
          await addListeners();
          r(true);
        } catch (e) {
          throw new Error(e);
        }
      });
    case 'queryChannelList':
      return new Promise(async (r) => {
        try {
          await wallet.instance.channel.queryChannels({ page: 1, size: 100 });
          r(true);
        } catch (e) {
          throw new Error(e);
        }
      });
    case 'setActiveChannel':
      const channel = payload.channel;
      if (channel) {
        return new Promise(async (r) => {
          try {
            let channelList = wallet.instance.channel.channelList;
            await wallet.instance.channel.setActiveChannel(channelList[channel]);
            r(true);
          } catch (e) {
            throw new Error(e);
          }
        });
      } else {
        throw new Error('channel is  require .');
      }
    case 'creatRoom':
      return new Promise(async (r) => {
        try {
          await wallet.instance.channel.createRoom();
          r(true);
        } catch (e) {
          throw new Error(e);
        }
      });
    case 'getChannelList':
      return new Promise(async (r) => {
        try {
          let channelList = wallet.instance.channel.channelList;
          r(channelList);
        } catch (e) {
          throw new Error(e);
        }
      });
    case 'getActiveChannel':
      return new Promise(async (r) => {
        try {
          let activeChannel = wallet.instance.channel.activeChannel;
          r(activeChannel);
        } catch (e) {
          throw new Error(e);
        }
      });

    case 'sendClientMessageListRequest':
      //{ page: 1,size: 20,}paload
      // const app_key = request.app_key;
      if (payload && isPlainObject(payload)) {
        return new Promise(async (r) => {
          try {
            let messageList = instance.message.getMessageList({
              ...payload,
            });
            r(messageList);
          } catch (e) {
            throw new Error(e);
          }
        });
      } else {
        throw new Error('payload require a object.');
      }
    case 'getClientMessageList':
      //{ page: 1,size: 20,}paload
      // const app_key = request.app_key;
      return new Promise(async (r) => {
        try {
          let messageList = wallet.instance.message.messageList;
          r(messageList);
        } catch (e) {
          throw new Error(e);
        }
      });
    case 'handleSendMessage':
      //{ page: 1,size: 20,}paload
      // const app_key = request.app_key;
      if (payload && isPlainObject(payload)) {
        return new Promise(async (r) => {
          try {
            wallet.instance.message.sendMessage(payload.text);
            r(true);
          } catch (e) {
            throw new Error(e);
          }
        });
      } else {
        throw new Error('payload require a object.');
      }
    case 'startListionNewMessage':
      //{ page: 1,size: 20,}paload
      // const app_key = request.app_key;
      return new Promise(async (r) => {
        try {
          client.on('message.new', () => {
            const list = instance.message.messageList || [];
            instance.message.messageList = [...list, { content: text, id: list.length + 1 }];
          });
          r(true);
        } catch (e) {
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
          let keys = await getClient('keys');
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
          let keys = await getClient('keys');
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
    case 'saveTargetOrigin':
      const targetOrigin = payload.targetOrigin;
      await saveClient('targetOrigin', targetOrigin);
      return {
        done: targetOrigin,
      };
    case 'test':
      let targetOrigined = await getClient('targetOrigin');
      Window.postMessage('i am a message', targetOrigined);
      return {
        test: 'test',
      };
    default:
      throw new Error('Method not found.');
  }
};
