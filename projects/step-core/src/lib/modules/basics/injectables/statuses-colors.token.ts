import { Execution } from '../../../client/step-client-module';
import { inject, InjectionToken } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type E = Pick<Required<Execution>, 'status' | 'result'>;
type Status = E['status'] | E['result'] | 'UNKNOW' | 'DELAYED_UPDATE' | 'EMPTY';

const COLORS: Record<Status, string> = {
  EMPTY: '#e1e1e1',
  UNKNOW: '#dadada',
  ENDED: 'gray',
  INITIALIZING: 'gray',
  IMPORTING: 'orange',
  EXPORTING: 'orange',
  DELAYED_UPDATE: 'orange',
  RUNNING: '#337ab7',
  ABORTING: '#d9534f',
  FORCING_ABORT: '#d9534f',
  SKIPPED: '#a0a0a0',
  NORUN: '#a0a0a0',
  PASSED: '#5cb85c',
  FAILED: '#d9534f',
  TECHNICAL_ERROR: 'black',
  INTERRUPTED: '#f9c038',
  IMPORT_ERROR: '#d9534f',
  VETOED: '#cc0099',
  ESTIMATING: 'orange',
  PROVISIONING: 'orange',
  DEPROVISIONING: 'orange',
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
