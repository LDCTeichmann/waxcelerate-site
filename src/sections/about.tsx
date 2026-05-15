import { useEffect, useRef, useState } from 'react';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}</span>;
}

export function About() {
  const { t, lang } = useLanguage();

  const stats = [
    { value: 100, suffix: '%', label: t.about.stats.rating },
    { value: 500, suffix: '+', label: t.about.stats.sold },
    { value: 2024, suffix: '', label: lang === 'de' ? 'Waxcelerate seit' : 'Waxcelerate since' },
    { value: 24, suffix: 'h', label: lang === 'de' ? 'Versand in < 24h' : 'Ships in < 24h' },
  ];

  return (
    <section id="ueber-mich" className="py-24 bg-wx-bg">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-[#4A6AEE] uppercase mb-3 block font-medium">
              {lang === 'de' ? 'Über Uns' : 'About Us'}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t.about.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Story */}
            <div>
              <p className="text-wx-tx2 mb-4 leading-relaxed">
                {t.about.bio1}
              </p>
              <p className="text-wx-tx2 mb-4 leading-relaxed">
                {t.about.bio2}
              </p>
              <p className="text-wx-tx2 mb-8 leading-relaxed">
                {t.about.bio3}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-wx-tx2">
                  <MapPin className="h-5 w-5 text-[#4A6AEE]" />
                  <span className="text-sm">{t.about.location}</span>
                </div>
                <div className="flex items-center gap-3 text-wx-tx2">
                  <Mail className="h-5 w-5 text-[#4A6AEE]" />
                  <a href="mailto:waxcelerate@gmail.com" className="text-sm hover:text-[#4A6AEE] transition-colors">
                    {t.about.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-wx-tx2">
                  <Phone className="h-5 w-5 text-[#4A6AEE]" />
                  <a href="tel:+4915751957470" className="text-sm hover:text-[#4A6AEE] transition-colors">
                    {t.about.phone}
                  </a>
                </div>
                <a
                  href="https://www.ebay.de/usr/waxcelerate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#4A6AEE] hover:text-[#6478F5] transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span className="text-sm">{t.about.ebay}</span>
                </a>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="bg-wx-sf border border-wx-bd/30 rounded-2xl p-8">
              <div className="text-center mb-8">
                <img
                  src="/images/logo.jpg"
                  alt="Waxcelerate"
                  className="h-14 mx-auto mb-4 rounded-sm"
                />
                <p className="font-display text-lg text-wx-tx1">
                  WAXCELERATE
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-center">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl sm:text-4xl font-bold text-[#4A6AEE] mb-1">
                      {stat.value === 100 ? (
                        <>{stat.value}{stat.suffix}</>
                      ) : stat.value === 2024 ? (
                        <>{stat.value}</>
                      ) : stat.value === 24 ? (
                        <>{'<'}{stat.value}{stat.suffix}</>
                      ) : (
                        <><CountUp end={stat.value} />{stat.suffix}</>
                      )}
                    </div>
                    <div className="text-wx-tx2 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
