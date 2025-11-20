"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useCampaign } from "@/contexts/CampaignContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import {
  GiExitDoor,
  GiDragonHead,
  GiScrollUnfurled,
  GiCrossedSwords
} from "react-icons/gi"
import { FaSkull, FaMoon } from "react-icons/fa"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Navbar() {
  const { user, logout } = useAuth()
  const { currentCampaign } = useCampaign()
  const { visualTheme, toggleTheme, isHalloween } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...')
      await logout()
      console.log('Logout concluído, redirecionando...')
      router.push("/")
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  // Gerar breadcrumbs baseado no pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    breadcrumbs.push({
      label: "Início",
      href: "/dashboard",
      icon: GiScrollUnfurled,
    })

    if (paths.includes("dashboard")) {
      // Já está em dashboard
    }

    if (paths.includes("characters")) {
      breadcrumbs.push({
        label: "Personagens",
        href: "/characters",
        icon: GiCrossedSwords,
      })
    }

    if (currentCampaign) {
      breadcrumbs.push({
        label: currentCampaign.title || "Campanha",
        href: `/campaigns/${currentCampaign.id}`,
        icon: GiScrollUnfurled,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Breadcrumbs */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <GiDragonHead className="h-6 w-6 text-primary" />
              <span className="font-medieval text-lg text-primary hidden sm:inline text-glow-gold">
                Dungeons e Drogas
              </span>
            </Link>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
              <div className="hidden md:block ml-4 pl-4 border-l">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => {
                      const Icon = crumb.icon
                      const isLast = index === breadcrumbs.length - 1

                      return (
                        <React.Fragment key={crumb.href}>
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage className="flex items-center gap-1.5 text-primary font-medium">
                                <Icon className="h-4 w-4" />
                                {crumb.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={crumb.href}
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                {crumb.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && (
                            <BreadcrumbSeparator className="text-muted-foreground" />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}
          </div>

          {/* User Info e Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <GiDragonHead className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>

              {/* Toggle Tema Halloween */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`hover:bg-primary/10 hover:text-primary transition-all ${
                  isHalloween ? 'text-horror-purple animate-horror-pulse' : 'text-primary'
                }`}
                title={isHalloween ? 'Desativar Tema Halloween' : 'Ativar Tema Halloween'}
              >
                {isHalloween ? (
                  <FaSkull className="h-4 w-4" />
                ) : (
                  <GiDragonHead className="h-4 w-4" />
                )}
                <span className="hidden md:inline ml-2">
                  {isHalloween ? 'Halloween' : 'Tema'}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <GiExitDoor className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
