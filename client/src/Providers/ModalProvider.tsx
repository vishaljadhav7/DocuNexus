'use client'
import React from 'react'
import { useAppSelector } from '@/redux/store';
import { selectIsModalOpen } from '@/features/modal/modalSlice';
import CreateAccountModal from '@/components/Modals/CreateAccountModal'


export default function ModalProvider({ children }: { children: React.ReactNode }) {
   const isModalOpen = useAppSelector((state) => selectIsModalOpen(state, "connectAccountModal"));
   
  
  return (
    <>
    {children }
    {isModalOpen && <CreateAccountModal/>}
    </>
  )
}