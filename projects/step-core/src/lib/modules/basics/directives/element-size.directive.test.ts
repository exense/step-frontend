import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ElementSizeDirective } from './element-size.directive';

describe('ElementSizeDirective', () => {
  let width: number;
  let height: number;
  let resize: () => void;
  let disconnect: jest.Mock;
  let directive: ElementSizeDirective;
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    width = 0;
    height = 0;
    disconnect = jest.fn();
    globalThis.ResizeObserver = jest.fn().mockImplementation((callback: () => void) => {
      resize = callback;
      return { observe: jest.fn(), disconnect };
    });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRef,
          useValue: {
            nativeElement: {
              get offsetWidth(): number {
                return width;
              },
              get offsetHeight(): number {
                return height;
              },
            },
          },
        },
      ],
    });
    directive = TestBed.runInInjectionContext(() => new ElementSizeDirective());
  });

  afterEach(() => {
    directive.ngOnDestroy();
    TestBed.resetTestingModule();
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it('publishes initial positive dimensions without the resize debounce', fakeAsync(() => {
    width = 500;
    height = 100;
    directive.ngOnInit();
    TestBed.flushEffects();
    expect(directive.width()).toBe(500);
    expect(directive.height()).toBe(100);
  }));

  it('handles initially hidden elements and coalesces later resizes, including zero', fakeAsync(() => {
    directive.ngOnInit();
    TestBed.flushEffects();
    tick(300);
    expect(directive.width()).toBe(0);
    width = 500;
    resize();
    TestBed.flushEffects();
    expect(directive.width()).toBe(500);
    width = 400;
    resize();
    TestBed.flushEffects();
    tick(200);
    expect(directive.width()).toBe(500);
    width = 320;
    resize();
    TestBed.flushEffects();
    tick(299);
    expect(directive.width()).toBe(500);
    tick(1);
    expect(directive.width()).toBe(320);
    width = 0;
    resize();
    TestBed.flushEffects();
    tick(300);
    expect(directive.width()).toBe(0);
    width = 600;
    resize();
    TestBed.flushEffects();
    tick(299);
    expect(directive.width()).toBe(0);
    tick(1);
    expect(directive.width()).toBe(600);
  }));

  it('disconnects the observer on destruction', () => {
    directive.ngOnInit();
    directive.ngOnDestroy();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
