import { toArray } from 'rxjs/operators';
import { plusOne } from '../../src';

describe('使用 Subscribe callback 測試', function () {
  it('使用 Subscribe callback 測試', () => {
    plusOne([1, 2, 3, 4])
      .pipe(toArray())
      .subscribe((result: number[]) => {
        expect(result).toEqual([2, 3, 4, 5]);
      });
  });
});
