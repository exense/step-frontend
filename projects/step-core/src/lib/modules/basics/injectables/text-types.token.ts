import { InjectionToken } from '@angular/core';
import { TextType } from '../types/text-type.enum';

export const TEXT_TYPES = new InjectionToken<ReadonlySet<TextType>>('Available text types', {
  providedIn: 'root',
  factory: () =>
    new Set([
      TextType.TXT,
      TextType.LOG,
      TextType.MD,
      TextType.CSV,
      TextType.JSON,
      TextType.XML,
      TextType.YAML,
      TextType.YML,
      TextType.INI,
      TextType.CONF,
      TextType.JAVA,
      TextType.C,
      TextType.CPP,
      TextType.H,
      TextType.HPP,
      TextType.SH,
      TextType.BAT,
      TextType.PS1,
      TextType.SQL,
      TextType.PHP,
      TextType.RB,
      TextType.PL,
      TextType.GO,
      TextType.RS,
    ]),
});
