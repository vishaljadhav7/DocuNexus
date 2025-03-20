import ContractReview from '@/components/Analysis/ContractReview';
import { useFetchContractByIdQuery} from '@/features/contracts/contractApi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ContractContainer({contractId} : {contractId : string} ) {

 const {isLoading, data} = useFetchContractByIdQuery({contractId});

  if(isLoading){
    return <LoadingSpinner/>
  }

  return (
    <ContractReview analysisResults={data}/>
  )
}