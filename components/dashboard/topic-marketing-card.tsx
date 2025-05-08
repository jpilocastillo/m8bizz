"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Megaphone } from "lucide-react"
import { motion } from "framer-motion"

interface TopicMarketingCardProps {
  topic: string
}

export function TopicMarketingCard({ topic }: TopicMarketingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-[#334155] rounded-lg overflow-hidden shadow-lg h-full">
        <CardHeader className="bg-[#1e293b]/80 border-b border-[#334155] px-4 py-3">
          <h3 className="text-lg font-extrabold text-white flex items-center tracking-tight">
            <Megaphone className="mr-2 h-5 w-5 text-blue-400" />
            Topic of Marketing
          </h3>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center h-[calc(100%-60px)]">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
            <div className="relative bg-gradient-to-br from-blue-500/30 to-blue-600/30 p-5 rounded-full backdrop-blur-sm border border-blue-400/20">
              <Megaphone className="h-12 w-12 text-blue-300" />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-lg opacity-30"></div>
            <div className="relative bg-[#1e293b]/80 backdrop-blur-sm border border-blue-500/20 rounded-lg px-6 py-4">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{topic}</h2>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
