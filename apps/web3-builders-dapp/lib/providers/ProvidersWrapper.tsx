'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import WagmiSetupProvider from './WagmiSetupProvider'

type Props = {
    children: React.ReactNode
}

function ProvidersWrapper({
    children
}: Props) {
  return (
  
        <WagmiSetupProvider>

    {children}

    </WagmiSetupProvider>

  )
}

export default ProvidersWrapper