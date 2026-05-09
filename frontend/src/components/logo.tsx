interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-xl', sub: 'text-xs' },
    md: { icon: 40, text: 'text-3xl', sub: 'text-xs' },
    lg: { icon: 72, text: 'text-5xl', sub: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <svg width={s.icon} height={s.icon} viewBox="0 0 100 100" fill="none">
        <polygon points="50,5 95,90 80,90 50,28 20,90 5,90" fill="#c9a227" />
        <polygon points="50,35 70,80 60,80 50,58 40,80 30,80" fill="#0a0a0a" />
      </svg>
      {showText && (
        <div>
          <div className={`font-tactical ${s.text} text-[#e8e8e8] leading-none tracking-widest`}>
            APUNTAR
          </div>
          <div className={`${s.sub} text-[#c9a227] tracking-[0.4em] uppercase mt-0.5`}>
            Academia
          </div>
        </div>
      )}
    </div>
  );
}