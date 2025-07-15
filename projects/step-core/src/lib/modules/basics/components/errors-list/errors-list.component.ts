import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'step-errors-list',
  templateUrl: './errors-list.component.html',
  styleUrls: ['./errors-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ErrorsListComponent implements OnChanges {
  protected displayErrors: string[] = [];

  @Input() errors?: ValidationErrors | null;
  @Input() keysDictionary?: Record<string, string>;

  ngOnChanges(changes: SimpleChanges): void {
    let errors: ValidationErrors | undefined = undefined;
    let keysDictionary: Record<string, string> | undefined = undefined;

    const cErrors = changes['errors'];
    if (cErrors?.previousValue !== cErrors?.currentValue || cErrors?.firstChange) {
      errors = cErrors?.currentValue;
    }

    const cKeysDictionary = changes['keysDictionary'];
    if (cKeysDictionary?.previousValue !== cKeysDictionary?.currentValue || cKeysDictionary?.firstChange) {
      keysDictionary = cKeysDictionary?.currentValue;
    }

    if (errors !== undefined || keysDictionary) {
      this.buildDisplayErrors(errors, keysDictionary);
    }
  }

  private buildDisplayErrors(errors?: ValidationErrors | null, keysDictionary?: Record<string, string>): void {
    errors = errors !== undefined ? errors : this.errors;
    keysDictionary = keysDictionary ?? this.keysDictionary ?? {};

    this.displayErrors = Object.entries(errors ?? {}).map(
      ([errorKey, errorValue]) => keysDictionary![errorKey] ?? errorValue,
    );
  }
}
