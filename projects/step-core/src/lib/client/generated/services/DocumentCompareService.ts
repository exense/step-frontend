/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Dimension } from '../models/Dimension';
import type { LanguageEntity } from '../models/LanguageEntity';
import type { RegionDefinion } from '../models/RegionDefinion';
import type { Scenario } from '../models/Scenario';
import type { TestScenario } from '../models/TestScenario';
import type { TestScenarioOutput } from '../models/TestScenarioOutput';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class DocumentCompareService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param sessionid
     * @param lang
     * @param requestBody
     * @returns string default response
     * @throws ApiError
     */
    public extractRegionText(
        sessionid: string,
        lang?: string,
        requestBody?: RegionDefinion,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/imagecompare/doc/{sessionid}/zone/text',
            path: {
                'sessionid': sessionid,
            },
            query: {
                'lang': lang,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param sessionid
     * @param pageid
     * @returns any default response
     * @throws ApiError
     */
    public getDocumentPageAsImage(
        sessionid: string,
        pageid: number,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/doc/{sessionid}/page/{pageid}',
            path: {
                'sessionid': sessionid,
                'pageid': pageid,
            },
        });
    }

    /**
     * @param sessionid
     * @param pageid
     * @returns Dimension default response
     * @throws ApiError
     */
    public getPageDimensionInPt(
        sessionid: string,
        pageid: number,
    ): Observable<Dimension> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/doc/{sessionid}/doc/page/{pageid}/dimension',
            path: {
                'sessionid': sessionid,
                'pageid': pageid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns number default response
     * @throws ApiError
     */
    public getPageIdsWithAnchors(
        sessionid: string,
    ): Observable<Array<number>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/scenario/{sessionid}/pagesIdsWithAnchors',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns string default response
     * @throws ApiError
     */
    public getPdfFilename(
        sessionid: string,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/doc/{sessionid}/doc/filename',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns number default response
     * @throws ApiError
     */
    public getPdfPageCount(
        sessionid: string,
    ): Observable<number> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/doc/{sessionid}/pagecount',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns Scenario default response
     * @throws ApiError
     */
    public getScenario(
        sessionid: string,
    ): Observable<Scenario> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/doc/{sessionid}/scenario',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveScenario(
        sessionid: string,
        requestBody?: Scenario,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/imagecompare/doc/{sessionid}/scenario',
            path: {
                'sessionid': sessionid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param sessionid
     * @returns LanguageEntity default response
     * @throws ApiError
     */
    public getSupportedLanguages(
        sessionid: string,
    ): Observable<LanguageEntity> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/imagecompare/doc/supportedLanguages',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @param filename
     * @returns any default response
     * @throws ApiError
     */
    public loadDocument(
        sessionid: string,
        filename?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/imagecompare/session/{sessionid}/load',
            path: {
                'sessionid': sessionid,
            },
            query: {
                'filename': filename,
            },
        });
    }

    /**
     * @param sessionid
     * @param lang
     * @param requestBody
     * @returns TestScenarioOutput default response
     * @throws ApiError
     */
    public testScenario(
        sessionid: string,
        lang?: string,
        requestBody?: TestScenario,
    ): Observable<TestScenarioOutput> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/imagecompare/scenario/{sessionid}/test',
            path: {
                'sessionid': sessionid,
            },
            query: {
                'lang': lang,
            },
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param sessionid
     * @param lang
     * @param requestBody
     * @returns string default response
     * @throws ApiError
     */
    public extractRegionText1(
        sessionid: string,
        lang?: string,
        requestBody?: RegionDefinion,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/pdftest/doc/{sessionid}/zone/text',
            path: {
                'sessionid': sessionid,
            },
            query: {
                'lang': lang,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param sessionid
     * @param pageid
     * @returns any default response
     * @throws ApiError
     */
    public getDocumentPageAsImage1(
        sessionid: string,
        pageid: number,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/doc/{sessionid}/page/{pageid}',
            path: {
                'sessionid': sessionid,
                'pageid': pageid,
            },
        });
    }

    /**
     * @param sessionid
     * @param pageid
     * @returns Dimension default response
     * @throws ApiError
     */
    public getPageDimensionInPt1(
        sessionid: string,
        pageid: number,
    ): Observable<Dimension> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/doc/{sessionid}/doc/page/{pageid}/dimension',
            path: {
                'sessionid': sessionid,
                'pageid': pageid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns number default response
     * @throws ApiError
     */
    public getPageIdsWithAnchors1(
        sessionid: string,
    ): Observable<Array<number>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/scenario/{sessionid}/pagesIdsWithAnchors',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns string default response
     * @throws ApiError
     */
    public getPdfFilename1(
        sessionid: string,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/doc/{sessionid}/doc/filename',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns number default response
     * @throws ApiError
     */
    public getPdfPageCount1(
        sessionid: string,
    ): Observable<number> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/doc/{sessionid}/pagecount',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @returns Scenario default response
     * @throws ApiError
     */
    public getScenario1(
        sessionid: string,
    ): Observable<Scenario> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/doc/{sessionid}/scenario',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveScenario1(
        sessionid: string,
        requestBody?: Scenario,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/pdftest/doc/{sessionid}/scenario',
            path: {
                'sessionid': sessionid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param sessionid
     * @returns LanguageEntity default response
     * @throws ApiError
     */
    public getSupportedLanguages1(
        sessionid: string,
    ): Observable<LanguageEntity> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/pdftest/doc/supportedLanguages',
            path: {
                'sessionid': sessionid,
            },
        });
    }

    /**
     * @param sessionid
     * @param filename
     * @returns any default response
     * @throws ApiError
     */
    public loadDocument1(
        sessionid: string,
        filename?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/pdftest/session/{sessionid}/load',
            path: {
                'sessionid': sessionid,
            },
            query: {
                'filename': filename,
            },
        });
    }

    /**
     * @param sessionid
     * @param lang
     * @param requestBody
     * @returns TestScenarioOutput default response
     * @throws ApiError
     */
    public testScenario1(
        sessionid: string,
        lang?: string,
        requestBody?: TestScenario,
    ): Observable<TestScenarioOutput> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/pdftest/scenario/{sessionid}/test',
            path: {
                'sessionid': sessionid,
            },
            query: {
                'lang': lang,
            },
            body: requestBody,
            mediaType: '*/*',
        });
    }

}
