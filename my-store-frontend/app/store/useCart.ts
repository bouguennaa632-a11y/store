import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
  persist(
    (set, get: any) => ({
      items: [],
      
      addItem: (product: any) => {
        console.log('🛒 addItem استدعي بـ:', product);
        
        // تنظيف البيانات الفاسدة أولاً
        const currentItems = get().items;
        const cleanItems = currentItems.filter((item: any) => 
          item && item.id && item.Name && item.Name !== "منتج" && item.Price > 0
        );
        
        // إذا كان المنتج الجديد فاسد، لا نضيفه
        if (!product || !product.id || !product.Name || product.Name === "منتج" || product.Price <= 0) {
          console.error('❌ بيانات المنتج فاسدة:', product);
          return;
        }
        
        // البحث عن المنتج الموجود
        const existingItem = cleanItems.find((item: any) => item.id === product.id);
        
        if (existingItem) {
          // تحديث الكمية
          const updatedItems = cleanItems.map((item: any) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
          set({ items: updatedItems });
        } else {
          // إضافة منتج جديد
          const newItem = {
            id: product.id,
            Name: product.Name,
            Price: Number(product.Price),
            Image: product.Image || "",
            quantity: product.quantity || 1
          };
          set({ items: [...cleanItems, newItem] });
        }
      },
      
      removeItem: (id: string) => {
        set((state: any) => ({
          items: state.items.filter((item: any) => item.id !== id)
        }));
      },
      
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'cart-storage',
      version: 4, // زيادة الإصدار لمسح البيانات القديمة
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          console.log('🔄 ترقية السلة إلى الإصدار 4');
          return { items: [] };
        }
        return persistedState;
      }
    }
  )
);