import { isValidEventType } from './events';
class EventEmitter {
  events

  constructor() {
    this.events = {};
  }

  // 订阅
  on(eventName ,callback) {
    const valid = isValidEventType(eventName);
    if (!valid) {
      throw Error(`Invalid event type ${eventName}`);
    }
    if (typeof callback == 'function') {
      const callbacks = this.events[eventName] || [];
      callbacks.push(callback);
      this.events[eventName] = callbacks;
    } else {
      throw new Error(`You need to add a callback method to the ${eventName} event`);
    }
  }

  // 触发
  emit(eventName, ...args[]) {
    const callbacks = this.events[eventName] || [];
    if (callbacks.length === 0) {
      throw new Error(`The ${eventName} event was not registered`);
    }
    callbacks.forEach((cb) => cb(...args));
  }

  // 取消订阅，
  off(eventName, callback) {
    if (callback === undefined) {
      this.events[eventName] = [];
      // throw new Error('The callback function is required');
    }
    const callbacks = this.events[eventName] || [];
    const newCallbacks = callbacks.filter(
      (fn) => fn != callback && fn.initialCallback != callback,
    );

    this.events[eventName] = newCallbacks;
  }

  once(eventName, callback) {
    if (callback === undefined) {
      throw new Error('The callback function is required');
    }
    const one = (...args[]) => {
      callback(...args);
      this.off(eventName, one);
    };
    one.initialCallback = callback;
    this.on(eventName, one);
  }
}

export default EventEmitter;
