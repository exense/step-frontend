import { IPromise, IScope } from 'angular';
import { Injectable } from '@angular/core';
import { INJECTOR } from '../modules/basics/step-basics.module';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('Dialogs'),
  deps: [INJECTOR],
})
export abstract class DialogsService {
  abstract showDeleteWarning(i: number, itemName?: string, secondaryText?: string): IPromise<unknown>;
  abstract showWarning(msg: string): IPromise<unknown>;
  abstract showErrorMsg(msg: string, callback?: Function): IPromise<unknown>;
  abstract showListOfMsgs(messages: string[]): IPromise<unknown>;
  abstract editTextField(scope: IScope): void;
  abstract enterValue(
    title: string,
    message: string,
    size: string,
    template: string,
    functionOnSuccess: (value: string) => void
  ): void;
  abstract showEntityInAnotherProject(newProjectName?: string): IPromise<unknown>;
}
