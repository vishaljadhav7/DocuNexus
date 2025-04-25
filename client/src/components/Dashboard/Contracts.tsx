"use client";

import { useFetchContractsQuery, useDeleteContractByIdMutation } from "@/features/contracts/contractApi";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import LoadingSpinner from "../LoadingSpinner";
import { Button as DialogButton } from "@/components/ui/button"; 
import { Analysis } from "@/features/contracts/contractSlice";

export default function UserContracts() {
  const { data: contracts, isLoading } = useFetchContractsQuery();
  const [deleteContractById, {isLoading : newContractsLoading}] = useDeleteContractByIdMutation()
  if (isLoading) return <LoadingSpinner />;
  if(newContractsLoading) return <LoadingSpinner />;

  const totalContracts = contracts?.length || 0;

  const averageScore =
    totalContracts > 0
      ? (contracts?.reduce(
          (sum: number, contract: Analysis) => sum + (contract.overallScore ?? 0),
          0
        ) ?? 0) / totalContracts
      : 0;

  const highRiskContracts = 0; 
  const handleDelete = async (contractId : string) => {
    try {
      await deleteContractById({contractId}).unwrap();
    } catch (error) {
      console.error("error ", error)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 mt-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Your Contracts</h1>
        <UploadModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-800">{totalContracts}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-800">{averageScore.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-800">{highRiskContracts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-gray-200 shadow-sm bg-gray-50">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead>
                <Button variant="ghost" className="text-gray-600 hover:text-teal-600">
                  Contract ID
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="text-gray-600 hover:text-teal-600">
                  Overall Score
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="text-gray-600 hover:text-teal-600">
                  Contract Type
                </Button>
              </TableHead>
              <TableHead className="text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {contracts && contracts?.length > 0 ? (
              contracts?.map((contract: Partial<Analysis>) => (
                <TableRow key={contract.id} className="border-b border-gray-100">
                  <TableCell className="font-medium text-gray-700">{contract.id}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md",
                        Number(contract.overallScore) > 75
                          ? "bg-teal-100 text-teal-600 border-teal-200"
                          : Number(contract.overallScore) < 50
                          ? "bg-red-100 text-red-600 border-red-200"
                          : "bg-amber-100 text-amber-600 border-amber-200"
                      )}
                    >
                      {Number(contract.overallScore).toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-md bg-gray-200 text-gray-700 border-gray-300">
                      {contract.contractType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0 text-gray-600 hover:text-teal-600">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-gray-200 bg-gray-50">
                        <DropdownMenuItem>
                          <Link href={`/dashboard/contract/${contract.id}`} className="text-gray-700 hover:text-teal-600">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => handleDelete(contract.id as string)}>
                              <span className="text-red-600 hover:text-red-700">Delete Contract</span>
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-50 border-gray-200">
                            <DialogHeader>
                              <DialogTitle className="text-gray-800">Are you absolutely sure?</DialogTitle>
                              <DialogDescription className="text-gray-600">
                                This action cannot be undone. This will permanently delete your contract and remove your data from our servers.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogButton variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-200">
                                Cancel
                              </DialogButton>
                              <DialogButton className="bg-teal-600 hover:bg-teal-700 text-white">
                                Continue
                              </DialogButton>
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
                <TableCell colSpan={4} className="h-24 text-center text-gray-600">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}