'use client';

import Link from 'next/link';

export default function HomeLink() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Link href="/" onClick={handleClick} className="text-gray-400 hover:text-[#ff4d94] transition-all hover:pr-2">
      الرئيسية
    </Link>
  );
}