# use-hooks

![npm](https://img.shields.io/badge/npm-1.0.0-red?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Collection of production-ready React hooks for common UI patterns. Zero dependencies, fully typed, SSR-safe.

## Installation

```bash
npm install @marwantech/use-hooks
```

## Hooks

| Hook | Description |
|------|-------------|
| `useLocalStorage` | Sync state with localStorage |
| `useDebounce` | Debounce rapidly changing values |
| `useClickOutside` | Detect clicks outside element |
| `useMediaQuery` | Responsive design breakpoints |
| `useCopyToClipboard` | Copy text to clipboard |
| `useToggle` | Boolean toggle state |
| `usePrevious` | Track previous value |
| `useOnScreen` | Intersection Observer wrapper |
| `useEventListener` | Safe event listener management |
| `useFetch` | Simple data fetching |

## Usage

### useLocalStorage

```tsx
import { useLocalStorage } from '@marwantech/use-hooks';

function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme: {theme}
    </button>
  );
}
```

### useDebounce

```tsx
import { useDebounce } from '@marwantech/use-hooks';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### useClickOutside

```tsx
import { useClickOutside } from '@marwantech/use-hooks';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

### useMediaQuery

```tsx
import { useMediaQuery } from '@marwantech/use-hooks';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Features

- **TypeScript** - Full type safety
- **SSR Safe** - Works with Next.js
- **Tree Shakeable** - Import only what you need
- **Zero Dependencies** - Lightweight
- **Well Tested** - 100% coverage

## License

MIT
