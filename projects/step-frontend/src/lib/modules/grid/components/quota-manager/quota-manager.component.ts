import { Component, inject, OnInit } from '@angular/core';
import { AugmentedQuotaManagerService } from '@exense/step-core';

@Component({
  selector: 'step-quota-manager',
  templateUrl: './quota-manager.component.html',
  styleUrls: ['./quota-manager.component.scss'],
  standalone: false,
})
export class QuotaManagerComponent implements OnInit {
  private _quotaManager = inject(AugmentedQuotaManagerService);

  protected statusText = '';

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this._quotaManager.getQuotaManagerStatus().subscribe({
      next: (value) => (this.statusText = value),
      error: () => (this.statusText = ''),
    });
  }
}
