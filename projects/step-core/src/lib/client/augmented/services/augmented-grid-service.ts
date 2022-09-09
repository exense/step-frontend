import { Injectable } from '@angular/core';
import { GridService, Plan } from '../../generated';
import type { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AugmentedGridService extends GridService {
  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public override startTokenMaintenance(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/grid/token/{id}/maintenance',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public override stopTokenMaintenance(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/grid/token/{id}/maintenance',
      path: {
        id: id,
      },
    });
  }
}
