
'use client'

import ContractContainer from "./_components/ContractContainer";
import React from "react";


export default function ContractPage({
    params
}: { params: Promise<{ contractId : string }> }) {

    const resolvedParams = React.use(params);
    const {contractId} = resolvedParams;
   

  return (
    <ContractContainer contractId={contractId}/>
  )
}
