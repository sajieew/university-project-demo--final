import { useEffect } from 'react';

export default function useVerificationItemFocus(itemId) {
  useEffect(() => {
    if (!itemId) return undefined;

    let highlightTimeout;
    const frame = requestAnimationFrame(() => {
      const row = document.getElementById(`verification-item-${itemId}`);
      if (!row) return;

      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.add('bg-amber-100', 'ring-2', 'ring-inset', 'ring-amber-400');
      row.querySelector('input[type="checkbox"]')?.focus({ preventScroll: true });
      highlightTimeout = window.setTimeout(() => {
        row.classList.remove('bg-amber-100', 'ring-2', 'ring-inset', 'ring-amber-400');
      }, 2000);
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(highlightTimeout);
    };
  }, [itemId]);
}
