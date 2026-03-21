import { useEffect, useMemo, useState } from "react";

export type SectionNavItem = {
  id: string;
  label: string;
};

type SectionNavProps = {
  items: SectionNavItem[];
  ariaLabel?: string;
  stickyTop?: number;
  className?: string;
};

function resolveClassName(base: string, extra?: string): string {
  return extra ? `${base} ${extra}` : base;
}

export function SectionNav({
  items,
  ariaLabel = "Navegacion de secciones",
  stickyTop = 0,
  className,
}: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  const validItems = useMemo(
    () => items.filter((item) => item.id.trim() && item.label.trim()),
    [items],
  );

  useEffect(() => {
    if (validItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) return;
        setActiveId(visibleEntries[0].target.id);
      },
      {
        root: null,
        threshold: [0.2, 0.5, 0.75],
        rootMargin: `-${stickyTop + 12}px 0px -55% 0px`,
      },
    );

    validItems.forEach((item) => {
      const target = document.getElementById(item.id);
      if (target) observer.observe(target);
    });

    return () => observer.disconnect();
  }, [validItems, stickyTop]);

  if (validItems.length === 0) return null;

  return (
    <nav className={resolveClassName("cms-section-nav", className)} aria-label={ariaLabel}>
      <div className="cms-section-nav-track">
        {validItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              className={
                isActive
                  ? "cms-section-nav-link cms-section-nav-link-active"
                  : "cms-section-nav-link"
              }
              onClick={() => {
                const target = document.getElementById(item.id);
                if (!target) return;
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveId(item.id);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
