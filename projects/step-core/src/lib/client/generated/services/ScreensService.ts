/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Input } from '../models/Input';
import type { ScreenInput } from '../models/ScreenInput';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ScreensService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @returns ScreenInput default response
   * @throws ApiError
   */
  public getInput(id: string): Observable<ScreenInput> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/screens/input/{id}',
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
  public deleteInput(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/screens/input/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param screenid
   * @param inputid
   * @returns Input default response
   * @throws ApiError
   */
  public getInputForScreen(screenid: string, inputid: string): Observable<Input> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/screens/{screenid}/{inputid}',
      path: {
        screenid: screenid,
        inputid: inputid,
      },
    });
  }

  /**
   * @param id
   * @returns Input default response
   * @throws ApiError
   */
  public getInputsForScreenGet(id: string): Observable<Array<Input>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/screens/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns Input default response
   * @throws ApiError
   */
  public getInputsForScreenPost(id: string, requestBody?: any): Observable<Array<Input>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/screens/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param screenid
   * @returns ScreenInput default response
   * @throws ApiError
   */
  public getScreenInputsByScreenId(screenid: string): Observable<Array<ScreenInput>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/screens/input/byscreen/{screenid}',
      path: {
        screenid: screenid,
      },
    });
  }

  /**
   * @param id
   * @returns ScreenInput default response
   * @throws ApiError
   */
  public getScreenInputsForScreenGet(id: string): Observable<Array<ScreenInput>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/screens/{id}/screen-inputs',
      path: {
        id: id,
      },
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns ScreenInput default response
   * @throws ApiError
   */
  public getScreenInputsForScreenPost(id: string, requestBody?: any): Observable<Array<ScreenInput>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/screens/{id}/screen-inputs',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns string default response
   * @throws ApiError
   */
  public getScreens(): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/screens',
    });
  }

  /**
   * @param id
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public moveInput(id: string, requestBody?: number): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/screens/input/{id}/move',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public saveInput(requestBody?: ScreenInput): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/screens/input',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
