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
  abstract showInfo(msg: string): IPromise<unknown>;
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
  abstract selectEntityOfType(entityName: string, singleSelection: boolean, id?: string): IPromise<unknown>;
  abstract selectEntityType(excludeArray: string[], id: string): IPromise<unknown>;
  abstract selectEntityTypeForEntities(excludeArray: string[], callback: Function, arg: unknown): void;
  abstract showEntityInAnotherProject(newProjectName?: string): IPromise<unknown>;
  abstract showAssignmentWarning(msg: string): IPromise<unknown>;
}
