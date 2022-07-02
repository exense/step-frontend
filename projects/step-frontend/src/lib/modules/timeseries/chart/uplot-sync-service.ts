declare const uPlot: any;

export class UplotSyncService {
  // this is a simple equality matching function
  static syncFunction = (own: any, ext: any) => own == ext;

  static syncGroups: { [key: string]: any } = {};
}
