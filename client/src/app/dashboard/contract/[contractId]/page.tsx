import ContractContainer from "./_components/ContractContainer";

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
