import { TraceViewerComponent } from './trace-viewer.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_HOST } from '../../../../client/_common';
import { By } from '@angular/platform-browser';
import { ComponentRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

describe('Trace Viewer', () => {
  let componentRef: ComponentRef<TraceViewerComponent>;
  let fixture: ComponentFixture<TraceViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraceViewerComponent],
      providers: [
        {
          provide: APP_HOST,
          useValue: 'https://step.ch',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TraceViewerComponent);
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('Initial view', async () => {
    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe.nativeElement.src).toEqual('https://step.ch/trace-viewer/');
  });

  it('Set report url', async () => {
    componentRef.setInput('reportUrl', 'https://step.ch/reports/1');
    fixture.detectChanges();
    await fixture.whenStable();
    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe.nativeElement.src).toEqual('https://step.ch/trace-viewer/?trace=https://step.ch/reports/1');
  });

  it('Oper url', async () => {
    componentRef.setInput('reportUrl', 'https://step.ch/reports/1');
    fixture.detectChanges();
    await fixture.whenStable();

    const doc = TestBed.inject(DOCUMENT);
    const spyWindowOpen = jest.spyOn(doc.defaultView!, 'open').mockImplementation(() => {});

    expect(spyWindowOpen).not.toHaveBeenCalled();
    componentRef.instance.openInSeparateTab();
    expect(spyWindowOpen).toHaveBeenCalledWith(
      'https://step.ch/trace-viewer/?trace=https://step.ch/reports/1',
      '_blank',
    );
  });
});
