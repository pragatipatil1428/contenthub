"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  isOwnerAdmin: boolean;
  emailVerified: boolean;
  isPremium: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

interface CartState {
  items: { contentId: string; title: string; price: number }[];
  addItem: (item: { contentId: string; title: string; price: number }) => void;
  removeItem: (contentId: string) => void;
  clearCart: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);


export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (contentId) =>
        set((state) => ({
          items: state.items.filter((item) => item.contentId !== contentId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);
