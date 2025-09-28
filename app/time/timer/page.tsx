"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Timer, Play, Pause, RotateCcw, Plus, Minus } from "lucide-react"

export default function TimerPage() {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [initialTime, setInitialTime] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    if (timeLeft === 0) {
      const total = minutes * 60 + seconds
      setTimeLeft(total)
      setInitialTime(total)
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setInitialTime(0)
    setIsShaking(false)
  }

  const adjustMinutes = (change: number) => {
    if (!isRunning && timeLeft === 0) {
      setMinutes(Math.max(0, Math.min(99, minutes + change)))
    }
  }

  const adjustSeconds = (change: number) => {
    if (!isRunning && timeLeft === 0) {
      const newSeconds = seconds + change
      if (newSeconds >= 60) {
        setMinutes(Math.min(99, minutes + 1))
        setSeconds(0)
      } else if (newSeconds < 0) {
        if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          setSeconds(0)
        }
      } else {
        setSeconds(newSeconds)
      }
    }
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsShaking(true)
            // Timer finished - add notification and stop shaking after animation
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('타이머 완료!', {
                body: '설정한 시간이 종료되었습니다.',
                icon: '/favicon.ico'
              })
            }
            // Stop shaking after 2 seconds
            setTimeout(() => {
              setIsShaking(false)
            }, 2000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0
  const isTimerSet = timeLeft > 0 || (minutes > 0 || seconds > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timer</h1>
        <p className="text-muted-foreground">
          원하는 시간을 설정하여 타이머를 실행하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Timer Display */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Timer className="h-6 w-6" />
              타이머
            </CardTitle>
            <CardDescription>
              {isRunning ? "타이머가 실행 중입니다" : timeLeft > 0 ? "타이머가 일시정지되었습니다" : "시간을 설정하고 시작하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            {/* Time Display */}
            <div className="text-center space-y-6">
              <div className={`text-8xl font-mono font-bold text-primary transition-all duration-150 ${
                isShaking ? 'animate-pulse' : ''
              } ${isShaking ? 'shake' : ''}`}>
                {timeLeft > 0 ? formatTime(timeLeft) : formatTime(minutes * 60 + seconds)}
              </div>

              {/* Progress bar area - always reserve space */}
              <div className="space-y-3 max-w-md mx-auto h-12 flex flex-col justify-center">
                {initialTime > 0 ? (
                  <>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {Math.round(progress)}% 완료
                    </p>
                  </>
                ) : (
                  <div className="h-3"></div>
                )}</div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    disabled={!isTimerSet}
                    className="px-8 py-3 text-lg"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    시작
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    className="px-8 py-3 text-lg"
                    size="lg"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    일시정지
                  </Button>
                )}

                <Button
                  onClick={resetTimer}
                  variant="outline"
                  disabled={timeLeft === 0 && !isTimerSet}
                  className="px-8 py-3 text-lg"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  리셋
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Setting Controls */}
        {!isRunning && timeLeft === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>시간 설정</CardTitle>
              <CardDescription>
                원하는 시간을 설정하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual Time Setting */}
              <div className="flex justify-center gap-8">
                {/* Minutes */}
                <div className="text-center space-y-3">
                  <label className="text-sm font-medium block">분</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustMinutes(-1)}
                      disabled={minutes === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max="99"
                      value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                      className="w-20 text-center text-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustMinutes(1)}
                      disabled={minutes === 99}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Seconds */}
                <div className="text-center space-y-3">
                  <label className="text-sm font-medium block">초</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustSeconds(-1)}
                      disabled={seconds === 0 && minutes === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-20 text-center text-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustSeconds(1)}
                      disabled={seconds === 59 && minutes === 99}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick time buttons */}
              <div className="space-y-3">
                <label className="text-sm font-medium block text-center">빠른 설정</label>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[
                    { label: "10초", mins: 0, secs: 10 },
                    { label: "30초", mins: 0, secs: 30 },
                    { label: "1분", mins: 1, secs: 0 },
                    { label: "5분", mins: 5, secs: 0 },
                    { label: "10분", mins: 10, secs: 0 },
                    { label: "15분", mins: 15, secs: 0 },
                    { label: "30분", mins: 30, secs: 0 },
                    { label: "1시간", mins: 60, secs: 0 }
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMinutes(preset.mins)
                        setSeconds(preset.secs)
                      }}
                      className="text-sm"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timer Status */}
        {timeLeft === 0 && initialTime > 0 && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="p-4 text-center">
              <p className="text-green-700 dark:text-green-300 font-medium">
                🎉 타이머가 완료되었습니다!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}