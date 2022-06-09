export interface Bucket {
    begin: number;
    attributes: any;
    count: number;
    sum: number;
    min: number;
    max: number;
    pclPrecision: number;
    distribution: {[key: number]: number};
}
