/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from 'next/link';
// استيراد الأيقونات الأساسية فقط
import { MapPin, Phone } from 'lucide-react';
import HomeLink from './HomeLink'; // اضبط المسار حسب مكان الملف

async function getSocialData() {
  const STRAPI_URL = "http://localhost:1337"; 
  try {
    // التعديل الجوهري: إضافة populate=* لجلب كل البيانات من سترابي 5
    const res = await fetch(`${STRAPI_URL}/api/socialmedia?populate=*`, { 
      cache: 'no-store' 
    });
    const json = await res.json();
    
    // سترابي 5 يعيد البيانات داخل json.data
    return json.data; 
  
  
  } catch (error) {
    return null;
  }
}

export default async function Footer() {
  const data = await getSocialData();
  console.log("البيانات القادمة من سترابي:", data);
  // مخرجات سترابي 5 (الوصول المباشر للحقول)
  const social = {
    description: data?.description || "وصف المتجر...",
    phone: data?.phone || "+213 000 000 000",
    address: data?.address || "الجزائر",
    facebook: data?.Facebook || "#",
    instagram: data?.Instagram || "#",
    whatsapp: data?.WhatsApp || "#",
    tiktok: data?.TikTok || "#",
    location: data?.location || "here",
  };

  const styles = {
    iconWrapper: `flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1.5 active:scale-90 bg-gray-800 text-gray-400`,
    facebook: `hover:bg-[#1877F2] hover:text-white`,
    instagram: `hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white`,
    whatsapp: `hover:bg-[#25D366] hover:text-white`,
    tiktok: `hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#ff0050,-2px_-2px_0px_#2af0ea]`,
    sectionTitle: `text-xl font-bold mb-6 text-white border-r-4 border-[#ff4d94] pr-3`,
    contactItem: `flex items-center gap-4 text-gray-300 mb-5 text-sm`,
  };

  return (
    <footer className="bg-[#0f1729] text-white pt-16 pb-8 border-t border-gray-800 font-zain" dir="rtl">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-right">
        
        <div className="flex flex-col items-start">
          <h3 className="text-2xl font-black mb-6 bg-gradient-to-l from-[#ff4d94] to-[#1c74e9] bg-clip-text text-transparent">بيت الود</h3>
          <p className="text-gray-400 mb-8 leading-relaxed text-sm">{social.description}</p>
          
          <div className="flex gap-4">
            {/* فيسبوك */}
            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className={`${styles.iconWrapper} ${styles.facebook}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>

            {/* انستغرام */}
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className={`${styles.iconWrapper} ${styles.instagram}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>

            {/* واتساب (الشعار الأصلي المشهور) */}
            <a href={social.whatsapp ? `https://wa.me/${social.whatsapp.toString().replace(/\s+/g, '')}` : '#'} target="_blank" rel="noopener noreferrer" className={`${styles.iconWrapper} ${styles.whatsapp}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>

            {/* تيك توك (الشعار الأصلي المشهور) */}
            <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className={`${styles.iconWrapper} ${styles.tiktok}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.08z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>روابط سريعة</h3>
          <ul className="space-y-4">
            <li><HomeLink /></li>
            <li><Link href="/#products" className="text-gray-400 hover:text-[#ff4d94] transition-all hover:pr-2">أحدث المنتجات</Link></li>
            <li><Link href="/#location" className="text-gray-400 hover:text-[#ff4d94] transition-all hover:pr-2"> عن المتجر </Link></li>
            <li><Link href="/privacy-policy" className="text-gray-400 hover:text-[#ff4d94] transition-all hover:pr-2">سياسة الخصوصية </Link></li>
            
          </ul>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>تواصل معنا</h3>
          <div className="mt-8">
            <div className={styles.contactItem}>
              <span className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-xl text-[#ff4d94]"><MapPin size={20} /></span>
              <span className="font-medium text-lg text-gray-200">{social.location}</span>
            </div>
            <div className={styles.contactItem}>
              <span className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-xl text-[#1c74e9]"><Phone size={20} /></span>
              {/* تعديل عرض أرقام الهاتف لتصبح عمودية إذا كان هناك عدة أرقام */}
              <div className="flex flex-col items-start" dir="ltr">
                {social.phone.split(' ').map((number: string, idx: number) => (
                  <span key={idx} className="font-medium text-lg text-gray-200">{number}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* خط حقوق النشر - مضاف حديثًا */}
      <div className="text-center text-gray-400 text-sm mt-12 pt-6 border-t border-gray-800/50">
         جميع الحقوق محفوظة ل بيت الود  {new Date().getFullYear()} © 
      </div>
    </footer>
  );
}
