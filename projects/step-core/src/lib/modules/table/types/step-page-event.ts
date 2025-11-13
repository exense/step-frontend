import { PageEvent } from '@angular/material/paginator';

export type StepPageEvent = Omit<PageEvent, 'length' | 'previousPageIndex'>;
