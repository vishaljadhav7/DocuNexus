import React from 'react'
import StoreProvider from '@/redux/store'

export default function Provider({children}: {children : React.ReactNode}) {
  return (
    <StoreProvider>
         {children}
    </StoreProvider>
  )
}