import { Observable } from 'rxjs';

export interface DeactivateComponentDataInterface {
  canExit(): boolean | Observable<boolean>;
}
