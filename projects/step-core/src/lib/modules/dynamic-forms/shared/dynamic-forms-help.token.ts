import { InjectionToken } from '@angular/core';
import { HelpMessage } from '../../basics/step-basics.module';
import { DYNAMIC_VALUES_HELP_URL } from './constants';

// The html is trusted application markup rendered with a sanitizer bypass. It must never contain user data.
export const DYNAMIC_EXPRESSION_HELP = new InjectionToken<Required<HelpMessage>>('Dynamic expression help', {
  providedIn: 'root',
  factory: () => ({
    html:
      '<p>The whole field is a Groovy expression, for example "http://" + host + ":8080/api". ' +
      'Use it when you need a number, a boolean or a complex object rather than text, ' +
      'or logic the placeholder syntax cannot express.</p>',
    learnMoreUrl: DYNAMIC_VALUES_HELP_URL,
  }),
});

export const PLAIN_VALUE_HELP = new InjectionToken<Required<HelpMessage>>('Plain value help', {
  providedIn: 'root',
  factory: () => ({
    html:
      '<p>Plain (non dynamic) plan values can now embed variables using the ${...} placeholder syntax. ' +
      'A value containing ${ was previously used literally and is now evaluated, ' +
      'so existing values have to be escaped to keep their meaning.</p>' +
      '<p>This is done for you, in two different ways depending on where the value lives. ' +
      'Only the values containing ${ are ever rewritten: ' +
      'a value without it, including one containing $ or $$, is never touched.</p>',
    learnMoreUrl: DYNAMIC_VALUES_HELP_URL,
  }),
});
