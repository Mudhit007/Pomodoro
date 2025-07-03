"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Geist } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export default function CosmicSplashScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 60)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen flex items-center justify-center relative ${geist.className}`}>
      {/* Floating cosmic elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-300 opacity-60" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10 px-8">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 blur-xl animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-thin text-white mb-4 tracking-wider">Cosmic Focus</h1>

        {/* Subtitle */}
        <p className="text-purple-300 text-lg font-light mb-12 tracking-wide">
          Journey through deep focus in the cosmos
        </p>

        {/* Progress bar */}
        <div className="w-80 max-w-full mx-auto">
          <div className="h-1 bg-purple-900/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300 ease-out shadow-lg shadow-purple-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-purple-300 text-sm mt-4 font-light tracking-wider">
            Initializing cosmic environment... {progress}%
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
