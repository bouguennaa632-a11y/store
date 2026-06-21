"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaExpand, FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';
import useEmblaCarousel from 'embla-carousel-react';
<div style={{ background: 'yellow', padding: '10px', margin: '10px', direction: 'ltr' }}>
  API URL: {process.env.NEXT_PUBLIC_STRAPI_URL || 'NOT SET'} 
</div>
// ==================== دالة استخراج imageId ====================
const getImageId = (product: any): number | null => {
  if (product?.Images && Array.isArray(product.Images) && product.Images.length > 0) {
    const firstImage = product.Images[0];
    if (firstImage?.id) {
      return firstImage.id;
    }
  }
  return null;
};

// ==================== مكون ProductRecommendations مع دوار ====================
const ProductRecommendations = ({ 
  allProducts, 
  currentProductId 
}: { 
  allProducts: any[], 
  currentProductId?: string | number 
}) => {
  const recommendedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const filteredProducts = currentProductId 
      ? allProducts.filter(product => {
          const productId = product.id || product.documentId;
          return productId !== currentProductId;
        })
      : allProducts;
    if (filteredProducts.length === 0) return [];
    const shuffled = [...filteredProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(15, shuffled.length));
  }, [allProducts, currentProductId]);

  // إعداد Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    direction: 'rtl',
    loop: false,
    skipSnaps: false,
    dragFree: true
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const addToCartSingle = (productData: any) => {
    const inventory = productData.Inventory ?? 0;
    const isStock = inventory > 0;
    if (!isStock) {
      alert(`⚠️ عذرًا، المنتج "${productData.Name}" غير متوفر في المخزون حالياً`);
      return;
    }

    console.log('🛒 إضافة من المقترحات - imageId:', productData.imageId);

    const cartData = localStorage.getItem('cart-storage');
    let currentData = { state: { items: [] }, version: 0 };
    if (cartData) {
      try { currentData = JSON.parse(cartData); } catch (error) { console.error('❌ خطأ في قراءة السلة:', error); }
    }

    const currentItems: any[] = (currentData.state.items as any[]) || [];
    const existingIndex = currentItems.findIndex((item: any) => item.product && item.product.id === productData.id);
    const productName = productData.Name || 'المنتج';

    if (existingIndex !== -1) {
      const currentQuantity = currentItems[existingIndex].product.quantity || 1;
      currentItems[existingIndex].product.quantity = currentQuantity + 1;
      if (productData.imageId && !currentItems[existingIndex].product.imageId) {
        currentItems[existingIndex].product.imageId = productData.imageId;
      }
    } else {
      currentItems.push({
        product: {
          id: productData.id,
          Name: productData.Name,
          Price: productData.Price,
          Image: productData.Image,
          Description: productData.Description,
          quantity: 1,
          Inventory: inventory,
          imageId: productData.imageId || null
        }
      });
    }

    const updatedData = { state: { items: currentItems }, version: 0 };
    localStorage.setItem('cart-storage', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));

    const message = existingIndex !== -1 
      ? `تم زيادة كمية "${productName}" في السلة`
      : `تم إضافة "${productName}" إلى السلة`;
    alert(`✅ ${message}`);
  };

  if (recommendedProducts.length === 0) return null;

  const getStrapiImageUrl = (imagePath: string, productName: string): string => {
    if (!imagePath) {
      const encodedName = encodeURIComponent(productName.substring(0, 10));
      return `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
    }
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `http://localhost:1337${imagePath}`;
    return imagePath;
  };

  return (
    <div className="mt-16 md:mt-24 py-8 border-t border-gray-100" dir="rtl">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-pink-500 font-bold mb-2 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-pink-500 animate-pulse"></span>
              اكتشف المزيد
            </h3>
            <h2 className="text-2xl md:text-4xl font-[900] text-slate-900 leading-tight">
              منتجات <span className="relative inline-block">
                قد تعجبك
                <span className="absolute bottom-0 right-0 h-2 w-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-40 rounded-full"></span>
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={scrollPrev} 
              disabled={!prevBtnEnabled}
              className={`w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${!prevBtnEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={scrollNext} 
              disabled={!nextBtnEnabled}
              className={`w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${!nextBtnEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* حاوية الدوار مع إخفاء شريط التمرير */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6" style={{ backfaceVisibility: 'hidden' }}>
            {recommendedProducts.map((item: any) => {
              const data = item.attributes || item;
              const productName = data.Name || 'منتج';
              const inventory = data.Inventory ?? 0;
              const isStock = inventory > 0;

              let mainImageUrl = data.Image || '';
              if (data.Images && Array.isArray(data.Images) && data.Images.length > 0) {
                if (typeof data.Images[0] === 'string') mainImageUrl = data.Images[0];
                else if (data.Images[0]?.url) mainImageUrl = data.Images[0].url;
              }
              const imageUrl = getStrapiImageUrl(mainImageUrl, productName);

              let imageId = null;
              if (data.Images && Array.isArray(data.Images) && data.Images.length > 0 && data.Images[0]?.id) {
                imageId = data.Images[0].id;
              }

              return (
                <div 
                  key={`recommended-${item.id}`}
                  className="group bg-white rounded-2xl md:rounded-3xl p-4 border border-slate-100 hover:shadow-xl transition-all duration-500 relative flex-shrink-0 w-48 md:w-56"
                >
                  <Link href={`/product/${item.documentId || item.id}`} className="block mb-3">
                    <div className={`relative bg-slate-50 rounded-xl md:rounded-2xl h-40 md:h-48 flex items-center justify-center overflow-hidden mb-3 ${!isStock ? 'grayscale opacity-60' : ''}`}>
                      {!isStock && (
                        <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-black px-3 py-1 rounded-full z-10 shadow-lg">
                          نفذ
                        </div>
                      )}
                      <img 
                        src={imageUrl} 
                        alt={productName} 
                        className="w-full h-full group-hover:scale-110 transition-transform duration-700 object-cover"
                        onError={(e) => {
                          const encodedName = encodeURIComponent(productName.substring(0, 10));
                          (e.target as HTMLImageElement).src = `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
                        }}
                      />
                    </div>
                    <div className="px-1 text-right">
                      <h3 className="text-sm font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight truncate">
                        {productName}
                      </h3>
                    </div>
                  </Link>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-blue-600 leading-none">
                      {data.Price || 0} <small className="text-[10px] font-bold text-gray-400">د.ج</small>
                    </span>
                    {isStock ? (
                      <button 
                        onClick={() => {
                          addToCartSingle({
                            id: item.documentId || item.id,
                            Name: productName,
                            Price: data.Price || 0,
                            Image: imageUrl,
                            Description: data.Description || '',
                            Inventory: inventory,
                            imageId: imageId
                          });
                        }}
                        className="relative z-20 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-pink-500 rounded-xl text-white flex items-center justify-center overflow-hidden group/btn shadow active:scale-90 transition-all"
                      >
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/btn:-top-full transition-all duration-300 font-bold text-sm">+</span>
                        <span className="absolute top-[150%] left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/btn:top-1/2 transition-all duration-300 text-xs">🛒</span>
                      </button>
                    ) : (
                      <button 
                        disabled
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 border-2 border-gray-100 rounded-xl flex items-center justify-center text-lg shake-animation cursor-not-allowed"
                      >
                        🤕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* إضافة تلميح للسحب للهواتف */}
        <div className="flex md:hidden justify-center mt-4">
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            اسحب لليمين للمزيد
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

// ==================== واجهات البيانات ====================
interface Product {
  id: string;
  documentId?: string;
  Name: string;
  Price: number;
  Image: string;
  Description?: string;
  category?: string;
  Images?: any[];
  Inventory?: number;
}

interface StrapiImage {
  id: number;
  url: string;
  formats?: any;
  name?: string;
}

// ==================== المكون الرئيسي ====================
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  // التمرير إلى أعلى الصفحة عند تحميل المكون
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const inventory = product?.Inventory ?? 0;
  const isStock = inventory > 0;

  // دالة إضافة المنتج إلى السلة
 const addToCart = (product: Product) => {
    if (!isStock) {
      alert(`⚠️ عذرًا، المنتج "${product.Name}" غير متوفر في المخزون حالياً`);
      return;
    }

    const imageId = getImageId(product);
    console.log('🛒 إضافة إلى السلة - imageId:', imageId);

    const cartData = localStorage.getItem('cart-storage');
    let currentData = { state: { items: [] }, version: 0 };
    if (cartData) {
      try { currentData = JSON.parse(cartData); } catch (error) { console.error('❌ خطأ في قراءة السلة:', error); }
    }

    // ✅ التعديل هنا: تحويل currentItems إلى any[]
    const currentItems: any[] = (currentData.state.items as any[]) || [];
    const existingIndex = currentItems.findIndex((item: any) => item.product && item.product.id === product.id);
    const productName = product.Name || 'المنتج';

    if (existingIndex !== -1) {
      const currentQuantity = (currentItems[existingIndex] as any).product.quantity || 1;
      (currentItems[existingIndex] as any).product.quantity = currentQuantity + quantity;
      if (imageId && !(currentItems[existingIndex] as any).product.imageId) {
        (currentItems[existingIndex] as any).product.imageId = imageId;
      }
    } else {
      currentItems.push({
        product: {
          id: product.id,
          Name: product.Name,
          Price: product.Price,
          Image: product.Image,
          Description: product.Description,
          quantity: quantity,
          Inventory: inventory,
          imageId: imageId
        }
      });
    }

    const updatedData = { state: { items: currentItems }, version: 0 };
    localStorage.setItem('cart-storage', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('storage'));

    const message = existingIndex !== -1 
      ? `تم زيادة كمية "${productName}" في السلة`
      : `تم إضافة "${productName}" إلى السلة`;
    alert(`✅ ${message}`);
  };

  const handleBuyNow = (product: Product) => {
    if (!isStock) {
      alert(`⚠️ عذرًا، المنتج "${product.Name}" غير متوفر في المخزون حالياً`);
      return;
    }
    addToCart(product);
    router.push('/checkout');
  };

  // دوال الصور
  const startAutoPlay = useCallback(() => {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    if (isAutoPlaying && allImages.length > 1) {
      const interval = setInterval(() => {
        setSelectedImageIndex((prevIndex) => 
          prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000);
      setAutoPlayInterval(interval);
    }
  }, [isAutoPlaying, allImages.length]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayInterval) clearInterval(autoPlayInterval); };
  }, [startAutoPlay]);

  const stopAutoPlay = () => {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    setAutoPlayInterval(null);
  };

  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsAutoPlaying(false);
  };
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };
  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  // جلب جميع المنتجات للمقترحات
  const fetchAllProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const response = await fetch(`${apiUrl}/api/items?populate=*`);
      if (response.ok) {
        const data = await response.json();
        const products = (data.data || []).map((item: any) => {
          let itemData = item.attributes || item;
          let images: any[] = [];
          let mainImageUrl = '';
          if (itemData.Images && Array.isArray(itemData.Images) && itemData.Images.length > 0) {
            itemData.Images.forEach((img: StrapiImage) => {
              if (img.url) {
                const imageUrl = `${apiUrl}${img.url}`;
                images.push({ ...img, url: imageUrl });
                if (images.length === 1) mainImageUrl = imageUrl;
              }
            });
          }
          if (images.length === 0) {
            const encodedName = encodeURIComponent(itemData.Name || 'منتج');
            mainImageUrl = `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
            images = [{ url: mainImageUrl }];
          }
          let category = '';
          if (itemData.categories && Array.isArray(itemData.categories) && itemData.categories.length > 0) {
            category = itemData.categories[0]?.Name || '';
          }
          const id = itemData.documentId || itemData.id?.toString() || item.id;
          return {
            id: id,
            Name: itemData.Name || 'منتج بدون اسم',
            Price: itemData.Price || 0,
            Image: mainImageUrl,
            Images: images,
            Description: itemData.Description || '',
            category: category,
            Inventory: itemData.Inventory || 0
          };
        });
        setAllProducts(products);
      } else {
        // منتجات افتراضية
        setAllProducts([
          { id: '1', Name: 'كرسي مريح', Price: 8500, Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=كرسي+مريح', Inventory: 5 },
          { id: '2', Name: 'طاولة قهوة', Price: 12000, Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=طاولة+قهوة', Inventory: 0 },
          { id: '3', Name: 'أريكة حديثة', Price: 35000, Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=أريكة+حديثة', Inventory: 3 },
          { id: '4', Name: 'خزانة ملابس', Price: 28000, Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=خزانة+ملابس', Inventory: 0 },
          { id: '5', Name: 'سرير خشبي', Price: 42000, Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=سرير+خشبي', Inventory: 2 },
          { id: '6', Name: 'مكتب عمل', Price: 19000, Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=مكتب+عمل', Inventory: 7 }
        ]);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
    }
  };

  // جلب المنتج الحالي
  useEffect(() => {
    const loadProduct = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
     console.log('🔍 محاولة جلب المنتج من:', `${apiUrl}/api/items/${productId}?populate=*`);
    // المحاولة الأولى: باستخدام المعرف كما هو (documentId أو رقمي)
    let response = await fetch(`${apiUrl}/api/items/${productId}?populate=*`);
    console.log('📡 حالة الاستجابة:', response.status, response.statusText);
    // إذا فشل وكان المعرف رقماً، حاول مرة أخرى باستخدام الرقمي
    if (!response.ok && !isNaN(Number(productId))) {
      console.log('محاولة جلب المنتج باستخدام id الرقمي:', productId);
      response = await fetch(`${apiUrl}/api/items/${Number(productId)}?populate=*`);
    }

    if (response.ok) {
      const data = await response.json();
      let itemData = data.data?.attributes || data.data || data;
      let images: any[] = [];
      let mainImageUrl = '';
      if (itemData.Images && Array.isArray(itemData.Images) && itemData.Images.length > 0) {
        itemData.Images.forEach((img: StrapiImage) => {
          if (img.url) {
            const imageUrl = `${apiUrl}${img.url}`;
            images.push({ ...img, url: imageUrl });
            if (images.length === 1) mainImageUrl = imageUrl;
          }
        });
      }
      if (images.length === 0) {
        const encodedName = encodeURIComponent(itemData.Name || 'منتج');
        mainImageUrl = `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
        images = [{ url: mainImageUrl }];
      }
      let category = '';
      if (itemData.categories && Array.isArray(itemData.categories) && itemData.categories.length > 0) {
        category = itemData.categories[0]?.Name || '';
      }
      const id = itemData.documentId || itemData.id?.toString() || productId;
      const formattedProduct: Product = {
        id: id,
        Name: itemData.Name || 'منتج بدون اسم',
        Price: itemData.Price || 0,
        Image: mainImageUrl,
        Images: images,
        Description: itemData.Description || '',
        category: category,
        Inventory: itemData.Inventory || 0
      };
      setProduct(formattedProduct);
      setAllImages(images.map(img => img.url));

      const productIdToSave = formattedProduct.documentId || formattedProduct.id;
      localStorage.setItem('checkout-product-id', productIdToSave);
      localStorage.setItem('checkout-product-data', JSON.stringify({
        id: productIdToSave,
        Name: formattedProduct.Name,
        Price: formattedProduct.Price,
        Image: formattedProduct.Image,
        Description: formattedProduct.Description,
        Inventory: formattedProduct.Inventory
      }));
    } else {
      // منتج تجريبي
      const testProduct: Product = {
        id: productId,
        Name: 'كرسي',
        Price: 7600,
        Image: 'https://placehold.co/600x600/3b82f6/ec4899?text=كرسي',
        Images: [{ url: 'https://placehold.co/600x600/3b82f6/ec4899?text=كرسي' }],
        Description: 'كرسي مريح وعصري',
        category: 'أثاث',
        Inventory: 0
      };
      setProduct(testProduct);
      setAllImages(['https://placehold.co/600x600/3b82f6/ec4899?text=كرسي']);
    }
  } catch (error) {
    console.error('❌ خطأ في جلب المنتج:', error);
    const defaultProduct: Product = {
      id: productId,
      Name: 'منتج تجريبي',
      Price: 5000,
      Image: `https://placehold.co/600x600/3b82f6/ec4899?text=منتج+${productId}`,
      Images: [{ url: `https://placehold.co/600x600/3b82f6/ec4899?text=منتج+${productId}` }],
      Description: 'وصف تجريبي للمنتج',
      category: 'تجريبي',
      Inventory: 10
    };
    setProduct(defaultProduct);
    setAllImages([`https://placehold.co/600x600/3b82f6/ec4899?text=منتج+${productId}`]);
  } finally {
    setLoading(false);
  }
};
    loadProduct();
    fetchAllProducts();
  }, [productId]);

  const getStrapiImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${apiUrl}${imagePath}`;
}
    return imagePath;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, productName: string) => {
    const target = e.currentTarget;
    const encodedName = encodeURIComponent(productName.substring(0, 10));
    target.src = `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
  };

  const totalPrice = product ? product.Price * quantity : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-pink-700 font-medium">جاري تحميل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    <div style={{ background: 'yellow', padding: '10px', margin: '10px', direction: 'ltr', color: 'black' }}>
  API URL: {process.env.NEXT_PUBLIC_STRAPI_URL || 'NOT SET'}
</div>
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4 text-pink-600">❌</div>
          <h1 className="text-2xl font-bold text-blue-900 mb-4">المنتج غير موجود</h1>
          <Link href="/" className="inline-flex items-center bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 transition duration-300 shadow-md">
            ← العودة إلى المتجر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">
      {/* كامل الـ JSX (كما هو في كودك السابق) - لا حاجة لتغيير أي شيء هنا */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium">
            ← العودة للمتجر
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* قسم الصور */}
              <div className="lg:col-span-1">
                <div className={`relative aspect-square bg-gradient-to-br from-blue-50 to-pink-50 rounded-xl overflow-hidden mb-4 group ${!isStock ? 'grayscale opacity-80' : ''}`}>
                  {!isStock && (
                    <div className="absolute top-3 right-3 bg-pink-500 text-white text-sm font-black px-4 py-2 rounded-full z-20 shadow-lg">
                      نفذ المخزون
                    </div>
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <FaChevronLeft />
                      </button>
                      <button onClick={nextImage} className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowLightbox(true)} className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <FaExpand />
                  </button>
                  {allImages.length > 1 && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded-full z-20">
                      <button onClick={toggleAutoPlay} className="hover:text-yellow-300 transition-colors">
                        {isAutoPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                      <span className="text-sm">{selectedImageIndex + 1} / {allImages.length}</span>
                    </div>
                  )}
                  <img
                    src={getStrapiImageUrl(allImages[selectedImageIndex])}
                    alt={`${product.Name} - ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => handleImageError(e, product.Name)}
                  />
                  {allImages.length > 1 && isAutoPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-100 ease-linear"
                        style={{ width: '100%', animation: 'progress 4s linear infinite' }}
                      />
                    </div>
                  )}
                  {product.category && (
                    <div className="absolute bottom-4 right-4">
                      <span className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {allImages.length > 1 && (
                  <>
                    <div className="flex gap-3 overflow-x-auto py-4 px-2">
                      {allImages.map((img, index) => (
                        <button key={index} onClick={() => handleThumbnailClick(index)} className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImageIndex === index ? 'border-blue-500 scale-105 shadow-lg' : 'border-gray-300 hover:border-blue-300'}`}>
                          <div className="w-24 h-24 relative">
                            <img src={getStrapiImageUrl(img)} alt={`${product.Name} - صورة ${index + 1}`} className="w-full h-full object-cover" onError={(e) => handleImageError(e, product.Name)} />
                            {selectedImageIndex === index && <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500"></div>}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      {allImages.map((_, index) => (
                        <button key={index} onClick={() => handleThumbnailClick(index)} className={`w-3 h-3 rounded-full transition-all ${selectedImageIndex === index ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} aria-label={`انتقل إلى الصورة ${index + 1}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* تفاصيل المنتج */}
              <div className="lg:col-span-1 flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900 mb-4">{product.Name}</h1>
                  <div className="mb-4">
                    {isStock ? (
                      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="font-bold">متوفر في المخزون</span>
                        {inventory <= 5 && (
                          <span className="text-sm bg-white px-2 py-1 rounded-full">{inventory} قطعة متبقية</span>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="font-bold">نفذ من المخزون</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                      {product.Price.toLocaleString()} <span className="text-lg text-blue-700">دينار جزائري</span>
                    </div>
                  </div>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-blue-800 mb-3">الوصف</h2>
                    <div className="text-blue-700 leading-relaxed bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-lg border border-blue-100">
                      {product.Description || 'لا يوجد وصف متاح لهذا المنتج.'}
                    </div>
                  </div>
                </div>

                <div>
                  {isStock && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">الكمية</h3>
                      <div className="flex items-center w-fit">
                        <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} disabled={quantity <= 1} className="w-12 h-12 flex items-center justify-center border border-blue-200 bg-white rounded-r-lg hover:bg-blue-50 text-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                          <span className="text-xl">-</span>
                        </button>
                        <div className="w-16 h-12 flex items-center justify-center border-t border-b border-blue-200 bg-gradient-to-r from-blue-50 to-pink-50">
                          <span className="text-xl font-bold text-blue-800">{quantity}</span>
                        </div>
                        <button onClick={() => setQuantity(prev => prev + 1)} className="w-12 h-12 flex items-center justify-center border border-blue-200 bg-white rounded-l-lg hover:bg-pink-50 text-pink-700 font-bold">
                          <span className="text-xl">+</span>
                        </button>
                      </div>
                    </div>
                  )}
                  {isStock && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800 font-semibold">المجموع</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                          {totalPrice.toLocaleString()} <span className="text-lg text-blue-700">د.ج</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {isStock ? (
                      <>
                        <button onClick={() => addToCart(product)} className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition duration-300 shadow-lg shadow-blue-200">
                          <span className="ml-2">🛒</span> أضف إلى السلة
                        </button>
                        <button onClick={() => handleBuyNow(product)} className="w-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-pink-600 hover:to-pink-700 transition duration-300 shadow-lg shadow-pink-200">
                          <span className="ml-2">⚡</span> اشتري الآن
                        </button>
                      </>
                    ) : (
                      <button disabled className="w-full flex items-center justify-center bg-gray-300 text-gray-600 py-4 rounded-xl font-bold cursor-not-allowed">
                        <span className="ml-2">🚫</span> المنتج غير متوفر
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <ProductRecommendations allProducts={allProducts} currentProductId={productId} />
      </div>

      {showLightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button onClick={() => setShowLightbox(false)} className="absolute top-4 right-4 text-white text-2xl bg-black/50 hover:bg-black/70 p-3 rounded-full z-10">
            ✕
          </button>
          <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black/50 hover:bg-black/70 p-4 rounded-full z-10">
            <FaChevronLeft />
          </button>
          <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black/50 hover:bg-black/70 p-4 rounded-full z-10">
            <FaChevronRight />
          </button>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={getStrapiImageUrl(allImages[selectedImageIndex])} alt={`${product.Name} - تكبير`} className="w-full h-full object-contain max-h-[80vh] rounded-lg" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {allImages.map((img, index) => (
                <button key={index} onClick={() => handleThumbnailClick(index)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-600'}`}>
                  <img src={getStrapiImageUrl(img)} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .overflow-x-auto::-webkit-scrollbar { height: 6px; }
        .overflow-x-auto::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .overflow-x-auto::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover { background: #555; }
        #recommended-products-container::-webkit-scrollbar { height: 6px; }
        #recommended-products-container::-webkit-scrollbar-thumb { background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 10px; }
        #recommended-products-container::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        @keyframes sideShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(5px); } 75% { transform: translateX(-5px); } }
        .shake-animation:hover { animation: sideShake 0.4s ease-in-out infinite; border-color: #ff4d94 !important; }
      `}</style>
    </div>
  );
}
