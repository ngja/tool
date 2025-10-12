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
import { Type, Copy, Check } from "lucide-react"

type DelimiterType = 'newline' | 'comma' | 'period' | 'space' | 'dash' | 'underscore' | 'colon'

const DELIMITER_MAP: Record<DelimiterType, { label: string; value: string }> = {
  newline: { label: '줄바꿈', value: '\n' },
  comma: { label: '쉼표 (,)', value: ',' },
  period: { label: '마침표 (.)', value: '.' },
  space: { label: '공백', value: ' ' },
  dash: { label: '대시 (-)', value: '-' },
  underscore: { label: '밑줄 (_)', value: '_' },
  colon: { label: '콜론 (:)', value: ':' },
}

export default function StringManipulatorPage() {
  const [inputText, setInputText] = useState("")
  const [prefix, setPrefix] = useState("'")
  const [suffix, setSuffix] = useState("',")
  const [delimiter, setDelimiter] = useState<DelimiterType>('newline')
  const [outputText, setOutputText] = useState("")
  const [copied, setCopied] = useState(false)

  // Process the text whenever inputs change
  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText("")
      return
    }

    const delimiterValue = DELIMITER_MAP[delimiter].value

    // Split the input by the selected delimiter
    const parts = inputText.split(delimiterValue)

    // Add prefix and suffix to each non-empty part
    const processed = parts
      .filter(part => part.trim() !== '') // Remove empty parts
      .map(part => `${prefix}${part.trim()}${suffix}`)
      .join(delimiterValue)

    setOutputText(processed)
  }, [inputText, prefix, suffix, delimiter])

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
    setPrefix("'")
    setSuffix("'")
    setDelimiter('newline')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">String Manipulator</h1>
        <p className="text-muted-foreground">
          문자열을 구분자로 나누고 각 부분에 접두사와 접미사를 추가하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-6 w-6" />
              조작 설정
            </CardTitle>
            <CardDescription>
              문자열 앞뒤에 추가할 텍스트와 구분자를 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prefix */}
              <div className="space-y-2">
                <Label htmlFor="prefix">앞에 붙일 텍스트</Label>
                <Input
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="예: '"
                  className="font-mono"
                />
              </div>

              {/* Suffix */}
              <div className="space-y-2">
                <Label htmlFor="suffix">뒤에 붙일 텍스트</Label>
                <Input
                  id="suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="예: '"
                  className="font-mono"
                />
              </div>

              {/* Delimiter */}
              <div className="space-y-2">
                <Label htmlFor="delimiter">구분자</Label>
                <Select value={delimiter} onValueChange={(value) => setDelimiter(value as DelimiterType)}>
                  <SelectTrigger id="delimiter">
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
                처리할 문자열을 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`텍스트를 입력하세요...\n예시:\napple\nbanana\ncherry`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {inputText.split(DELIMITER_MAP[delimiter].value).filter(p => p.trim()).length}개 항목
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
                    처리된 문자열
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
              <p className="font-medium">💡 사용 예시</p>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">입력:</p>
                  <pre className="bg-background p-2 rounded mt-1 text-xs font-mono">
apple{'\n'}banana{'\n'}cherry
                  </pre>
                </div>
                <div>
                  <p className="font-medium">설정: 앞 = ', 뒤 = ', 구분자 = 줄바꿈</p>
                </div>
                <div>
                  <p className="font-medium">결과:</p>
                  <pre className="bg-background p-2 rounded mt-1 text-xs font-mono">
'apple'{'\n'}'banana'{'\n'}'cherry'
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
