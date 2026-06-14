"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Store, Menu, X } from 'lucide-react';
import { useCart } from '../../store/useCart';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const items = useCart((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // دالة للتعامل مع النقر على الرئيسية
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
    // تأخير بسيط لضمان التوجيه ثم التمرير
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const styles = {
    nav: `sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm`,
    container: `container mx-auto px-6 py-4 flex justify-between items-center`,
    logo: `flex items-center gap-2 text-2xl font-black transition-transform hover:scale-105`,
    logoText: `text-[#0f1729]`,
    logoIcon: `text-[#ff4d94]`,
    menuLinks: `hidden md:flex gap-8 font-bold text-[#0f1729]`, 
    link: `hover:text-[#1c74e9] transition-colors duration-300 relative group`,
    linkUnderline: `absolute -bottom-1 right-0 w-0 h-0.5 bg-[#ff4d94] transition-all group-hover:w-full`,
    cartBtn: `relative p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95`,
    badge: `absolute -top-1 -left-1 bg-[#ff4d94] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm`,
  };

  return (
    <nav className={styles.nav} dir="rtl">
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={handleHomeClick}>
          <Store className={styles.logoIcon} size={32} />
          <span className={styles.logoText}>بيت الود</span>
        </Link>

        <div className={styles.menuLinks}>
          <Link href="/" className={styles.link} onClick={handleHomeClick}>
            الرئيسية<span className={styles.linkUnderline}></span>
          </Link>
          <Link href="/#products" className={styles.link}>المنتجات<span className={styles.linkUnderline}></span></Link>
          <Link href="/#location" className={styles.link}>عن المتجر<span className={styles.linkUnderline}></span></Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/checkout" className={styles.cartBtn}>
            <ShoppingCart size={24} className="text-[#0f1729]" />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
          <button 
            onClick={() => setIsOpen(true)} 
            className="md:hidden p-3 bg-gray-50 rounded-2xl text-[#0f1729] hover:bg-gray-100 transition-all"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* قائمة الجوال المنبثقة - خلفية بيضاء تغطي الشاشة كاملة */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* طبقة الخلفية - تمتد لكامل الشاشة */}
          <div className="absolute inset-0 bg-white min-h-screen"></div>
          
          {/* المحتوى - يأخذ المساحة كاملة مع تمرير داخلي */}
          <div className="relative h-screen overflow-y-auto">
            <div className="flex flex-col min-h-screen p-6">
              {/* زر الإغلاق */}
              <div className="flex justify-start">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-[#0f1729] p-2 transition-all duration-300 hover:rotate-90 hover:text-[#ff4d94] active:scale-90"
                >
                  <X size={32} />
                </button>
              </div>

              {/* الشعار (ينقل إلى أعلى الصفحة) */}
              <div className="flex justify-center mt-8 mb-16">
                <Link 
                  href="/" 
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                    setIsOpen(false);
                  }} 
                  className="flex items-center gap-2 text-3xl font-black"
                >
                  <Store className="text-[#ff4d94]" size={36} />
                  <span className="text-[#0f1729]">بيت الود</span>
                </Link>
              </div>

              {/* الروابط */}
              <nav className="flex flex-col items-stretch gap-6 flex-1">
                <Link 
                  href="/" 
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                    setIsOpen(false);
                  }} 
                  className="text-center text-[#0f1729] text-3xl font-bold py-4 border-b border-gray-200 hover:text-[#1c74e9] hover:border-[#1c74e9] transition-all"
                >
                  الرئيسية
                </Link>
                <Link 
                  href="/#products" 
                  onClick={() => setIsOpen(false)} 
                  className="text-center text-[#0f1729] text-3xl font-bold py-4 border-b border-gray-200 hover:text-[#1c74e9] hover:border-[#1c74e9] transition-all"
                >
                  المنتجات
                </Link>
                <Link 
                  href="/#location" 
                  onClick={() => setIsOpen(false)} 
                  className="text-center text-[#0f1729] text-3xl font-bold py-4 border-b border-gray-200 hover:text-[#1c74e9] hover:border-[#1c74e9] transition-all"
                >
                  عن المتجر
                </Link>
              </nav>

              {/* نص سفلي */}
              <div className="text-center text-gray-400 text-sm font-medium mt-8 pb-4">
                بيت الود © 2026
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}