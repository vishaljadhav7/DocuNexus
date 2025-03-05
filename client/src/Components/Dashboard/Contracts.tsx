// Assuming this is located at src/components/UserContracts.tsx
// import { ContractAnalysis } from "@/interfaces/contract.interface";
// import { useState, useMemo } from "react";
// import { api } from "@/lib/api";
// import { useGetUserContractsQuery } from "@/services/contractApi"; // RTK Query API slice
import { Button } from "../ui/button";
// import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../ui/table";
// import { UploadModal } from "../Modals/UploadModal/index";
// import { cn } from "@/lib/utils";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { MoreHorizontal } from "lucide-react";
// import Link from "next/link";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button as DialogButton } from "@/components/ui/button"; // Renamed to avoid conflict

export default function UserContracts() {
//   const { data: contracts, error, isFetching, refetch } = useGetUserContractsQuery();
//   const [sortBy, setSortBy] = useState<string | null>(null);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const pageLimit = 10;

//   const contractTypeColors: { [key: string]: string } = {
//     Employment: "bg-blue-100 text-blue-800 hover:bg-blue-200",
//     "Non-Disclosure Agreement": "bg-green-100 text-green-800 hover:bg-green-200",
//     Sales: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
//     Lease: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
//     Services: "bg-pink-100 text-pink-800 hover:bg-pink-200",
//     Other: "bg-gray-100 text-gray-800 hover:bg-gray-200",
//   };

//   // Sorting logic
//   const sortedContracts = useMemo(() => {
//     if (!sortBy || !contracts) return contracts || [];
//     return [...contracts].sort((a, b) => {
//       let valA = a[sortBy as keyof ContractAnalysis];
//       let valB = b[sortBy as keyof ContractAnalysis];
//       // Handle numerical sorting for overallScore
//       if (sortBy === "overallScore") {
//         valA = Number(valA) || 0;
//         valB = Number(valB) || 0;
//       }
//       if (sortOrder === "asc") {
//         return valA < valB ? -1 : valA > valB ? 1 : 0;
//       } else {
//         return valA > valB ? -1 : valA < valB ? 1 : 0;
//       }
//     });
//   }, [contracts, sortBy, sortOrder]);

//   // Pagination logic
//   const paginatedContracts = useMemo(() => {
//     if (!sortedContracts) return [];
//     return sortedContracts.slice(currentPage * pageLimit, (currentPage + 1) * pageLimit);
//   }, [sortedContracts, currentPage, pageLimit]);

//   const totalPages = Math.ceil((sortedContracts?.length ?? 0) / pageLimit) - 1;

//   const handleSort = (column: string) => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(column);
//       setSortOrder("asc");
//     }
//     setCurrentPage(0); // Reset to first page on sort
//   };

//   // Statistics calculation
//   const totalContracts = contracts?.length || 0;
//   const averageScore =
//     totalContracts > 0
//       ? (contracts?.reduce((sum, contract) => sum + (Number(contract.overallScore) || 0), 0) ?? 0) / totalContracts
//       : 0;
//   const highRiskContracts =
//     contracts?.filter((contract) =>
//       contract.risks.some((risk : {risk : string, riskDetails : string, severity : string}) => risk.severity === "high")
//     ).length ?? 0;

//   if (error) {
//     return <div>Error loading contracts: {(error as Error).message}</div>;
//   }

//   if (isFetching) {
//     return <div>Loading...</div>;
//   }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Contracts</h1>
        <Button onClick={()=>{}}>New Contract</Button>
        {/* {() => setIsUploadModalOpen(true)} */}
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
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">55 </div>
            {/* {{averageScore.toFixed(2)}} */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"> 0</div> 
            {/* {{highRiskContracts}} */}
          </CardContent>
        </Card>
      </div>
{/* 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("_id")}>
                  Contract ID {sortBy === "_id" && (sortOrder === "asc" ? "▼" : "▲")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("overallScore")}>
                  Overall Score {sortBy === "overallScore" && (sortOrder === "asc" ? "▼" : "▲")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("contractType")}>
                  Contract Type {sortBy === "contractType" && (sortOrder === "asc" ? "▼" : "▲")}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedContracts.length > 0 ? (
              paginatedContracts.map((contract : {contractType : string, id : string , overallScore : string,}) => (
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
                        contractTypeColors[contract.contractType] || contractTypeColors["Other"]
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => refetch()}
      /> */}
    </div>
  );
}

