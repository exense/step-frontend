import { Observable } from 'rxjs';

export interface CanLeaveComponent {
  canLeave(): boolean | Observable<boolean>;
}
