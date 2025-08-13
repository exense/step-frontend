import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[stepStatusIconClass]',
  exportAs: 'StatusIconClass',
})
export class StatusIconClassDirective {
  readonly status = input<string | undefined | null>(undefined);
  readonly classPrefix = input<string>('step');
  readonly iconMode = input(false);

  readonly className = computed(() => {
    const prefix = this.classPrefix();
    const iconMode = this.iconMode();
    const status = this.status();

    return [prefix, iconMode ? 'icon' : '', status].filter((part) => !!part).join('-');
  });
}
