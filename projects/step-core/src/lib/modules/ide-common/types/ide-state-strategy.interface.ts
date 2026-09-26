import { Signal } from '@angular/core';
import { AutomationPackageDescriptor } from '../../../client/ide-generated';

export interface IdeStateStrategy {
  readonly currentPackage: Signal<AutomationPackageDescriptor | undefined>;
  readonly inProgress: Signal<boolean>;
}
