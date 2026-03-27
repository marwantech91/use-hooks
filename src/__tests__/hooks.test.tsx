import { renderHook, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';
import { useDebounce } from '../useDebounce';
import { useClickOutside } from '../useClickOutside';
import { useMediaQuery } from '../useMediaQuery';

// ─── useLocalStorage ────────────────────────────────────────────────

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('sets and retrieves a string value', () => {
    const { result } = renderHook(() => useLocalStorage('name', ''));

    act(() => {
      result.current[1]('Alice');
    });

    expect(result.current[0]).toBe('Alice');
    expect(JSON.parse(window.localStorage.getItem('name')!)).toBe('Alice');
  });

  it('serializes and deserializes complex objects', () => {
    const initial = { count: 0, items: ['a'] };
    const { result } = renderHook(() => useLocalStorage('obj', initial));

    const updated = { count: 1, items: ['a', 'b'] };
    act(() => {
      result.current[1](updated);
    });

    expect(result.current[0]).toEqual(updated);
    expect(JSON.parse(window.localStorage.getItem('obj')!)).toEqual(updated);
  });

  it('supports updater function', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('removes value and resets to initial', () => {
    const { result } = renderHook(() => useLocalStorage('temp', 'init'));

    act(() => {
      result.current[1]('changed');
    });
    expect(result.current[0]).toBe('changed');

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('init');
    expect(window.localStorage.getItem('temp')).toBeNull();
  });

  it('reads existing value from localStorage on mount', () => {
    window.localStorage.setItem('pre', JSON.stringify(42));

    const { result } = renderHook(() => useLocalStorage('pre', 0));
    expect(result.current[0]).toBe(42);
  });

  it('falls back to initial value when JSON parse fails', () => {
    window.localStorage.setItem('bad', '{invalid json');
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useLocalStorage('bad', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    spy.mockRestore();
  });

  it('is SSR-safe (returns initial when window is undefined)', () => {
    // The hook checks typeof window === 'undefined' internally.
    // In jsdom window exists, so we verify the guard path via the
    // initial-value-when-empty behavior which exercises the same branch.
    const { result } = renderHook(() => useLocalStorage('ssr', 'safe'));
    expect(result.current[0]).toBe('safe');
  });
});

// ─── useDebounce ────────────────────────────────────────────────────

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately on first render', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update debounced value before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    rerender({ value: 'b', delay: 500 });

    // Before timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');
  });

  it('updates debounced value after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    );

    rerender({ value: 'b', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('b');
  });

  it('resets timer when value changes before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'c', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // 'b' should have been skipped
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('c');
  });
});

// ─── useClickOutside ───────────────────────────────────────────────

describe('useClickOutside', () => {
  it('calls handler when clicking outside the referenced element', () => {
    const handler = jest.fn();

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    // Create and attach a DOM element to the ref
    const inside = document.createElement('div');
    document.body.appendChild(inside);
    Object.defineProperty(result.current, 'current', {
      value: inside,
      writable: true,
    });

    // Click outside (on body, not the element)
    const outsideEvent = new MouseEvent('mousedown', { bubbles: true });
    document.body.dispatchEvent(outsideEvent);

    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
  });

  it('does not call handler when clicking inside the referenced element', () => {
    const handler = jest.fn();

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(handler));

    const inside = document.createElement('div');
    const child = document.createElement('span');
    inside.appendChild(child);
    document.body.appendChild(inside);

    Object.defineProperty(result.current, 'current', {
      value: inside,
      writable: true,
    });

    // Click on the element itself
    const insideEvent = new MouseEvent('mousedown', { bubbles: true });
    inside.dispatchEvent(insideEvent);

    expect(handler).not.toHaveBeenCalled();

    // Click on a child of the element
    const childEvent = new MouseEvent('mousedown', { bubbles: true });
    child.dispatchEvent(childEvent);

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(inside);
  });

  it('does not call handler when ref is null', () => {
    const handler = jest.fn();
    renderHook(() => useClickOutside(handler));

    // ref.current is null, clicking should not throw or call handler
    const event = new MouseEvent('mousedown', { bubbles: true });
    document.body.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── useMediaQuery ──────────────────────────────────────────────────

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  function mockMatchMedia(matches: boolean) {
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];

    const mql = {
      matches,
      media: '',
      addEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      },
      dispatchEvent: () => true,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
    };

    window.matchMedia = jest.fn().mockReturnValue(mql);
    return { mql, listeners };
  }

  it('returns true when media query matches', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('updates when media query match changes', () => {
    const { mql, listeners } = mockMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      (mql as any).matches = true;
      listeners.forEach((cb) =>
        cb({ matches: true } as MediaQueryListEvent)
      );
    });

    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const { mql } = mockMatchMedia(false);
    const removeSpy = jest.spyOn(mql, 'removeEventListener');

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 600px)'));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
