'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <div className="aspect-square rounded-lg bg-ink/5" />;
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-ink/5">
        <Image src={images[i]} alt={`${title}, image ${i + 1}`} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {images.map((src, n) => (
            <li key={src}>
              <button onClick={() => setI(n)} aria-label={`Show image ${n + 1}`} aria-current={n === i}
                className={cn('relative block h-16 w-16 overflow-hidden rounded-md border-2 bg-ink/5', n === i ? 'border-pine' : 'border-transparent')}>
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
