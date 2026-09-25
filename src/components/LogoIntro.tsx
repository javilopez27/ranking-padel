import { useEffect, useState, type ReactNode } from 'react';

export function LogoIntro({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(() =>
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const skipIfReduced = () => { if (motion.matches) setVisible(false); };
    motion.addEventListener('change', skipIfReduced);
    // Release the page even if the browser never dispatches animationend.
    const fallback = window.setTimeout(() => setVisible(false), 2400);

    return () => {
      window.clearTimeout(fallback);
      motion.removeEventListener('change', skipIfReduced);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <>
      <div inert={visible}>{children}</div>
      {visible && (
        <div
          className="logo-intro"
          role="status"
          aria-label="Entrando en Ranking Padel"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setVisible(false);
          }}
        >
          <img
            className="logo-intro-image"
            src="./logo.png"
            alt="Ranking Padel"
            width={180}
            height={180}
            fetchPriority="high"
            onError={() => setVisible(false)}
          />
        </div>
      )}
    </>
  );
}
