"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
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
import { Binary, Copy, Check } from "lucide-react"

type DelimiterType = 'comma' | 'space' | 'newline' | 'semicolon' | 'colon' | 'dash' | 'pipe'

const DELIMITER_MAP: Record<DelimiterType, { label: string; value: string | RegExp }> = {
  comma: { label: '쉼표 (,)', value: ',' },
  space: { label: '띄어쓰기', value: /\s+/ },
  newline: { label: '줄바꿈', value: '\n' },
  semicolon: { label: '세미콜론 (;)', value: ';' },
  colon: { label: '콜론 (:)', value: ':' },
  dash: { label: '대시 (-)', value: '-' },
  pipe: { label: '파이프 (|)', value: '|' },
}

type SetResult = {
  union: string[]
  intersection: string[]
  diffAB: string[]
  diffBA: string[]
}

export default function SetOperationsPage() {
  const [inputA, setInputA] = useState("")
  const [inputB, setInputB] = useState("")
  const [delimiter, setDelimiter] = useState<DelimiterType>('comma')
  const [result, setResult] = useState<SetResult>({
    union: [],
    intersection: [],
    diffAB: [],
    diffBA: [],
  })
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  // Calculate set operations whenever inputs change
  useEffect(() => {
    if (!inputA.trim() && !inputB.trim()) {
      setResult({
        union: [],
        intersection: [],
        diffAB: [],
        diffBA: [],
      })
      return
    }

    const delimiterValue = DELIMITER_MAP[delimiter].value

    // Split and clean inputs
    const setA = new Set(
      inputA
        .split(delimiterValue)
        .map(item => item.trim())
        .filter(item => item !== '')
    )

    const setB = new Set(
      inputB
        .split(delimiterValue)
        .map(item => item.trim())
        .filter(item => item !== '')
    )

    // Union: A ∪ B
    const union = Array.from(new Set([...setA, ...setB])).sort()

    // Intersection: A ∩ B
    const intersection = Array.from(setA).filter(item => setB.has(item)).sort()

    // Difference A - B
    const diffAB = Array.from(setA).filter(item => !setB.has(item)).sort()

    // Difference B - A
    const diffBA = Array.from(setB).filter(item => !setA.has(item)).sort()

    setResult({
      union,
      intersection,
      diffAB,
      diffBA,
    })
  }, [inputA, inputB, delimiter])

  // Copy functionality
  const copyToClipboard = async (text: string, section: string) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)

      setTimeout(() => {
        setCopiedSection(null)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Clear all
  const clearAll = () => {
    setInputA("")
    setInputB("")
  }

  // Format output based on delimiter
  const formatOutput = (items: string[]) => {
    if (items.length === 0) return ''

    const delimiterValue = DELIMITER_MAP[delimiter].value
    const separator = typeof delimiterValue === 'string'
      ? delimiterValue
      : (delimiter === 'space' ? ' ' : ',')

    return items.join(separator)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Set Operations</h1>
        <p className="text-muted-foreground">
          두 텍스트 집합의 합집합, 교집합, 차집합을 계산하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Binary className="h-6 w-6" />
              구분자 설정
            </CardTitle>
            <CardDescription>
              입력 텍스트를 나눌 구분자를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Action Button */}
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={clearAll}>
                  전체 지우기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input A Card */}
          <Card>
            <CardHeader>
              <CardTitle>집합 A</CardTitle>
              <CardDescription>
                첫 번째 텍스트를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`텍스트를 입력하세요...\n예시: apple, banana, cherry`}
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                className="min-h-[250px] font-mono text-sm resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {new Set(inputA.split(DELIMITER_MAP[delimiter].value).map(s => s.trim()).filter(s => s)).size}개 항목
              </div>
            </CardContent>
          </Card>

          {/* Input B Card */}
          <Card>
            <CardHeader>
              <CardTitle>집합 B</CardTitle>
              <CardDescription>
                두 번째 텍스트를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`텍스트를 입력하세요...\n예시: banana, date, elderberry`}
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                className="min-h-[250px] font-mono text-sm resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {new Set(inputB.split(DELIMITER_MAP[delimiter].value).map(s => s.trim()).filter(s => s)).size}개 항목
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Union */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>합집합 (A ∪ B)</CardTitle>
                  <CardDescription>
                    두 집합의 모든 요소
                  </CardDescription>
                </div>
                {result.union.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatOutput(result.union), 'union')}
                    className={`transition-all duration-200 ${
                      copiedSection === 'union' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {copiedSection === 'union' ? (
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
              {result.union.length > 0 ? (
                <div className="relative">
                  <Textarea
                    value={formatOutput(result.union)}
                    readOnly
                    className="min-h-[150px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.union.length}개 항목
                  </div>
                </div>
              ) : (
                <div className="min-h-[150px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    결과가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intersection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>교집합 (A ∩ B)</CardTitle>
                  <CardDescription>
                    두 집합에 모두 포함된 요소
                  </CardDescription>
                </div>
                {result.intersection.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatOutput(result.intersection), 'intersection')}
                    className={`transition-all duration-200 ${
                      copiedSection === 'intersection' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {copiedSection === 'intersection' ? (
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
              {result.intersection.length > 0 ? (
                <div className="relative">
                  <Textarea
                    value={formatOutput(result.intersection)}
                    readOnly
                    className="min-h-[150px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.intersection.length}개 항목
                  </div>
                </div>
              ) : (
                <div className="min-h-[150px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    결과가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difference A - B */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>차집합 (A - B)</CardTitle>
                  <CardDescription>
                    A에만 있는 요소
                  </CardDescription>
                </div>
                {result.diffAB.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatOutput(result.diffAB), 'diffAB')}
                    className={`transition-all duration-200 ${
                      copiedSection === 'diffAB' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {copiedSection === 'diffAB' ? (
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
              {result.diffAB.length > 0 ? (
                <div className="relative">
                  <Textarea
                    value={formatOutput(result.diffAB)}
                    readOnly
                    className="min-h-[150px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.diffAB.length}개 항목
                  </div>
                </div>
              ) : (
                <div className="min-h-[150px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    결과가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difference B - A */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>차집합 (B - A)</CardTitle>
                  <CardDescription>
                    B에만 있는 요소
                  </CardDescription>
                </div>
                {result.diffBA.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formatOutput(result.diffBA), 'diffBA')}
                    className={`transition-all duration-200 ${
                      copiedSection === 'diffBA' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {copiedSection === 'diffBA' ? (
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
              {result.diffBA.length > 0 ? (
                <div className="relative">
                  <Textarea
                    value={formatOutput(result.diffBA)}
                    readOnly
                    className="min-h-[150px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.diffBA.length}개 항목
                  </div>
                </div>
              ) : (
                <div className="min-h-[150px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    결과가 여기에 표시됩니다
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
                  <p className="font-medium">집합 A:</p>
                  <pre className="bg-background p-2 rounded mt-1 text-xs font-mono">
apple, banana, cherry, date
                  </pre>
                </div>
                <div>
                  <p className="font-medium">집합 B:</p>
                  <pre className="bg-background p-2 rounded mt-1 text-xs font-mono">
banana, date, elderberry, fig
                  </pre>
                </div>
                <div>
                  <p className="font-medium">결과:</p>
                  <ul className="bg-background p-2 rounded mt-1 text-xs font-mono space-y-1">
                    <li>• 합집합: apple, banana, cherry, date, elderberry, fig</li>
                    <li>• 교집합: banana, date</li>
                    <li>• A - B: apple, cherry</li>
                    <li>• B - A: elderberry, fig</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
