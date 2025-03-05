import ContractContainer from "./_components/ContractContainer";

import React from 'react'

interface IContractResultsProps {
    params: { contractId: string };
  }

export default function ContractPage({
    params: { contractId },
  }: IContractResultsProps) {
  return (
    <ContractContainer contractId={contractId}/>
  )
}
