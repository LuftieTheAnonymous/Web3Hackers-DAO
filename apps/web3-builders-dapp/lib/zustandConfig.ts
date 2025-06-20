import { create } from 'zustand'

export const useStore = create((set) => ({
token: null,
setToken: (token: string) => set({ token }),
unsetToken: () => set({ token: null }),
}))

export interface TokenState {
    token: string | null
    setToken: (token: string) => void
    unsetToken: () => void
}