import { RouterLink } from '@angular/router';

export interface Tab<T extends string | number> {
  id: T;
  label?: string;
  link?: RouterLink['routerLink'];
}
