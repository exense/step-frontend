import { Component, OnInit, inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { AugmentedQuotaManagerService } from '../../services/augmented-quota-manager.service';

@Component({
  selector: 'step-quota-manager',
  templateUrl: './quota-manager.component.html',
  styleUrls: ['./quota-manager.component.scss'],
})
export class QuotaManagerComponent implements OnInit {
  private _augmentedQuotaManagerService = inject(AugmentedQuotaManagerService);
  protected statusTitle = 'Quota Manager';
  protected statusBody = 'Loading...';

  ngOnInit(): void {
    this.updateQuotaManagerStatus();
  }

  updateQuotaManagerStatus(): void {
    this._augmentedQuotaManagerService.getQuotaManagerStatus().subscribe({
      next: (response: string) => {
        this.updateStatus(response);
      },
      error: () => {
        this.clearStatus();
      },
    });
  }

  refresh(): void {
    this.updateQuotaManagerStatus();
  }

  private updateStatus(response: string): void {
    const delimiter = response.includes(':') ? ':' : '.';
    const { title, body } = this.renderMessage(response, delimiter);
    this.statusTitle = title;
    this.statusBody = body;
  }

  private clearStatus(): void {
    this.statusTitle = '';
    this.statusBody = '';
  }

  private renderMessage(message: string, delimiter: string): { title: string; body: string } {
    const parts = message.split(delimiter);
    const title = parts[0].trim() || message.trim();
    const body = parts.slice(1).join(delimiter).trim();
    return { title, body };
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepQuotaManager', downgradeComponent({ component: QuotaManagerComponent }));
