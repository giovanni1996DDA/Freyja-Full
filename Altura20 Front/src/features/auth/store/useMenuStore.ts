import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResolvedMenuItem } from '../types/menu'

interface MenuState {
  visibleMenu: ResolvedMenuItem[]
  setVisibleMenu: (menu: ResolvedMenuItem[]) => void
  clearMenu: () => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      visibleMenu: [],
      setVisibleMenu: (menu) => set({ visibleMenu: menu }),
      clearMenu: () => set({ visibleMenu: [] }),
    }),
    {
      name: 'menu-storage',
    },
  ),
)
