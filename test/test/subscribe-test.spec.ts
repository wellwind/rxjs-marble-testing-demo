import { of } from 'rxjs';
import { emitOne$, emitOneToFour$, emitOntToFourPerSecond$, plusOne } from '../../src';

describe('使用 Subscribe callback 測試', function () {
  it('測試單一個事件的 Observable', () => {
    emitOne$.subscribe(data => {
      expect(data).toEqual(1);
    });
  });

  it('測試多個事件的 Observable', () => {
    const actual: number[] = [];
    emitOneToFour$.subscribe(data => {
      actual.push(data);
    });
    expect(actual).toEqual([1, 2, 3, 4]);
  });

  it('測試非同步處理的 Observable', (done) => {
    const actual: number[] = [];
    emitOntToFourPerSecond$.subscribe({
      next: data => {
        actual.push(data);
      },
      complete: () => {
        expect(actual).toEqual([0, 1, 2, 3]);
        done();
      }
    });
  });

  it('使用 pipe 測試 operator', () => {
    of(1).pipe(
      plusOne()
    ).subscribe(data => {
      expect(data).toEqual(2);
    });
  });

  it('單獨測試一個 operator', () => {
    const source$ = of(1);
    plusOne()(source$).subscribe(data => {
      expect(data).toEqual(2);
    });
  });
});
