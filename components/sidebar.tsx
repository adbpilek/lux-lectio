"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Clock, BookOpen, User, Info, Settings, Heart, Menu, X, Calendar, Cross, Sun, Moon, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { CalendarWidget } from "./calendar-widget"
import { Button } from "@/components/ui/button"
import { useLiturgical } from "@/components/liturgical-provider"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"


// Navigation items (à adapter selon vos routes réelles)
const navigation = [
  { name: "Messes", href: "/", icon: BookOpen },
  { name: "Offices des heures", href: "/offices", icon: Clock },
  { name: "Bible", href: "/bible", icon: Book },
  { name: "Saints", href: "/saints", icon: User },
  { name: "À propos", href: "/about", icon: Info },
  { name: "Paramètres", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: Heart },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const pathname = usePathname()
  const { setCurrentDate, refreshData, liturgicalData, liturgicalColor, currentDate, loading } = useLiturgical()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatLiturgicalDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
  
  const changeDate = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }



  const getLiturgicalColorName = (color: string) => {
    const colorNames: Record<string, string> = {
      vert: "Temps ordinaire",
      violet: "Avent / Carême",
      rouge: "Martyrs / Pentecôte",
      blanc: "Fêtes du Seigneur",
      rose: "Joie tempérée",
      noir: "Deuil",
    }
    return colorNames[color] || "Temps ordinaire"
  }

  const getLogoColor = (color: string) => {
    switch (color) {
      case "vert": return "text-green-500"
      case "violet": return "text-purple-500"
      case "rouge": return "text-red-500"
      case "blanc": return "text-sky-500"
      case "rose": return "text-pink-500"
      case "noir": return "text-gray-500"
      default: return "text-green-500"
    }
  }

  return (
    <>
      {/* Bouton menu mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-sky-100/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg hover-lift"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Ouvrir le menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar unifiée */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col bg-sky-100/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-liturgical-primary/20 shadow-2xl p-0">
          {/* Tout dans une seule box principale scrollable */}
          <div className="flex flex-col h-full p-0 overflow-y-auto">
            {/* En-tête animé : logo et nom côte à côte, animation, sous-titre */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600" />
              <div className="relative p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 animate-float">
                    <Cross className={`h-10 w-10 mr-3 drop-shadow-lg ${getLogoColor(liturgicalColor)}`} />
                    <h1 className={`text-2xl font-bold drop-shadow-lg ${getLogoColor(liturgicalColor)}`}>Lux Lectio</h1>
                  </div>
                  <p className="text-sm opacity-90 drop-shadow text-gray-600 dark:text-gray-300">Compagnon liturgique</p>
                  <div className="mt-3 flex items-center justify-center space-x-2">
                    {[0, 0.2, 0.4].map((delay) => (
                      <div
                        key={delay}
                        className={`w-2 h-2 rounded-full animate-pulse ${getLogoColor(liturgicalColor).replace("text-", "bg-")}`}
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Box d'information AVANT la navigation (unique, aucune après) */}
            <div className="px-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={() => changeDate(-1)} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={() => setShowCalendar((v) => !v)} className="px-3 py-1 h-8 text-xs"><Calendar className="h-3 w-3 mr-2" />{currentDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</Button>
                <Button variant="outline" size="sm" onClick={() => changeDate(1)} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={refreshData} className="h-6 w-6 ml-2"><RefreshCw className="h-3 w-3" /></Button>
                {mounted && (
                  <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-6 w-6 ml-1"><Sun className="h-3 w-3" style={{ display: theme === "dark" ? "none" : undefined }} /><Moon className="h-3 w-3" style={{ display: theme === "dark" ? undefined : "none" }} /></Button>
                )}
              </div>
              {showCalendar && (
                <div className="mb-2 animate-scale-in">
                  <CalendarWidget onDateSelected={(date) => { setCurrentDate(date); setShowCalendar(false); }} />
                </div>
              )}
              {liturgicalData && (
                <div className="text-xs rounded-lg p-3 border border-sky-200 dark:border-slate-700 mb-2 bg-transparent dark:bg-transparent">
                  <div className="mb-1 text-liturgical-primary font-semibold flex flex-wrap items-center gap-2">
                    {liturgicalData.informations.jour_liturgique_nom?.replace(/\bde la férie\s+de la férie\b/gi, 'de la férie') || 'Jour ordinaire'}
                    {liturgicalData.informations.temps_liturgique && (
                      <span className="italic text-gray-600 dark:text-gray-400">- Temps {liturgicalData.informations.temps_liturgique}</span>
                    )}
                    {loading && (
                      <span className="ml-2 animate-spin inline-block align-middle">
                        <svg className="h-4 w-4 text-liturgical-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      </span>
                    )}
                  </div>
                  {liturgicalData.informations.fete && <div className="text-amber-700 dark:text-amber-200 mb-1">✨ {liturgicalData.informations.fete.replace(/\bde la férie\s+de la férie\b/gi, 'de la férie')}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-3 h-3 rounded-full shadow-lg", liturgicalColor === "vert" && "bg-green-500", liturgicalColor === "violet" && "bg-purple-500", liturgicalColor === "rouge" && "bg-red-500", liturgicalColor === "blanc" && "bg-sky-500", liturgicalColor === "rose" && "bg-pink-500", liturgicalColor === "noir" && "bg-gray-500")}></div>
                    <span className="capitalize text-liturgical-text">{getLiturgicalColorName(liturgicalColor)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation principale */}
            <nav className="flex-0 px-4 space-y-1 mb-4">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover-lift group",
                      isActive
                        ? "bg-liturgical-primary text-white shadow-lg animate-pulse-glow"
                        : "text-gray-700 dark:text-gray-300 hover:bg-liturgical-primary/10 hover:text-liturgical-primary",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className={cn("h-5 w-5 mr-3 transition-transform duration-300", "group-hover:scale-110")} />
                    {item.name}
                    {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                  </Link>
                )
              })}
            </nav>

            {/* (Supprimé) Box d'information liturgique après la navigation */}

            {/* Footer auteur supprimé */}
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden animate-scale-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
