import { Execution } from '../../../client/step-client-module';
import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type E = Pick<Required<Execution>, 'status' | 'result'>;
type Status = E['status'] | E['result'] | 'UNKNOW' | 'DELAYED_UPDATE' | 'EMPTY';

export const COLORS: Record<Status, string> = {
  EMPTY: '#e1e1e1',
  UNKNOW: '#dadada',
  ENDED: '#808080',
  INITIALIZING: '#808080',
  IMPORTING: '#ff8f15',
  EXPORTING: '#ff8f15',
  DELAYED_UPDATE: '#ff8f15',
  RUNNING: '#0082cd',
  ABORTING: '#ff595b',
  FORCING_ABORT: '#ff595b',
  SKIPPED: '#a0a0a0',
  NORUN: '#a0a0a0',
  PASSED: '#01a990',
  FAILED: '#ff595b',
  TECHNICAL_ERROR: '#000000',
  INTERRUPTED: '#e1cc01',
  IMPORT_ERROR: '#ff595b',
  VETOED: '#cc0099',
  ESTIMATING: '#ff8f15',
  PROVISIONING: '#ff8f15',
  DEPROVISIONING: '#ff8f15',
};

function addCssVariables(doc: Document): void {
  const idValue = 'status-var';
  if (doc.querySelector(`#${idValue}`)) {
    return;
  }

  const cssVariables = Object.entries(COLORS).map(([status, color]) => `--status-${status}: ${color};`);
  const inlineStyle = `body { ${cssVariables.join(' ')} }`;

  const style: HTMLStyleElement = doc.createElement('style');
  const styleId = doc.createAttribute('id');
  styleId.value = idValue;
  style.attributes.setNamedItem(styleId);
  style.innerHTML = inlineStyle;

  doc.head.appendChild(style);
}

export const STATUS_COLORS = new InjectionToken<typeof COLORS>('Status colors', {
  providedIn: 'root',
  factory: () => {
    const _doc = inject(DOCUMENT);
    addCssVariables(_doc);

    return COLORS;
  },
});
