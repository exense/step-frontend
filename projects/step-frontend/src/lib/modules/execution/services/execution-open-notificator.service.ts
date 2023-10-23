import { Injectable } from '@angular/core';

@Injectable()
export abstract class ExecutionOpenNotificatorService {
  abstract openNotify(eId: string): void;
}
