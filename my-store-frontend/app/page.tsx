import LandingSection from "./components/LandingSection";
import ProductSection from "./components/ProductSection";
import LocationSection from "./components/LocationSection"; // استيراد المكون الجديد

// تأكد من أن عنوان URL الخاص بـ Strapi صحيح
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export default async function Home() {
  
  async function safeFetch(endpoint: string) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, { 
        cache: 'no-store' 
      });
      
      if (!res.ok) {
        console.error(`خطأ في جلب البيانات من: ${endpoint}`);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error(`فشل الاتصال بـ Strapi عند: ${endpoint}`, error);
      return null;
    }
  }

  // تنفيذ جميع طلبات البيانات بالتوازي لسرعة التحميل
  const [heroRes, catRes, itemRes, locationRes] = await Promise.all([
    safeFetch("hero?populate=*"),
    safeFetch("categories?populate=*"),
    // جلب المنتجات مع الفئات المرتبطة بها والصور
    safeFetch("items?populate[categories][populate]=*&populate[Images][populate]=*"),
    // جلب بيانات الموقع (Single Type)
    safeFetch("location") 
  ]);

  // تجهيز البيانات المستخرجة
  const heroData = heroRes?.data || null;
  const categories = catRes?.data || [];
  const items = itemRes?.data || [];
  
  // استخراج بيانات الموقع (ندعم البنية القديمة والجديدة لـ Strapi)
  const locationData = locationRes?.data?.attributes || locationRes?.data || null;

  return (
    <main className="min-h-screen bg-white">
      
      {/* 1. قسم الهيرو (العرض الرئيسي) */}
      <LandingSection 
        hero={heroData} 
        contact={{ 
          WhatsApp: "+966XXXXXXXXX", 
          Instagram: "beit_alwed" 
        }} 
      />

      {/* 2. قسم المنتجات (مع الفلترة التي برمجناها بالـ ID) */}
      <ProductSection 
        products={items} 
        categories={categories} 
      />

      {/* 3. قسم الموقع (الخريطة وأوقات العمل) */}
      {/* يظهر فقط إذا كانت هناك بيانات في سترابي، أو يعرض القيم الافتراضية داخل المكون */}
      <LocationSection data={locationData} />

      {/* يمكنك إضافة Footer هنا لاحقاً */}
      
    </main>
  );
}