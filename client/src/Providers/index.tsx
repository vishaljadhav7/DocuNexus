import React from 'react'
import StoreProvider from '@/redux/store'
import ModalProvider from './ModalProvider'

export default function Provider({children}: {children : React.ReactNode}) {
  return (
    <StoreProvider>
       <ModalProvider>
         {children}
       </ModalProvider> 
    </StoreProvider>
  )
}