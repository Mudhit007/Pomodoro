"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Crown, Award, Lock, Sunrise, Flame, Brain, Clock, Sparkles } from "lucide-react"
import { Geist } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

// Zodiac constellation patterns (simplified)
const CONSTELLATIONS = [
  {
    name: "Aries",
    points: [
      [20, 30],
      [40, 20],
      [60, 35],
      [45, 50],
    ],
  },
  {
    name: "Leo",
    points: [
      [15, 25],
      [35, 15],
      [55, 25],
      [45, 40],
      [25, 45],
    ],
  },
  {
    name: "Libra",
    points: [
      [25, 20],
      [45, 25],
      [65, 20],
      [35, 40],
    ],
  },
  {
    name: "Aquarius",
    points: [
      [20, 15],
      [40, 25],
      [60, 15],
      [50, 35],
      [30, 45],
    ],
  },
]

interface Reward {
  id: string
  name: string
  icon: any
  unlocked: boolean
  requiredGems?: number
  description: string
}

const rewards: Reward[] = [
  {
    id: "early-riser",
    name: "Early Riser",
    icon: Sunrise,
    unlocked: true,
    description: "Complete 3 morning sessions",
  },
  {
    id: "focus-master",
    name: "Focus Master",
    icon: Brain,
    unlocked: true,
    description: "Complete 25 Pomodoros",
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    icon: Flame,
    unlocked: false,
    requiredGems: 10,
    description: "Maintain 7-day streak",
  },
  {
    id: "time-lord",
    name: "Time Lord",
    icon: Clock,
    unlocked: false,
    requiredGems: 15,
    description: "Complete 100 Pomodoros",
  },
  {
    id: "productivity-king",
    name: "Productivity King",
    icon: Crown,
    unlocked: false,
    requiredGems: 25,
    description: "Complete 10 sessions in one day",
  },
  {
    id: "champion",
    name: "Champion",
    icon: Trophy,
    unlocked: false,
    requiredGems: 50,
    description: "Reach 30-day streak",
  },
]

export default function FocusArena() {
  const [currentGems, setCurrentGems] = useState(0)
  const [completedPomodoros] = useState(4)
  const [totalPomodoros] = useState(6)

  // Load gems from localStorage
  useEffect(() => {
    const savedGems = localStorage.getItem("cosmic-pomodoro-gems")
    if (savedGems !== null) {
      setCurrentGems(Number.parseInt(savedGems, 10))
    }
  }, [])

  // Listen for gem updates
  useEffect(() => {
    const handleStorageChange = () => {
      const savedGems = localStorage.getItem("cosmic-pomodoro-gems")
      if (savedGems !== null) {
        setCurrentGems(Number.parseInt(savedGems, 10))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also check periodically for updates from the same tab
    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const progressPercentage = (completedPomodoros / totalPomodoros) * 100

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden ${geist.className}`}
    >
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

      {/* Floating Constellations */}
      {CONSTELLATIONS.map((constellation, index) => (
        <div
          key={constellation.name}
          className="absolute opacity-30 animate-pulse"
          style={{
            left: `${10 + index * 20}%`,
            top: `${15 + index * 15}%`,
            animationDelay: `${index * 2}s`,
            animationDuration: "6s",
          }}
        >
          <svg width="80" height="60" className="text-purple-300">
            {constellation.points.map((point, i) => (
              <circle key={i} cx={point[0]} cy={point[1]} r="1.5" fill="currentColor" className="animate-pulse" />
            ))}
            {constellation.points.map((point, i) => {
              if (i < constellation.points.length - 1) {
                const nextPoint = constellation.points[i + 1]
                return (
                  <line
                    key={`line-${i}`}
                    x1={point[0]}
                    y1={point[1]}
                    x2={nextPoint[0]}
                    y2={nextPoint[1]}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                )
              }
              return null
            })}
          </svg>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pt-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 blur-lg animate-pulse" />
              </div>
              <h1 className="text-2xl font-thin text-white tracking-wider">Focus Arena</h1>
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <span className="text-lg">💎</span>
              <span className="font-light text-white tracking-wide">{currentGems} Gems</span>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-light text-white mb-4 tracking-wide">Today's Focus Progress</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-purple-300 tracking-wide">
                    {completedPomodoros} of {totalPomodoros} Pomodoros Completed
                  </span>
                  <span className="text-sm font-medium text-white">{Math.round(progressPercentage)}%</span>
                </div>

                <Progress
                  value={progressPercentage}
                  className="h-3 bg-gray-700/50"
                  style={
                    {
                      "--progress-background": "linear-gradient(to right, #a855f7, #ec4899)",
                    } as React.CSSProperties
                  }
                />

                <div className="grid grid-cols-3 gap-2 text-xs text-purple-300/80 font-light tracking-wide">
                  <div className="text-center p-2 bg-black/20 rounded-lg">
                    <div className="text-white font-medium">25 min</div>
                    <div>5 gems</div>
                  </div>
                  <div className="text-center p-2 bg-black/20 rounded-lg">
                    <div className="text-white font-medium">15 min</div>
                    <div>3 gems</div>
                  </div>
                  <div className="text-center p-2 bg-black/20 rounded-lg">
                    <div className="text-white font-medium">5 min</div>
                    <div>1 gem</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-light text-white tracking-wider">Your Cosmic Rewards</h2>

            <div className="grid grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const IconComponent = reward.icon
                const isLocked = !reward.unlocked && (reward.requiredGems ? currentGems < reward.requiredGems : true)
                const canUnlock = !reward.unlocked && reward.requiredGems && currentGems >= reward.requiredGems

                return (
                  <Card
                    key={reward.id}
                    className={`border-0 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 ${
                      reward.unlocked
                        ? "bg-black/40 border border-purple-500/30 shadow-purple-500/10"
                        : canUnlock
                          ? "bg-black/40 border border-green-500/30 shadow-green-500/10"
                          : "bg-black/20 border border-gray-600/30 shadow-gray-500/5"
                    }`}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      {/* Icon */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                            reward.unlocked
                              ? "bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg shadow-purple-500/30"
                              : canUnlock
                                ? "bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-500/30"
                                : "bg-gray-600/50 border border-gray-500/30"
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-6 h-6 text-gray-400" />
                          ) : (
                            <IconComponent className="w-6 h-6 text-white" />
                          )}
                        </div>

                        {reward.unlocked && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-400/30">
                            <Award className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {canUnlock && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30 animate-pulse">
                            <span className="text-xs">!</span>
                          </div>
                        )}
                      </div>

                      {/* Reward Name */}
                      <h3
                        className={`font-light text-sm leading-tight tracking-wide ${
                          reward.unlocked
                            ? "text-white"
                            : canUnlock
                              ? "text-green-300"
                              : "text-gray-400"
                        }`}
                      >
                        {reward.name}
                      </h3>

                      {/* Status */}
                      <div className="space-y-1">
                        {reward.unlocked ? (
                          <>
                            <p className="text-xs text-green-400 font-light flex items-center justify-center gap-1">
                              <Award className="w-3 h-3" />
                              Unlocked
                            </p>
                            <p className="text-xs text-purple-300/80 leading-tight font-light">{reward.description}</p>
                          </>
                        ) : canUnlock ? (
                          <>
                            <p className="text-xs text-green-400 font-light animate-pulse">Ready to Unlock!</p>
                            <p className="text-xs text-green-300/80 leading-tight font-light">{reward.description}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-red-400 font-light">Requires {reward.requiredGems} Gems</p>
                            <p className="text-xs text-gray-500 leading-tight font-light">{reward.description}</p>
                          </>
                        \
