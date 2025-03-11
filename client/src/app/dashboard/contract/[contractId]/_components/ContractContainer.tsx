import { notFound } from "next/navigation";
import ContractReview from '@/components/Analysis/ContractReview';
import { useFetchContractQuery } from '@/features/contracts/contractApi';

export default function ContractContainer({contractId} : {contractId : string} ) {

 const {isLoading, isError, data} = useFetchContractQuery(contractId);

  if(isLoading){
    return <h1>Loading.....</h1>
  }

  if (isError) {
    return notFound();
  }


  return (
    <ContractReview analysisResults={data}/>
  )
}