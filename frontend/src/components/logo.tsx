import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-xl', sub: 'text-xs' },
    md: { icon: 48, text: 'text-3xl', sub: 'text-xs' },
    lg: { icon: 80, text: 'text-5xl', sub: 'text-sm' },
  };

  const s = sizes[size];

  return (
     <div className="flex items-center gap-3">
      <Image
        src="/images/logo.png"
        alt="Apuntar Academia"
        width={521}
        height={479}
        style={{ height: s.icon, width: s.icon }}
        className="object-contain"
        priority
      />
      {showText && (
        <Image
          src="/images/letras.png"
          alt="Apuntar Academia"
          width={713}
          height={200}
          style={{ height: s.icon, width: s.icon * 4}}
          className="object-contain"
          priority
        />
      )}
    </div>
  );
}