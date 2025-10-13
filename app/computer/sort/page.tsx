"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowDownAZ, Copy, Check } from "lucide-react"

type DelimiterType = 'newline' | 'comma' | 'space' | 'dash' | 'semicolon' | 'pipe' | 'tab'
type SortOrder = 'asc' | 'desc'
type SortMethod = 'string' | 'number' | 'length'

const DELIMITER_MAP: Record<DelimiterType, { label: string; value: string }> = {
  newline: { label: '줄바꿈 (\\n)', value: '\n' },
  comma: { label: '쉼표 (,)', value: ',' },
  space: { label: '공백 ( )', value: ' ' },
  dash: { label: '대시 (-)', value: '-' },
  semicolon: { label: '세미콜론 (;)', value: ';' },
  pipe: { label: '파이프 (|)', value: '|' },
  tab: { label: '탭 (\\t)', value: '\t' },
}

export default function SortPage() {
  const [inputText, setInputText] = useState("")
  const [inputDelimiter, setInputDelimiter] = useState<DelimiterType>('newline')
  const [outputDelimiter, setOutputDelimiter] = useState<DelimiterType>('newline')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [sortMethod, setSortMethod] = useState<SortMethod>('string')
  const [removeDuplicates, setRemoveDuplicates] = useState(false)
  const [removeEmpty, setRemoveEmpty] = useState(true)
  const [outputText, setOutputText] = useState("")
  const [copied, setCopied] = useState(false)

  // Process the text whenever inputs change
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("")
      return
    }

    const inputDelimiterValue = DELIMITER_MAP[inputDelimiter].value
    const outputDelimiterValue = DELIMITER_MAP[outputDelimiter].value

    // Split the input by the selected delimiter
    let parts = inputText.split(inputDelimiterValue)

    // Remove empty parts if option is enabled
    if (removeEmpty) {
      parts = parts.filter(part => part.trim() !== '')
    }

    // Trim whitespace from each part
    parts = parts.map(part => part.trim())

    // Remove duplicates if option is enabled
    if (removeDuplicates) {
      parts = Array.from(new Set(parts))
    }

    // Sort based on method
    const sorted = [...parts].sort((a, b) => {
      let comparison = 0

      switch (sortMethod) {
        case 'string':
          comparison = a.localeCompare(b, 'ko-KR')
          break
        case 'number':
          const numA = parseFloat(a)
          const numB = parseFloat(b)
          // Handle NaN values - put them at the end
          if (isNaN(numA) && isNaN(numB)) comparison = 0
          else if (isNaN(numA)) comparison = 1
          else if (isNaN(numB)) comparison = -1
          else comparison = numA - numB
          break
        case 'length':
          comparison = a.length - b.length
          break
      }

      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Join with output delimiter
    setOutputText(sorted.join(outputDelimiterValue))
  }, [inputText, inputDelimiter, outputDelimiter, sortOrder, sortMethod, removeDuplicates, removeEmpty])

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
  }

  // Reset to defaults
  const resetSettings = () => {
    setInputDelimiter('newline')
    setOutputDelimiter('newline')
    setSortOrder('asc')
    setSortMethod('string')
    setRemoveDuplicates(false)
    setRemoveEmpty(true)
  }

  // Count items
  const inputCount = inputText.trim()
    ? inputText.split(DELIMITER_MAP[inputDelimiter].value).filter(p => removeEmpty ? p.trim() : true).length
    : 0
  const outputCount = outputText.trim()
    ? outputText.split(DELIMITER_MAP[outputDelimiter].value).filter(p => p.trim()).length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sort</h1>
        <p className="text-muted-foreground">
          텍스트를 구분자로 나누고 다양한 방식으로 정렬하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownAZ className="h-6 w-6" />
              정렬 설정
            </CardTitle>
            <CardDescription>
              구분자와 정렬 방식을 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delimiters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="input-delimiter">입력 구분자</Label>
                <Select value={inputDelimiter} onValueChange={(value) => setInputDelimiter(value as DelimiterType)}>
                  <SelectTrigger id="input-delimiter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DELIMITER_MAP).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="output-delimiter">출력 구분자</Label>
                <Select value={outputDelimiter} onValueChange={(value) => setOutputDelimiter(value as DelimiterType)}>
                  <SelectTrigger id="output-delimiter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DELIMITER_MAP).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Method */}
            <div className="space-y-3">
              <Label>정렬 방식</Label>
              <RadioGroup value={sortMethod} onValueChange={(value) => setSortMethod(value as SortMethod)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="string" id="string" />
                  <Label htmlFor="string" className="font-normal cursor-pointer">
                    문자열 비교 (사전순 정렬)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="number" id="number" />
                  <Label htmlFor="number" className="font-normal cursor-pointer">
                    숫자 비교 (숫자로 변환하여 정렬)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="length" id="length" />
                  <Label htmlFor="length" className="font-normal cursor-pointer">
                    길이 비교 (문자열 길이 기준 정렬)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sort Order */}
            <div className="space-y-3">
              <Label>정렬 순서</Label>
              <RadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="asc" id="asc" />
                  <Label htmlFor="asc" className="font-normal cursor-pointer">
                    오름차순 (A → Z, 작은 수 → 큰 수, 짧은 것 → 긴 것)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="desc" id="desc" />
                  <Label htmlFor="desc" className="font-normal cursor-pointer">
                    내림차순 (Z → A, 큰 수 → 작은 수, 긴 것 → 짧은 것)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label>추가 옵션</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-duplicates"
                    checked={removeDuplicates}
                    onCheckedChange={(checked) => setRemoveDuplicates(checked as boolean)}
                  />
                  <Label htmlFor="remove-duplicates" className="font-normal cursor-pointer">
                    중복 제거
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-empty"
                    checked={removeEmpty}
                    onCheckedChange={(checked) => setRemoveEmpty(checked as boolean)}
                  />
                  <Label htmlFor="remove-empty" className="font-normal cursor-pointer">
                    빈 항목 제거
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetSettings}>
                설정 초기화
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
                정렬할 텍스트를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`텍스트를 입력하세요...\n예시:\nbanana\napple\ncherry`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {inputCount}개 항목
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>결과</CardTitle>
                  <CardDescription>
                    정렬된 텍스트
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
              {outputText ? (
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[400px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {outputCount}개 항목
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    입력 텍스트를 입력하면 결과가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-3">
              <p className="font-medium">사용 예시</p>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">예시 1: 문자열 오름차순 정렬</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">입력:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono">
banana{'\n'}apple{'\n'}cherry
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">결과:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono">
apple{'\n'}banana{'\n'}cherry
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium">예시 2: 숫자 내림차순 정렬</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">입력:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono">
10, 2, 100, 5
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">결과 (숫자 비교, 내림차순):</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono">
100, 10, 5, 2
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium">예시 3: 길이 정렬</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">입력:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono">
hello-world-programming
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">결과 (길이 비교, 오름차순):</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono">
world-hello-programming
                      </pre>
                    </div>
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
