export class TsUtils {
  static readonly TS_PARAMS_KEY = 'tsParams';
  static readonly PARAMS_TO_IGNORE = ['tenant'];

  static getURLParams(url: string): any {
    const allParamsObject: any = {};
    let paramsStartIndex = url.indexOf('?');
    if (paramsStartIndex < 0) {
      return {};
    }
    let paramsString = url.substring(paramsStartIndex + 1);
    let paramsPairs = paramsString.split('&');
    paramsPairs.forEach((pair) => {
      let keyValueArray = pair.split('=');
      let key = keyValueArray[0]?.trim();
      let value = keyValueArray[1]?.trim();
      if (key) {
        allParamsObject[key] = value;
      }
    });
    let tsParamsObj = allParamsObject[this.TS_PARAMS_KEY];
    const params: any = {};
    if (tsParamsObj) {
      let tsParams = tsParamsObj.split(',');
      tsParams.forEach((param: string) => {
        if (allParamsObject[param]) {
          params[param] = allParamsObject[param];
        }
      });
    }
    return params;
  }
}
