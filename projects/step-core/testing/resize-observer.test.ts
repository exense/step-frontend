import { ResizeObserverMock, resizeObserverMock } from './index';

describe('Shared ResizeObserver support', () => {
  it('delivers measured entries to each observer and respects unobserve, disconnect, and reobserve', () => {
    const element = document.createElement('div');
    const other = document.createElement('div');
    const first = jest.fn();
    const second = jest.fn();
    const observer = new ResizeObserver(first);
    const another = new ResizeObserver(second);
    expect(observer).toBeInstanceOf(ResizeObserverMock);
    observer.observe(element);
    another.observe(element, { box: 'border-box' });
    observer.observe(other);
    resizeObserverMock.resize(element, { width: 320, height: 80 });
    expect(first).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          target: element,
          contentRect: expect.objectContaining({ width: 320, height: 80 }),
          borderBoxSize: [{ inlineSize: 320, blockSize: 80 }],
        }),
      ],
      observer,
    );
    expect(second).toHaveBeenCalledTimes(1);
    expect(element.offsetWidth).toBe(320);
    expect(element.getBoundingClientRect().height).toBe(80);
    observer.unobserve(element);
    another.disconnect();
    resizeObserverMock.resize(element, { width: 400, height: 90 });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    resizeObserverMock.resize(other, { width: 100, height: 50 });
    expect(first).toHaveBeenCalledTimes(2);
    another.observe(element);
    resizeObserverMock.resize(element, { width: 500, height: 90 });
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('resets registrations and restores the original element geometry', () => {
    const element = document.createElement('div');
    const originalWidth = element.offsetWidth;
    const originalRect = element.getBoundingClientRect;
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(element);
    resizeObserverMock.resize(element, { width: 640, height: 100 });
    resizeObserverMock.reset();
    expect(element.offsetWidth).toBe(originalWidth);
    expect(element.getBoundingClientRect).toBe(originalRect);
    resizeObserverMock.resize(element, { width: 800, height: 100 });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
