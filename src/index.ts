export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useClickOutside } from './useClickOutside';
export { useMediaQuery } from './useMediaQuery';

// useClickOutside - Detect clicks outside an element
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}
