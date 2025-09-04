
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User,
  Bell,
  Shield,
  Smartphone,
  Download,
  Trash2,
  HelpCircle,
  LogOut,
  ChevronRight
} from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const settingSections = [
    {
      title: "Account",
      items: [
        { label: "Profile Information", icon: User, description: "Update your personal details" },
        { label: "Password & Security", icon: Shield, description: "Change password and security settings" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { label: "Notifications", icon: Bell, description: "Manage workout reminders and updates" },
        { label: "App Settings", icon: Smartphone, description: "Customize your app experience" },
      ]
    },
    {
      title: "Data",
      items: [
        { label: "Export Data", icon: Download, description: "Download your workout data" },
        { label: "Delete Account", icon: Trash2, description: "Permanently remove your account", destructive: true },
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Help & FAQ", icon: HelpCircle, description: "Get help and find answers" },
      ]
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-8">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
              <p className="text-text-secondary">
                Manage your account and app preferences
              </p>
            </div>

            {/* Profile Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">First Name</label>
                    <Input 
                      defaultValue={session?.user?.firstName || ""} 
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Last Name</label>
                    <Input 
                      defaultValue={session?.user?.lastName || ""} 
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Email</label>
                  <Input 
                    defaultValue={session?.user?.email || ""} 
                    type="email"
                    disabled
                  />
                  <p className="text-xs text-text-secondary">
                    Contact support to change your email address
                  </p>
                </div>
                <Button disabled>
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Settings Sections */}
            {settingSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={itemIndex}
                        className={`
                          w-full flex items-center justify-between p-4 hover:bg-surface transition-colors text-left
                          ${itemIndex !== section.items.length - 1 ? 'border-b border-border' : ''}
                          ${item.destructive ? 'hover:bg-destructive/10' : ''}
                        `}
                        disabled
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-5 w-5 ${item.destructive ? 'text-destructive' : 'text-text-secondary'}`} />
                          <div>
                            <p className={`font-medium ${item.destructive ? 'text-destructive' : 'text-text-primary'}`}>
                              {item.label}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-text-secondary" />
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            ))}

            {/* App Info */}
            <Card className="bg-surface/50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-text-primary mb-2">Spotter</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Version 1.0.0 (Beta)
                </p>
                <p className="text-xs text-text-secondary">
                  Made with ❤️ for fitness enthusiasts
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
