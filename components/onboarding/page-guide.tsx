"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronDown, ChevronUp, BookOpen, X, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth-provider"
import { pageGuideStorageKey, resolvePageGuide } from "@/lib/page-guides"
import { isBrandNewUser } from "@/lib/onboarding-eligibility"
import { getTourIdForPath, hasTourForPath } from "@/lib/tour-steps"
import { isTourComplete, startPageTour } from "@/components/onboarding/start-page-tour"

/** Page instructions + spotlight tour only for brand-new accounts (see onboarding-eligibility). */
export function PageGuide() {
  const pathname = usePathname() || "/"
  const { user, isLoading } = useAuth()
  const guide = useMemo(() => resolvePageGuide(pathname), [pathname])
  const storageKey = pageGuideStorageKey(pathname, user?.id)

  const [open, setOpen] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  const showTour = hasTourForPath(pathname)
  const activeTourId = getTourIdForPath(pathname)
  const tourDone = activeTourId ? isTourComplete(activeTourId) : true
  const showTourOffer = Boolean(user && showTour && !tourDone)

  useEffect(() => {
    setHydrated(true)
    try {
      if (localStorage.getItem(storageKey) === "1") {
        setOpen(false)
      }
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const dismiss = () => {
    setOpen(false)
    try {
      localStorage.setItem(storageKey, "1")
    } catch {
      /* ignore */
    }
  }

  const onTourClick = () => {
    startPageTour(pathname, user ?? null)
  }

  if (!hydrated || isLoading) return null

  if (!user || !isBrandNewUser(user)) return null

  return (
    <div data-tour="tour-page-guide">
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="mb-4 border-m8bs-border bg-gradient-to-br from-m8bs-card to-m8bs-card-alt shadow-md">
        <CardHeader className="py-3 px-4 pb-2 space-y-0">
          <div className="flex items-start gap-2">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left rounded-md hover:bg-m8bs-card-alt/50 -m-1 p-1 transition-colors"
              >
                <BookOpen className="h-5 w-5 shrink-0 text-m8bs-blue" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-white text-sm sm:text-base">{guide.title}</span>
                  <span className="sr-only">—how to use this page</span>
                </div>
                {open ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-m8bs-muted" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-m8bs-muted" />
                )}
              </button>
            </CollapsibleTrigger>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 text-m8bs-muted hover:text-white"
              title="Hide this panel on this page"
              onClick={(e) => {
                e.stopPropagation()
                dismiss()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4 space-y-3">
            {showTourOffer && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-m8bs-blue/40 bg-m8bs-blue/10 px-3 py-2">
                <Sparkles className="h-4 w-4 text-m8bs-blue shrink-0" />
                <p className="text-sm text-m8bs-muted flex-1 min-w-[12rem]">
                  Take the quick guided tour for this screen (your first week only).
                </p>
                <Button size="sm" className="bg-m8bs-blue hover:bg-m8bs-blue-dark" type="button" onClick={onTourClick}>
                  Start tour
                </Button>
              </div>
            )}
            <p className="text-sm text-m8bs-muted leading-relaxed">{guide.summary}</p>
            {guide.steps && guide.steps.length > 0 && (
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-white/90">
                {guide.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
            {guide.links && guide.links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {guide.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button variant="secondary" size="sm" className="bg-m8bs-card-alt border border-m8bs-border">
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
