import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { AJS_MODULE } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { ModalWindowService } from './modal-window.service';

@Component({
  selector: 'step-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.scss'],
})
export class ModalWindowComponent {
  @ViewChild('customButtons', { read: ViewContainerRef, static: true }) container?: ViewContainerRef;

  @Input() title: string = '';
  @Input() componentName: string = '';

  constructor(public modalWindowService: ModalWindowService) {}
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepModalWindow', downgradeComponent({ component: ModalWindowComponent }));
