import { Register } from '../authorization';
import { Channel } from '../channel';
import { Connect } from '../connect';
import { Message } from '../message';
import { User } from '../user';
import { Contact } from '../contact';
import { Notify } from '../notify';
import { Request } from '../core/request';

import event from '../core/eventEmitter';
import { selectUrl, getFastestUrl } from '../utils';
export class Client {
  static _instance;
  static wsUrl;
  keys;
  channel;
  listeners;
  connect;
  message;
  user;
  contact;
  notify;

  constructor(keys) {
    this.keys = { ...keys, userid: `user:${keys.PublicKey}` };
    this.listeners = new event();
    this.channel = new Channel(this);
    this.connect = new Connect(this);
    this.message = new Message(this);
    this.user = new User(this);
    this.contact = new Contact(this);
    this.notify = new Notify(this);
  }

  static init = async (
    initOptions = {
      connectUrl: null,
    },
  ) => {
    const { connectUrl, app_key } = initOptions;
    const fastUrl = connectUrl || (await getFastestUrl());
    Client.wsUrl = selectUrl('ws', fastUrl);
    new Request(selectUrl('http', fastUrl));
    Client.register = new Register(app_key);
    return fastUrl;
  };

  static getInstance = keys => {
    if (!keys) {
      throw new Error('The PrivateKey and PublicKey is required!');
    }
    if (!Client._instance) {
      Client._instance = new Client(keys);
    }
    return Client._instance;
  };

  on = (eventName, callback) => this.listeners.on(eventName, callback);
  emit = (eventName, data) => this.listeners.emit(eventName, data);
  off = (eventName, callback) => this.listeners.off(eventName, callback);
  once = (eventName, callback) => this.listeners.once(eventName, callback);
}
