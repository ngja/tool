"use client"

import {useEffect, useState} from "react"
import {fromUnixTime, getUnixTime, isValid, parseISO} from "date-fns"
import {formatInTimeZone, toZonedTime, fromZonedTime} from "date-fns-tz"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator";

interface ConversionResult {
  type: string
  value: string
  isTimezoneAffected: boolean
}

const TIMEZONES = [
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" }
]

export default function ConverterPage() {
  const [inputValue, setInputValue] = useState("")
  const [results, setResults] = useState<ConversionResult[]>([])
  const [detectedFormat, setDetectedFormat] = useState("")
  const [hasError, setHasError] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Seoul")
  const [inputTimezone, setInputTimezone] = useState("Asia/Seoul")
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  // Initialize with current time
  const initializeWithCurrentTime = () => {
    const now = new Date()
    return generateConversions(now)
  }

  const generateConversions = (date: Date): ConversionResult[] => {
    return [
      { type: "Unix Timestamp (seconds)", value: getUnixTime(date).toString(), isTimezoneAffected: false },
      { type: "Unix Timestamp (milliseconds)", value: date.getTime().toString(), isTimezoneAffected: false },
      { type: "ISO 8601 (UTC)", value: date.toISOString(), isTimezoneAffected: false },
      { type: "YYYY-MM-DD HH:mm:ss", value: formatInTimeZone(date, selectedTimezone, "yyyy-MM-dd HH:mm:ss"), isTimezoneAffected: true },
      { type: "YYYY-MM-DD", value: formatInTimeZone(date, selectedTimezone, "yyyy-MM-dd"), isTimezoneAffected: true },
      { type: "HH:mm:ss", value: formatInTimeZone(date, selectedTimezone, "HH:mm:ss"), isTimezoneAffected: true },
      { type: "Korean Format", value: formatInTimeZone(date, selectedTimezone, "yyyy년 MM월 dd일 HH시 mm분 ss초"), isTimezoneAffected: true },
      { type: "US Format", value: formatInTimeZone(date, selectedTimezone, "MM/dd/yyyy hh:mm:ss a"), isTimezoneAffected: true },
      { type: "Locale String", value: toZonedTime(date, selectedTimezone).toLocaleString(), isTimezoneAffected: true }
    ]
  }

  const detectTimeFormat = (input: string): { type: string; date: Date | null } => {
    const trimmed = input.trim()

    // Unix timestamp (10 digits for seconds, 13 digits for milliseconds)
    if (/^\d{10}$/.test(trimmed)) {
      const date = fromUnixTime(parseInt(trimmed))
      return { type: "Unix Timestamp (seconds)", date }
    }

    if (/^\d{13}$/.test(trimmed)) {
      const date = new Date(parseInt(trimmed))
      return { type: "Unix Timestamp (milliseconds)", date }
    }

    // ISO 8601 format: YYYY-MM-DD HH:mm:ss
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      try {
        // Parse the date string as if it's in the input timezone
        const localDate = parseISO(trimmed.replace(' ', 'T'))
        if (isValid(localDate)) {
          // Convert from input timezone to UTC
          const utcDate = fromZonedTime(localDate, inputTimezone)
          return { type: `YYYY-MM-DD HH:mm:ss (${TIMEZONES.find(tz => tz.value === inputTimezone)?.label || inputTimezone})`, date: utcDate }
        }
      } catch {}
    }

    // ISO 8601 format with T: YYYY-MM-DDTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
      try {
        const date = parseISO(trimmed)
        if (isValid(date)) {
          return { type: "ISO 8601", date }
        }
      } catch {}
    }

    // Try to parse as general date
    const date = new Date(trimmed)
    if (isValid(date) && !isNaN(date.getTime())) {
      return { type: "General Date Format", date }
    }

    return { type: "Unknown", date: null }
  }

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(value)
      setTimeout(() => setCopiedValue(null), 2000) // Clear after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedValue(value)
      setTimeout(() => setCopiedValue(null), 2000)
    }
  }

  const convertTime = (input: string) => {
    if (!input.trim()) {
      setResults(initializeWithCurrentTime())
      setDetectedFormat("Current Time")
      setHasError(false)
      return
    }

    const { type, date } = detectTimeFormat(input)
    setDetectedFormat(type)

    if (!date) {
      setHasError(true)
      return
    }

    setHasError(false)
    const conversions = generateConversions(date)
    setResults(conversions)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      convertTime(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue])

  // Initialize with current time on component mount
  useEffect(() => {
    setResults(initializeWithCurrentTime())
    setDetectedFormat("Current Time")
  }, [])

  // Update results when timezone changes
  useEffect(() => {
    if (!hasError && results.length > 0) {
      convertTime(inputValue)
    }
  }, [selectedTimezone])

  // Update results when input timezone changes
  useEffect(() => {
    if (inputValue.trim()) {
      convertTime(inputValue)
    }
  }, [inputTimezone])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Converter</h1>
        <p className="text-muted-foreground">
          시간을 다양한 형식으로 변환하고 복사하세요
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Time Input</CardTitle>
              <Select value={inputTimezone} onValueChange={setInputTimezone}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Input timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Enter time (e.g., 2025-09-01 10:00:00 or 1759032639)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full"
              />
            </div>
            {hasError ? (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                ❌ 잘못된 시간 형식입니다. 올바른 형식을 입력해주세요.
              </div>
            ) : detectedFormat && (
              <div className="text-sm text-muted-foreground">
                Detected format: <span className="font-medium">{detectedFormat}</span>
              </div>
            )}

            {/* Examples moved here */}
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Examples:</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unix Timestamp:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">1759032639</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard Format:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">2025-09-01 10:00:00</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISO 8601:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">2025-09-01T10:00:00Z</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversion Results</CardTitle>
              <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {hasError ? (
              <p className="text-muted-foreground text-center py-8">
                올바른 시간 형식을 입력하면 변환 결과가 표시됩니다
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        {result.type}
                      </div>
                      {result.isTimezoneAffected && (
                        <Badge variant="secondary" className="text-xs">
                          🌍 {TIMEZONES.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone}
                        </Badge>
                      )}
                    </div>
                    <div
                      className="font-mono text-sm bg-muted p-2 rounded cursor-pointer hover:bg-muted/80 transition-colors relative"
                      onClick={() => copyToClipboard(result.value)}
                      title="Click to copy"
                    >
                      {result.value}
                      {copiedValue === result.value && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}