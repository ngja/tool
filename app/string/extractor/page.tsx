"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scissors, Copy, Check, AlertCircle } from "lucide-react"

type ExtractionMode = 'split' | 'position' | 'delimiter' | 'regex'

export default function StringExtractorPage() {
  const [inputText, setInputText] = useState("")
  const [mode, setMode] = useState<ExtractionMode>('split')

  // Split mode (new default)
  const [splitDelimiter, setSplitDelimiter] = useState(",")
  const [splitIndex, setSplitIndex] = useState(0)

  // Position mode
  const [startPos, setStartPos] = useState(0)
  const [endPos, setEndPos] = useState(10)

  // Delimiter mode
  const [startDelimiter, setStartDelimiter] = useState("[")
  const [endDelimiter, setEndDelimiter] = useState("]")
  const [includeDelimiters, setIncludeDelimiters] = useState(false)

  // Regex mode
  const [regexPattern, setRegexPattern] = useState("\\d+")
  const [regexFlags, setRegexFlags] = useState("g")

  const [outputText, setOutputText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Extract text based on mode
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("")
      setError(null)
      return
    }

    try {
      const lines = inputText.split('\n')
      let results: string[] = []

      if (mode === 'split') {
        results = lines.map(line => {
          const parts = line.split(splitDelimiter)
          const index = splitIndex < 0 ? parts.length + splitIndex : splitIndex
          return parts[index] || ''
        }).filter(line => line.trim() !== '')

      } else if (mode === 'position') {
        results = lines.map(line => {
          const start = Math.max(0, startPos)
          const end = Math.min(line.length, endPos)
          return line.substring(start, end)
        }).filter(line => line !== '')

      } else if (mode === 'delimiter') {
        results = lines.flatMap(line => {
          const parts: string[] = []
          let currentIndex = 0

          while (currentIndex < line.length) {
            const startIndex = line.indexOf(startDelimiter, currentIndex)
            if (startIndex === -1) break

            const endIndex = line.indexOf(endDelimiter, startIndex + startDelimiter.length)
            if (endIndex === -1) break

            if (includeDelimiters) {
              parts.push(line.substring(startIndex, endIndex + endDelimiter.length))
            } else {
              parts.push(line.substring(startIndex + startDelimiter.length, endIndex))
            }

            currentIndex = endIndex + endDelimiter.length
          }

          return parts
        }).filter(part => part !== '')

      } else if (mode === 'regex') {
        try {
          const regex = new RegExp(regexPattern, regexFlags)
          results = lines.flatMap(line => {
            const matches = Array.from(line.matchAll(regex))
            return matches.map(match => match[0])
          }).filter(match => match !== '')
        } catch (err) {
          setError("유효하지 않은 정규식입니다")
          setOutputText("")
          return
        }
      }

      setOutputText(results.join('\n'))
      setError(null)
    } catch (err) {
      setError("텍스트 추출 중 오류가 발생했습니다")
      setOutputText("")
    }
  }, [inputText, mode, splitDelimiter, splitIndex, startPos, endPos, startDelimiter, endDelimiter, includeDelimiters, regexPattern, regexFlags])

  // Copy functionality
  const copyToClipboard = async () => {
    if (!outputText) return

    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Clear all
  const clearAll = () => {
    setInputText("")
    setOutputText("")
    setError(null)
  }

  // Load example
  const loadExample = () => {
    if (mode === 'split') {
      setInputText("apple,banana,cherry\ndog,cat,bird\nred,green,blue")
      setSplitDelimiter(",")
      setSplitIndex(1)
    } else if (mode === 'position') {
      setInputText("Hello World\nGreetings from Korea\nWelcome to the future")
      setStartPos(0)
      setEndPos(5)
    } else if (mode === 'delimiter') {
      setInputText("Name: [John], Age: [30]\nName: [Alice], Age: [25]\nName: [Bob], Age: [35]")
      setStartDelimiter("[")
      setEndDelimiter("]")
      setIncludeDelimiters(false)
    } else if (mode === 'regex') {
      setInputText("Order #12345 costs $99.99\nOrder #67890 costs $149.50\nOrder #11111 costs $25.00")
      setRegexPattern("\\d+")
      setRegexFlags("g")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">String Extractor</h1>
        <p className="text-muted-foreground">
          텍스트에서 원하는 부분만 추출하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-6 w-6" />
              추출 설정
            </CardTitle>
            <CardDescription>
              추출 방법을 선택하고 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => setMode(value as ExtractionMode)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="split">구분자 분할</TabsTrigger>
                <TabsTrigger value="position">위치 기반</TabsTrigger>
                <TabsTrigger value="delimiter">범위 추출</TabsTrigger>
                <TabsTrigger value="regex">정규식</TabsTrigger>
              </TabsList>

              {/* Split Mode (New Default) */}
              <TabsContent value="split" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="splitDelimiter">구분자</Label>
                    <Input
                      id="splitDelimiter"
                      value={splitDelimiter}
                      onChange={(e) => setSplitDelimiter(e.target.value)}
                      placeholder="예: ,"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="splitIndex">추출할 인덱스 (0부터)</Label>
                    <Input
                      id="splitIndex"
                      type="number"
                      value={splitIndex}
                      onChange={(e) => setSplitIndex(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">자주 사용하는 구분자:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSplitDelimiter(",")}>
                      쉼표 (,)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSplitDelimiter("\t")}>
                      탭
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSplitDelimiter(" ")}>
                      공백
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSplitDelimiter("|")}>
                      파이프 (|)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSplitDelimiter(";")}>
                      세미콜론 (;)
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  각 줄을 "{splitDelimiter}"로 나눈 후 {splitIndex}번째 항목을 추출합니다
                  {splitIndex < 0 && ` (음수는 뒤에서부터: -1 = 마지막 항목)`}
                </p>
              </TabsContent>

              {/* Position Mode */}
              <TabsContent value="position" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startPos">시작 위치 (0부터)</Label>
                    <Input
                      id="startPos"
                      type="number"
                      value={startPos}
                      onChange={(e) => setStartPos(parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endPos">끝 위치</Label>
                    <Input
                      id="endPos"
                      type="number"
                      value={endPos}
                      onChange={(e) => setEndPos(parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  각 줄에서 {startPos}번째 문자부터 {endPos}번째 문자까지 추출합니다
                </p>
              </TabsContent>

              {/* Delimiter Mode */}
              <TabsContent value="delimiter" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDelimiter">시작 구분자</Label>
                    <Input
                      id="startDelimiter"
                      value={startDelimiter}
                      onChange={(e) => setStartDelimiter(e.target.value)}
                      placeholder="예: ["
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDelimiter">끝 구분자</Label>
                    <Input
                      id="endDelimiter"
                      value={endDelimiter}
                      onChange={(e) => setEndDelimiter(e.target.value)}
                      placeholder="예: ]"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeDelimiters"
                    checked={includeDelimiters}
                    onChange={(e) => setIncludeDelimiters(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="includeDelimiters" className="cursor-pointer">
                    구분자 포함하여 추출
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  "{startDelimiter}"와 "{endDelimiter}" 사이의 텍스트를 추출합니다
                </p>
              </TabsContent>

              {/* Regex Mode */}
              <TabsContent value="regex" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="regexPattern">정규식 패턴</Label>
                    <Input
                      id="regexPattern"
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      placeholder="예: \\d+"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regexFlags">플래그</Label>
                    <Input
                      id="regexFlags"
                      value={regexFlags}
                      onChange={(e) => setRegexFlags(e.target.value)}
                      placeholder="예: g, gi"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">자주 사용하는 패턴:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRegexPattern("\\d+")}>
                      숫자
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRegexPattern("[a-zA-Z]+")}>
                      영문자
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRegexPattern("\\w+@\\w+\\.\\w+")}>
                      이메일
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRegexPattern("https?://[^\\s]+")}>
                      URL
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRegexPattern("#\\w+")}>
                      해시태그
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  정규식 패턴과 일치하는 모든 텍스트를 추출합니다
                </p>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={loadExample}>
                예시 불러오기
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                전체 지우기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input/Output Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>입력</CardTitle>
              <CardDescription>
                추출할 텍스트를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="텍스트를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {inputText.split('\n').filter(l => l.trim()).length}줄
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>추출 결과</CardTitle>
                  <CardDescription>
                    추출된 텍스트
                  </CardDescription>
                </div>
                {outputText && (
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
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="min-h-[400px] flex items-center justify-center bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
                    <p className="text-destructive font-medium">{error}</p>
                  </div>
                </div>
              ) : outputText ? (
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[400px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {outputText.split('\n').filter(l => l.trim()).length}개 추출됨
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    입력 텍스트를 입력하면 추출 결과가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
