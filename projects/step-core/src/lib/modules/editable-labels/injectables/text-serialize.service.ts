import { Injectable } from '@angular/core';

export const DEFAULT_DECORATION_INDEX = 35;
export const BREAK_LINE = '<br />';

@Injectable({
  providedIn: 'root',
})
export class TextSerializeService {
  deserializeValue(value?: string, undecorate = true): string {
    if (!value) {
      return '';
    }
    let deserializedValue = undecorate ? this.undecorateLine(value) : value;
    deserializedValue = deserializedValue.replace(/<br \/>/g, '\n');

    if (deserializedValue.endsWith('\n')) {
      deserializedValue = deserializedValue.replace(/\n$/g, '');
    }

    return deserializedValue;
  }

  serializeValue(value?: string, decorate = true): string {
    if (!value) {
      return '';
    }

    let serializedValue = value.replace(/\n/g, BREAK_LINE);

    if (decorate) {
      let decorationIndex = DEFAULT_DECORATION_INDEX;
      if (serializedValue.includes(BREAK_LINE)) {
        decorationIndex = serializedValue.indexOf(BREAK_LINE);
      }

      serializedValue =
        this.decorateLine(serializedValue.slice(0, decorationIndex)) + serializedValue.slice(decorationIndex);
    }

    if (serializedValue.endsWith(BREAK_LINE)) {
      serializedValue += BREAK_LINE;
    }

    return serializedValue;
  }

  decorateLine(line: string): string {
    return `<span class="decorated">${line}</span>`;
  }

  undecorateLine(line: string): string {
    if (!line || !line.includes('<span')) {
      return line;
    }
    return line.replace(/<span.*>(.*)<\/span>/g, '$1');
  }
}
