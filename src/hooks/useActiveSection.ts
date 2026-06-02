import { useState, useEffect } from 'react';

/**
 * Returns the href of the currently active section (e.g. '#produkte').
 * Uses IntersectionObserver with the same margins as the navigation.
 */
export function useActiveSection(sectionHrefs: string[]): string {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sectionIds = sectionHrefs.map(h => h.replace('#', ''));
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection('#' + entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionHrefs.join(',')]); // stable dep string

  return activeSection;
}
