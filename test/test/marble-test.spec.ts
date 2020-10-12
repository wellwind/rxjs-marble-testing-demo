import { iif, of, throwError } from 'rxjs';
import { concatMap, delay, map, switchMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

describe('使用 TestScheduler 測試', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  })

  it('測試 take operator', () => {
    testScheduler.run(helper => {
      const { cold, expectObservable, expectSubscriptions } = helper;
      const sourceMarbleDiagram =   '---a---b---c---d---e---|';
      const sourceObservable = cold(sourceMarbleDiagram);
      const expectedSubscription =  '^----------!';
      const expectedResult =        '---a---b---(c|)';

      const source$ = sourceObservable.pipe(take(3));
      expectObservable(source$).toBe(expectedResult);
      expectSubscriptions(sourceObservable.subscriptions).toBe(expectedSubscription);
    });
  })

  it('測試 map operator (帶入 value)', () => {
    testScheduler.run(helper => {
      const { cold, expectObservable } = helper;
      const sourceMarbleDiagram =  '---a---b---c---|';
      const sourceObservable = cold(sourceMarbleDiagram, { a: 1, b: 2, c: 3 });
      const expectedResult =       '---x---y---z---|';

      const source$ = sourceObservable.pipe(map(value => value + 1));
      expectObservable(source$).toBe(expectedResult, { x: 2, y: 3, z: 4 });
    });
  });

  it('測試 error', () => {
    testScheduler.run(helper => {
      const { cold, expectObservable, expectSubscriptions } = helper;

      const sourceMarbleDiagram =   '---1---2---3---|';
      const sourceObservable = cold(sourceMarbleDiagram);
      const expectedResult =        '---1---2---#';
      const expectedSubscription =  '^----------!';

      const source$ = sourceObservable.pipe(
        switchMap(value =>
          iif(() => value === '3', throwError('error'), of(value))
        )
      )

      expectObservable(source$).toBe(expectedResult);
      expectSubscriptions(sourceObservable.subscriptions).toBe(expectedSubscription);
    })
  });

  it('測試時間 time frame', () => {
    testScheduler.run(helper => {
      const { cold, expectObservable, expectSubscriptions } = helper;

      const sourceMarbleDiagram = '(123|)';
      const sourceObservable = cold(sourceMarbleDiagram);
      const expectedResult =      '--- 7ms 1 9ms 2 9ms (3|)';

      const source$ = sourceObservable.pipe(
        concatMap(value => of(value).pipe(delay(10)))
      );

      expectObservable(source$).toBe(expectedResult);
    });
  });

  it('測試 Hot Observable', () => {
    testScheduler.run(helper => {
      const { hot, expectObservable } = helper;

      const sourceMarbleDiagram = '--1--2--3--4--5--6--7--8';
      const sourceObservable = hot(sourceMarbleDiagram);
      const subscription1 =       '-------^-------!';
      const subscription2 =       '-----------^-----!';
      const expectedResult1 =     '--------3--4--5-';
      const expectedResult2 =     '-----------4--5---';

      expectObservable(sourceObservable, subscription1).toBe(expectedResult1);
      expectObservable(sourceObservable, subscription2).toBe(expectedResult2);
    });
  });
});
