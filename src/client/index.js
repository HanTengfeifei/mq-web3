import { Register } from '../register';
import { Channel } from '../channel';
import { Connect } from '../connect';
import { Message } from '../message';
import { User } from '../user';
import { Contact } from '../contact';
import { Notify } from '../notify';
import { Request } from '../core/request';

import event from '../core/eventEmitter';
import { selectUrl } from '../utils';
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

  static init = (initOptions = {}) => {
    const { connectUrl, app_key } = initOptions;
    Client.wsUrl = selectUrl('ws', connectUrl);
    new Request(selectUrl('http', connectUrl));
    return new Register(app_key);
  };

  static getInstance = (keys) => {
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
