"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataEntryFormV2 } from "@/components/business-dashboard/data-entry-form-v2"
import { PlusCircle } from "lucide-react"

export function DataEntryModal({ onDataSubmit, user }: { onDataSubmit: (data: any) => void; user: any }) {
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    onDataSubmit({})
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Enter Business Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Data Entry</DialogTitle>
          <DialogDescription>Enter your business data to generate visualizations and insights.</DialogDescription>
        </DialogHeader>
        <DataEntryFormV2 user={user} onComplete={handleSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
