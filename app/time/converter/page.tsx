"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Copy, Check } from "lucide-react"

interface CopyState {
  [key: string]: boolean
}

interface TooltipState {
  [key: string]: boolean
}

export default function TimeConverter() {
  const [inputTime, setInputTime] = useState("")
  const [textInput, setTextInput] = useState("")
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [copyStates, setCopyStates] = useState<CopyState>({})
  const [tooltipStates, setTooltipStates] = useState<TooltipState>({})
  const [parseError, setParseError] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [detectedFormat, setDetectedFormat] = useState("")
  const [mounted, setMounted] = useState(false)

  // Initialize component after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    setInputTime(new Date().toISOString().slice(0, 16))
  }, [])

  // Update current time every second (only after mount)
  useEffect(() => {
    if (!mounted) return

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted])

  const parseTextInput = (input: string): { date: Date | null; format: string } => {
    if (!input.trim()) return { date: null, format: "" }

    const cleanInput = input.trim()

    // Try parsing various formats
    const patterns = [
      { regex: /^\d{10}$/, name: "Unix Timestamp (초)" },
      { regex: /^\d{13}$/, name: "Unix Timestamp (밀리초)" },
      { regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, name: "ISO 8601" },
      { regex: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, name: "yyyy-MM-dd HH:mm:ss" },
      { regex: /^\d{4}-\d{2}-\d{2}$/, name: "yyyy-MM-dd" },
      { regex: /^\d{4}년 \d{1,2}월 \d{1,2}일/, name: "한국어 형식" },
      { regex: /^\d{1,2}\/\d{1,2}\/\d{4}/, name: "MM/dd/yyyy" },
      { regex: /^\d{4}\.\d{1,2}\.\d{1,2}/, name: "yyyy.MM.dd" },
    ]

    try {
      // Unix timestamp (seconds)
      if (patterns[0].regex.test(cleanInput)) {
        return {
          date: new Date(parseInt(cleanInput) * 1000),
          format: patterns[0].name
        }
      }

      // Unix timestamp (milliseconds)
      if (patterns[1].regex.test(cleanInput)) {
        return {
          date: new Date(parseInt(cleanInput)),
          format: patterns[1].name
        }
      }

      // Check other patterns
      for (let i = 2; i < patterns.length; i++) {
        if (patterns[i].regex.test(cleanInput)) {
          const parsed = new Date(cleanInput)
          if (!isNaN(parsed.getTime())) {
            return {
              date: parsed,
              format: patterns[i].name
            }
          }
        }
      }

      // Try direct parsing for remaining formats
      const parsed = new Date(cleanInput)
      if (!isNaN(parsed.getTime())) {
        return {
          date: parsed,
          format: "일반 형식"
        }
      }

      return { date: null, format: "" }
    } catch {
      return { date: null, format: "" }
    }
  }

  // Update selected date when inputs change
  useEffect(() => {
    if (textInput.trim()) {
      const result = parseTextInput(textInput)
      if (result.date) {
        setParseError("")
        setDetectedFormat(result.format)
        setSelectedDate(result.date)
      } else {
        setParseError("유효하지 않은 날짜 형식입니다")
        setDetectedFormat("")
        setSelectedDate(new Date())
      }
    } else if (inputTime) {
      setParseError("")
      setDetectedFormat("")
      setSelectedDate(new Date(inputTime))
    } else {
      setParseError("")
      setDetectedFormat("")
      setSelectedDate(new Date())
    }
  }, [textInput, inputTime])

  const getTimeToConvert = () => {
    return selectedDate
  }

  const timeFormats = [
    {
      label: "ISO 8601",
      value: getTimeToConvert().toISOString(),
      description: "국제 표준 시간 형식"
    },
    {
      label: "Unix Timestamp",
      value: Math.floor(getTimeToConvert().getTime() / 1000).toString(),
      description: "1970년부터의 초 단위"
    },
    {
      label: "Unix Timestamp (ms)",
      value: getTimeToConvert().getTime().toString(),
      description: "1970년부터의 밀리초 단위"
    },
    {
      label: "UTC String",
      value: getTimeToConvert().toUTCString(),
      description: "UTC 기준 문자열"
    },
    {
      label: "Local String",
      value: getTimeToConvert().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
      description: "한국 시간 (KST)"
    },
    {
      label: "Date Only",
      value: getTimeToConvert().toISOString().split("T")[0],
      description: "날짜만 (YYYY-MM-DD)"
    },
    {
      label: "Time Only",
      value: getTimeToConvert().toTimeString().split(" ")[0],
      description: "시간만 (HH:MM:SS)"
    },
    {
      label: "RFC 2822",
      value: getTimeToConvert().toString(),
      description: "이메일 헤더 형식"
    }
  ]

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStates(prev => ({ ...prev, [format]: true }))
      setTooltipStates(prev => ({ ...prev, [format]: true }))

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [format]: false }))
      }, 2000)

      // Reset tooltip state after 1.5 seconds
      setTimeout(() => {
        setTooltipStates(prev => ({ ...prev, [format]: false }))
      }, 1500)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const setCurrentTimeAsInput = () => {
    if (mounted) {
      setInputTime(new Date().toISOString().slice(0, 16))
      setTextInput("")
      setParseError("")
    }
  }

  const handleTextInputChange = (value: string) => {
    setTextInput(value)
    if (value.trim()) {
      setInputTime("")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Converter</h1>
        <p className="text-muted-foreground">
          시간을 다양한 형식으로 변환하고 복사하세요
        </p>
      </div>

      <Separator />

      {/* Current Time Display */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-mono font-semibold text-primary mb-2">
              {mounted && currentTime ? (
                currentTime.toLocaleString("ko-KR", {
                  timeZone: "Asia/Seoul",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })
              ) : (
                <span className="text-muted-foreground">로딩 중...</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              Korean Standard Time (KST)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Input and Conversion */}
      <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-2">
        {/* Left: Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              날짜/시간 입력
            </CardTitle>
            <CardDescription>
              다양한 형식으로 날짜와 시간을 입력할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date picker */}
            <div>
              <label className="text-sm font-medium mb-2 block">날짜/시간 선택기</label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={inputTime}
                  onChange={(e) => {
                    setInputTime(e.target.value)
                    setTextInput("")
                    setParseError("")
                  }}
                  className="flex-1"
                />
                <Button variant="outline" onClick={setCurrentTimeAsInput}>
                  현재 시간
                </Button>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">또는</div>

            {/* Text input */}
            <div>
              <label className="text-sm font-medium mb-2 block">텍스트로 입력</label>
              <Input
                type="text"
                placeholder="예: 2024-01-01 12:30:45, 1704067200000, 2024년 1월 1일..."
                value={textInput}
                onChange={(e) => handleTextInputChange(e.target.value)}
                className={parseError ? "border-red-500" : detectedFormat ? "border-green-500" : ""}
              />
              {parseError && (
                <p className="text-red-500 text-xs mt-1">{parseError}</p>
              )}
              {detectedFormat && !parseError && (
                <p className="text-green-600 text-xs mt-1">
                  ✓ 감지된 형식: <span className="font-medium">{detectedFormat}</span>
                </p>
              )}
            </div>

            {/* Format examples */}
            <div className="space-y-2">
              <label className="text-sm font-medium">지원하는 형식 예시:</label>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Unix Timestamp (초): <code className="bg-muted px-1 rounded">1704067200</code></div>
                <div>• Unix Timestamp (밀리초): <code className="bg-muted px-1 rounded">1704067200000</code></div>
                <div>• ISO 8601: <code className="bg-muted px-1 rounded">2024-01-01T00:00:00</code></div>
                <div>• yyyy-MM-dd HH:mm:ss: <code className="bg-muted px-1 rounded">2024-01-01 12:30:45</code></div>
                <div>• 날짜만: <code className="bg-muted px-1 rounded">2024-01-01</code></div>
                <div>• 슬래시: <code className="bg-muted px-1 rounded">1/1/2024</code></div>
                <div>• 점 구분: <code className="bg-muted px-1 rounded">2024.01.01</code></div>
                <div>• 한글: <code className="bg-muted px-1 rounded">2024년 1월 1일</code></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Conversion Results */}
        <Card>
          <CardHeader>
            <CardTitle>변환 결과</CardTitle>
            <CardDescription>
              입력한 시간이 다양한 형식으로 변환됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[700px] overflow-y-auto">
              {timeFormats.map((format) => (
                <div
                  key={format.label}
                  className="group relative overflow-hidden bg-muted/30 border rounded-lg p-3 transition-all hover:shadow-sm hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{format.label}</h3>
                        <span className="text-xs text-muted-foreground">
                          {format.description}
                        </span>
                      </div>
                      <div
                        className={`font-mono text-sm bg-background px-2 py-1 rounded cursor-pointer hover:bg-accent transition-all duration-200 ${
                          copyStates[format.label] ? 'scale-[1.01]' : ''
                        } break-all`}
                        onClick={() => copyToClipboard(format.value, format.label)}
                      >
                        {format.value}
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(format.value, format.label)}
                        className={`h-7 w-7 p-0 transition-all duration-200 ${
                          copyStates[format.label] ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        {copyStates[format.label] ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>

                      {/* Diagonal "Copied" overlay */}
                      {tooltipStates[format.label] && (
                        <div className="absolute -inset-2 pointer-events-none z-50">
                          <div className="absolute top-0 right-0 transform rotate-12 translate-x-1 -translate-y-1">
                            <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg animate-in zoom-in-95 fade-in-0 duration-300">
                              Copied!
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content area diagonal "Copied" overlay */}
                  {tooltipStates[format.label] && (
                    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                      <div className="transform rotate-12">
                        <div className="bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded shadow-lg animate-in zoom-in-95 fade-in-0 duration-300">
                          Copied! 🎉
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}