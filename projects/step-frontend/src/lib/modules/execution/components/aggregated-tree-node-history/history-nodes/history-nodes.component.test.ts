import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementSizeService } from '@exense/step-core';
import { HistoryNodesComponent } from './history-nodes.component';

describe('HistoryNodesComponent', () => {
  const createComponent = async (
    parentWidth?: WritableSignal<number>,
  ): Promise<ComponentFixture<HistoryNodesComponent>> => {
    const providers = parentWidth
      ? [
          {
            provide: ElementSizeService,
            useValue: {
              width: parentWidth,
              height: signal(0),
            } satisfies ElementSizeService,
          },
        ]
      : [];

    await TestBed.configureTestingModule({
      imports: [HistoryNodesComponent],
      providers,
    })
      .overrideComponent(HistoryNodesComponent, {
        set: {
          imports: [],
          template: '<div class="container" [class.justify-end]="!isFitToParent()"></div>',
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(HistoryNodesComponent);
    fixture.componentRef.setInput('nodesCount', 8);
    fixture.componentRef.setInput('nodesSize', 40);
    fixture.componentRef.setInput('pastNodes', []);
    fixture.componentRef.setInput('currentNode', { statusSlices: [] });
    fixture.detectChanges();
    return fixture;
  };

  const isJustifiedToEnd = (fixture: ComponentFixture<HistoryNodesComponent>): boolean =>
    fixture.nativeElement.querySelector('.container').classList.contains('justify-end');

  it('keeps the default alignment when the history fits exactly', async () => {
    const fixture = await createComponent(signal(420));

    expect(isJustifiedToEnd(fixture)).toBe(false);
  });

  it('aligns the history to the end when it does not fit', async () => {
    const fixture = await createComponent(signal(419));

    expect(isJustifiedToEnd(fixture)).toBe(true);
  });

  it('restores the default alignment when the parent grows', async () => {
    const parentWidth = signal(419);
    const fixture = await createComponent(parentWidth);

    parentWidth.set(420);
    fixture.detectChanges();

    expect(isJustifiedToEnd(fixture)).toBe(false);
  });

  it('keeps the default alignment without a measured parent width', async () => {
    const fixture = await createComponent();

    expect(isJustifiedToEnd(fixture)).toBe(false);
  });
});
