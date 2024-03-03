import { Injectable, signal, TemplateRef } from '@angular/core';
import { Alert } from '../shared/alert';
import { AlertType } from '../shared/alert-type.enum';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private alertsInternal = signal<Alert[]>([]);

  readonly alerts = this.alertsInternal.asReadonly();

  add(template: TemplateRef<any>, type?: AlertType, autoDismissTimeout?: number): string;
  add(message: string, type?: AlertType, autoDismissTimeout?: number): string;
  add(messageOrTemplate: string | TemplateRef<any>, type?: AlertType, autoDismissTimeout?: number): string {
    const alert = this.createAlert(messageOrTemplate, type);
    const alerts = this.alertsInternal().concat(alert);
    this.alertsInternal.set(alerts);
    if (autoDismissTimeout !== undefined) {
      this.setupAutoDismiss(alert, autoDismissTimeout);
    }
    return alert.id;
  }

  replace(oldId: string, template: TemplateRef<any>, type?: AlertType, autoDismissTimeout?: number): string;
  replace(oldId: string, message: string, type?: AlertType, autoDismissTimeout?: number): string;
  replace(
    oldId: string,
    messageOrTemplate: string | TemplateRef<any>,
    type?: AlertType,
    autoDismissTimeout?: number,
  ): string {
    const oldIndex = this.alertsInternal().findIndex((alert) => alert.id === oldId);
    const alert = this.createAlert(messageOrTemplate, type);
    let alerts: Alert[];
    if (oldIndex < 0) {
      alerts = this.alertsInternal().concat(alert);
    } else {
      alerts = [...this.alertsInternal()];
      alerts.splice(oldIndex, 1, alert);
    }
    this.alertsInternal.set(alerts);
    if (autoDismissTimeout !== undefined) {
      this.setupAutoDismiss(alert, autoDismissTimeout);
    }
    return alert.id;
  }

  remove(id: string): void {
    const alerts = this.alertsInternal().filter((alert) => alert.id !== id);
    this.alertsInternal.set(alerts);
  }

  private createAlert(messageOrTemplate: string | TemplateRef<any>, type: AlertType = AlertType.DEFAULT): Alert {
    const id = v4();
    const { message, template } =
      typeof messageOrTemplate === 'string'
        ? { message: messageOrTemplate, template: undefined }
        : { template: messageOrTemplate, message: undefined };
    return { id, type, message, template };
  }

  private setupAutoDismiss(alert: Alert, autoDismissTimeout: number): void {
    const { id } = alert;
    setTimeout(() => this.remove(id), autoDismissTimeout);
  }
}
