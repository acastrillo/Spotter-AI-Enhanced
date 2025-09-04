"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { User, Settings, MessageCircle, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login")
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const profileOptions = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Edit your personal information",
      href: "/settings"
    },
    {
      icon: MessageCircle,
      title: "Support & Feedback",
      description: "Get help or share feedback",
      href: "#"
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "FAQs and guides",
      href: "#"
    },
    {
      icon: Settings,
      title: "App Settings",
      description: "Notifications and preferences",
      href: "/settings"
    }
  ]

  return (
    <>
      <main className="min-h-screen pb-20 md:pb-8 bg-background">
        <div className="container-padding py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Profile
            </h1>
            <p className="text-text-secondary">
              Manage your account and preferences
            </p>
          </div>

          {/* User Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {session?.user?.firstName || "User"}
                  </h2>
                  <p className="text-text-secondary">
                    {session?.user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Options */}
          <div className="space-y-4">
            {profileOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <Card key={index} className="hover:bg-surface/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-text-primary">
                          {option.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Sign Out */}
          <div className="mt-8">
            <Button 
              variant="outline" 
              className="w-full bg-surface border-border text-text-primary hover:bg-surface-elevated"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}