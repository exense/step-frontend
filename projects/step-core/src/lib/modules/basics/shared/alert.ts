import { AlertType } from './alert-type.enum';
import { TemplateRef } from '@angular/core';

export interface Alert {
  id: string;
  type: AlertType;
  message?: string;
  template?: TemplateRef<any>;
}
