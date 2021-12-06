import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { firstValueFrom, Observable } from 'rxjs';

export interface AuthContext {
  userID: string;
  rights: string;
  role: string;
  otp: boolean;
  session: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _http: HttpClient,
    @Inject('$rootScope') private _$rootScope: any,
    @Inject('$location') private _$location: any,
    @Inject(DOCUMENT) private _document: Document,
    @Inject('Preferences') private _preferences: any,
    @Inject('$uibModal') private _$uibModal: any
  ) { }

  private _serviceContext: any = {};

  private setContext(session: any): void {
    const context: AuthContext = {
      userID:session.username, 
      rights:session.role.rights, 
      role:session.role.attributes.name, 
      otp:session.otp, 
      session: {}
    };
    this._$rootScope.context = context;
    this._preferences.load();
  }

  getContext(): AuthContext {
    return this._$rootScope.context as AuthContext;
  }

  async init(): Promise<unknown> {
    const response = await firstValueFrom(this._http.get('rest/access/conf') as Observable<HttpResponse<any>>);
    this._serviceContext.conf = response.body;
    this._document.title = this._serviceContext.conf.title;
    return undefined;
  }

  async getSession(): Promise<unknown> {
    try {
      const response = await firstValueFrom(this._http.get('rest/access/session') as Observable<HttpResponse<any>>);
      if (response.body.opt) {
        await this.showPasswordChangeDialog(true);
        response.body.opt = false;
        this.setContext(response.body);
        return response;
      } else {
        this.setContext(response.body);
        return response;
      }
    } catch (err) {
      return err;
    }
  }

  async login(credentials: any): Promise<unknown> {
    await firstValueFrom(this._http.post('rest/access/login', credentials));
    await this.getSession();
    const context = this.getContext();
    if (context && !context.otp) {
      this._$rootScope.broadcast('step.login.succeeded');
      if (this._$location.path().indexOf('login') !== -1) {
        this.gotoDefaultPage();
      }
    }
    return undefined;
	};

  async logout(): Promise<unknown> {
    await firstValueFrom(this._http.post('rest/access/logout', {}));
    this._$rootScope.context = {userID: 'anonymous'};
    this.gotoDefaultPage();
    return undefined;
  }

  goToLoginPage(): any {
		return this._$location.path('/root/login')
	}; 

  gotoDefaultPage(): void {
    console.log('gotoDefaultPage', this._serviceContext.conf.defaultUrl);
		if(this._serviceContext.conf && this._serviceContext.conf.defaultUrl) {
			this._$location.path(this._serviceContext.conf.defaultUrl)
		} else {
			this._$location.path('/root/plans/list')
		}
  }

  isAuthenticated(): boolean {
    return this._$rootScope.context.userID && 
           this._$rootScope.context.userID !== 'anonymous';
  }

  isExtLoginAuth(): boolean {
    return this._serviceContext.conf.noLoginMask;
  }

  hasRight(right: string): boolean {
    // don't allow write- or delete- actions in the [All] tenant except for user and project
	  if (this._$rootScope.tenant && (this._$rootScope.tenant.name === '[All]' || this._$rootScope.tenant.name === '[None]') &&
    !(right.startsWith('user') || right.startsWith('project')) &&
    (right.endsWith('-write') || right.endsWith('-delete')  || right.endsWith('-execute'))) {
      return false;
    }
  
    return this._$rootScope.context &&
           this._$rootScope.context.rights ? 
              this._$rootScope.context.rights.indexOf(right) !== -1 : false;
  }

  getConf(): any {
    return this._serviceContext.conf;
  }

  debug(): boolean {
    const conf = this._serviceContext.conf;
    return conf ? conf.debug : false;
  }

  showPasswordChangeDialog(otp: boolean): Promise<unknown> {
      const modalInstance = this._$uibModal.open({
        backdrop: 'static',
        animation: false,
        templateUrl: 'partials/changePasswordForm.html',
        controller: 'ChangePasswordModalCtrl', resolve: {
          otp: function () {
            return otp;
          }
        }});
      return new Promise<unknown>(
        (resolve, reject) => modalInstance.result.then(resolve, reject)
      ); 
  }
}

getAngularJSGlobal()
.module('tecAdminApp')
.service('AuthService2', downgradeInjectable(AuthService));