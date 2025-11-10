import Image from 'next/image';

interface LogoProps {
  className?: string;
  logoUrl?: string; // Optional Sanity override
}

export function Logo({ className = "w-8 h-8", logoUrl }: LogoProps) {
  return (
    <div className={`relative ${className} flex items-center`}>
      <Image
        src={logoUrl || "/long-life-logo.png"}
        alt="Long Life Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
