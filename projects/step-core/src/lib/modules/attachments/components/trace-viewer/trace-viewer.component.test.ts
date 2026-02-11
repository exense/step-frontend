import { TraceViewerComponent } from './trace-viewer.component';
import { TestBed } from '@angular/core/testing';
import { APP_HOST } from '../../../../client/_common';
import { ComponentRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

describe('Trace Viewer', () => {
  let componentRef: ComponentRef<TraceViewerComponent>;

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

    componentRef = TestBed.createComponent(TraceViewerComponent).componentRef;
  });

  it('Initial view', async () => {
    const url = (componentRef.instance as any).traceViewerUrl();
    expect(url).toEqual('https://step.ch/trace-viewer/');
  });

  it('Set report url', async () => {
    componentRef.setInput('reportUrl', 'https://step.ch/reports/1');
    const url = (componentRef.instance as any).traceViewerUrl();
    expect(url).toEqual('https://step.ch/trace-viewer/?trace=https://step.ch/reports/1');
  });

  it('Oper url', async () => {
    componentRef.setInput('reportUrl', 'https://step.ch/reports/1');

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
