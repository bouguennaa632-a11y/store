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

interface OrderInfo {
  shipping: {
    type: string;
    state: string;
    cost: number;
    stateId: number;
  };
  cart: {
    items: CartItem[];
    productsTotal: number;
    shippingCost: number;
    total: number;
  };
  orderNumber: string;
  createdAt: string;
}

interface PersonalInfo {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
  email: string;
}

const CheckoutConfirmPage = () => {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
    email: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);


  // التمرير إلى أعلى الصفحة عند تحميل المكون
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  // تحميل معلومات الطلب من localStorage
  useEffect(() => {
    const loadOrderInfo = () => {
      try {
        const orderData = localStorage.getItem('pending-order');
        if (orderData) {
          const parsed = JSON.parse(orderData);
          setOrderInfo(parsed);
          console.log('📦 [تأكيد] المنتجات المستلمة:', parsed.cart.items);
          parsed.cart.items.forEach((item: CartItem, index: number) => {
            console.log(`   ${index + 1}. ${item.Name} - imageId: ${item.imageId}`);
          });
        } else {
          router.push('/checkout');
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل معلومات الطلب:', error);
        router.push('/checkout');
      } finally {
        setLoading(false);
      }
    };
    loadOrderInfo();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!personalInfo.fullName.trim()) { alert('⚠️ الرجاء إدخال الاسم الكامل'); return false; }
    if (!personalInfo.phone.trim()) { alert('⚠️ الرجاء إدخال رقم الهاتف'); return false; }
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!phoneRegex.test(personalInfo.phone.replace(/\s/g, ''))) { alert('⚠️ رقم هاتف غير صحيح'); return false; }
    if (!personalInfo.address.trim()) { alert('⚠️ الرجاء إدخال العنوان'); return false; }
    if (!personalInfo.email.trim()) { alert('⚠️ الرجاء إدخال البريد الإلكتروني'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) { alert('⚠️ بريد إلكتروني غير صحيح'); return false; }
    if (!agreeToTerms) { alert('⚠️ الرجاء الموافقة على الشروط'); return false; }
    return true;
  };

  const getShippingMethodEnum = (shippingType: string): string => {
    if (shippingType.includes('مكتب')) return 'office_delivery';
    return 'home_delivery';
  };

  // ==================== جلب imageId من Strapi مباشرة (Fallback) ====================
  const fetchImageIdFromStrapi = async (productId: string): Promise<number | null> => {
    try {
      console.log(`🔍 محاولة جلب imageId للمنتج ${productId} من Strapi...`);
      const response = await fetch(`http://localhost:1337/api/items/${productId}?populate=*`);
      if (!response.ok) {
        console.error(`❌ فشل جلب المنتج ${productId}: ${response.status}`);
        return null;
      }
      const data = await response.json();
      const itemData = data.data?.attributes || data.data || data;
      
      if (itemData.Images && Array.isArray(itemData.Images) && itemData.Images.length > 0) {
        const firstImage = itemData.Images[0];
        if (firstImage?.id) {
          console.log(`✅ تم جلب imageId للمنتج ${productId}: ${firstImage.id}`);
          return firstImage.id;
        }
      }
      console.log(`⚠️ لا توجد صور للمنتج ${productId}`);
      return null;
    } catch (error) {
      console.error(`❌ خطأ في جلب المنتج ${productId}:`, error);
      return null;
    }
  };

  // ==================== التأكد من أن جميع العناصر تحتوي على imageId ====================
  const ensureImageIds = async (items: CartItem[]): Promise<CartItem[]> => {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (item.imageId) return item;
        
        console.log(`⚠️ المنتج "${item.Name}" لا يحتوي على imageId. جلب من Strapi...`);
        const fetchedImageId = await fetchImageIdFromStrapi(item.id);
        if (fetchedImageId) {
          return { ...item, imageId: fetchedImageId };
        }
        console.warn(`❌ فشل جلب imageId للمنتج "${item.Name}". سيتم الإرسال بدون صورة.`);
        return item;
      })
    );
    return updatedItems;
  };

  // ==================== المحاولة الأولى: { id: imageId } ====================
  const submitOrderWithId = async () => {
    if (!orderInfo) return null;
    try {
      const itemsWithImages = await ensureImageIds(orderInfo.cart.items);
      
      const orderItems = itemsWithImages.map(item => ({
        productName: item.Name,
        quantity: item.quantity,
        price: item.Price,
        photo: item.imageId ? { id: item.imageId } : undefined
      }));

      const orderData = {
        data: {
          fullName: personalInfo.fullName.trim(),
          phoneNumber: personalInfo.phone.trim(),
          email: personalInfo.email.trim(),
          note: personalInfo.notes.trim(),
          state: orderInfo.shipping.state,
          fullAddress: personalInfo.address.trim(),
          ordernumber: orderInfo.orderNumber,
          shippingMethod: getShippingMethodEnum(orderInfo.shipping.type),
          statuis: 'pending',
          shippingPrice: orderInfo.shipping.cost,
          total: orderInfo.cart.total,
          orderDate: new Date().toISOString(),
          orderItems
        }
      };

      console.log('📤 إرسال الطلب مع الصورة:', JSON.stringify(orderData, null, 2));

      const response = await fetch('http://localhost:1337/api/orderies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ فشل الإرسال:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('✅ تم الحفظ:', result);
      return result.data;
    } catch (error) {
      console.error('❌ خطأ:', error);
      return null;
    }
  };

  // ==================== المحاولة الثانية: { connect: [imageId] } ====================
  const submitOrderWithConnect = async () => {
    if (!orderInfo) return null;
    try {
      const itemsWithImages = await ensureImageIds(orderInfo.cart.items);
      const orderItems = itemsWithImages.map(item => ({
        productName: item.Name,
        quantity: item.quantity,
        price: item.Price,
        photo: item.imageId ? { connect: [item.imageId] } : undefined
      }));

      const orderData = {
        data: {
          fullName: personalInfo.fullName.trim(),
          phoneNumber: personalInfo.phone.trim(),
          email: personalInfo.email.trim(),
          note: personalInfo.notes.trim(),
          state: orderInfo.shipping.state,
          fullAddress: personalInfo.address.trim(),
          ordernumber: orderInfo.orderNumber,
          shippingMethod: getShippingMethodEnum(orderInfo.shipping.type),
          statuis: 'pending',
          shippingPrice: orderInfo.shipping.cost,
          total: orderInfo.cart.total,
          orderDate: new Date().toISOString(),
          orderItems
        }
      };

      const response = await fetch('http://localhost:1337/api/orderies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    } catch (error) {
      return null;
    }
  };

  // ==================== المحاولة الثالثة: رقم مباشر ====================
  const submitOrderWithDirectId = async () => {
    if (!orderInfo) return null;
    try {
      const itemsWithImages = await ensureImageIds(orderInfo.cart.items);
      const orderItems = itemsWithImages.map(item => ({
        productName: item.Name,
        quantity: item.quantity,
        price: item.Price,
        photo: item.imageId || undefined
      }));

      const orderData = {
        data: {
          fullName: personalInfo.fullName.trim(),
          phoneNumber: personalInfo.phone.trim(),
          email: personalInfo.email.trim(),
          note: personalInfo.notes.trim(),
          state: orderInfo.shipping.state,
          fullAddress: personalInfo.address.trim(),
          ordernumber: orderInfo.orderNumber,
          shippingMethod: getShippingMethodEnum(orderInfo.shipping.type),
          statuis: 'pending',
          shippingPrice: orderInfo.shipping.cost,
          total: orderInfo.cart.total,
          orderDate: new Date().toISOString(),
          orderItems
        }
      };

      const response = await fetch('http://localhost:1337/api/orderies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    } catch (error) {
      return null;
    }
  };

  // ==================== المحاولة الرابعة: بدون صورة ====================
  const submitOrderWithoutPhoto = async () => {
    if (!orderInfo) return null;
    try {
      const orderItems = orderInfo.cart.items.map(item => ({
        productName: item.Name,
        quantity: item.quantity,
        price: item.Price
      }));

      const orderData = {
        data: {
          fullName: personalInfo.fullName.trim(),
          phoneNumber: personalInfo.phone.trim(),
          email: personalInfo.email.trim(),
          note: personalInfo.notes.trim(),
          state: orderInfo.shipping.state,
          fullAddress: personalInfo.address.trim(),
          ordernumber: orderInfo.orderNumber,
          shippingMethod: getShippingMethodEnum(orderInfo.shipping.type),
          statuis: 'pending',
          shippingPrice: orderInfo.shipping.cost,
          total: orderInfo.cart.total,
          orderDate: new Date().toISOString(),
          orderItems
        }
      };

      const response = await fetch('http://localhost:1337/api/orderies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    } catch (error) {
      return null;
    }
  };

  // ==================== إرسال الطلب مع تجربة جميع المحاولات ====================
  const submitOrderToStrapi = async () => {
    if (!orderInfo) return null;

    let result = await submitOrderWithId();
    if (result) return result;

    result = await submitOrderWithConnect();
    if (result) return result;

    result = await submitOrderWithDirectId();
    if (result) return result;

    result = await submitOrderWithoutPhoto();
    if (result) return result;

    throw new Error('جميع المحاولات فشلت في حفظ الطلب في Strapi');
  };

  const getStrapiImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:1337${imagePath}`;
    return imagePath;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm() || !orderInfo) return;
    try {
      setSubmitting(true);
      console.log('🚀 بدء إرسال الطلب...');

      let strapiOrder = null;
      try {
        strapiOrder = await submitOrderToStrapi();
        if (strapiOrder) console.log('🎉 تم الحفظ في Strapi');
        else console.log('⚠️ لم يتم الحفظ');
      } catch (err) {
        console.error('❌ فشل Strapi:', err);
      }

      const finalOrder = {
        ...orderInfo,
        personalInfo,
        paymentMethod: 'الدفع عند الاستلام',
        status: strapiOrder ? 'pending' : 'pending_backup',
        orderDate: new Date().toISOString(),
        strapiId: strapiOrder?.id || null
      };

      const ordersHistory = JSON.parse(localStorage.getItem('orders-history') || '[]');
      ordersHistory.push(finalOrder);
      localStorage.setItem('orders-history', JSON.stringify(ordersHistory));

      localStorage.removeItem('pending-order');
      localStorage.setItem('cart-storage', JSON.stringify({ state: { items: [] }, version: 0 }));
      window.dispatchEvent(new Event('storage'));

      localStorage.setItem('last-order', JSON.stringify({ ...finalOrder, strapiOrderId: strapiOrder?.id }));
      router.push('/checkout/success');
    } catch (error) {
      console.error('❌ خطأ عام:', error);
      alert('⚠️ حدث خطأ، حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-900 font-medium">جاري تحميل معلومات الطلب...</span>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">لم يتم العثور على طلب</h1>
          <p className="text-gray-700 mb-6">يبدو أن معلومات الطلب غير متوفرة. الرجاء العودة إلى السلة.</p>
          <Link href="/checkout" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
            العودة إلى سلة التسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/checkout" className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium">
            ← العودة إلى السلة
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">✅ تأكيد الطلب</h1>
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-blue-900 font-semibold text-lg text-center">
            رقم الطلب: <span className="font-bold">{orderInfo.orderNumber}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* العمود الأيمن: المعلومات الشخصية */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">👤 المعلومات الشخصية</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">الاسم الكامل *</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={personalInfo.fullName} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="أدخل اسمك الكامل" 
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-medium mb-2">رقم الهاتف *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={personalInfo.phone} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="05XXXXXXXX" 
                  />
                  <p className="text-xs text-gray-600 mt-1">مثال: 0551234567 أو 0771234567</p>
                </div>
                <div>
                  <label className="block text-gray-900 font-medium mb-2">البريد الإلكتروني *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={personalInfo.email} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    placeholder="example@email.com" 
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-medium mb-2">العنوان التفصيلي *</label>
                  <textarea 
                    name="address" 
                    value={personalInfo.address} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    rows={3} 
                    placeholder="الشارع، الحي، رقم المنزل، الطابق..." 
                  />
                </div>
                <div>
                  <label className="block text-gray-900 font-medium mb-2">ملاحظات إضافية (اختياري)</label>
                  <textarea 
                    name="notes" 
                    value={personalInfo.notes} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                    rows={2} 
                    placeholder="أي تعليمات خاصة بالتوصيل أو الطلب..." 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">💳 طريقة الدفع</h2>
              <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ml-3">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900">الدفع عند الاستلام</h3>
                    <p className="text-sm text-green-700">الدفع نقداً عند استلام المنتج</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ بوكس ملاحظة سعر الشحن */}
            <div className="bg-amber-50 rounded-xl shadow-md p-5 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">📦</span>
                <div>
                  <h3 className="font-bold text-amber-800 text-base">ملاحظة حول تكلفة الشحن</h3>
                  <p className="text-sm text-amber-700 leading-relaxed mt-1">
                    سعر الشحن المعروض تقديري وقد يتغير حسب وزن الطرد وأبعاده. 
                    سيتم تأكيد التكلفة النهائية عبر الهاتف عند معالجة الطلب.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* العمود الأيسر: ملخص الطلب */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 ملخص الطلب</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">معلومات الشحن</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-900">طريقة التوصيل:</span>
                      <span className="font-medium text-gray-900">{orderInfo.shipping.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900">الولاية:</span>
                      <span className="font-medium text-gray-900">{orderInfo.shipping.state}</span>
                    </div>
                    {/* ✅ تم إزالة سطر تاريخ التوصيل المتوقع */}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">المنتجات ({orderInfo.cart.items.length})</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pl-2">
                    {orderInfo.cart.items.map((item) => (
                      <div key={item.id} className="flex items-center border-b border-gray-100 pb-3">
                        <div className="w-16 h-16 flex-shrink-0">
                          <img src={getStrapiImageUrl(item.Image)} alt={item.Name} className="w-full h-full object-cover rounded-lg border border-gray-300" />
                        </div>
                        <div className="flex-1 mr-3">
                          <h4 className="font-medium text-gray-900 text-sm">{item.Name}</h4>
                          <p className="text-sm text-gray-600">{item.quantity} × {item.Price.toLocaleString()} د.ج</p>
                          {/* ✅ تم إزالة سطر "معرف الصورة" بالكامل */}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">{(item.Price * item.quantity).toLocaleString()} د.ج</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-medium">المجموع الجزئي:</span>
                    <span className="text-gray-900 font-bold">{orderInfo.cart.productsTotal.toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-medium">تكلفة الشحن:</span>
                    <span className="text-gray-900 font-bold">{orderInfo.cart.shippingCost.toLocaleString()} د.ج</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">المجموع الكلي:</span>
                      <span className="text-blue-800">{orderInfo.cart.total.toLocaleString()} د.ج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-start mb-4">
                <input type="checkbox" id="terms" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 ml-2 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  أوافق على الشروط والأحكام وسياسة الخصوصية.
                </label>
              </div>
              <button onClick={handleSubmitOrder} disabled={submitting} className={`w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    جاري إرسال الطلب...
                  </span>
                ) : '✅ تأكيد الطلب وإرساله'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmPage;