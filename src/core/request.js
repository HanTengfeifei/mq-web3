import qs from 'query-string';
/*
 * @Author: HanTengfeifei 1157123521@qq.com
 * @Date: 2022-09-02 20:41:14
 * @LastEditors: HanTengfeifei 1157123521@qq.com
 * @LastEditTime: 2022-09-06 21:10:33
 * @FilePath: /mq-web3/src/core/request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// const localStorageKey = '__web3-mq_token__';
// eslint-disable-next-line no-unused-vars
let baseURL = '';
export function logout() {
  // window.localStorage.removeItem(localStorageKey);
}
export const request = (endpoint, { body, ...customConfig } = {}) => {
  // const token = window.localStorage.getItem(localStorageKey);
  const headers = { 'content-type': 'application/json' };
  // if (token) {
  //   headers.Authorization = `Bearer ${token}`;
  // }
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
  let Url = body
    ? `${baseURL}${endpoint}`
    : `${baseURL}${endpoint}?${encodeURIComponent(qs.stringify(customConfig))}`;
  debugger;

  return window.fetch(`${Url}`, config).then(async (response) => {
    if (response.status === 401) {
      logout();
      // window.location.assign(window.location);
      return;
    }
    if (response.status === 200) {
      let res = await response.json();
      if (res.code !== 0) {
        throw new Error(res.msg);
      }
      const { data } = res;
      return data;
    } else {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
  });
};
export class Request {
  constructor(httpUrl) {
    baseURL = httpUrl;
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
    return window.fetch(endpoint, { method: 'HEAD' }).then((res) => {
      let headers = {};
      res.headers.forEach((v, k) => (headers[k] = v));
      return { headers };
    });
  }
}
