import { TestScheduler } from 'rxjs/testing';
import { debounceInput } from '../src/debounce-input';

describe('使用 TestScheduler 測試 debounceInput', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('文字長度大於等於 3 才允許事件發生', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const input = {
        a: 'rxjs',
        b: 'rx'
      };
      const expectedOutput = {
        x: 'rxjs'
      };

      // b 事件的內容不到 3 個字，因此沒有事件發生
      const sourceMarbleDiagram = 'a 300ms   100ms b';
      const expectedResult      = '  300ms x 100ms  ';

      const sourceObservable = cold(sourceMarbleDiagram, input);
      const source$ = sourceObservable.pipe(debounceInput());
      expectObservable(source$).toBe(expectedResult, expectedOutput);
    });
  });

  it('300ms 內沒有的輸入才允許事件發生', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;
      const input = {
        a: 'rxjs-demo',
        b: 'rxjs-test',
        c: 'rxjs'
      };

      // a--b 後等待 100ms 繼續輸入文字 (事件 c)，因為沒超過 300ms 所以沒有新事件
      // 之後 300ms 沒有新的輸入，將最後資料當作事件發送
      const sourceMarbleDiagram = 'a--b 100ms c';
      const expectedResult      = '---- 100ms 300ms c';

      const sourceObservable = cold(sourceMarbleDiagram, input);
      const source$ = sourceObservable.pipe(debounceInput());
      expectObservable(source$).toBe(expectedResult, input);
    });
  });

  it('事件值跟上次相同時，不允許本次事件發生', () => {
    testScheduler.run((helpers) => {
      const { cold, expectObservable } = helpers;

      const input = {
        a: 'rxj',
        b: 'rxjs',
        c: 'rxjs',
        d: 'rxj'
      };

      // 由於 b 事件跟 c 事件的內容一樣，因此事件不會發生
      // 由於 c 事件跟 d 事件的內容不同，因此事件繼續發生
      // 若使用 distinct 則會因為 a 和 d 事件一樣而不發生新事件
      const sourceMarbleDiagram = 'a 300ms   b 300ms   c 300ms d';
      const expectedResult      = '  300ms a   300ms b - 300ms   300ms d';

      const sourceObservable = cold(sourceMarbleDiagram, input);
      const source$ = sourceObservable.pipe(debounceInput());
      expectObservable(source$).toBe(expectedResult, input);
    });
  });
});
