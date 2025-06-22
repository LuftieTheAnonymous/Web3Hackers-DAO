import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create<TokenState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token: string) => set({ token }),
      unsetToken: () => set({ token: null }),
    }),
    {
      name: 'token-storage', // name of item in storage
     
    }
  )
)

export interface TokenState {
    token: string | null
    setToken: (token: string) => void
    unsetToken: () => void
}