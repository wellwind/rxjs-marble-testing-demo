import { iif, of, throwError } from 'rxjs';
import { concatMap, delay, map, switchMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { emitOne$, emitOneToFour$, emitOntToFourPerSecond$, plusOne } from '../src';

describe('使用 TestSchedule 測試實際寫好的 Observable 或 Operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('使用彈珠圖測試單一個事件的 Observable', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;

      // 1 會被當事件字串，因此不能這樣寫
      // const expectedResult = (1|);
      const expected = '(a|)';
      expectObservable(emitOne$).toBe(expected, { a: 1 });
    });
  });

  it('使用彈珠圖測試多個事件的 Observable', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;

      const expected = '(abcd|)';
      expectObservable(emitOneToFour$).toBe(expected, { a: 1, b: 2, c: 3, d: 4 });
    });
  });

  it('使用彈珠圖測試非同步處理的 Observable', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;

      // 因為事件本身佔一個 frame，所以用 999ms
      const expected = 'a 999ms b 999ms c 999ms (d|)';
      expectObservable(emitOntToFourPerSecond$)
        .toBe(expected, { a: 0, b: 1, c: 2, d: 3 });
    });
  });

  it('使用彈珠圖測試 operator', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;

      const source$ = of(1).pipe(plusOne());
      const expected = '(a|)';
      expectObservable(source$).toBe(expected, { a: 2 });
    });
  });

  it('使用彈珠圖測試 operator 的另一種寫法', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;

      const one$ = of(1);
      const source$ = plusOne()(one$);
      const expected = '(a|)';
      expectObservable(source$).toBe(expected, { a: 2 });
    });
  });
});
