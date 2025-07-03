"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Coffee, Brain, Clock } from "lucide-react"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface Session {
  mode: TimerMode
  completedAt: Date
}

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
}

const MODE_LABELS = {
  work: "Focus Time",
  shortBreak: "Short Break",
  longBreak: "Long Break",
}

const MODE_ICONS = {
  work: Brain,
  shortBreak: Coffee,
  longBreak: Clock,
}

export default function PomodoroTimer() {
  const [currentMode, setCurrentMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("pomodoro-sessions")
    if (savedSessions) {
      setSessions(
        JSON.parse(savedSessions).map((s: any) => ({
          ...s,
          completedAt: new Date(s.completedAt),
        })),
      )
    }
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("pomodoro-sessions", JSON.stringify(sessions))
  }, [sessions])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            // Add completed session
            setSessions((prev) => [
              ...prev,
              {
                mode: currentMode,
                completedAt: new Date(),
              },
            ])
            // Play notification sound (browser notification)
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`${MODE_LABELS[currentMode]} completed!`)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, currentMode])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const handleModeChange = (mode: TimerMode) => {
    setCurrentMode(mode)
    setTimeLeft(TIMER_DURATIONS[mode])
    setIsRunning(false)
  }

  const handleStartPause = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_DURATIONS[currentMode])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const total = TIMER_DURATIONS[currentMode]
    return ((total - timeLeft) / total) * 100
  }

  const getTodaySessions = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    })
  }

  const todaySessions = getTodaySessions()
  const workSessions = todaySessions.filter((s) => s.mode === "work").length
  const breakSessions = todaySessions.filter((s) => s.mode !== "work").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Timer Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Tabs value={currentMode} onValueChange={(value) => handleModeChange(value as TimerMode)}>
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 rounded-2xl p-1">
                <TabsTrigger
                  value="work"
                  className="rounded-xl data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 data-[state=active]:shadow-sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Work
                </TabsTrigger>
                <TabsTrigger
                  value="shortBreak"
                  className="rounded-xl data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Short
                </TabsTrigger>
                <TabsTrigger
                  value="longBreak"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Long
                </TabsTrigger>
              </TabsList>

              <TabsContent value={currentMode} className="space-y-6">
                {/* Timer Display */}
                <div className="text-center space-y-4">
                  <h2 className="text-lg font-medium text-gray-600">{MODE_LABELS[currentMode]}</h2>

                  <div className="relative">
                    <div className="text-6xl font-light text-gray-800 font-mono tracking-wider">
                      {formatTime(timeLeft)}
                    </div>
                    <Progress
                      value={getProgress()}
                      className="mt-4 h-2 bg-gray-100"
                      style={
                        {
                          "--progress-background":
                            currentMode === "work"
                              ? "rgb(244 63 94)"
                              : currentMode === "shortBreak"
                                ? "rgb(34 197 94)"
                                : "rgb(59 130 246)",
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleStartPause}
                    size="lg"
                    className={`rounded-2xl px-8 py-3 font-medium transition-all duration-200 ${
                      currentMode === "work"
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl"
                        : currentMode === "shortBreak"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl"
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="rounded-2xl px-6 py-3 border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Daily Session Tracker */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Today's Progress</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-rose-50 rounded-2xl">
                <div className="text-2xl font-bold text-rose-600 mb-1">{workSessions}</div>
                <div className="text-sm text-rose-600/80 font-medium">Focus Sessions</div>
              </div>

              <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                <div className="text-2xl font-bold text-emerald-600 mb-1">{breakSessions}</div>
                <div className="text-sm text-emerald-600/80 font-medium">Break Sessions</div>
              </div>
            </div>

            {todaySessions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 text-center mb-2">Recent Sessions</div>
                <div className="flex justify-center gap-1 flex-wrap">
                  {todaySessions.slice(-10).map((session, index) => {
                    const Icon = MODE_ICONS[session.mode]
                    return (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          session.mode === "work"
                            ? "bg-rose-100 text-rose-600"
                            : session.mode === "shortBreak"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                        title={`${MODE_LABELS[session.mode]} completed at ${session.completedAt.toLocaleTimeString()}`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
