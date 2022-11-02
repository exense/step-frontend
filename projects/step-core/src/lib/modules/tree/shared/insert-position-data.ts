import { CdkDragDrop } from '@angular/cdk/drag-drop';

export type InsertPositionData = Pick<CdkDragDrop<any>, 'previousIndex' | 'currentIndex' | 'distance'>;
