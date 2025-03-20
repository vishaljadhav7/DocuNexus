'use client'

import React from 'react'
import ContractReview from '@/components/Analysis/ContractReview';
import { useAppSelector } from '@/redux/store';

export default function OutcomePage() {
 const analysisResults = useAppSelector(store => store.contract.analysisResults)

    return (
      <div>
        <ContractReview analysisResults={analysisResults}/>
      </div>
    );
}   