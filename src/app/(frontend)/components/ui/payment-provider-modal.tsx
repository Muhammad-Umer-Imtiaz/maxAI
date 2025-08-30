'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/(frontend)/components/ui/dialog'
import { Button } from '@/app/(frontend)/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaymentProviderModalProps {
  isOpen: boolean
  onClose: () => void
  plan: 'starter' | 'proFit' | 'maxFlex'
  planName: string
  onStripeSelect: () => void
  onPayPalSelect: () => void
  isLoading: boolean
}

export function PaymentProviderModal({
  isOpen,
  onClose,
  plan,
  planName,
  onStripeSelect,
  onPayPalSelect,
  isLoading,
}: PaymentProviderModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-maxfit-darker-grey border border-maxfit-neon-green/20">
        <DialogHeader>
          <DialogTitle className="text-white text-center">Choose Payment Method</DialogTitle>
          <p className="text-gray-300 text-center text-sm">
            Select how you would like to pay for {planName}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Stripe Option */}
          <Button
            onClick={onStripeSelect}
            disabled={isLoading}
            className="w-full h-14 bg-[#635bff] hover:bg-[#5a52ff] text-white flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Pay with Credit/Debit Card (Stripe)</span>
              </>
            )}
          </Button>

          {/* PayPal Option */}
          <Button
            onClick={onPayPalSelect}
            disabled={isLoading}
            className="w-full h-14 bg-[#0070ba] hover:bg-[#005ea6] text-white flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.421c-.315-.24-.681-.462-1.093-.67C18.085 5.43 16.777 5.32 15.3 5.32h-2.19c-.524 0-.968.382-1.05.9L10.94 12.76c-.082.518.24.96.764.96h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.291-1.867-.002-3.137-1.012-4.287z" />
                </svg>
                <span>Pay with PayPal</span>
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
