"use client"

import { Login } from "@/components/auth/login"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user

  if (!session) {
    return <Login />
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Settings
            </h1>
            <p className="text-text-secondary">
              Manage your account and app preferences
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-primary">Email</label>
                    <p className="text-text-secondary">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-primary">Name</label>
                    <p className="text-text-secondary">
                      {user?.name || user?.email?.split("@")[0]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  Preferences and customization options coming soon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}