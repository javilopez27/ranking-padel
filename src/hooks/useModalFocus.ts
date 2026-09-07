import { useEffect, useRef } from 'react';

export function useModalFocus(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = ref.current;
    if (!element) return;
    const focusables = () => Array.from(element.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex="0"]'));
    focusables()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = focusables();
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    element.addEventListener('keydown', onKey);
    return () => { element.removeEventListener('keydown', onKey); previous?.focus(); };
  }, []);
  return ref;
}
