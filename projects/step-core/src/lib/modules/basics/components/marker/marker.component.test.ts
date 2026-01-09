import { MarkerComponent, MarkerType } from '@exense/step-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';

describe('MarkerComponent', () => {
  let component: MarkerComponent;
  let fixture: ComponentFixture<MarkerComponent>;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MarkerComponent);
    component = fixture.componentInstance;
    changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('change shape', async () => {
    let div = fixture.nativeElement.querySelector('div');
    expect(div).toBeTruthy();
    expect(div.classList).toContain('step-marker-filled-square');

    component.markerType = MarkerType.DOTS;
    changeDetectorRef.detectChanges();
    await fixture.whenStable();

    div = fixture.nativeElement.querySelector('div');
    expect(div).toBeTruthy();
    expect(div.classList).toContain('step-marker-dots');

    component.markerType = MarkerType.DASHED;
    changeDetectorRef.detectChanges();
    await fixture.whenStable();

    div = fixture.nativeElement.querySelector('div');
    expect(div).toBeTruthy();
    expect(div.classList).toContain('step-marker-dashed-square');
  });

  it('change color', async () => {
    component.color = 'red';
    changeDetectorRef.detectChanges();
    await fixture.whenStable();

    let div = fixture.nativeElement.querySelector('div');
    expect(div.style.getPropertyValue('--item-color')).toBe('red');

    component.color = 'blue';
    changeDetectorRef.detectChanges();
    await fixture.whenStable();

    div = fixture.nativeElement.querySelector('div');
    expect(div.style.getPropertyValue('--item-color')).toBe('blue');
  });
});
