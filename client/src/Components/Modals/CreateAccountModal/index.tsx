'use client'

import { useAppDispatch, useAppSelector } from "@/redux/store"
import { closeModal, selectIsModalOpen } from "@/features/modal/modalSlice"
import { useGoogleSignInMutation } from "@/features/auth/authApi"
import { useState } from "react"
// import toast from 'sooner'
import { 
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react';
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreateAccountModal() {
    
 const [isAgreed, setIsAgreed] = useState(false);
 const modalKey = 'connectAccountModal';
 const dispatch = useAppDispatch();
 const isModalOpen = useAppSelector((state) => selectIsModalOpen(state, modalKey));
 
 const [googleSignIn, { isLoading: isPending }] = useGoogleSignInMutation();

 const handleGoogleSignIn = () => {
    if (isAgreed) {
      googleSignIn()
        .unwrap()
        .then(() => {
          dispatch(closeModal(modalKey));
        })
        .catch((error) => {
          console.error(error.message || 'Failed to initiate Google sign-in');
        });
    } else {
      console.error('Please agree to the terms and conditions');
    }
  };

  return (
    <Dialog
     open={isModalOpen}
     onOpenChange={() => dispatch(closeModal(modalKey))}
    > 
     <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Google Account</DialogTitle>
          <DialogDescription>
            Please connect your Google account to continue.
          </DialogDescription>
        </DialogHeader>
      <div className="grid gap-4 py-4">
         <Button
          onClick={handleGoogleSignIn}
          disabled={!isAgreed || isPending}
          className="w-full"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin"/>
            ) : (
              <>Sign in with Google</>
            )}
         </Button> 
         <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions
            </Label>
          </div>
      </div>
     </DialogContent>
    </Dialog>
  )
}