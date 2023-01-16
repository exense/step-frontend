export class UrlUtils {
  static getURLParams(url: string): any {
    const paramsObject: any = {};
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
        paramsObject[key] = value;
      }
    });
    return paramsObject;
  }
}
