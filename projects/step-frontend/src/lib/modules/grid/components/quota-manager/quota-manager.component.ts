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
  protected statusTitle!: string;
  protected statusBody!: string;

  ngOnInit(): void {
    this.getQuotaManagerStatus();
  }

  getQuotaManagerStatus(): void {
    this._augmentedQuotaManagerService.getQuotaManagerStatus().subscribe({
      next: (response: string) => {
        const parts = response.split('.');
        if (parts.length > 1) {
          this.statusTitle = parts[0].trim();
          this.statusBody = parts.slice(1).join('.').trim();
        } else {
          this.statusTitle = response.trim();
          this.statusBody = '';
        }
      },
      error: () => {
        this.statusTitle = '';
        this.statusBody = '';
      },
    });
  }

  refresh(): void {
    this.getQuotaManagerStatus();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepQuotaManager', downgradeComponent({ component: QuotaManagerComponent }));
