"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Clock, Copy, Check, Calendar, CalendarClock } from "lucide-react"
import { format as formatDate } from "date-fns"
import { ko } from "date-fns/locale"

type CronFormat = 'standard' | 'aws'

type CronPreset = {
  name: string
  description: string
  standard: string
  aws: string
}

const PRESETS: CronPreset[] = [
  {
    name: "매분",
    description: "매 분마다 실행",
    standard: "* * * * *",
    aws: "* * * * ? *"
  },
  {
    name: "매시간",
    description: "매 시간 정각에 실행",
    standard: "0 * * * *",
    aws: "0 * * * ? *"
  },
  {
    name: "매일 자정",
    description: "매일 00:00에 실행",
    standard: "0 0 * * *",
    aws: "0 0 * * ? *"
  },
  {
    name: "매일 정오",
    description: "매일 12:00에 실행",
    standard: "0 12 * * *",
    aws: "0 12 * * ? *"
  },
  {
    name: "평일 오전 9시",
    description: "월-금 09:00에 실행",
    standard: "0 9 * * 1-5",
    aws: "0 9 ? * MON-FRI *"
  },
  {
    name: "매주 일요일",
    description: "매주 일요일 00:00에 실행",
    standard: "0 0 * * 0",
    aws: "0 0 ? * SUN *"
  },
  {
    name: "매월 1일",
    description: "매월 1일 00:00에 실행",
    standard: "0 0 1 * *",
    aws: "0 0 1 * ? *"
  }
]

const WEEKDAYS = [
  { value: "SUN", label: "일" },
  { value: "MON", label: "월" },
  { value: "TUE", label: "화" },
  { value: "WED", label: "수" },
  { value: "THU", label: "목" },
  { value: "FRI", label: "금" },
  { value: "SAT", label: "토" }
]

// Calculate next execution times
const calculateNextExecutions = (cronExpr: string, cronFormat: CronFormat, count: number = 5): Date[] => {
  try {
    const parts = cronExpr.trim().split(/\s+/)
    const expectedLength = cronFormat === 'standard' ? 5 : 6

    if (parts.length !== expectedLength) {
      return []
    }

    const [minutePart, hourPart, dayPart, monthPart, weekdayPart, yearPart] = parts
    const results: Date[] = []
    const now = new Date()
    let current = new Date(now)
    current.setSeconds(0)
    current.setMilliseconds(0)

    const maxIterations = 10000 // Prevent infinite loops
    let iterations = 0

    while (results.length < count && iterations < maxIterations) {
      iterations++
      current = new Date(current.getTime() + 60000) // Add 1 minute

      const minute = current.getMinutes()
      const hour = current.getHours()
      const day = current.getDate()
      const month = current.getMonth() + 1
      const weekday = current.getDay()

      // Check minute
      if (!matchesCronPart(minutePart, minute, 0, 59)) continue

      // Check hour
      if (!matchesCronPart(hourPart, hour, 0, 23)) continue

      // Check month
      if (!matchesCronPart(monthPart, month, 1, 12)) continue

      // Check day of month and day of week
      const dayMatches = dayPart === '*' || dayPart === '?' || matchesCronPart(dayPart, day, 1, 31)
      const weekdayMatches = matchesWeekday(weekdayPart, weekday)

      if (dayPart === '?' || weekdayPart === '?') {
        // AWS format: one must be ?, the other is used
        if (dayPart === '?') {
          if (!weekdayMatches) continue
        } else {
          if (!dayMatches) continue
        }
      } else {
        // Standard format or both specified: OR logic
        if (!dayMatches && !weekdayMatches) continue
      }

      results.push(new Date(current))
    }

    return results
  } catch (err) {
    return []
  }
}

const matchesCronPart = (part: string, value: number, min: number, max: number): boolean => {
  if (part === '*') return true
  if (part === '?') return true

  // Specific value
  if (/^\d+$/.test(part)) {
    return parseInt(part) === value
  }

  // Range (e.g., 1-5)
  if (part.includes('-')) {
    const [start, end] = part.split('-').map(n => parseInt(n))
    return value >= start && value <= end
  }

  // List (e.g., 1,3,5)
  if (part.includes(',')) {
    const values = part.split(',').map(n => parseInt(n.trim()))
    return values.includes(value)
  }

  // Interval (e.g., */5)
  if (part.includes('/')) {
    const [range, interval] = part.split('/')
    const step = parseInt(interval)
    if (range === '*') {
      return value % step === 0
    }
  }

  return false
}

const matchesWeekday = (part: string, weekday: number): boolean => {
  if (part === '*' || part === '?') return true

  // Convert Sunday from 0 to 7 for cron compatibility
  const cronWeekday = weekday === 0 ? 7 : weekday

  // Handle day names (SUN, MON, etc.)
  const dayNames: Record<string, number> = {
    'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
  }

  let processedPart = part
  Object.entries(dayNames).forEach(([name, num]) => {
    processedPart = processedPart.replace(new RegExp(name, 'gi'), num.toString())
  })

  // List (e.g., 1,3,5 or MON,WED,FRI)
  if (processedPart.includes(',')) {
    const values = processedPart.split(',').map(n => {
      const parsed = parseInt(n.trim())
      return parsed === 0 ? 7 : parsed
    })
    return values.includes(cronWeekday) || values.includes(weekday)
  }

  // Range (e.g., 1-5 or MON-FRI)
  if (processedPart.includes('-')) {
    const [start, end] = processedPart.split('-').map(n => {
      const parsed = parseInt(n.trim())
      return parsed === 0 ? 7 : parsed
    })
    return cronWeekday >= start && cronWeekday <= end
  }

  // Specific day
  if (/^\d+$/.test(processedPart)) {
    const day = parseInt(processedPart)
    return day === cronWeekday || day === weekday
  }

  return false
}

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins}분 후`
  } else if (diffHours < 24) {
    const remainMins = diffMins % 60
    return remainMins > 0 ? `${diffHours}시간 ${remainMins}분 후` : `${diffHours}시간 후`
  } else {
    const remainHours = diffHours % 24
    return remainHours > 0 ? `${diffDays}일 ${remainHours}시간 후` : `${diffDays}일 후`
  }
}

// Explain cron field values
const explainMinute = (value: string): string => {
  if (value === '*') return '매 분'
  if (value === '?') return '(무시)'
  if (value.startsWith('*/')) return `${value.slice(2)}분마다`
  if (value.includes(',')) return `${value.replace(/,/g, ', ')}분`
  if (value.includes('-')) {
    const [start, end] = value.split('-')
    return `${start}분부터 ${end}분까지`
  }
  return `${value}분`
}

const explainHour = (value: string): string => {
  if (value === '*') return '매 시간'
  if (value === '?') return '(무시)'
  if (value.startsWith('*/')) return `${value.slice(2)}시간마다`
  if (value.includes(',')) return `${value.replace(/,/g, ', ')}시`
  if (value.includes('-')) {
    const [start, end] = value.split('-')
    return `${start}시부터 ${end}시까지`
  }
  return `${value}시`
}

const explainDayOfMonth = (value: string): string => {
  if (value === '*') return '매일'
  if (value === '?') return '(요일로 지정)'
  if (value === 'L') return '마지막 날'
  if (value.includes('W')) return `${value.replace('W', '')}일과 가까운 평일`
  if (value.includes(',')) return `${value.replace(/,/g, ', ')}일`
  if (value.includes('-')) {
    const [start, end] = value.split('-')
    return `${start}일부터 ${end}일까지`
  }
  return `${value}일`
}

const explainMonth = (value: string): string => {
  if (value === '*') return '매월'
  if (value === '?') return '(무시)'

  const monthNames: Record<string, string> = {
    'JAN': '1월', 'FEB': '2월', 'MAR': '3월', 'APR': '4월',
    'MAY': '5월', 'JUN': '6월', 'JUL': '7월', 'AUG': '8월',
    'SEP': '9월', 'OCT': '10월', 'NOV': '11월', 'DEC': '12월'
  }

  let result = value
  Object.entries(monthNames).forEach(([name, label]) => {
    result = result.replace(new RegExp(name, 'gi'), label.replace('월', ''))
  })

  if (result.includes(',')) return `${result.replace(/,/g, ', ')}월`
  if (result.includes('-')) {
    const [start, end] = result.split('-')
    return `${start}월부터 ${end}월까지`
  }
  return `${result}월`
}

const explainDayOfWeek = (value: string): string => {
  if (value === '*') return '매일'
  if (value === '?') return '(일자로 지정)'

  const dayNames: Record<string, string> = {
    'SUN': '일요일', 'MON': '월요일', 'TUE': '화요일', 'WED': '수요일',
    'THU': '목요일', 'FRI': '금요일', 'SAT': '토요일',
    '0': '일요일', '1': '월요일', '2': '화요일', '3': '수요일',
    '4': '목요일', '5': '금요일', '6': '토요일', '7': '일요일'
  }

  // Handle special formats like FRI#3
  if (value.includes('#')) {
    const [day, nth] = value.split('#')
    const dayName = dayNames[day.toUpperCase()] || day
    return `${nth}번째 ${dayName}`
  }

  let result = value

  // Replace day names and numbers
  Object.entries(dayNames).forEach(([name, label]) => {
    result = result.replace(new RegExp(`\\b${name}\\b`, 'gi'), label)
  })

  if (result.includes(',')) return result.replace(/,/g, ', ')
  if (result.includes('-')) {
    const parts = result.split('-')
    return `${parts[0]}부터 ${parts[1]}까지`
  }
  return result
}

const explainYear = (value: string): string => {
  if (value === '*') return '매년'
  if (value.includes(',')) return `${value.replace(/,/g, ', ')}년`
  if (value.includes('-')) {
    const [start, end] = value.split('-')
    return `${start}년부터 ${end}년까지`
  }
  return `${value}년`
}

export default function CronPage() {
  const [format, setFormat] = useState<CronFormat>('standard')
  const [cronExpression, setCronExpression] = useState("* * * * *")
  const [manualExpression, setManualExpression] = useState("* * * * *")
  const [isManualMode, setIsManualMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [nextExecutions, setNextExecutions] = useState<Date[]>([])

  // Individual field values
  const [minute, setMinute] = useState("*")
  const [hour, setHour] = useState("*")
  const [dayOfMonth, setDayOfMonth] = useState("*")
  const [month, setMonth] = useState("*")
  const [dayOfWeek, setDayOfWeek] = useState("*")
  const [year, setYear] = useState("*")

  // Quick selection modes
  const [minuteMode, setMinuteMode] = useState<'every' | 'specific' | 'interval' | 'custom'>('every')
  const [hourMode, setHourMode] = useState<'every' | 'specific' | 'interval' | 'custom'>('every')
  const [dayMode, setDayMode] = useState<'every' | 'specific' | 'custom'>('every')
  const [monthMode, setMonthMode] = useState<'every' | 'specific' | 'custom'>('every')
  const [weekdayMode, setWeekdayMode] = useState<'every' | 'specific' | 'custom'>('every')

  // Specific values
  const [specificMinute, setSpecificMinute] = useState("0")
  const [specificHour, setSpecificHour] = useState("0")
  const [specificDay, setSpecificDay] = useState("1")
  const [specificMonth, setSpecificMonth] = useState("1")
  const [specificWeekdays, setSpecificWeekdays] = useState<string[]>([])

  // Interval values
  const [minuteInterval, setMinuteInterval] = useState("5")
  const [hourInterval, setHourInterval] = useState("1")

  // Custom values (for range and list)
  const [customMinute, setCustomMinute] = useState("0-59")
  const [customHour, setCustomHour] = useState("0-23")
  const [customDay, setCustomDay] = useState("1-31")
  const [customMonth, setCustomMonth] = useState("1-12")
  const [customWeekday, setCustomWeekday] = useState("MON-FRI")

  // Build cron expression
  useEffect(() => {
    let m = minute
    let h = hour
    let dom = dayOfMonth
    let mon = month
    let dow = dayOfWeek
    let y = year

    // Minute
    if (minuteMode === 'every') {
      m = '*'
    } else if (minuteMode === 'specific') {
      m = specificMinute
    } else if (minuteMode === 'interval') {
      m = `*/${minuteInterval}`
    } else if (minuteMode === 'custom') {
      m = customMinute
    }

    // Hour
    if (hourMode === 'every') {
      h = '*'
    } else if (hourMode === 'specific') {
      h = specificHour
    } else if (hourMode === 'interval') {
      h = `*/${hourInterval}`
    } else if (hourMode === 'custom') {
      h = customHour
    }

    // Day of Month
    if (dayMode === 'every') {
      dom = '*'
    } else if (dayMode === 'specific') {
      dom = specificDay
    } else if (dayMode === 'custom') {
      dom = customDay
    }

    // Month
    if (monthMode === 'every') {
      mon = '*'
    } else if (monthMode === 'specific') {
      mon = specificMonth
    } else if (monthMode === 'custom') {
      mon = customMonth
    }

    // Day of Week
    if (weekdayMode === 'every') {
      dow = format === 'aws' ? '?' : '*'
    } else if (weekdayMode === 'specific' && specificWeekdays.length > 0) {
      dow = specificWeekdays.join(',')
      if (format === 'aws') {
        dom = '?' // AWS requires ? when day of week is specified
      }
    } else if (weekdayMode === 'custom') {
      dow = customWeekday
      if (format === 'aws' && dom !== '?') {
        dom = '?'
      }
    } else {
      dow = format === 'aws' ? '?' : '*'
    }

    // For AWS, if day of month is specified, day of week must be ?
    if (format === 'aws') {
      if (dayMode === 'specific') {
        dow = '?'
      } else if (weekdayMode === 'every') {
        dow = '?'
      }
    }

    // Build expression
    if (format === 'standard') {
      setCronExpression(`${m} ${h} ${dom} ${mon} ${dow}`)
    } else {
      setCronExpression(`${m} ${h} ${dom} ${mon} ${dow} ${y}`)
    }

    setMinute(m)
    setHour(h)
    setDayOfMonth(dom)
    setMonth(mon)
    setDayOfWeek(dow)
    setYear(y)

    // Only update expression if not in manual mode
    if (!isManualMode) {
      const expr = format === 'standard' ? `${m} ${h} ${dom} ${mon} ${dow}` : `${m} ${h} ${dom} ${mon} ${dow} ${y}`
      setManualExpression(expr)
    }
  }, [format, minuteMode, hourMode, dayMode, monthMode, weekdayMode,
      specificMinute, specificHour, specificDay, specificMonth, specificWeekdays,
      minuteInterval, hourInterval, customMinute, customHour, customDay, customMonth, customWeekday,
      year, isManualMode])

  // Calculate next executions when expression or format changes
  useEffect(() => {
    const exprToUse = isManualMode ? manualExpression : cronExpression
    const executions = calculateNextExecutions(exprToUse, format, 5)
    setNextExecutions(executions)
  }, [cronExpression, manualExpression, format, isManualMode])

  // Parse expression to extract fields when in manual mode
  useEffect(() => {
    if (isManualMode) {
      const parts = manualExpression.trim().split(/\s+/)
      const expectedLength = format === 'standard' ? 5 : 6

      if (parts.length === expectedLength) {
        setMinute(parts[0] || '*')
        setHour(parts[1] || '*')
        setDayOfMonth(parts[2] || '*')
        setMonth(parts[3] || '*')
        setDayOfWeek(parts[4] || '*')
        if (format === 'aws' && parts[5]) {
          setYear(parts[5])
        }
      }
    }
  }, [manualExpression, format, isManualMode])

  // Handle manual expression change
  const handleManualExpressionChange = (value: string) => {
    setManualExpression(value)
    setCronExpression(value)
  }

  // Apply preset
  const applyPreset = (preset: CronPreset) => {
    const expr = format === 'standard' ? preset.standard : preset.aws
    setCronExpression(expr)
    setManualExpression(expr)
    setIsManualMode(false)

    // Parse and update individual fields
    const parts = expr.trim().split(/\s+/)
    if (parts.length >= 5) {
      setMinute(parts[0] || '*')
      setHour(parts[1] || '*')
      setDayOfMonth(parts[2] || '*')
      setMonth(parts[3] || '*')
      setDayOfWeek(parts[4] || '*')
      if (format === 'aws' && parts[5]) {
        setYear(parts[5])
      }
    }

    // Reset to every mode
    setMinuteMode('every')
    setHourMode('every')
    setDayMode('every')
    setMonthMode('every')
    setWeekdayMode('every')
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cronExpression)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Toggle weekday selection
  const toggleWeekday = (day: string) => {
    setSpecificWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => {
            const order = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
            return order.indexOf(a) - order.indexOf(b)
          })
    )
  }

  // Get human-readable description
  const getDescription = (): string => {
    const parts: string[] = []

    // Minute
    if (minute === '*') {
      parts.push('매 분')
    } else if (minute.startsWith('*/')) {
      parts.push(`${minute.slice(2)}분마다`)
    } else {
      parts.push(`${minute}분`)
    }

    // Hour
    if (hour === '*') {
      parts.push('매 시간')
    } else if (hour.startsWith('*/')) {
      parts.push(`${hour.slice(2)}시간마다`)
    } else {
      parts.push(`${hour}시`)
    }

    // Day
    if (dayOfMonth !== '*' && dayOfMonth !== '?') {
      parts.push(`${dayOfMonth}일`)
    }

    // Month
    if (month !== '*') {
      parts.push(`${month}월`)
    }

    // Weekday
    if (dayOfWeek !== '*' && dayOfWeek !== '?') {
      const days = dayOfWeek.split(',').map(d => {
        const found = WEEKDAYS.find(w => w.value === d)
        return found ? found.label : d
      })
      parts.push(days.join(', ') + '요일')
    }

    return parts.join(' ')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cron Expression</h1>
        <p className="text-muted-foreground">
          Cron 표현식을 쉽게 생성하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Cron 형식
            </CardTitle>
            <CardDescription>
              사용할 Cron 형식을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={format} onValueChange={(v) => setFormat(v as CronFormat)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="standard">
                  전통 방식 (5필드)
                </TabsTrigger>
                <TabsTrigger value="aws">
                  AWS EventBridge (6필드)
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm">
                {format === 'standard' ? (
                  <div className="space-y-2">
                    <p className="font-medium">전통 Cron 형식 (Unix/Linux)</p>
                    <p className="text-muted-foreground">
                      형식: <code className="bg-background px-2 py-1 rounded">분 시 일 월 요일</code>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      사용처: Linux crontab, Jenkins, 대부분의 스케줄러
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">AWS EventBridge Cron 형식</p>
                    <p className="text-muted-foreground">
                      형식: <code className="bg-background px-2 py-1 rounded">분 시 일 월 요일 연도</code>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      사용처: AWS EventBridge, CloudWatch Events
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ 일(day-of-month)과 요일(day-of-week) 중 하나는 반드시 ?를 사용해야 합니다
                    </p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Presets - Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">빠른 설정</CardTitle>
            <CardDescription className="text-xs">
              자주 사용되는 패턴 선택
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="h-auto py-2 px-3 hover:bg-primary/10 hover:border-primary"
                >
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Configuration - Compact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">상세 설정</CardTitle>
            <CardDescription className="text-xs">
              각 필드를 개별적으로 설정
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Minute */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">분 (0-59)</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant={minuteMode === 'every' ? 'default' : 'outline'}
                    onClick={() => setMinuteMode('every')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    매분
                  </Button>
                  <Button
                    variant={minuteMode === 'specific' ? 'default' : 'outline'}
                    onClick={() => setMinuteMode('specific')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    특정
                  </Button>
                  <Button
                    variant={minuteMode === 'interval' ? 'default' : 'outline'}
                    onClick={() => setMinuteMode('interval')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    간격
                  </Button>
                  <Button
                    variant={minuteMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setMinuteMode('custom')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    범위/목록
                  </Button>
                </div>
                {minuteMode === 'specific' && (
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={specificMinute}
                    onChange={(e) => setSpecificMinute(e.target.value)}
                    placeholder="0-59"
                    className="h-8 text-xs"
                  />
                )}
                {minuteMode === 'interval' && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      max="59"
                      value={minuteInterval}
                      onChange={(e) => setMinuteInterval(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs whitespace-nowrap">분마다</span>
                  </div>
                )}
                {minuteMode === 'custom' && (
                  <Input
                    type="text"
                    value={customMinute}
                    onChange={(e) => setCustomMinute(e.target.value)}
                    placeholder="예: 0-30 또는 0,15,30,45"
                    className="h-8 text-xs"
                  />
                )}
              </div>

              {/* Hour */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">시 (0-23)</Label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant={hourMode === 'every' ? 'default' : 'outline'}
                    onClick={() => setHourMode('every')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    매시간
                  </Button>
                  <Button
                    variant={hourMode === 'specific' ? 'default' : 'outline'}
                    onClick={() => setHourMode('specific')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    특정
                  </Button>
                  <Button
                    variant={hourMode === 'interval' ? 'default' : 'outline'}
                    onClick={() => setHourMode('interval')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    간격
                  </Button>
                  <Button
                    variant={hourMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setHourMode('custom')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    범위/목록
                  </Button>
                </div>
                {hourMode === 'specific' && (
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={specificHour}
                    onChange={(e) => setSpecificHour(e.target.value)}
                    placeholder="0-23"
                    className="h-8 text-xs"
                  />
                )}
                {hourMode === 'interval' && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      max="23"
                      value={hourInterval}
                      onChange={(e) => setHourInterval(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <span className="text-xs whitespace-nowrap">시간마다</span>
                  </div>
                )}
                {hourMode === 'custom' && (
                  <Input
                    type="text"
                    value={customHour}
                    onChange={(e) => setCustomHour(e.target.value)}
                    placeholder="예: 9-18 또는 9,12,15,18"
                    className="h-8 text-xs"
                  />
                )}
              </div>

              {/* Day of Month */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">일 (1-31)</Label>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={dayMode === 'every' ? 'default' : 'outline'}
                    onClick={() => setDayMode('every')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    매일
                  </Button>
                  <Button
                    variant={dayMode === 'specific' ? 'default' : 'outline'}
                    onClick={() => setDayMode('specific')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    특정
                  </Button>
                  <Button
                    variant={dayMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setDayMode('custom')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    범위/목록
                  </Button>
                </div>
                {dayMode === 'specific' && (
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={specificDay}
                    onChange={(e) => setSpecificDay(e.target.value)}
                    placeholder="1-31"
                    className="h-8 text-xs"
                  />
                )}
                {dayMode === 'custom' && (
                  <Input
                    type="text"
                    value={customDay}
                    onChange={(e) => setCustomDay(e.target.value)}
                    placeholder="예: 1-15 또는 1,15,30"
                    className="h-8 text-xs"
                  />
                )}
              </div>

              {/* Month */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">월 (1-12)</Label>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={monthMode === 'every' ? 'default' : 'outline'}
                    onClick={() => setMonthMode('every')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    매월
                  </Button>
                  <Button
                    variant={monthMode === 'specific' ? 'default' : 'outline'}
                    onClick={() => setMonthMode('specific')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    특정
                  </Button>
                  <Button
                    variant={monthMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setMonthMode('custom')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    범위/목록
                  </Button>
                </div>
                {monthMode === 'specific' && (
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={specificMonth}
                    onChange={(e) => setSpecificMonth(e.target.value)}
                    placeholder="1-12"
                    className="h-8 text-xs"
                  />
                )}
                {monthMode === 'custom' && (
                  <Input
                    type="text"
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                    placeholder="예: 3-6 또는 1,4,7,10"
                    className="h-8 text-xs"
                  />
                )}
              </div>

              {/* Day of Week */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">요일</Label>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={weekdayMode === 'every' ? 'default' : 'outline'}
                    onClick={() => {
                      setWeekdayMode('every')
                      setSpecificWeekdays([])
                    }}
                    size="sm"
                    className="text-xs h-8"
                  >
                    매일
                  </Button>
                  <Button
                    variant={weekdayMode === 'specific' ? 'default' : 'outline'}
                    onClick={() => setWeekdayMode('specific')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    선택
                  </Button>
                  <Button
                    variant={weekdayMode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setWeekdayMode('custom')}
                    size="sm"
                    className="text-xs h-8"
                  >
                    범위/목록
                  </Button>
                </div>
                {weekdayMode === 'specific' && (
                  <div className="flex gap-1 flex-wrap">
                    {WEEKDAYS.map((day) => (
                      <Button
                        key={day.value}
                        variant={specificWeekdays.includes(day.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleWeekday(day.value)}
                        className="w-8 h-8 p-0 text-xs"
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                )}
                {weekdayMode === 'custom' && (
                  <Input
                    type="text"
                    value={customWeekday}
                    onChange={(e) => setCustomWeekday(e.target.value)}
                    placeholder="예: MON-FRI 또는 MON,WED,FRI"
                    className="h-8 text-xs"
                  />
                )}
              </div>

              {/* Year (AWS only) */}
              {format === 'aws' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">연도</Label>
                  <Input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="* 또는 2024"
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Display */}
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>생성된 Cron 표현식</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isManualMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsManualMode(!isManualMode)}
                >
                  {isManualMode ? "수동 입력" : "자동 생성"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className={`transition-all duration-200 ${
                    copied ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="ml-2">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="ml-2">복사</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isManualMode ? (
              <Input
                value={manualExpression}
                onChange={(e) => handleManualExpressionChange(e.target.value)}
                className="font-mono text-lg p-4 h-auto"
                placeholder={format === 'standard' ? "* * * * *" : "* * * * ? *"}
              />
            ) : (
              <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary/20">
                <code className="text-2xl font-mono font-bold break-all">
                  {cronExpression}
                </code>
              </div>
            )}

            {/* Field breakdown with explanations */}
            <div className="mt-6 space-y-3">
              <div className="text-sm font-semibold text-muted-foreground mb-3">
                필드별 의미
              </div>
              <div className={`grid gap-3 ${format === 'aws' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
                <div className="p-3 rounded-lg bg-muted border min-h-[80px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">분</span>
                    <code className="text-sm font-mono font-semibold">{minute}</code>
                  </div>
                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={explainMinute(minute)}>
                    {explainMinute(minute)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted border min-h-[80px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">시</span>
                    <code className="text-sm font-mono font-semibold">{hour}</code>
                  </div>
                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={explainHour(hour)}>
                    {explainHour(hour)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted border min-h-[80px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">일</span>
                    <code className="text-sm font-mono font-semibold">{dayOfMonth}</code>
                  </div>
                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={explainDayOfMonth(dayOfMonth)}>
                    {explainDayOfMonth(dayOfMonth)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted border min-h-[80px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">월</span>
                    <code className="text-sm font-mono font-semibold">{month}</code>
                  </div>
                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={explainMonth(month)}>
                    {explainMonth(month)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted border min-h-[80px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">요일</span>
                    <code className="text-sm font-mono font-semibold">{dayOfWeek}</code>
                  </div>
                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={explainDayOfWeek(dayOfWeek)}>
                    {explainDayOfWeek(dayOfWeek)}
                  </div>
                </div>

                {format === 'aws' && (
                  <div className="p-3 rounded-lg bg-muted border min-h-[80px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">연도</span>
                      <code className="text-sm font-mono font-semibold">{year}</code>
                    </div>
                    <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={explainYear(year)}>
                      {explainYear(year)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Executions */}
        {nextExecutions.length > 0 && (
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-6 w-6 text-green-600 dark:text-green-400" />
                다음 실행 시간 (5회)
              </CardTitle>
              <CardDescription>
                현재 시간 기준으로 다음에 실행될 시간입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nextExecutions.map((date, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 text-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-mono font-semibold">
                          {formatDate(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(date, 'EEEE', { locale: ko })}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatRelativeTime(date)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reference Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-3">
              <p className="font-medium">💡 특수 문자 사용법</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">*</code>
                    <span className="text-xs">모든 값 (매번)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">?</code>
                    <span className="text-xs">무시 (AWS 전용, day-of-month나 day-of-week)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">-</code>
                    <span className="text-xs">범위 (예: 1-5 = 1,2,3,4,5)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">,</code>
                    <span className="text-xs">여러 값 (예: 1,3,5)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">/</code>
                    <span className="text-xs">간격 (예: */5 = 5분마다)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">L</code>
                    <span className="text-xs">마지막 (AWS 전용, 예: L = 월의 마지막 날)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">W</code>
                    <span className="text-xs">평일 (AWS 전용, 예: 15W = 15일과 가까운 평일)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-background px-2 py-1 rounded">#</code>
                    <span className="text-xs">N번째 요일 (AWS 전용, 예: FRI#3 = 3번째 금요일)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
