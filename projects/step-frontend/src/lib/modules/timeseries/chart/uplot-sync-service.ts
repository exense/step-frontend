declare const uPlot: any;

/**
 * This classed is used for the uPlot synchronization built-in mechanism
 */
export class UplotSyncService {
  // this is a simple equality matching function
  static syncFunction = (own: any, ext: any) => own == ext;

  static syncGroups: { [key: string]: any } = {};
}
