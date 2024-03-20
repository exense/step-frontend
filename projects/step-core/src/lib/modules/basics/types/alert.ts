import { TemplateRef } from '@angular/core';
import { AlertType } from './alert-type.enum';

export interface Alert {
  id: string;
  type: AlertType;
  message?: string;
  template?: TemplateRef<any>;
}
