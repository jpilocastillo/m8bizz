"use client"

import { GrowthPlannerTool } from "@/components/growth-planner-tool"
import { useEffect } from "react"

export default function BucketPlanPage() {
  useEffect(() => {
    // Remove gradient from main element and set solid dark blue background
    const removeGradient = () => {
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.classList.remove('bg-gradient-radial', 'from-m8bs-card-alt/10', 'to-m8bs-bg')
        mainElement.classList.add('bg-m8bs-bg')
        mainElement.style.setProperty('background', '#05071F', 'important')
        mainElement.style.setProperty('background-image', 'none', 'important')
      }
    }

    // Inject global style to ensure solid dark blue background
    const styleId = 'bucket-plan-no-gradient'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = 'main { background: #05071F !important; background-image: none !important; background-color: #05071F !important; }'
      document.head.appendChild(style)
    }

    // Remove gradient after render
    setTimeout(removeGradient, 0)
    requestAnimationFrame(removeGradient)
  }, [])

  return (
    <div className="bg-m8bs-bg min-h-full">
      <GrowthPlannerTool />
    </div>
  )
}
