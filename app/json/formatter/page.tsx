"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, FileJson, AlertCircle, CheckCircle } from "lucide-react"

interface JsonError {
  message: string
  line?: number
  column?: number
  position?: number
}

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState("")
  const [formattedJson, setFormattedJson] = useState("")
  const [error, setError] = useState<JsonError | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

  // JSON validation and formatting
  const validateAndFormatJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setFormattedJson("")
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonString)
      const formatted = JSON.stringify(parsed, null, 2)
      setFormattedJson(formatted)
      setError(null)
    } catch (err) {
      setFormattedJson("")

      if (err instanceof SyntaxError) {
        // Extract line and column information from error message
        const message = err.message
        let line: number | undefined
        let column: number | undefined
        let position: number | undefined

        // Parse different error message formats
        const lineMatch = message.match(/line (\d+)/i)
        const columnMatch = message.match(/column (\d+)/i)
        const positionMatch = message.match(/position (\d+)/i)

        if (lineMatch) line = parseInt(lineMatch[1])
        if (columnMatch) column = parseInt(columnMatch[1])
        if (positionMatch) position = parseInt(positionMatch[1])

        // Calculate line and column from position if available
        if (position && !line && !column) {
          const lines = jsonString.substring(0, position).split('\n')
          line = lines.length
          column = lines[lines.length - 1].length + 1
        }

        setError({
          message: message.replace(/^JSON\.parse: /, '').replace(/^Unexpected token/, 'Unexpected character'),
          line,
          column,
          position
        })
      } else {
        setError({
          message: "Unknown JSON parsing error"
        })
      }
    }
  }

  // Update JSON when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateAndFormatJson(inputJson)
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timeoutId)
  }, [inputJson])

  // Copy functionality
  const copyToClipboard = async () => {
    if (!formattedJson) return

    try {
      await navigator.clipboard.writeText(formattedJson)
      setCopied(true)
      setShowCopiedTooltip(true)

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      // Reset tooltip state after 1.5 seconds
      setTimeout(() => {
        setShowCopiedTooltip(false)
      }, 1500)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Sample JSON examples
  const loadSampleJson = (sample: string) => {
    setInputJson(sample)
  }

  const sampleJsons = [
    {
      name: "Simple Object",
      json: '{"name":"John Doe","age":30,"city":"Seoul"}'
    },
    {
      name: "Array with Objects",
      json: '[{"id":1,"name":"Alice","active":true},{"id":2,"name":"Bob","active":false}]'
    },
    {
      name: "Nested Object",
      json: '{"user":{"personal":{"name":"Jane","age":25},"contact":{"email":"jane@example.com","phone":"010-1234-5678"}},"settings":{"theme":"dark","notifications":true}}'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON Formatter</h1>
        <p className="text-muted-foreground">
          JSON 문자열을 입력하여 보기 좋게 포맷팅하고 유효성을 검사하세요
        </p>
      </div>

      <Separator />

      {/* Sample JSON buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium self-center">샘플 JSON:</span>
        {sampleJsons.map((sample, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => loadSampleJson(sample.json)}
          >
            {sample.name}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInputJson("")}
        >
          Clear
        </Button>
      </div>

      {/* Main Content: Input and Output */}
      <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-2">
        {/* Left: JSON Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              JSON 입력
            </CardTitle>
            <CardDescription>
              JSON 문자열을 입력하거나 붙여넣으세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                placeholder="JSON 문자열을 입력하세요... 예: {&quot;name&quot;: &quot;John&quot;, &quot;age&quot;: 30}"
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className={`min-h-[500px] font-mono text-sm resize-none ${
                  error ? "border-red-500 focus:border-red-500" : ""
                }`}
              />

              {/* Error display */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                      JSON 구문 오류
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error.message}
                    </p>
                    {(error.line || error.column) && (
                      <p className="text-red-600 dark:text-red-400 text-xs">
                        위치: {error.line && `줄 ${error.line}`}{error.line && error.column && ", "}{error.column && `열 ${error.column}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Success indicator */}
              {!error && inputJson.trim() && formattedJson && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  유효한 JSON입니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Formatted JSON Output */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>포맷된 JSON</CardTitle>
                <CardDescription>
                  입력한 JSON이 보기 좋게 포맷됩니다
                </CardDescription>
              </div>
              {formattedJson && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className={`transition-all duration-200 ${
                      copied ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-2">복사</span>
                  </Button>

                  {/* Diagonal "Copied" overlay */}
                  {showCopiedTooltip && (
                    <div className="absolute -inset-2 pointer-events-none z-50">
                      <div className="absolute top-0 right-0 transform rotate-12 translate-x-1 -translate-y-1">
                        <div className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg animate-in zoom-in-95 fade-in-0 duration-300">
                          Copied!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {formattedJson ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap break-words">
                  {formattedJson}
                </pre>
              ) : inputJson.trim() && error ? (
                <div className="bg-muted/50 p-4 rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>유효한 JSON을 입력하면 포맷된 결과가 여기에 표시됩니다</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileJson className="h-8 w-8 mx-auto mb-2" />
                    <p>JSON을 입력하면 포맷된 결과가 여기에 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}