import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'step-errors-list',
  templateUrl: './errors-list.component.html',
  styleUrls: ['./errors-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorsListComponent {
  readonly errors = input<ValidationErrors | null | undefined>(undefined);
  readonly keysDictionary = input<Record<string, string> | undefined>(undefined);

  protected readonly displayErrors = computed(() => {
    const errors = this.errors() ?? {};
    const keysDictionary = this.keysDictionary() ?? {};
    return Object.entries(errors ?? {}).map(([errorKey, errorValue]) => keysDictionary![errorKey] ?? errorValue);
  });
}
