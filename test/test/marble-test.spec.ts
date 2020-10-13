import { iif, of, throwError } from 'rxjs';
import { concatMap, delay, map, switchMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { emitOne$, emitOneToFour$, emitOntToFourPerSecond$, plusOne } from '../../src';

describe('使用 TestScheduler 測試', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('測試 take operator', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;

      const sourceMarbleDiagram =  '---a---b---c---d---e---|';
      const expectedSubscription = '^----------!';
      const expectedResult =       '---a---b---(c|)';

      const sourceObservable = cold(sourceMarbleDiagram);
      const source$ = sourceObservable.pipe(take(3));

      expectObservable(source$).toBe(expectedResult);
      expectSubscriptions(sourceObservable.subscriptions).toBe(expectedSubscription);
    });
  });

  it('測試 map operator (帶入 value)', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;
      const sourceMarbleDiagram = '--a--b--c--d--|';
      const expectedResult =      '--w--x--y--z--|';

      const sourceObservable = cold(sourceMarbleDiagram, { a: 1, b: 2, c: 3, d: 4 });
      const source$ = sourceObservable.pipe(map(value => value + 1));
      expectObservable(source$).toBe(expectedResult, { w: 2, x: 3, y: 4, z: 5 });
    });
  });

  it('測試 map operator (帶入更複雜的 value)', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;

      const input = {
        a: { name: 'Student A', score: 25 },
        b: { name: 'Student B', score: 49 },
        c: { name: 'Student C', score: 100 },
        d: { name: 'Student D', score: 0 }
      };
      const expected = {
        w: { name: 'Student A', score: 50 },
        x: { name: 'Student B', score: 70 },
        y: { name: 'Student C', score: 100 },
        z: { name: 'Student D', score: 0 }
      };

      const sourceMarbleDiagram = '--a--b--c--d--|';
      const expectedResult =      '--w--x--y--z--|';

      const sourceObservable = cold(sourceMarbleDiagram, input);

      const source$ = sourceObservable.pipe(
        map(student => ({ ...student, score: Math.sqrt(student.score) * 10 }))
      );
      expectObservable(source$).toBe(expectedResult, expected);
    });
  });

  it('測試 error', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;

      const sourceMarbleDiagram =  '---1---2---3---|';
      const expectedResult =       '---1---2---#';
      const expectedSubscription = '^----------!';

      const sourceObservable = cold(sourceMarbleDiagram);
      const source$ = sourceObservable.pipe(
        switchMap(value =>
          iif(() => value === '3', throwError('error'), of(value))
        )
      );

      expectObservable(source$).toBe(expectedResult);
      expectSubscriptions(sourceObservable.subscriptions).toBe(expectedSubscription);
    })
  });

  it('測試時間 time frame', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable } = helpers;

      const sourceMarbleDiagram = '(123|)';
      const expectedResult =      '--- 7ms 1 9ms 2 9ms (3|)';

      const sourceObservable = cold(sourceMarbleDiagram);
      const source$ = sourceObservable.pipe(
        concatMap(value => of(value).pipe(delay(10)))
      );

      expectObservable(source$).toBe(expectedResult);
    });
  });

  it('測試 Hot Observable', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable } = helpers;

      const sourceMarbleDiagram = '--1--2--3--4--5--6--7--8';
      const subscription1 =       '-------^-------!';
      const subscription2 =       '-----------^-----!';
      const expectedResult1 =     '--------3--4--5-';
      const expectedResult2 =     '-----------4--5---';

      const sourceObservable = hot(sourceMarbleDiagram);

      expectObservable(sourceObservable, subscription1).toBe(expectedResult1);
      expectObservable(sourceObservable, subscription2).toBe(expectedResult2);
    });
  });

  describe('使用 TestSchedule 測試實際寫好的 Observable 或 Operator', () => {

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
});
