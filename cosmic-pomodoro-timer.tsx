"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Star, Moon, Sun, Volume2, VolumeX } from "lucide-react"
import { Geist } from "next/font/google"

const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

type TimerMode = "work" | "shortBreak" | "longBreak"

interface Session {
  mode: TimerMode
  completedAt: Date
  duration: number
  gemsEarned: number
}

interface GemToast {
  id: string
  gems: number
  show: boolean
}

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
}

const MODE_LABELS = {
  work: "Deep Focus",
  shortBreak: "Cosmic Rest",
  longBreak: "Stellar Recharge",
}

const MODE_COLORS = {
  work: "from-purple-400 to-pink-400",
  shortBreak: "from-blue-400 to-cyan-400",
  longBreak: "from-indigo-400 to-purple-400",
}

// Gem earning logic based on session duration
const calculateGemsEarned = (durationInSeconds: number): number => {
  const durationInMinutes = durationInSeconds / 60

  // Only award gems for exact durations (fully completed sessions)
  if (durationInMinutes === 5) return 1 // Short break
  if (durationInMinutes === 15) return 3 // Long break
  if (durationInMinutes === 25) return 5 // Work session

  // Future extensibility - can add more durations here
  // if (durationInMinutes === 45) return 10  // Extended focus session

  return 0 // No gems for partial or non-standard durations
}

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

export default function CosmicPomodoroTimer() {
  const [currentMode, setCurrentMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [totalGems, setTotalGems] = useState(0)
  const [gemToast, setGemToast] = useState<GemToast | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const completionAudioRef = useRef<HTMLAudioElement | null>(null)
  const currentMusicRef = useRef<any>(null)

  // Lo-Fi Beat Generator for Work Sessions
  const createLoFiBeats = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Main gain node for overall volume control
    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0.15, audioContext.currentTime)
    masterGain.connect(audioContext.destination)

    // Lo-fi filter for warm sound
    const lofiFilter = audioContext.createBiquadFilter()
    lofiFilter.type = "lowpass"
    lofiFilter.frequency.setValueAtTime(3500, audioContext.currentTime)
    lofiFilter.Q.setValueAtTime(1.5, audioContext.currentTime)
    lofiFilter.connect(masterGain)

    // Reverb for ambient space
    const convolver = audioContext.createConvolver()
    const impulseLength = audioContext.sampleRate * 2
    const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate)
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2)
      }
    }
    convolver.buffer = impulse
    convolver.connect(lofiFilter)

    // Dry/wet mix for reverb
    const dryGain = audioContext.createGain()
    const wetGain = audioContext.createGain()
    dryGain.gain.setValueAtTime(0.7, audioContext.currentTime)
    wetGain.gain.setValueAtTime(0.3, audioContext.currentTime)
    dryGain.connect(lofiFilter)
    wetGain.connect(convolver)

    // Chord progressions for lo-fi
    const chordProgressions = [
      // Cmaj7 - Am7 - Fmaj7 - G7
      [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 415.3], // Am7
        [174.61, 220.0, 261.63, 349.23], // Fmaj7
        [196.0, 246.94, 293.66, 369.99], // G7
      ],
      // Am7 - Dm7 - G7 - Cmaj7
      [
        [220.0, 261.63, 329.63, 415.3], // Am7
        [146.83, 174.61, 220.0, 293.66], // Dm7
        [196.0, 246.94, 293.66, 369.99], // G7
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
      ],
    ]

    let currentProgression = 0
    let currentChord = 0
    let beatCount = 0

    // Create drum pattern
    const createKick = (time: number) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()

      osc.frequency.setValueAtTime(60, time)
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.1)
      osc.type = "sine"

      filter.type = "lowpass"
      filter.frequency.setValueAtTime(100, time)

      gain.gain.setValueAtTime(0.8, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(dryGain)

      osc.start(time)
      osc.stop(time + 0.3)
    }

    const createSnare = (time: number) => {
      const noise = audioContext.createBufferSource()
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1
      }
      noise.buffer = buffer

      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()

      filter.type = "highpass"
      filter.frequency.setValueAtTime(1000, time)

      gain.gain.setValueAtTime(0.3, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(dryGain)

      noise.start(time)
    }

    const createHiHat = (time: number) => {
      const noise = audioContext.createBufferSource()
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.05, audioContext.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1
      }
      noise.buffer = buffer

      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()

      filter.type = "highpass"
      filter.frequency.setValueAtTime(8000, time)

      gain.gain.setValueAtTime(0.1, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(dryGain)

      noise.start(time)
    }

    // Create chord
    const playChord = (frequencies: number[], startTime: number, duration: number) => {
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator()
        const gain = audioContext.createGain()

        // Slightly detune for lo-fi effect
        const detune = (Math.random() - 0.5) * 10
        osc.frequency.setValueAtTime(freq + detune, startTime)
        osc.type = "sine"

        // Soft attack and release
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.03 / frequencies.length, startTime + 0.1)
        gain.gain.setValueAtTime(0.03 / frequencies.length, startTime + duration - 0.2)
        gain.gain.linearRampToValueAtTime(0, startTime + duration)

        osc.connect(gain)
        gain.connect(dryGain)
        gain.connect(wetGain)

        osc.start(startTime)
        osc.stop(startTime + duration)
      })
    }

    // Create bass line
    const playBass = (frequency: number, startTime: number) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()

      osc.frequency.setValueAtTime(frequency / 4, startTime) // Bass octave
      osc.type = "triangle"

      filter.type = "lowpass"
      filter.frequency.setValueAtTime(200, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
      gain.gain.setValueAtTime(0.15, startTime + 0.4)
      gain.gain.linearRampToValueAtTime(0, startTime + 0.5)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(dryGain)

      osc.start(startTime)
      osc.stop(startTime + 0.5)
    }

    // Main loop
    const scheduleNextBeat = () => {
      const currentTime = audioContext.currentTime
      const beatDuration = 0.5 // 120 BPM
      const nextBeatTime = currentTime + beatDuration

      // Drum pattern (kick on 1 and 3, snare on 2 and 4)
      if (beatCount % 4 === 0 || beatCount % 4 === 2) {
        createKick(nextBeatTime)
      }
      if (beatCount % 4 === 1 || beatCount % 4 === 3) {
        createSnare(nextBeatTime)
      }

      // Hi-hats on off-beats
      if (beatCount % 2 === 1) {
        createHiHat(nextBeatTime)
        createHiHat(nextBeatTime + 0.25)
      }

      // Play chord every 4 beats
      if (beatCount % 4 === 0) {
        const progression = chordProgressions[currentProgression]
        const chord = progression[currentChord]

        playChord(chord, nextBeatTime, 2.0)
        playBass(chord[0], nextBeatTime)

        currentChord = (currentChord + 1) % progression.length
        if (currentChord === 0) {
          currentProgression = (currentProgression + 1) % chordProgressions.length
        }
      }

      beatCount++
    }

    // Start the loop
    const interval = setInterval(scheduleNextBeat, 500) // 120 BPM

    return {
      start: () => {
        // Already started with setInterval
      },
      stop: () => {
        clearInterval(interval)
        // Stop all scheduled sounds by disconnecting the master gain
        masterGain.disconnect()
      },
    }
  }

  // Ocean Waves for Short Break
  const createOceanWaves = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Main gain node
    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0.12, audioContext.currentTime)
    masterGain.connect(audioContext.destination)

    // Create filtered noise for wave sounds
    const createWave = (startTime: number, duration: number, intensity: number) => {
      const noise = audioContext.createBufferSource()
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
      const data = buffer.getChannelData(0)

      // Generate pink noise for more natural wave sound
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.969 * b2 + white * 0.153852
        b3 = 0.8665 * b3 + white * 0.3104856
        b4 = 0.55 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.016898
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        b6 = white * 0.115926
        data[i] = pink * 0.11 * intensity
      }
      noise.buffer = buffer

      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()

      // Low-pass filter for muffled wave sound
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(800, startTime)
      filter.Q.setValueAtTime(0.5, startTime)

      // Wave envelope
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(intensity, startTime + duration * 0.3)
      gain.gain.setValueAtTime(intensity * 0.8, startTime + duration * 0.7)
      gain.gain.linearRampToValueAtTime(0, startTime + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(masterGain)

      noise.start(startTime)
    }

    let waveCount = 0
    const scheduleNextWave = () => {
      const currentTime = audioContext.currentTime
      const waveInterval = 2 + Math.random() * 3 // 2-5 seconds between waves
      const nextWaveTime = currentTime + waveInterval
      const waveDuration = 1.5 + Math.random() * 2 // 1.5-3.5 second waves
      const intensity = 0.3 + Math.random() * 0.4 // Varying intensity

      createWave(nextWaveTime, waveDuration, intensity)
      waveCount++
    }

    const interval = setInterval(scheduleNextWave, 2000) // Check every 2 seconds

    return {
      start: () => {
        // Already started with setInterval
      },
      stop: () => {
        clearInterval(interval)
        masterGain.disconnect()
      },
    }
  }

  // Cosmic Ambient for Long Break
  const createCosmicAmbient = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Main gain node
    const masterGain = audioContext.createGain()
    masterGain.gain.setValueAtTime(0.08, audioContext.currentTime)
    masterGain.connect(audioContext.destination)

    // Deep reverb for space-like effect
    const convolver = audioContext.createConvolver()
    const impulseLength = audioContext.sampleRate * 4
    const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate)
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 3)
      }
    }
    convolver.buffer = impulse
    convolver.connect(masterGain)

    // Create ethereal pad sounds
    const createPad = (frequency: number, startTime: number, duration: number) => {
      const osc1 = audioContext.createOscillator()
      const osc2 = audioContext.createOscillator()
      const osc3 = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()

      // Slightly detuned oscillators for richness
      osc1.frequency.setValueAtTime(frequency, startTime)
      osc2.frequency.setValueAtTime(frequency * 1.005, startTime)
      osc3.frequency.setValueAtTime(frequency * 0.995, startTime)

      osc1.type = "sine"
      osc2.type = "triangle"
      osc3.type = "sine"

      // Low-pass filter for warmth
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(1200, startTime)
      filter.Q.setValueAtTime(0.8, startTime)

      // Very slow attack and release
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.02, startTime + duration * 0.4)
      gain.gain.setValueAtTime(0.02, startTime + duration * 0.6)
      gain.gain.linearRampToValueAtTime(0, startTime + duration)

      osc1.connect(filter)
      osc2.connect(filter)
      osc3.connect(filter)
      filter.connect(gain)
      gain.connect(convolver)

      osc1.start(startTime)
      osc2.start(startTime)
      osc3.start(startTime)
      osc1.stop(startTime + duration)
      osc2.stop(startTime + duration)
      osc3.stop(startTime + duration)
    }

    // Cosmic chord progression (very slow and ethereal)
    const cosmicChords = [
      [130.81, 164.81, 196.0], // C3 - E3 - G3
      [146.83, 174.61, 220.0], // D3 - F3 - A3
      [164.81, 196.0, 246.94], // E3 - G3 - B3
      [174.61, 220.0, 261.63], // F3 - A3 - C4
    ]

    let chordIndex = 0
    const scheduleNextChord = () => {
      const currentTime = audioContext.currentTime
      const chordDuration = 8 + Math.random() * 4 // 8-12 second chords
      const nextChordTime = currentTime + chordDuration * 0.7 // Overlap chords

      const chord = cosmicChords[chordIndex]
      chord.forEach((freq) => {
        createPad(freq, nextChordTime, chordDuration)
      })

      chordIndex = (chordIndex + 1) % cosmicChords.length
    }

    const interval = setInterval(scheduleNextChord, 6000) // New chord every 6 seconds

    return {
      start: () => {
        // Already started with setInterval
      },
      stop: () => {
        clearInterval(interval)
        masterGain.disconnect()
      },
    }
  }

  // Show gem toast notification
  const showGemToast = (gems: number) => {
    const toastId = Date.now().toString()
    setGemToast({ id: toastId, gems, show: true })

    // Hide toast after 3 seconds
    setTimeout(() => {
      setGemToast((prev) => (prev?.id === toastId ? { ...prev, show: false } : prev))
    }, 3000)

    // Remove toast after animation
    setTimeout(() => {
      setGemToast((prev) => (prev?.id === toastId ? null : prev))
    }, 3500)
  }

  // Initialize audio
  useEffect(() => {
    completionAudioRef.current = new Audio()
    completionAudioRef.current.volume = 0.6

    const createCompletionSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2)
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1.5)
    }

    if (completionAudioRef.current) {
      completionAudioRef.current.play = async () => {
        if (soundEnabled) {
          try {
            createCompletionSound()
          } catch (error) {
            console.log("Web Audio not supported for completion sound")
          }
        }
        return Promise.resolve()
      }
    }

    return () => {
      if (currentMusicRef.current) {
        currentMusicRef.current.stop()
      }
    }
  }, [soundEnabled])

  // Handle music changes based on mode
  useEffect(() => {
    if (currentMusicRef.current) {
      currentMusicRef.current.stop()
      currentMusicRef.current = null
    }

    if (isRunning && soundEnabled) {
      try {
        let musicGenerator

        if (currentMode === "work") {
          musicGenerator = createLoFiBeats()
        } else if (currentMode === "shortBreak") {
          musicGenerator = createOceanWaves()
        } else if (currentMode === "longBreak") {
          musicGenerator = createCosmicAmbient()
        }

        if (musicGenerator) {
          currentMusicRef.current = musicGenerator
          musicGenerator.start()
        }
      } catch (error) {
        console.log("Error creating ambient sounds:", error)
      }
    }
  }, [isRunning, soundEnabled, currentMode])

  // Load sessions and gems from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("cosmic-pomodoro-sessions")
    if (savedSessions) {
      setSessions(
        JSON.parse(savedSessions).map((s: any) => ({
          ...s,
          completedAt: new Date(s.completedAt),
        })),
      )
    }

    const savedSoundEnabled = localStorage.getItem("cosmic-pomodoro-sound")
    if (savedSoundEnabled !== null) {
      setSoundEnabled(JSON.parse(savedSoundEnabled))
    }

    const savedGems = localStorage.getItem("cosmic-pomodoro-gems")
    if (savedGems !== null) {
      setTotalGems(Number.parseInt(savedGems, 10))
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("cosmic-pomodoro-sessions", JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem("cosmic-pomodoro-sound", JSON.stringify(soundEnabled))
  }, [soundEnabled])

  useEffect(() => {
    localStorage.setItem("cosmic-pomodoro-gems", totalGems.toString())
  }, [totalGems])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)

            // Calculate gems earned for completed session
            const sessionDuration = TIMER_DURATIONS[currentMode]
            const gemsEarned = calculateGemsEarned(sessionDuration)

            // Add completed session with gem info
            const newSession: Session = {
              mode: currentMode,
              completedAt: new Date(),
              duration: sessionDuration,
              gemsEarned: gemsEarned,
            }

            setSessions((prev) => [...prev, newSession])

            // Update total gems
            if (gemsEarned > 0) {
              setTotalGems((prev) => prev + gemsEarned)
              showGemToast(gemsEarned)
            }

            if (soundEnabled && completionAudioRef.current) {
              completionAudioRef.current.play()
            }

            if ("Notification" in window && Notification.permission === "granted") {
              const gemMessage = gemsEarned > 0 ? ` You earned ${gemsEarned} gems! 💎` : ""
              new Notification(`${MODE_LABELS[currentMode]} completed! ✨${gemMessage}`)
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
  }, [isRunning, timeLeft, currentMode, soundEnabled])

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

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
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
  const todayGemsEarned = todaySessions.reduce((total, session) => total + (session.gemsEarned || 0), 0)

  // Get current sound description
  const getCurrentSoundDescription = () => {
    if (!soundEnabled) return "Sound Off"
    if (!isRunning) return "Sound Ready"

    switch (currentMode) {
      case "work":
        return "Lo-Fi Beats Playing"
      case "shortBreak":
        return "Ocean Waves Playing"
      case "longBreak":
        return "Cosmic Ambient Playing"
      default:
        return "Sound Playing"
    }
  }

  return (
    <div className={`min-h-screen relative ${geist.className}`}>
      {/* Gem Toast Notification */}
      {gemToast && (
        <div
          className={`fixed top-6 right-6 z-50 transition-all duration-500 ${
            gemToast.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-purple-500/30 border border-purple-400/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">🎉</div>
              <div>
                <div className="font-medium tracking-wide">Gems Earned!</div>
                <div className="text-sm opacity-90 flex items-center gap-1">
                  <span>💎</span>
                  <span>+{gemToast.gems} gems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Mode Selection */}
          <Tabs value={currentMode} onValueChange={(value) => handleModeChange(value as TimerMode)}>
            <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-1">
              <TabsTrigger
                value="work"
                className="rounded-xl text-purple-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/50 data-[state=active]:to-pink-500/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
              >
                <Sun className="w-4 h-4 mr-2" />
                Focus
              </TabsTrigger>
              <TabsTrigger
                value="shortBreak"
                className="rounded-xl text-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/50 data-[state=active]:to-cyan-500/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25"
              >
                <Star className="w-4 h-4 mr-2" />
                Rest
              </TabsTrigger>
              <TabsTrigger
                value="longBreak"
                className="rounded-xl text-indigo-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/50 data-[state=active]:to-purple-500/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25"
              >
                <Moon className="w-4 h-4 mr-2" />
                Recharge
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentMode} className="space-y-8 mt-12">
              {/* Cosmic Timer Orb */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${MODE_COLORS[currentMode]} opacity-30 blur-xl animate-pulse`}
                    style={{ width: "320px", height: "320px", margin: "-10px" }}
                  />

                  {/* Main orb */}
                  <div className="relative w-80 h-80 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                    {/* Inner glow */}
                    <div
                      className={`absolute inset-4 rounded-full bg-gradient-to-r ${MODE_COLORS[currentMode]} opacity-10 animate-pulse`}
                    />

                    {/* Progress ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="0.5" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                        className="transition-all duration-1000 ease-out drop-shadow-lg"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Timer content */}
                    <div className="text-center z-10 px-8">
                      <div className="text-xs text-purple-300/80 mb-3 tracking-[0.2em] uppercase font-light">
                        {MODE_LABELS[currentMode]}
                      </div>

                      <div className="relative mb-6">
                        {/* Text glow effect */}
                        <div className="absolute inset-0 text-7xl font-thin text-white/20 blur-sm tracking-wider">
                          {formatTime(timeLeft)}
                        </div>

                        {/* Main timer text */}
                        <div className="relative text-7xl font-thin text-white tracking-wider drop-shadow-2xl">
                          {formatTime(timeLeft)}
                        </div>

                        {/* Subtle accent line */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent"></div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-purple-300/70 font-light tracking-wide">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isRunning
                              ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
                              : timeLeft === 0
                                ? "bg-purple-400 shadow-lg shadow-purple-400/50"
                                : "bg-gray-400/50"
                          }`}
                        ></div>
                        <span className="uppercase tracking-[0.15em]">
                          {isRunning ? "In Progress" : timeLeft === 0 ? "Complete" : "Ready to Begin"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mystical Control Buttons */}
              <div className="flex justify-center items-center gap-4">
                {/* Main Sound Toggle */}
                <Button
                  onClick={toggleSound}
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 border-purple-500/50 bg-black/40 backdrop-blur-md hover:bg-purple-500/20 hover:scale-110 transition-all duration-300 text-purple-300 hover:text-white"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>

                {/* Play/Pause Button */}
                <Button
                  onClick={handleStartPause}
                  size="lg"
                  className={`relative rounded-full w-16 h-16 bg-gradient-to-r ${MODE_COLORS[currentMode]} hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/30 border border-purple-400/50`}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse" />
                  {isRunning ? (
                    <Pause className="w-6 h-6 text-white relative z-10" />
                  ) : (
                    <Play className="w-6 h-6 text-white relative z-10 ml-1" />
                  )}
                </Button>

                {/* Reset Button */}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12 border-purple-500/50 bg-black/40 backdrop-blur-md hover:bg-purple-500/20 hover:scale-110 transition-all duration-300 text-purple-300 hover:text-white"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {/* Sound Status Indicator */}
              {soundEnabled && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-purple-400/30 rounded-full">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isRunning
                          ? currentMode === "work"
                            ? "bg-pink-400 animate-pulse"
                            : currentMode === "shortBreak"
                              ? "bg-cyan-400 animate-pulse"
                              : "bg-indigo-400 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm text-purple-300 font-light tracking-wide">
                      {getCurrentSoundDescription()}
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Cosmic Session Tracker */}
          <Card className="border-0 bg-black/40 backdrop-blur-md border border-purple-500/30 shadow-2xl shadow-purple-500/10">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-purple-200 mb-4 text-center tracking-wide">
                Today's Cosmic Journey
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 mb-2">
                    <div className="text-2xl font-light text-white">{workSessions}</div>
                  </div>
                  <div className="text-sm text-purple-300">Focus Sessions</div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 mb-2">
                    <div className="text-2xl font-light text-white">{todayGemsEarned}</div>
                  </div>
                  <div className="text-sm text-purple-300">Gems Today</div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-purple-500/20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full">
                  <span className="text-lg">💎</span>
                  <span className="text-white font-light tracking-wide">Total: {totalGems} gems</span>
                </div>
              </div>

              {todaySessions.length > 0 && (
                <div className="pt-4 border-t border-purple-500/20 mt-4">
                  <div className="text-xs text-purple-400 mb-3">Recent Completions</div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {todaySessions.slice(-8).map((session, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                          session.mode === "work"
                            ? "from-purple-400 to-pink-400"
                            : session.mode === "shortBreak"
                              ? "from-blue-400 to-cyan-400"
                              : "from-indigo-400 to-purple-400"
                        } animate-pulse shadow-lg`}
                        title={`${MODE_LABELS[session.mode]} completed at ${session.completedAt.toLocaleTimeString()}${
                          session.gemsEarned ? ` - Earned ${session.gemsEarned} gems` : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
