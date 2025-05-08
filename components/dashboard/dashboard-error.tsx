"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface DashboardErrorProps {
  error: string
}

export function DashboardError({ error }: DashboardErrorProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-gradient-to-b from-m8bs-card to-m8bs-card-alt border border-red-500/50 rounded-xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 backdrop-blur-sm"></div>
        <CardContent className="relative flex flex-col items-center justify-center p-8 z-10">
          <div className="bg-red-500/20 p-5 rounded-full mb-5 shadow-lg shadow-red-500/20">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-3 text-white">Dashboard Error</h3>
            <p className="text-m8bs-muted text-lg max-w-md">{error}</p>
          </div>
          <Button
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
