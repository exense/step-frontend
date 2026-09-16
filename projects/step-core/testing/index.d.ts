export declare class ResizeObserverMock implements ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  observe(target: Element, options?: ResizeObserverOptions): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

export declare const resizeObserverMock: {
  resize(target: Element, size: { width: number; height: number }): void;
  reset(): void;
};

/** Call once from Jest setupFilesAfterEnv; resets observers and geometry after each test. */
export declare function installResizeObserverMock(): void;
