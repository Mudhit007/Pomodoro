"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Target, Flame, Zap, Crown, Star, Lock, ChevronDown, ChevronUp, Award, Timer } from "lucide-react"
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

interface Badge {
  id: string
  title: string
  description: string
  icon: any
  earned: boolean
  progress?: number
  maxProgress?: number
  gradient: string
}

const badges: Badge[] = [
  {
    id: "cosmic-initiate",
    title: "Cosmic Initiate",
    description: "Completed your first stellar focus session",
    icon: Sparkles,
    earned: true,
    gradient: "from-purple-400 to-pink-400",
  },
  {
    id: "constellation-keeper",
    title: "Constellation Keeper",
    description: "Maintained a 5-cycle cosmic streak",
    icon: Star,
    earned: true,
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    id: "deep-space-explorer",
    title: "Deep Space Explorer",
    description: "Completed 4 stellar focus sessions in one cosmic cycle",
    icon: Target,
    earned: true,
    gradient: "from-indigo-400 to-purple-400",
  },
  {
    id: "time-warrior",
    title: "Time Warrior",
    description: "Complete 10 stellar focus sessions in one cosmic cycle",
    icon: Zap,
    earned: false,
    progress: 6,
    maxProgress: 10,
    gradient: "from-orange-400 to-red-400",
  },
  {
    id: "consistency-champion",
    title: "Consistency Champion",
    description: "Maintain a 30-cycle cosmic streak",
    icon: Flame,
    earned: false,
    progress: 12,
    maxProgress: 30,
    gradient: "from-green-400 to-emerald-400",
  },
  {
    id: "productivity-legend",
    title: "Productivity Legend",
    description: "Complete 100 total stellar focus sessions",
    icon: Crown,
    earned: false,
    progress: 47,
    maxProgress: 100,
    gradient: "from-yellow-400 to-orange-400",
  },
]

export default function BadgesScreen() {
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [currentView, setCurrentView] = useState<"badges" | "timer">("badges")

  const earnedBadges = badges.filter((badge) => badge.earned)
  const lockedBadges = badges.filter((badge) => !badge.earned)
  const nextBadge = lockedBadges.reduce((closest, badge) => {
    if (!badge.progress || !badge.maxProgress) return closest
    if (!closest.progress || !closest.maxProgress) return badge
    const badgeProgress = badge.progress / badge.maxProgress
    const closestProgress = closest.progress / closest.maxProgress
    return badgeProgress > closestProgress ? badge : closest
  }, lockedBadges[0])

  if (currentView === "timer") {
    // This would normally import and render your timer component
    return <div>Timer Component Would Go Here</div>
  }

  return (
    <div className={`min-h-screen relative ${geist.className}`}>
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
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 blur-xl animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-thin text-white mb-2 tracking-wider">Cosmic Achievements</h1>
            <p className="text-purple-300 font-light tracking-wide">Your journey through the stellar dimensions</p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-light text-white mb-1">{earnedBadges.length}</div>
                <div className="text-sm text-purple-300">Earned Badges</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-light text-white mb-1">{lockedBadges.length}</div>
                <div className="text-sm text-purple-300">Remaining</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-light text-white mb-1">
                  {Math.round((earnedBadges.length / badges.length) * 100)}%
                </div>
                <div className="text-sm text-purple-300">Complete</div>
              </CardContent>
            </Card>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {badges.map((badge) => {
              const IconComponent = badge.icon
              return (
                <Card
                  key={badge.id}
                  className={`border-0 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 ${
                    badge.earned
                      ? "bg-black/40 border border-purple-500/30 shadow-purple-500/10"
                      : "bg-black/20 border border-gray-600/30 shadow-gray-500/5"
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      {badge.earned ? (
                        <div className="relative inline-block">
                          <div
                            className={`w-16 h-16 rounded-full bg-gradient-to-r ${badge.gradient} flex items-center justify-center shadow-lg drop-shadow-2xl`}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Award className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <div className="w-16 h-16 rounded-full bg-gray-600/50 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3
                      className={`text-lg font-medium mb-2 tracking-wide ${
                        badge.earned ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {badge.title}
                    </h3>
                    <p className={`text-sm mb-4 font-light ${badge.earned ? "text-purple-300" : "text-gray-500"}`}>
                      {badge.description}
                    </p>
                    {!badge.earned && badge.progress && badge.maxProgress && (
                      <div className="space-y-2">
                        <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-2" />
                        <div className="text-xs text-gray-400">
                          {badge.progress} / {badge.maxProgress}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Next Badge Progress */}
          {nextBadge && nextBadge.progress && nextBadge.maxProgress && (
            <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Timer className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-lg font-medium text-white tracking-wide">Next Achievement</h3>
                    <p className="text-purple-300 text-sm font-light">You're close to unlocking {nextBadge.title}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300">{nextBadge.title}</span>
                    <span className="text-white">
                      {nextBadge.progress} / {nextBadge.maxProgress}
                    </span>
                  </div>
                  <Progress value={(nextBadge.progress / nextBadge.maxProgress) * 100} className="h-3" />
                  <p className="text-xs text-purple-400 font-light">{nextBadge.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* View All Achievements Button */}
          <div className="text-center">
            <Button
              onClick={() => setShowAllAchievements(!showAllAchievements)}
              variant="outline"
              className="rounded-full border-purple-500/50 bg-black/40 backdrop-blur-md hover:bg-purple-500/20 text-purple-300 hover:text-white transition-all duration-300"
            >
              {showAllAchievements ? (
                <>
                  Hide Details <ChevronUp className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  View All Achievements <ChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {showAllAchievements && (
              <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10 mt-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-medium text-white mb-4 tracking-wide">Achievement Details</h3>
                  <div className="space-y-4 text-left">
                    {badges.map((badge) => {
                      const IconComponent = badge.icon
                      return (
                        <div key={badge.id} className="flex items-center gap-4 p-3 rounded-lg bg-black/20">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              badge.earned ? `bg-gradient-to-r ${badge.gradient}` : "bg-gray-600/50"
                            }`}
                          >
                            {badge.earned ? (
                              <IconComponent className="w-5 h-5 text-white" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${badge.earned ? "text-white" : "text-gray-400"}`}>
                                {badge.title}
                              </h4>
                              {badge.earned && <Award className="w-4 h-4 text-green-400" />}
                            </div>
                            <p className={`text-sm ${badge.earned ? "text-purple-300" : "text-gray-500"}`}>
                              {badge.description}
                            </p>
                            {!badge.earned && badge.progress && badge.maxProgress && (
                              <div className="mt-2">
                                <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-1" />
                                <div className="text-xs text-gray-400 mt-1">
                                  Progress: {badge.progress} / {badge.maxProgress}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
