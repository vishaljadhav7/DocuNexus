import React from 'react'
import StoreProvider from '@/redux/store'
import { SocketProvider } from '@/Context/SocketContext'

export default function Provider({children}: {children : React.ReactNode}) {
  return (
    <StoreProvider>
      <SocketProvider>
         {children}
      </SocketProvider>
    </StoreProvider>
  )
}