"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Mail } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { updateUserEmail } from "@/lib/auth"

const formSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current Password Is Required" }),
  newEmail: z.string().email({ message: "Please Enter A Valid Email Address" }),
})

export function EmailChangeForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newEmail: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error("Unable To Get Current User Email")
      }

      // First, verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      })

      if (signInError) {
        throw new Error("Current Password Is Incorrect")
      }

      // Check if the new email is different from current email
      if (values.newEmail.toLowerCase() === user.email.toLowerCase()) {
        throw new Error("New Email Must Be Different From Current Email")
      }

      // Update email - Supabase will send a confirmation email to the new address
      const { error: updateError } = await supabase.auth.updateUser({
        email: values.newEmail,
      })

      if (updateError) {
        throw updateError
      }

      // Update the profiles table in the database
      const profileUpdateResult = await updateUserEmail(values.newEmail)
      if (!profileUpdateResult.success) {
        console.error("Failed to update profile email:", profileUpdateResult.error)
        // Don't throw error here - auth email was updated, just log the profile update failure
        // The user can still confirm their email and we can sync later if needed
      }

      toast({
        title: "Email Update Initiated",
        description: "A Confirmation Email Has Been Sent To Your New Email Address. Please Check Your Inbox And Click The Confirmation Link To Complete The Change.",
      })

      // Clear form after successful update
      form.reset()
    } catch (error) {
      console.error("Email update error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed To Update Email. Please Try Again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="newemail@example.com" {...field} />
              </FormControl>
              <FormDescription className="text-muted-foreground">
                A Confirmation Email Will Be Sent To This Address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Update Email
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

