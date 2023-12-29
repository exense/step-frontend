export const createRange = (stop: number, start: number = 0, step: number = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
