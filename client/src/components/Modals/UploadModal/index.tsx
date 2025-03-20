"use client";

import { useAppDispatch } from "@/redux/store";
import { setAnalysisResults } from "@/features/contracts/contractSlice";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, FileText, Loader2, Sparkles, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import {
  useRecognizeContractTypeMutation,
  useAnalyzeContractMutation,
} from "@/features/contracts/contractApi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function UploadModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
 
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [step, setStep] = useState<"upload" | "detecting" | "confirm" | "processing" | "done">(
    "upload"
  );
  

  const [recognizeContractType, { isLoading: isDetecting }] = useRecognizeContractTypeMutation();
  const [analyzeContract, { isLoading: isProcessing }] = useAnalyzeContractMutation();

  const handleFileUpload = () => {
    if (files.length > 0) {
      setStep("detecting");
      const formData = new FormData();
      formData.append("contract", files[0]);

      recognizeContractType(formData)
        .unwrap()
        .then((data) => {
          setDetectedType(data);
          setStep("confirm");
        })
        .catch((error) => {
          console.error("Recognition error:", error);
          setError("Failed to detect contract type");
          setStep("upload");
        });
    }
  };

  const handleAnalyzeContract = () => {
    if (files.length && detectedType) {
      setStep("processing");
      const formData = new FormData();
      formData.append("contract", files[0]);
      formData.append("contractType", detectedType);

      analyzeContract(formData)
        .unwrap()
        .then((data) => {
          dispatch(setAnalysisResults(data));
          setStep("done");
        })
        .catch((error) => {
          console.error("Analysis error:", error);
          setError("Failed to analyze contract wait for a minute");
          setStep("upload");
        });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setError(null);
      setStep("upload");
    } else {
      setError("No valid PDF file selected");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const handleClose = () => {
    setFiles([]);
    setDetectedType(null);
    setError(null);
    setStep("upload");
  };

  const renderContent = () => {
    switch (step) {
      case "upload":
        return (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-md p-6 mt-4 text-center transition-colors",
                  isDragActive
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-300 hover:border-teal-600"
                )}
              >
                <input {...getInputProps()} />
                <FileText className="mx-auto size-12 text-teal-600" />
                <p className="mt-3 text-sm text-gray-600">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-2">
                  Note: Only PDF files are accepted
                </p>
              </div>
              {files.length > 0 && (
                <div className="mt-4 bg-teal-50 border border-teal-200 text-teal-600 p-2 rounded flex items-center justify-between">
                  <span>
                    {files[0].name}{" "}
                    <span className="text-xs text-gray-600">({files[0].size} bytes)</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-100"
                    onClick={() => setFiles([])}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              )}
              {files.length > 0 && !isProcessing && !isDetecting && (
                <Button
                  className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleFileUpload}
                >
                  <Sparkles className="mr-2 size-4" />
                  Analyze Contract
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        );
      case "detecting":
        return (
          <AnimatePresence>
            <motion.div
              className="flex flex-col items-center justify-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="size-12 animate-spin text-teal-600" />
              <p className="mt-3 text-sm text-gray-600">Detecting contract type...</p>
            </motion.div>
          </AnimatePresence>
        );
      case "confirm":
        return (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col space-y-3 mt-4">
                <p className="text-gray-700">
                  Detected contract type:{" "}
                  <span className="font-medium text-teal-600">{detectedType}</span>
                </p>
                <p className="text-sm text-gray-600">Proceed with AI analysis?</p>
              </div>
              <div className="mt-4 flex space-x-3">
                <Button
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={handleAnalyzeContract}
                >
                  Yes, Analyze
                </Button>
                <Button
                  onClick={() => setStep("upload")}
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-teal-600"
                >
                  No, Try Another
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      case "processing":
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="size-12 text-teal-600" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-sm text-gray-600"
              >
                AI is analyzing your contract...
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-1 text-xs text-gray-500"
              >
                This may take some time.
              </motion.p>
              <motion.div
                className="w-64 h-2 bg-teal-400 rounded-full mt-6 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
              >
                <motion.div
                  className="h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 10, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        );
      case "done":
        return (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Alert className="mt-4 border-teal-200 bg-teal-50">
                <AlertTitle className="text-teal-600">Analysis Completed</AlertTitle>
                <AlertDescription className="text-gray-600">
                  Your contract has been analyzed. View the results now.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex flex-col space-y-3">
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => router.push("/dashboard/outcomes")}
                >
                  View Results
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-teal-600"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">New Contract</Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-50 border-gray-200">
        <DialogTitle className="text-gray-800">Upload a Contract File</DialogTitle>
        {error && (
          <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
            <AlertTitle className="text-red-600">Error</AlertTitle>
            <AlertDescription className="text-gray-600">{error}</AlertDescription>
          </Alert>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}