import { CloudeeEventPayload, CloudeeEventType } from './cloudee.types';

type CloudeeListener = (event: CloudeeEventPayload) => void;

class CloudeeEventBus {
  private listeners: Set<CloudeeListener> = new Set();
  private lastEvent: CloudeeEventPayload | null = null;

  public subscribe(listener: CloudeeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(type: CloudeeEventType, details?: Omit<CloudeeEventPayload, 'type' | 'timestamp'>): void {
    const payload: CloudeeEventPayload = {
      type,
      timestamp: Date.now(),
      ...details,
    };
    this.lastEvent = payload;
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[CloudeeEventBus] Error in listener:', err);
      }
    });
  }

  public getLastEvent(): CloudeeEventPayload | null {
    return this.lastEvent;
  }
}

export const cloudeeBus = new CloudeeEventBus();

export const cloudeeEmit = (
  type: CloudeeEventType,
  details?: Omit<CloudeeEventPayload, 'type' | 'timestamp'>
): void => {
  cloudeeBus.emit(type, details);
};
