import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AdminService, FunctionPackage, KeywordsService, Plan } from '../../generated';
import { TableRestService } from '../../table/services/table-rest.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import type { Observable } from 'rxjs';
import { ProjectDto } from '../models/project-dto';
import { ProjectMemberDto } from '../models/project-member-dto';

@Injectable({ providedIn: 'root' })
export class AugmentedAdminService extends AdminService {
  readonly projectsDataSource = new TableRemoteDataSource<Plan>('projects', this._tableRest, {
    id: 'id',
    name: 'attributes.name',
    owner: 'attributes.owner',
    actions: '',
  });

  constructor(
    override httpRequest: BaseHttpRequest,
    private _tableRest: TableRestService,
    private _httpClient: HttpClient
  ) {
    super(httpRequest);
  }

  getProject(id: string): Observable<ProjectDto> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/tenants/project/' + id,
    });
  }

  deleteProject(id: string): Observable<ProjectDto> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/tenants/project/' + id,
    });
  }

  assignFunctionsAndEntitiesToProject(id: string, data: any) {
    return this.httpRequest.request({
      method: 'POST',
      url: '/tenants/project/' + id + '/entities',
      body: data,
    });
  }

  getProjectMembers(projectId: string): Observable<Array<ProjectMemberDto>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/tenants/project/' + projectId + '/members',
    });
  }

  removeUserFromProject(userId: string, projectId: string): Observable<ProjectMemberDto> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/tenants/project/' + projectId + '/members/' + userId,
    });
  }

  addUserWithRoleToProject(userId: string, role: string, projectId: string) {
    return this._httpClient.post<any>('rest/tenants/project/' + projectId + '/members/' + userId, role, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}
