import { Request } from '../core/request';

export const savePublicKeyRequest = async (payload) => {
  return await Request.post('/api/pubkey/', payload);
};
/**
 * @API Channel
 */
export const createRoomRequest = async (payload) => {
  return await Request.post('/api/groups/', payload);
};

// export const getGroupListRequest = async (payload) => {
//   return await request.get('/api/groups/', {
//     params: payload,
//   });
// };

export const getRoomListRequest = async (payload) => {
  return await Request.get('/api/chats/', {
    params: payload,
  });
};

export const getGroupMemberListRequest = async (payload) => {
  return await Request.get('/api/group_members/', {
    params: payload,
  });
};

export const inviteGroupMemberRequest = async (payload) => {
  return await Request.post('/api/group_invitation/', payload);
};
/**
 * @API Message
 */

export const getMessageListRequest = async (payload) => {
  return await Request.get('/api/messages/history/', {
    params: payload,
  });
};

export const changeMessageStatusRequest = async (payload) => {
  return await Request.post('/api/messages/status/', payload);
};
/**
 * @API User
 */
export const searchUsersRequest = async (payload) => {
  return await Request.get('/api/users/search/', {
    params: payload,
  });
};

export const getMyProfileRequest = async (payload) => {
  return await Request.get('/api/my_profile/', {
    params: payload,
  });
};

export const updateMyProfileRequest = async (payload) => {
  return await Request.post('/api/my_profile/', payload);
};
/**
 * @API Contact
 */
export const searchContactRequest = async (payload) => {
  return await Request.get('/api/contacts/search/', {
    params: payload,
  });
};

export const getContactListRequest = async (payload) => {
  return await Request.get('/api/contacts/', {
    params: payload,
  });
};

export const sendFriendRequest = async (payload) => {
  return await Request.post('/api/contacts/add_friends/', payload);
};

export const getMyFriendListRequset = async (payload) => {
  return await Request.get('/api/contacts/add_friends/', {
    params: payload,
  });
};

export const getRreceiveFriendListRequests = async (payload) => {
  return await Request.get('/api/contacts/friend_requests/', {
    params: payload,
  });
};

export const operationFriendRequest = async (payload) => {
  return await request.post('/api/contacts/friend_requests/', payload);
};
/**
 * @API Notification
 */
export const changeNotificationStatusRequest = async (payload) => {
  return await Request.post('/api/notification/status/', payload);
};
