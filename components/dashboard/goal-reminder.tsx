"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Check, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface GoalReminderProps {
  initialGoal: string
  userId: string
}

export function GoalReminder({ initialGoal, userId }: GoalReminderProps) {
  const [goal, setGoal] = useState(initialGoal || "")
  const [isEditing, setIsEditing] = useState(false)
  const [tempGoal, setTempGoal] = useState(goal)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSave = async () => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("profiles").update({ marketing_goal: tempGoal }).eq("id", userId)

      if (error) {
        console.error("Error updating goal:", error)
        return
      }

      setGoal(tempGoal)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving goal:", error)
    }
  }

  const toggleComplete = () => {
    setIsCompleted(!isCompleted)
  }

  if (!goal && !isEditing) {
    return (
      <Card className="bg-gradient-to-b from-m8bs-card to-m8bs-card-alt border border-m8bs-border rounded-xl shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-m8bs-blue" />
              <span className="text-gray-400">Set your business objective</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-m8bs-blue hover:text-m8bs-blue-light hover:bg-blue-900/20"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Set Objective
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`bg-gradient-to-b ${isCompleted ? "from-green-900/20 to-green-800/10" : "from-m8bs-card to-m8bs-card-alt"} border border-m8bs-border rounded-xl shadow-xl`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${isCompleted ? "bg-green-500/20" : "bg-m8bs-blue/20"}`}>
              {isCompleted ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Target className="h-4 w-4 text-m8bs-blue" />
              )}
            </div>
            {isEditing ? (
              <Input
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="bg-m8bs-bg border-m8bs-border text-white"
                placeholder="Enter your business objective"
              />
            ) : (
              <div className={`${isCompleted ? "line-through text-gray-400" : "text-white"}`}>{goal}</div>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-m8bs-blue hover:text-m8bs-blue-light hover:bg-blue-900/20"
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-800/20"
                  onClick={() => {
                    setTempGoal(goal)
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-m8bs-blue hover:text-m8bs-blue-light hover:bg-blue-900/20"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${isCompleted ? "text-green-500 hover:text-green-400" : "text-gray-400 hover:text-gray-300"} hover:bg-gray-800/20`}
                  onClick={toggleComplete}
                >
                  {isCompleted ? "Completed" : "Mark Complete"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
