// CommonJS keeps this test-only entry point usable by Jest in installed EE packages.
const observers = new Set();
const geometry = new Map();

class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.targets = new Set();
    observers.add(this);
  }

  observe(target) {
    this.targets.add(target);
    observers.add(this);
  }

  unobserve(target) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
    observers.delete(this);
  }
}

const resizeObserverMock = {
  resize(target, { width, height }) {
    const rect = new DOMRect(0, 0, width, height);
    const properties = {
      getBoundingClientRect: () => rect,
      offsetWidth: width,
      offsetHeight: height,
      clientWidth: width,
      clientHeight: height,
    };
    if (!geometry.has(target)) {
      geometry.set(
        target,
        Object.fromEntries(Object.keys(properties).map((key) => [key, Object.getOwnPropertyDescriptor(target, key)])),
      );
    }
    Object.entries(properties).forEach(([key, value]) => {
      Object.defineProperty(target, key, { configurable: true, value });
    });
    const size = { inlineSize: width, blockSize: height };
    const entry = {
      target,
      contentRect: rect,
      contentBoxSize: [size],
      borderBoxSize: [size],
      devicePixelContentBoxSize: [size],
    };
    [...observers].forEach((observer) => {
      if (observer.targets.has(target)) {
        observer.callback([entry], observer);
      }
    });
  },

  reset() {
    observers.forEach((observer) => observer.disconnect());
    geometry.forEach((descriptors, target) => {
      Object.entries(descriptors).forEach(([key, descriptor]) => {
        if (descriptor) {
          Object.defineProperty(target, key, descriptor);
        } else {
          delete target[key];
        }
      });
    });
    geometry.clear();
  },
};

function installResizeObserverMock() {
  globalThis.ResizeObserver = ResizeObserverMock;
  afterEach(() => resizeObserverMock.reset());
}

module.exports = { ResizeObserverMock, resizeObserverMock, installResizeObserverMock };
