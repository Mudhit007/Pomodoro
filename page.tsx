"use client"

import { useState, useEffect } from "react"
import CosmicSplashScreen from "../cosmic-splash-screen"
import CosmicPomodoroTimer from "../cosmic-pomodoro-timer"
import FocusArena from "../focus-arena"
import { Button } from "@/components/ui/button"
import { Timer, Sparkles } from "lucide-react"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [currentScreen, setCurrentScreen] = useState<"timer" | "focusArena">("timer")

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000) // Show splash for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Aurora effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 animate-pulse" />
          <div
            className="absolute inset-0 bg-gradient-to-l from-pink-400/20 via-purple-500/20 to-indigo-600/20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Nebula overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl animate-pulse" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <CosmicSplashScreen />
        </div>
      </div>
    )
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "focusArena":
        return <FocusArena />
      default:
        return <CosmicPomodoroTimer />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Aurora effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 animate-pulse" />
        <div
          className="absolute inset-0 bg-gradient-to-l from-pink-400/20 via-purple-500/20 to-indigo-600/20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Nebula overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pb-20">{renderCurrentScreen()}</div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-black/60 backdrop-blur-md border-t border-purple-500/30 px-4 py-2">
          <div className="flex justify-center items-center max-w-md mx-auto gap-8">
            {/* Timer Tab */}
            <Button
              onClick={() => setCurrentScreen("timer")}
              variant="ghost"
              className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all duration-300 ${
                currentScreen === "timer"
                  ? "bg-purple-500/30 text-white shadow-lg shadow-purple-500/20"
                  : "text-purple-300 hover:text-white hover:bg-purple-500/20"
              }`}
            >
              <Timer className="w-5 h-5" />
              <span className="text-xs font-light tracking-wide">Timer</span>
            </Button>

            {/* Focus Arena Tab */}
            <Button
              onClick={() => setCurrentScreen("focusArena")}
              variant="ghost"
              className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all duration-300 ${
                currentScreen === "focusArena"
                  ? "bg-purple-500/30 text-white shadow-lg shadow-purple-500/20"
                  : "text-purple-300 hover:text-white hover:bg-purple-500/20"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-light tracking-wide">Arena</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
