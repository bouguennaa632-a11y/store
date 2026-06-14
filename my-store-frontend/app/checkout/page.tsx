"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  id: string;
  Name: string;
  Price: number;
  Image: string;
  imageId?: number | null;
  quantity: number;
}

interface StateData {
  id: number;
  documentId: string;
  Name: string;
  Home_Delivery_Price: number;
  Office_Delivery_Price: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(true);
  const [productsTotal, setProductsTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [shippingType, setShippingType] = useState<'office' | 'home'>('office');
  const [selectedState, setSelectedState] = useState<string>('');
  const [shippingCost, setShippingCost] = useState(0);
  const [states, setStates] = useState<StateData[]>([]);
  const [statesError, setStatesError] = useState<string | null>(null);



   // التمرير إلى أعلى الصفحة عند تحميل المكون
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  // ==================== جلب الولايات من Strapi – يدعم جميع التنسيقات ====================
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setStatesLoading(true);
        setStatesError(null);
        
        console.log('🌍 جاري جلب الولايات من Strapi...');
        const response = await fetch('http://localhost:1337/api/states');
        
        if (!response.ok) {
          throw new Error(`فشل جلب الولايات: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 استجابة الولايات الخام:', data);

        let statesArray: any[] = [];

        // ---------- دعم جميع هياكل Strapi ----------
        if (data.data && Array.isArray(data.data)) {
          statesArray = data.data.map((item: any) => {
            const attrs = item.attributes || item;
            return {
              id: item.id,
              documentId: item.documentId || item.id?.toString() || '',
              ...attrs
            };
          });
        } else if (Array.isArray(data)) {
          statesArray = data;
        } else if (data && typeof data === 'object') {
          statesArray = [data];
        }

        // ---------- تحويل البيانات إلى الشكل الموحد ----------
        const normalizedStates = statesArray.map((state: any) => {
          const name = state.Name || state.name || state.title || state.ville || '';
          const homePrice = state.Home_Delivery_Price ?? state.home_delivery_price ?? state.homePrice ?? state.HomePrice ?? 0;
          const officePrice = state.Office_Delivery_Price ?? state.office_delivery_price ?? state.officePrice ?? state.OfficePrice ?? 0;

          const parsedHomePrice = typeof homePrice === 'string' ? parseFloat(homePrice) || 0 : Number(homePrice) || 0;
          const parsedOfficePrice = typeof officePrice === 'string' ? parseFloat(officePrice) || 0 : Number(officePrice) || 0;

          return {
            id: state.id || 0,
            documentId: state.documentId || state.id?.toString() || '',
            Name: String(name).trim(),
            Home_Delivery_Price: parsedHomePrice,
            Office_Delivery_Price: parsedOfficePrice
          };
        });

        // ---------- تصفية الولايات الصالحة ----------
        const validStates = normalizedStates.filter((state: any) => 
          state && 
          state.Name && 
          state.Name !== '' &&
          state.Home_Delivery_Price >= 0 &&
          state.Office_Delivery_Price >= 0
        );

        console.log('✅ الولايات المعالجة:', validStates);

        if (validStates.length > 0) {
          setStates(validStates);
          setSelectedState(validStates[0].Name);
          setStatesError(null);
        } else {
          console.warn('⚠️ لم يتم العثور على ولايات صالحة من Strapi. استخدام البيانات الوهمية.');
          const mockStates = [
            { id: 1, documentId: 'mock-1', Name: 'الجزائر', Home_Delivery_Price: 800, Office_Delivery_Price: 500 },
            { id: 2, documentId: 'mock-2', Name: 'وهران', Home_Delivery_Price: 900, Office_Delivery_Price: 600 },
            { id: 3, documentId: 'mock-3', Name: 'قسنطينة', Home_Delivery_Price: 850, Office_Delivery_Price: 550 }
          ];
          setStates(mockStates);
          setSelectedState(mockStates[0].Name);
          setStatesError('تم استخدام بيانات وهمية. تأكد من إعداد الولايات في Strapi.');
        }
      } catch (error) {
        console.error('❌ خطأ في جلب الولايات:', error);
        setStatesError(error instanceof Error ? error.message : 'فشل الاتصال بـ Strapi');
        
        const fallbackStates = [
          { id: 1, documentId: 'fallback-1', Name: 'الجزائر', Home_Delivery_Price: 800, Office_Delivery_Price: 500 },
          { id: 2, documentId: 'fallback-2', Name: 'وهران', Home_Delivery_Price: 900, Office_Delivery_Price: 600 }
        ];
        setStates(fallbackStates);
        setSelectedState(fallbackStates[0].Name);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  // ==================== حساب سعر الشحن ====================
  useEffect(() => {
    if (selectedState && states.length > 0) {
      const state = states.find(s => s.Name === selectedState);
      if (state) {
        const cost = shippingType === 'office' 
          ? state.Office_Delivery_Price 
          : state.Home_Delivery_Price;
        setShippingCost(cost);
        console.log(`🚚 سعر الشحن لـ ${selectedState} (${shippingType}): ${cost} د.ج`);
      }
    }
  }, [selectedState, shippingType, states]);

  // ==================== حساب المجموع الكلي ====================
  useEffect(() => {
    const productsTotal = cartItems.reduce((sum, item) => sum + (item.Price * item.quantity), 0);
    setProductsTotal(productsTotal);
    setTotal(productsTotal + shippingCost);
    console.log(`💰 المجموع: المنتجات ${productsTotal} + الشحن ${shippingCost} = ${productsTotal + shippingCost}`);
  }, [cartItems, shippingCost]);

  // ==================== جلب السلة من localStorage مع محاولة استخراج imageId إذا كان مفقوداً ====================
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartData = localStorage.getItem('cart-storage');
        if (cartData) {
          const parsed = JSON.parse(cartData);
          let items: CartItem[] = [];
          
          if (parsed.state?.items && Array.isArray(parsed.state.items)) {
            items = parsed.state.items.map((item: any) => {
              const product = item.product;
              
              // ✅ محاولة استخراج imageId إذا كان مفقوداً (للمنتجات القديمة)
              let imageId = product.imageId;
              if (!imageId && product.Images && Array.isArray(product.Images) && product.Images.length > 0) {
                const firstImage = product.Images[0];
                if (firstImage?.id) {
                  imageId = firstImage.id;
                  console.log(`🔄 [إصلاح] تم استخراج imageId للمنتج "${product.Name}": ${imageId}`);
                  
                  // تحديث localStorage مع imageId المستخرج
                  product.imageId = imageId;
                  localStorage.setItem('cart-storage', JSON.stringify(parsed));
                }
              }

              return {
                id: product.id,
                Name: product.Name,
                Price: product.Price,
                Image: product.Image,
                quantity: product.quantity,
                imageId: imageId || null
              };
            });
          }
          
          console.log('🛒 عناصر السلة:', items);
          setCartItems(items);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل السلة:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  // ==================== دوال مساعدة ====================
  const getStrapiImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:1337${imagePath}`;
    return imagePath;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, productName: string) => {
    const target = e.currentTarget;
    const encodedName = encodeURIComponent(productName.substring(0, 10));
    target.src = `https://placehold.co/100x100/3b82f6/ffffff?text=${encodedName}`;
  };

  // ==================== تحديث الكمية ====================
  const updateQuantity = (id: string, change: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    
    const storageData = {
      state: { 
        items: updatedCart.map(product => ({ 
          product: {
            id: product.id,
            Name: product.Name,
            Price: product.Price,
            Image: product.Image,
            quantity: product.quantity,
            imageId: product.imageId
          }
        })) 
      },
      version: 0
    };
    
    localStorage.setItem('cart-storage', JSON.stringify(storageData));
    window.dispatchEvent(new Event('storage'));
  };

  // ==================== حذف منتج ====================
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    
    const storageData = {
      state: { 
        items: updatedCart.map(product => ({ product })) 
      },
      version: 0
    };
    
    localStorage.setItem('cart-storage', JSON.stringify(storageData));
    window.dispatchEvent(new Event('storage'));
  };

  // ==================== تفريغ السلة ====================
  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart-storage', JSON.stringify({ state: { items: [] }, version: 0 }));
    window.dispatchEvent(new Event('storage'));
  };

  // ==================== الانتقال إلى صفحة تأكيد الطلب ====================
  const handleCheckout = () => {
    const selectedStateData = states.find(s => s.Name === selectedState);
    
    if (!selectedStateData) {
      alert('⚠️ الرجاء اختيار ولاية صحيحة');
      return;
    }

    if (cartItems.length === 0) {
      alert('⚠️ سلة التسوق فارغة');
      return;
    }

    cartItems.forEach((item, index) => {
      console.log(`📦 [Checkout] المنتج ${index + 1}: ${item.Name} - imageId: ${item.imageId}`);
    });

    const orderInfo = {
      shipping: {
        type: shippingType === 'office' ? 'التوصيل إلى المكتب' : 'التوصيل إلى المنزل',
        state: selectedState,
        cost: shippingCost,
        stateId: selectedStateData.id
      },
      cart: {
        items: cartItems,
        productsTotal: productsTotal,
        shippingCost: shippingCost,
        total: total
      },
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    console.log('🚀 [Checkout] حفظ معلومات الطلب:', orderInfo);
    localStorage.setItem('pending-order', JSON.stringify(orderInfo));
    router.push('/checkout/confirm');
  };

  // ==================== عرض حالة التحميل ====================
  if (loading || statesLoading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-900 font-medium">
          {loading ? 'جاري تحميل السلة...' : 'جاري تحميل الولايات...'}
        </span>
      </div>
    );
  }

  // ==================== عرض الخطأ في الولايات (فقط إذا لم تكن هناك ولايات على الإطلاق) ====================
  if (statesError && states.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4 text-red-600">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">خطأ في تحميل الولايات</h1>
          <p className="text-gray-700 mb-6">{statesError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            إعادة المحاولة
          </button>
          <Link href="/" className="block mt-4 text-blue-600 hover:underline">
            العودة إلى المتجر
          </Link>
        </div>
      </div>
    );
  }

  // ==================== العرض الرئيسي ====================
  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">🛒 سلة التسوق</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4 text-gray-800">🛍️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              سلة التسوق فارغة
            </h2>
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              ← العودة للتسوق
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-900 font-semibold text-lg">
                ✅ تم العثور على {cartItems.length} منتج في السلة
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ========== قائمة المنتجات ========== */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      منتجاتك ({cartItems.length})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-700 hover:text-red-900 font-medium"
                    >
                      🗑️ تفريغ السلة
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center hover:bg-gray-50 transition-colors"
                      >
                        {/* صورة المنتج */}
                        <div className="w-full md:w-24 h-48 md:h-24 flex-shrink-0 mb-3 md:mb-0">
                          <img
                            src={getStrapiImageUrl(item.Image)}
                            alt={item.Name}
                            className="w-full h-full object-cover rounded-lg border border-gray-300"
                            onError={(e) => handleImageError(e, item.Name)}
                          />
                        </div>

                        {/* تفاصيل المنتج */}
                        <div className="flex-1 px-0 md:px-6 w-full">
                          <div className="flex flex-col md:flex-row justify-between w-full">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                {item.Name}
                              </h3>
                              <p className="text-gray-900 font-medium mb-3">
                                السعر: <span className="text-blue-800 font-bold">{item.Price.toLocaleString()} د.ج</span>
                              </p>
                              {/* ✅ تم إزالة رسالة معرف الصورة بناءً على طلب المستخدم */}
                            </div>
                            
                            {/* السعر الإجمالي للعنصر */}
                            <div className="text-right mb-3 md:mb-0">
                              <p className="font-bold text-lg text-gray-900">
                                {(item.Price * item.quantity).toLocaleString()} <span className="text-blue-800">د.ج</span>
                              </p>
                              <p className="text-sm text-gray-800 font-medium">
                                {item.Price.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          
                          {/* أزرار التحكم */}
                          <div className="flex items-center justify-between mt-3 w-full">
                            <div className="flex items-center">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-bold"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="mx-3 font-bold min-w-[20px] text-center text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-500 rounded-lg hover:bg-gray-100 text-gray-900 font-bold"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-700 hover:text-red-900 text-sm font-medium px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center text-blue-800 hover:text-blue-900 font-medium"
                  >
                    ← استمر في التسوق
                  </Link>
                </div>
              </div>

              {/* ========== الجانب الأيمن: ملخص الطلب + الشحن ========== */}
              <div className="lg:col-span-1 space-y-6">
                {/* ملخص الطلب */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    ملخص الطلب
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">عدد المنتجات</span>
                      <span className="text-gray-900 font-bold">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)} قطعة
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">المجموع الجزئي</span>
                      <span className="text-gray-900 font-bold">
                        {productsTotal.toLocaleString()} د.ج
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">الشحن</span>
                      <div className="text-right">
                        <span className="text-gray-900 font-bold">{shippingCost.toLocaleString()} د.ج</span>
                        <div className="text-xs text-gray-700">
                          {selectedState} - {shippingType === 'office' ? 'مكتب' : 'منزل'}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">المجموع الكلي</span>
                        <span className="text-blue-800">{total.toLocaleString()} د.ج</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات الشحن */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    📦 معلومات الشحن
                  </h2>

                  <div className="space-y-5">
                    {/* اختيار الولاية */}
                    <div>
                      <label className="block text-gray-900 font-medium mb-2">
                        اختر الولاية *
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        disabled={states.length === 0}
                      >
                        {states.length === 0 ? (
                          <option value="">جاري تحميل الولايات...</option>
                        ) : (
                          <>
                            <option value="">اختر ولاية</option>
                            {states.map((state) => (
                              <option key={state.id} value={state.Name}>
                                {state.Name} - {shippingType === 'office' ? 
                                  `${state.Office_Delivery_Price.toLocaleString()} د.ج (مكتب)` : 
                                  `${state.Home_Delivery_Price.toLocaleString()} د.ج (منزل)`}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      {statesError && states.length > 0 && (
                        <p className="text-xs text-amber-600 mt-2">
                          ⚠️ {statesError} (يتم استخدام بيانات احتياطية)
                        </p>
                      )}
                    </div>

                    {/* نوع التوصيل - تم تحسين وضوح النص */}
                    <div>
                      <label className="block text-gray-900 font-medium mb-3">
                        اختر طريقة التوصيل *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShippingType('office')}
                          disabled={states.length === 0}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            shippingType === 'office' 
                              ? 'border-blue-700 bg-blue-100 text-blue-900' 
                              : 'border-gray-300 hover:border-gray-400'
                          } ${states.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="text-2xl mb-2">🏢</div>
                          <div className="font-semibold">التوصيل إلى المكتب</div>
                          <div className="text-sm text-gray-900 mt-1 font-medium">
                            {(() => {
                              if (states.length === 0) return 'تحميل...';
                              const state = states.find(s => s.Name === selectedState);
                              return state ? `${state.Office_Delivery_Price.toLocaleString()} د.ج` : 'اختر ولاية';
                            })()}
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShippingType('home')}
                          disabled={states.length === 0}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            shippingType === 'home' 
                              ? 'border-blue-700 bg-blue-100 text-blue-900' 
                              : 'border-gray-300 hover:border-gray-400'
                          } ${states.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="text-2xl mb-2">🏠</div>
                          <div className="font-semibold">التوصيل إلى المنزل</div>
                          <div className="text-sm text-gray-900 mt-1 font-medium">
                            {(() => {
                              if (states.length === 0) return 'تحميل...';
                              const state = states.find(s => s.Name === selectedState);
                              return state ? `${state.Home_Delivery_Price.toLocaleString()} د.ج` : 'اختر ولاية';
                            })()}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* زر إتمام الشراء - نص محدث */}
                <button
                  onClick={handleCheckout}
                  disabled={states.length === 0 || !selectedState || cartItems.length === 0}
                  className={`w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all ${
                    states.length === 0 || !selectedState || cartItems.length === 0
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  {states.length === 0 
                    ? 'جاري تحميل البيانات...' 
                    : cartItems.length === 0
                    ? 'السلة فارغة'
                    : 'تأكيد الطلب'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage; 