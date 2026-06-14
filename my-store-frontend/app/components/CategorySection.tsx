"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, LayoutGrid, Sofa, Bed, Lamp, Table, Armchair, Home } from "lucide-react";

interface Category {
  id: number;
  documentId: string;
  Name: string;
  Slug: string;
}

interface CategorySectionProps {
  categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 6;
  
  const allCategories = categories || [];
  const visibleCategories = showAll ? allCategories : allCategories.slice(0, initialCount);

  // دالة ذكية لاختيار الأيقونة بناءً على اسم الفئة
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("كنب") || n.includes("معيشة")) return <Sofa size={38} />;
    if (n.includes("نوم") || n.includes("سرير")) return <Bed size={38} />;
    if (n.includes("طاولة") || n.includes("طعام")) return <Table size={38} />;
    if (n.includes("إضاءة") || n.includes("ثريا")) return <Lamp size={38} />;
    if (n.includes("كرسي")) return <Armchair size={38} />;
    return <Home size={38} />;
  };

  return (
    <section id="categories" className="py-24 bg-[#fcfcfc] font-zain overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* رأس القسم بالنصوص الجديدة */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-3 bg-[#1c74e9]/5 px-5 py-2 rounded-full border border-[#1c74e9]/10">
            <LayoutGrid className="text-[#1c74e9]" size={20} />
            <span className="text-[#1c74e9] font-bold text-lg tracking-widest uppercase">
              الأقسام الرئيسية
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-[#020617] leading-tight">
            تصفح <span className="text-[#ff4d94]">بيت الود</span> ببساطة
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#1c74e9] to-[#ff4d94] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* شبكة التصنيفات البسيطة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleCategories.map((cat, index) => (
            <Link 
              href={`/categories/${cat.Slug}`} 
              key={cat.id}
              className="group relative p-10 h-64 rounded-[2rem] bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(28,116,233,0.1)] hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
            >
              {/* رقم الفئة الخلفي لإعطاء عمق فني */}
              <div className="absolute -left-2 -top-6 text-[9rem] font-black text-gray-50 opacity-[0.05] group-hover:text-[#1c74e9]/10 transition-colors">
                0{index + 1}
              </div>

              <div className="relative z-10">
                <div className="text-[#1c74e9] group-hover:text-[#ff4d94] transition-all duration-500 mb-6 group-hover:scale-110 origin-right">
                  {getIcon(cat.Name)}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#020617] group-hover:translate-x-[-5px] transition-transform">
                  {cat.Name}
                </h3>
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-gray-400 font-medium text-lg group-hover:text-[#020617] transition-colors">
                  اكتشف المجموعة
                </span>
                <ArrowLeft size={24} className="text-[#ff4d94] opacity-0 group-hover:opacity-100 group-hover:translate-x-[-10px] transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* زر إظهار المزيد */}
        {allCategories.length > initialCount && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-3 bg-[#020617] text-white px-10 py-5 rounded-xl font-bold text-xl transition-all hover:bg-[#1c74e9] shadow-2xl active:scale-95"
            >
              <Plus className={`transition-transform duration-500 ${showAll ? 'rotate-45' : ''}`} />
              {showAll ? "إخفاء الأقسام" : "عرض كافة الأقسام"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}