/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

const CustomStyles = () => (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        body { font-family: 'Cairo', sans-serif; background-color: #ffffff; }

        .bg-dots {
            background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
            background-size: 30px 30px;
        }

        @keyframes drawLine { from { width: 0; } to { width: 100%; } }
        .animate-line {
            height: 8px;
            background: #3b82f6;
            display: block;
            border-radius: 10px;
            animation: drawLine 1.5s ease-out forwards;
        }

        @keyframes sideShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
        }
        .shake-animation:hover {
            animation: sideShake 0.4s ease-in-out infinite;
            border-color: #ff4d94 !important;
        }

        @keyframes customPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.98); }
        }
        .animate-empty-pulse { animation: customPulse 2s ease-in-out infinite; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    `}</style>
);

interface ProductAttributes {
    Name: string;
    Price: number;
    Inventory?: number;
    Images?: { data?: Array<{ attributes?: { url: string }; url?: string }> } | Array<{ attributes?: { url: string }; url?: string }>;
}

interface Product {
    id: string | number;
    documentId?: string;
    attributes?: ProductAttributes;
    Name?: string;
    Price?: number;
    Inventory?: number;
    Images?: { data?: Array<{ attributes?: { url: string }; url?: string }> } | Array<{ attributes?: { url: string }; url?: string }>;
}

interface Category {
    id: string | number;
    attributes?: { Name?: string; name?: string };
    Name?: string;
    name?: string;
}

interface ProductSectionProps {
    products: Product[] | { data: Product[] };
    categories: Category[] | { data: Category[] };
}

const ProductSection = ({ products, categories }: ProductSectionProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState({ id: 'all' as string | number, label: 'كل المجموعات' });
    const [visibleCount, setVisibleCount] = useState(8);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const rawProducts = useMemo(() => 
        Array.isArray(products) ? products : (products?.data || []),
        [products]
    );
    const rawCategories = useMemo(() => 
        Array.isArray(categories) ? categories : (categories?.data || []),
        [categories]
    );

    const addToCart = (productData: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const inventory = productData.Inventory ?? 0;
        const isStock = inventory > 0;
        
        if (!isStock) {
            alert(`⚠️ عذرًا، المنتج "${productData.Name}" غير متوفر في المخزون حالياً`);
            return;
        }
        
        console.log('🛒 إضافة المنتج إلى السلة (كمية واحدة):', productData.Name);
        
        const cartData = localStorage.getItem('cart-storage');
        let currentData = {
            state: { items: [] },
            version: 0
        };
        
        if (cartData) {
            try {
                currentData = JSON.parse(cartData);
            } catch (error) {
                console.error('❌ خطأ في قراءة السلة:', error);
            }
        }
        
        const currentItems = currentData.state.items || [];
        const existingIndex = currentItems.findIndex(item => 
            item.product && item.product.id === productData.id
        );
        
        const productName = productData.Name || 'المنتج';
        
        if (existingIndex !== -1) {
            const currentQuantity = currentItems[existingIndex].product.quantity || 1;
            currentItems[existingIndex].product.quantity = currentQuantity + 1;
        } else {
            currentItems.push({
                product: {
                    id: productData.id,
                    Name: productData.Name,
                    Price: productData.Price,
                    Image: productData.Image,
                    Description: productData.Description || '',
                    quantity: 1,
                    Inventory: inventory
                }
            });
        }
        
        const updatedData = {
            state: { items: currentItems },
            version: 0
        };
        
        localStorage.setItem('cart-storage', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
        
        const message = existingIndex !== -1 
            ? `تم زيادة كمية "${productName}" في السلة`
            : `تم إضافة "${productName}" إلى السلة`;
        
        alert(`✅ ${message}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory.id === 'all') {
            return rawProducts;
        } else {
            return rawProducts.filter((item: Product) => {
                const itemData = (item.attributes || item) as unknown as Record<string, unknown>;
                const categoriesObj = itemData.categories as unknown as { data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>> | undefined;
                const itemCats = (typeof categoriesObj === 'object' && categoriesObj !== null && 'data' in categoriesObj) ? categoriesObj.data : (Array.isArray(categoriesObj) ? categoriesObj : []);
                return (itemCats || []).some((c: Record<string, unknown>) => c.id === selectedCategory.id);
            });
        }
    }, [selectedCategory, rawProducts]);

    useEffect(() => {
        setVisibleCount(8);
    }, [selectedCategory]);

    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const loadMore = () => {
        setVisibleCount(prev => prev + 8);
    };

    const getImageUrl = (mainImgUrl: string | undefined, productName: string): string => {
        if (!mainImgUrl) {
            const encodedName = encodeURIComponent(productName.substring(0, 10));
            return `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
        }
        
        if (mainImgUrl.startsWith('http')) {
            return mainImgUrl;
        }
        
        return `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${mainImgUrl}`;
    };

    return (
        <section 
            id="products"  // إضافة معرف للربط
            className="relative py-20 md:py-28 bg-white bg-dots min-h-[900px] overflow-x-hidden scroll-mt-20"  // scroll-mt-24 يخلق مسافة عند التمرير
            dir="rtl"
        >
            <CustomStyles />
            
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                
                {/* رأس القسم مع القائمة المنسدلة */}
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 text-center md:text-right">
                    <div className="max-w-3xl">
                        <h3 className="text-blue-600 font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                            <span className="w-8 h-[2px] bg-blue-600 animate-pulse"></span>
                            مجموعتنا الحصرية
                        </h3>
                        <h2 className="text-4xl md:text-7xl font-[900] text-slate-900 leading-tight">
                            أثاث يصنع <span className="relative inline-block">
                                الفارق
                                <span className="animate-line opacity-30 mt-[-10px]"></span>
                            </span> في منزلك
                        </h2>
                    </div>

                    <div ref={dropdownRef} className="relative flex justify-center w-full md:w-max">
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="group flex items-center gap-4 text-slate-900 font-black text-xl hover:text-blue-600 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <span className="bg-white shadow-md border border-slate-100 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"/>
                                </svg>
                            </span>
                            {selectedCategory.label}
                        </button>
                        
                        {isOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[280px] md:w-[320px] bg-white/95 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-3xl border border-white overflow-hidden z-[60] animate-in slide-in-from-top-4 duration-300">
                                <div className="p-3 grid grid-cols-1 max-h-80 overflow-y-auto custom-scrollbar">
                                    <button 
                                        onClick={() => {setSelectedCategory({id:'all', label:'كل المجموعات'}); setIsOpen(false)}}
                                        className={`text-right px-6 py-4 rounded-2xl font-bold transition-all ${selectedCategory.id === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-blue-50 hover:text-blue-600'}`}
                                    >
                                        تصفح الكل
                                    </button>
                                    {rawCategories.map((cat: Category) => {
                                        const c = cat.attributes || cat;
                                        return (
                                            <button 
                                                key={cat.id}
                                                onClick={() => {
                                                    setSelectedCategory({id: cat.id, label: c.Name || c.name || 'المجموعة'}); 
                                                    setIsOpen(false);
                                                }}
                                                className={`text-right px-6 py-4 rounded-2xl font-bold transition-all ${selectedCategory.id === cat.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50'}`}
                                            >
                                                {c.Name || c.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* عرض المنتجات */}
                {filteredProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                            {displayedProducts.map((item: Product) => {
                                const data = item.attributes || item;
                                const isStock = (data.Inventory ?? 0) > 0;

                                const imagesArray = (typeof data.Images === 'object' && data.Images !== null && 'data' in data.Images) ? (data.Images.data || []) : (Array.isArray(data.Images) ? data.Images : []);
                                const mainImgUrl = imagesArray?.[0]?.attributes?.url || imagesArray?.[0]?.url;
                                const imageUrl = getImageUrl(mainImgUrl, data.Name || 'منتج');

                                return (
                                    <div key={item.id} className="group bg-white rounded-[25px] md:rounded-[40px] p-3 md:p-6 border border-slate-100 hover:shadow-2xl transition-all duration-500 relative">
                                        <Link 
                                            href={`/product/${item.documentId || item.id}`}
                                            className="block"
                                        >
                                            <div className={`relative bg-slate-50 rounded-[20px] md:rounded-[30px] h-36 md:h-60 flex items-center justify-center overflow-hidden mb-3 md:mb-6 ${!isStock ? 'grayscale opacity-60' : ''}`}>
                                                {!isStock && <div className="absolute top-2 right-2 bg-pink-500 text-white text-[8px] md:text-[10px] font-black px-2 md:px-4 py-1 rounded-full z-10 shadow-lg">نفذ</div>}
                                                
                                                <img 
                                                    src={imageUrl} 
                                                    alt={data.Name} 
                                                    className="w-full h-full group-hover:scale-110 transition-transform duration-700 object-cover"
                                                    onError={(e) => {
                                                        const productName = data.Name || 'منتج';
                                                        const encodedName = encodeURIComponent(productName.substring(0, 10));
                                                        (e.target as HTMLImageElement).src = `https://placehold.co/600x600/3b82f6/ec4899?text=${encodedName}`;
                                                    }}
                                                />
                                            </div>
                                            <div className="px-1 text-right">
                                                <h3 className="text-sm md:text-lg font-black text-slate-900 mb-1 md:mb-3 group-hover:text-blue-600 transition-colors leading-tight truncate">
                                                    {data.Name}
                                                </h3>
                                            </div>
                                        </Link>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm md:text-xl font-black text-blue-600 leading-none">
                                                {data.Price} <small className="text-[9px] md:text-[11px] font-bold text-gray-400">د.ج</small>
                                            </span>

                                            {isStock ? (
                                                <button 
                                                    onClick={(e) => {
                                                        addToCart({
                                                            id: item.documentId || item.id,
                                                            Name: data.Name,
                                                            Price: data.Price,
                                                            Image: imageUrl,
                                                            Description: '',
                                                            Inventory: data.Inventory
                                                        }, e);
                                                    }}
                                                    className="relative z-20 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-pink-500 rounded-xl md:rounded-2xl text-white flex items-center justify-center overflow-hidden group/btn shadow-lg active:scale-90 transition-all"
                                                >
                                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/btn:-top-full transition-all duration-300 font-bold text-lg md:text-xl">+</span>
                                                    <span className="absolute top-[150%] left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/btn:top-1/2 transition-all duration-300 text-sm md:text-lg">🛒</span>
                                                </button>
                                            ) : (
                                                <button 
                                                    disabled
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    className="w-8 h-8 md:w-12 md:h-12 bg-gray-50 border-2 border-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl shake-animation cursor-not-allowed"
                                                >
                                                    🤕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* زر عرض المزيد */}
                        {visibleCount < filteredProducts.length && (
                            <div className="flex justify-center mt-12 md:mt-16">
                                <button
                                    onClick={loadMore}
                                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-pink-500 text-white font-black text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        عرض المزيد
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 animate-empty-pulse relative z-10">
                        <div className="text-7xl mb-6">📦</div>
                        <h3 className="text-2xl font-[900] text-slate-800 mb-2">لا توجد منتجات حالياً</h3>
                        <p className="text-gray-500 font-medium px-4 text-center">نحن بصدد إضافة تشكيلة جديدة قريباً!</p>
                        <button 
                            onClick={() => setSelectedCategory({id:'all', label:'كل المجموعات'})}
                            className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-full font-bold text-blue-600 hover:shadow-md transition-all active:scale-95"
                        >
                            العودة لتصفح الكل
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductSection;