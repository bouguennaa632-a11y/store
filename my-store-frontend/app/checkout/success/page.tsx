"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderInfo {
  orderNumber: string;
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  shipping: {
    type: string;
    state: string;
    cost: number;
  };
  cart: {
    total: number;
  };
  paymentMethod: string;
}

interface ContactInfo {
  phone: string;
  description?: string;
}

const CheckoutSuccessPage = () => {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  // التمرير إلى أعلى الصفحة
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // جلب معلومات الاتصال من Strapi
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await fetch('http://localhost:1337/api/socialmedia?populate=*');
        const json = await res.json();
        const data = json.data;
        if (data) {
          setContactInfo({
            phone: data.phone || '+213 000 000 000',
            description: data.description || '',
          });
        } else {
          setContactInfo({
            phone: '+213 000 000 000',
            description: 'يمكنك التواصل معنا عبر الهاتف',
          });
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات التواصل:', error);
        setContactInfo({
          phone: '+213 000 000 000',
          description: 'يمكنك التواصل معنا عبر الهاتف',
        });
      }
    };
    fetchContact();
  }, []);

  // جلب معلومات الطلب من localStorage
  useEffect(() => {
    const loadOrder = () => {
      try {
        const orderData = localStorage.getItem('last-order');
        if (orderData) {
          const parsed = JSON.parse(orderData);
          setOrderInfo(parsed);
          
          setTimeout(() => {
            localStorage.removeItem('last-order');
          }, 10000);
        }
      } catch (error) {
        console.error('خطأ في تحميل معلومات الطلب:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrder();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="mr-3 text-gray-900 font-medium">جاري تحضير تأكيد الطلب...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* منطقة الطباعة */}
          <div id="order-receipt" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-200 mb-8 print:border print:border-gray-300 print:shadow-none">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 md:p-8 text-center text-white print:bg-white print:text-black print:p-3">
              <div className="text-5xl md:text-6xl mb-2 print:text-3xl">🎉</div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 print:text-lg">شكراً لطلبك!</h1>
              <p className="text-base md:text-lg opacity-90 print:text-xs">تم استلام طلبك بنجاح وسيتم تجهيزه قريباً</p>
            </div>
            
            <div className="p-6 md:p-8 print:p-3">
              {orderInfo ? (
                <div className="space-y-5 print:space-y-2">
                  {/* تفاصيل الطلب */}
                  <div className="bg-gray-50 rounded-xl p-5 print:p-2 print:bg-white">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 print:text-sm">تفاصيل طلبك</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-1">
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">رقم الطلب</p>
                        <p className="font-bold text-gray-900 text-base md:text-lg print:text-xs">{orderInfo.orderNumber}</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">المجموع الكلي</p>
                        <p className="font-bold text-green-700 text-base md:text-lg print:text-xs">{orderInfo.cart.total.toLocaleString()} د.ج</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">اسم العميل</p>
                        <p className="font-medium text-gray-900 print:text-xs">{orderInfo.personalInfo.fullName}</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">طريقة الدفع</p>
                        <p className="font-medium text-gray-900 print:text-xs">الدفع عند الاستلام</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">رقم الهاتف</p>
                        <p className="font-medium text-gray-900 print:text-xs">{orderInfo.personalInfo.phone}</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">طريقة التوصيل</p>
                        <p className="font-medium text-gray-900 print:text-xs">{orderInfo.shipping.type}</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">البريد الإلكتروني</p>
                        <p className="font-medium text-gray-900 print:text-xs">{orderInfo.personalInfo.email}</p>
                      </div>
                      <div className="print:text-xs">
                        <p className="text-gray-600 mb-0.5 print:text-[10px]">الولاية</p>
                        <p className="font-medium text-gray-900 print:text-xs">{orderInfo.shipping.state}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* الخطوات التالية */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 print:p-2 print:bg-white print:border-gray-300">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 print:text-sm">الخطوات التالية</h2>
                    <div className="space-y-3 print:space-y-1">
                      <div className="flex items-start print:text-xs">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0 print:w-5 print:h-5 print:bg-gray-200">
                          <span className="text-blue-700 font-bold text-sm md:text-base print:text-[10px]">1</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm md:text-base print:text-xs">تأكيد الطلب</h3>
                          <p className="text-gray-700 text-xs md:text-sm print:text-[10px]">سيتم الاتصال بك خلال 24 ساعة لتأكيد الطلب</p>
                        </div>
                      </div>
                      <div className="flex items-start print:text-xs">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0 print:w-5 print:h-5 print:bg-gray-200">
                          <span className="text-blue-700 font-bold text-sm md:text-base print:text-[10px]">2</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm md:text-base print:text-xs">تجهيز الطلب</h3>
                          <p className="text-gray-700 text-xs md:text-sm print:text-[10px]">سيتم تجهيز طلبك خلال 1-2 يوم عمل</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* معلومات التواصل الديناميكية */}
                  <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 print:p-2 print:bg-white print:border-gray-300">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 print:text-sm">لأي استفسار</h2>
                    <div className="flex items-start text-yellow-800 print:text-gray-800">
                      <span className="ml-2 text-xl print:text-base">📞</span>
                      <div className="print:text-xs">
                        <p className="font-medium text-sm md:text-base print:text-xs">يمكنك التواصل معنا على:</p>
                        <div className="flex flex-col mt-1">
                          {contactInfo?.phone.split(' ').map((number, idx) => (
                            <span key={idx} className="text-base md:text-lg font-bold print:text-sm" dir="ltr">
                              {number}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs mt-1 print:text-[10px]">من السبت إلى الخميس، 9 صباحاً - 5 مساءً</p>
                        {contactInfo?.description && (
                          <p className="text-xs text-gray-600 mt-1 print:text-[10px]">{contactInfo.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 print:py-2">
                  <div className="text-4xl mb-3 print:text-2xl">✅</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 print:text-sm">تم تأكيد طلبك بنجاح</h2>
                  <p className="text-gray-700 print:text-xs">سنقوم بالاتصال بك قريباً لتأكيد تفاصيل الطلب</p>
                </div>
              )}
            </div>
          </div>
          
          {/* الأزرار */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
            >
              ← العودة إلى المتجر
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg text-center transition-colors"
            >
              🖨️ طباعة تأكيد الطلب
            </button>
          </div>
          
          <div className="text-center mt-8 print:hidden">
            <p className="text-gray-600">شكراً لثقتك بنا! نتمنى لك يوماً سعيداً 🛍️</p>
          </div>
        </div>
      </div>

      {/* إعدادات الطباعة المحسّنة – صفحة واحدة نظيفة */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0.3cm;
          }
          body * {
            visibility: hidden;
          }
          #order-receipt,
          #order-receipt * {
            visibility: visible;
          }
          #order-receipt {
            position: relative;
            width: 100%;
            margin: 0 auto;
            padding: 0;
            border: 1px solid #aaa !important;
            background: white;
            page-break-inside: avoid;
            page-break-before: avoid;
            page-break-after: avoid;
            box-shadow: none !important;
            font-size: 10px;
          }
          .bg-gradient-to-r,
          .bg-green-50,
          .bg-blue-50,
          .bg-yellow-50,
          .bg-gray-50 {
            background: white !important;
            color: black !important;
          }
          .text-white {
            color: black !important;
          }
          .border-green-200,
          .border-blue-200,
          .border-yellow-200 {
            border: 1px solid #ccc !important;
          }
          #order-receipt .p-6,
          #order-receipt .p-5,
          #order-receipt .p-4 {
            padding: 0.2rem !important;
          }
          #order-receipt .space-y-5,
          #order-receipt .space-y-4,
          #order-receipt .space-y-3 {
            margin-top: 0.1rem !important;
            margin-bottom: 0.1rem !important;
          }
          #order-receipt h1 {
            font-size: 14px !important;
            margin: 0 !important;
          }
          #order-receipt h2 {
            font-size: 12px !important;
            margin: 0.2rem 0 !important;
          }
          #order-receipt p,
          #order-receipt span,
          #order-receipt div {
            font-size: 9px !important;
          }
          #order-receipt .text-lg {
            font-size: 10px !important;
          }
          #order-receipt .text-sm {
            font-size: 8px !important;
          }
          #order-receipt .text-xs {
            font-size: 7px !important;
          }
          #order-receipt .w-8,
          #order-receipt .h-8 {
            width: 14px !important;
            height: 14px !important;
          }
          #order-receipt .w-7,
          #order-receipt .h-7 {
            width: 12px !important;
            height: 12px !important;
          }
          #order-receipt span.text-blue-700 {
            font-size: 8px !important;
          }
          .rounded-2xl,
          .rounded-xl,
          .rounded-lg {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutSuccessPage;