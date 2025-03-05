import React from 'react'
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch } from '@/redux/store';
import { setAnalysisResults } from '@/features/contracts/contractSlice';
import axios from 'axios'
import ContractReview from '@/components/Analysis/ContractReview';

export default function ContractContainer({contractId} : {contractId : string} ) {
 const dispatch = useAppDispatch()
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<boolean>(false);

 useEffect(() => {
      fetchAnalysisResults(contractId);
  }, []);


 const fetchAnalysisResults = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/contracts/contract/${id}`);
     dispatch(setAnalysisResults(response.data.data || response.data))
      console.log(response.data);
      setError(false);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if(loading){
    return <h1>Loading.....</h1>
  }

  if (error) {
    return notFound();
  }


  return (
    <ContractReview/>
  )
}