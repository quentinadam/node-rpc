interface Listener {
  object: any;
  event: string;
  handler: (...args: any[]) => void;
}

export default class ListenersHandler {

  private listeners: Listener[];

  constructor() {
    this.listeners = [];
  }

  addListener(object: any, event: string, handler: (...args: any[]) => void): void {
    object.addListener(event, handler);
    this.listeners.push({object, event, handler});
  }

  removeListeners(object?: any, event?: string): void {
    for (const listener of this.listeners) {
      if ((object === undefined || object === listener.object) && (event === undefined || event === listener.event)) {
        listener.object.removeListener(listener.event, listener.handler);
      }
    } 
  }

}
