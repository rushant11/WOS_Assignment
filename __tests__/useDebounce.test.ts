/**
 * Unit tests for the custom useDebounce hook.
 * Verifies debounce timing using Jest fake timers and react-test-renderer.
 */
import React, { act } from 'react';
import { create, type ReactTestRenderer } from 'react-test-renderer';
import { useDebounce } from '../src/shared/hooks/useDebounce';

// ─── Minimal renderHook helper ───────────────────────────────────────────────

function renderHook<TProps extends object, TResult>(
  hookFn: (props: TProps) => TResult,
  initialProps: TProps,
) {
  let result: TResult | undefined;

  function TestComponent(props: TProps) {
    result = hookFn(props);
    return null;
  }

  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      React.createElement(TestComponent as React.ComponentType, initialProps),
    );
  });

  return {
    get current() { return result as TResult; },
    async rerender(newProps: TProps) {
      await act(async () => {
        renderer.update(
          React.createElement(TestComponent as React.ComponentType, newProps),
        );
      });
    },
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useDebounce', () => {
  it('returns the initial value immediately', async () => {
    const hook = renderHook(() => useDebounce('hello', 300), {});
    await act(async () => {});
    expect(hook.current).toBe('hello');
  });

  it('does NOT update before the delay has elapsed', async () => {
    const hook = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { v: 'first' },
    );
    await act(async () => {});

    await hook.rerender({ v: 'second' });
    await act(async () => { jest.advanceTimersByTime(200); });
    expect(hook.current).toBe('first');
  });

  it('updates to the new value after the full delay', async () => {
    const hook = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { v: 'first' },
    );
    await act(async () => {});

    await hook.rerender({ v: 'second' });
    await act(async () => { jest.advanceTimersByTime(300); });
    expect(hook.current).toBe('second');
  });

  it('resets the timer on rapid successive changes', async () => {
    const hook = renderHook(
      ({ v }: { v: string }) => useDebounce(v, 300),
      { v: 'a' },
    );
    await act(async () => {});

    await hook.rerender({ v: 'ab' });
    await act(async () => { jest.advanceTimersByTime(100); });

    await hook.rerender({ v: 'abc' });
    await act(async () => { jest.advanceTimersByTime(100); });

    await hook.rerender({ v: 'abcd' });
    await act(async () => { jest.advanceTimersByTime(200); });
    expect(hook.current).toBe('a');

    await act(async () => { jest.advanceTimersByTime(100); });
    expect(hook.current).toBe('abcd');
  });

  it('works with number types', async () => {
    const hook = renderHook(
      ({ v }: { v: number }) => useDebounce<number>(v, 500),
      { v: 1 },
    );
    await act(async () => {});

    await hook.rerender({ v: 42 });
    await act(async () => { jest.advanceTimersByTime(500); });
    expect(hook.current).toBe(42);
  });

  it('uses the default 300ms delay when no delay is specified', async () => {
    const hook = renderHook(
      ({ v }: { v: string }) => useDebounce(v),
      { v: 'old' },
    );
    await act(async () => {});

    await hook.rerender({ v: 'new' });
    await act(async () => { jest.advanceTimersByTime(299); });
    expect(hook.current).toBe('old');

    await act(async () => { jest.advanceTimersByTime(1); });
    expect(hook.current).toBe('new');
  });
});
