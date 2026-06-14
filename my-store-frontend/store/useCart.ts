import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. تعريف شكل المنتج كما هو في Strapi
interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

// 2. تعريف شكل العناصر داخل السلة
interface CartItem {
  product: Product;
  quantity: number;
}

// 3. تعريف العمليات التي يمكن القيام بها في السلة
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

// 4. إنشاء المخزن (Store) مع ميزة الحفظ التلقائي (Persist)
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // إضافة منتج للسلة
      addItem: (product, quantity) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        }),

      // حذف منتج من السلة
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      // تحديث الكمية
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),

      // مسح السلة بالكامل
      clearCart: () => set({ items: [] }),

      // حساب السعر الإجمالي
      totalPrice: () => {
        return get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // هذا هو الاسم الذي سيظهر في LocalStorage بمتصفحك
    }
  )
);