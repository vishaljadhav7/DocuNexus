'use client'
// Assuming this is located at src/components/UserContracts.tsx
// import { ContractAnalysis } from "@/interfaces/contract.interface";
import { useState, useMemo, useEffect } from "react";
// import { api } from "@/lib/api";
import { useFetchContractsQuery } from "@/features/contracts/contractApi";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { UploadModal } from "../Modals/UploadModal/index";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog";
import { Button as DialogButton } from "@/components/ui/button"; // Renamed to avoid conflict

export default function UserContracts() {

  const { data: contracts , isLoading} = useFetchContractsQuery();




  if(isLoading) return <h1>Loading....</h1>



  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold">Your Contracts</h1>
          <UploadModal/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            {/* {totalContracts} */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            {/* {{averageScore.toFixed(2)}} */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div> 
            {/* {{highRiskContracts}} */}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" >
                  Contract ID 
                  {/* {{sortBy === "_id" && (sortOrder === "asc" ? "▼" : "▲")}} */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost">
                  Overall Score 
                  {/* {{sortBy === "overallScore" && (sortOrder === "asc" ? "▼" : "▲")}} */}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" >
                  Contract Type 
                  {/* {{sortBy === "contractType" && (sortOrder === "asc" ? "▼" : "▲")}} */}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {contracts && contracts?.length > 0 ? (
              contracts?.map((contract : {contractType : string, id : string , overallScore : string,}) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell>
                    <Badge
                      className="rounded-md"
                      variant={
                        Number(contract.overallScore) > 75
                          ? "outline"
                          : Number(contract.overallScore) < 50
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {Number(contract.overallScore).toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md",
                      )}
                    >
                      {contract.contractType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/dashboard/contract/${contract.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <span className="text-destructive">Delete Contract</span>
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Are you absolutely sure?</DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will permanently delete your
                                contract and remove your data from our servers.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogButton variant="outline">Cancel</DialogButton>
                              <DialogButton>Continue</DialogButton>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      
      {/* <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => refetch()}
      /> */}
    </div>
  );
}

