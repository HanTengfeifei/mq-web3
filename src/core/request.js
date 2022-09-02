const localStorageKey = '__web3-mq_token__';
// eslint-disable-next-line no-unused-vars
let baseURL = '';
export function logout() {
  window.localStorage.removeItem(localStorageKey);
}
export const request = (endpoint, { body, ...customConfig } = {}) => {
  const token = window.localStorage.getItem(localStorageKey);
  const headers = { 'content-type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }

  return window.fetch(`${baseURL}${endpoint}`, config).then(async (response) => {
    if (response.status === 401) {
      logout();
      window.location.assign(window.location);
      return;
    }
    if (response.ok) {
      let res = await response.json();
      const { data } = res;
      if (data.code !== 0) {
        throw new Error(data.msg);
      }
      return data;
    } else {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
  });
};
export class Request {
  constructor(httpUrl) {
    baseURL = baseURL || httpUrl;
    if (!baseURL) {
      throw new Error('httpUrl is required');
    }
  }
  static post(endpoint, customConfig = {}) {
    return request(endpoint, { body: customConfig });
  }
  static get(endpoint, customConfig = {}) {
    return request(endpoint, { ...customConfig.params });
  }
  static head(endpoint) {
    return window.fetch(endpoint).then((res) => res.json);
  }
}
