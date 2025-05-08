"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ThemeSwitcherProps {
  onThemeChange?: (theme: string) => void
}

export function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState("dark-blue")

  const themes = [
    { id: "dark-blue", name: "Dark Blue", color: "#05071F" },
    { id: "dark-purple", name: "Dark Purple", color: "#1A0B2E" },
    { id: "dark-green", name: "Dark Green", color: "#0B2E1A" },
    { id: "dark-red", name: "Dark Red", color: "#2E0B0B" },
    { id: "dark-cyan", name: "Dark Cyan", color: "#0B2E2E" },
  ]

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId)
    if (onThemeChange) {
      onThemeChange(themeId)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 bg-m8bs-blue/20 text-white hover:bg-m8bs-blue/30"
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">Theme switcher</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-m8bs-card border-m8bs-border text-white">
        <div className="px-4 py-3 border-b border-m8bs-border">
          <p className="text-sm font-medium">Dashboard Theme</p>
        </div>
        <div className="p-2 grid grid-cols-5 gap-2">
          {themes.map((theme) => (
            <motion.button
              key={theme.id}
              className="w-full aspect-square rounded-full relative"
              style={{ backgroundColor: theme.color }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeChange(theme.id)}
            >
              {currentTheme === theme.id && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        <div className="border-t border-m8bs-border p-2">
          <div className="flex justify-between">
            <DropdownMenuItem className="hover:bg-m8bs-card-alt cursor-pointer font-medium flex-1 justify-center">
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-m8bs-card-alt cursor-pointer font-medium flex-1 justify-center">
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
