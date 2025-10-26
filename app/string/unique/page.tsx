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
import { Fingerprint, Copy, Check } from "lucide-react"

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

type Statistics = {
  totalCount: number
  uniqueCount: number
  duplicateCount: number
}

type ItemCount = {
  item: string
  count: number
}

export default function UniquePage() {
  const [inputText, setInputText] = useState("")
  const [delimiter, setDelimiter] = useState<DelimiterType>('comma')
  const [uniqueItems, setUniqueItems] = useState<string[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalCount: 0,
    uniqueCount: 0,
    duplicateCount: 0,
  })
  const [itemCounts, setItemCounts] = useState<ItemCount[]>([])
  const [copied, setCopied] = useState(false)

  // Process the text whenever inputs change
  useEffect(() => {
    if (!inputText.trim()) {
      setUniqueItems([])
      setStatistics({
        totalCount: 0,
        uniqueCount: 0,
        duplicateCount: 0,
      })
      setItemCounts([])
      return
    }

    const delimiterValue = DELIMITER_MAP[delimiter].value

    // Split and clean inputs
    const items = inputText
      .split(delimiterValue)
      .map(item => item.trim())
      .filter(item => item !== '')

    const totalCount = items.length
    const unique = Array.from(new Set(items)).sort()
    const uniqueCount = unique.length
    const duplicateCount = totalCount - uniqueCount

    // Count occurrences of each item
    const countMap = new Map<string, number>()
    items.forEach(item => {
      countMap.set(item, (countMap.get(item) || 0) + 1)
    })

    // Convert to array and sort by count (descending)
    const counts: ItemCount[] = Array.from(countMap.entries())
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)

    setUniqueItems(unique)
    setStatistics({
      totalCount,
      uniqueCount,
      duplicateCount,
    })
    setItemCounts(counts)
  }, [inputText, delimiter])

  // Copy functionality
  const copyToClipboard = async () => {
    if (uniqueItems.length === 0) return

    const delimiterValue = DELIMITER_MAP[delimiter].value
    const separator = typeof delimiterValue === 'string'
      ? delimiterValue
      : (delimiter === 'space' ? ' ' : ',')

    const text = uniqueItems.join(separator)

    try {
      await navigator.clipboard.writeText(text)
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
  }

  // Format output based on delimiter
  const formatOutput = () => {
    if (uniqueItems.length === 0) return ''

    const delimiterValue = DELIMITER_MAP[delimiter].value
    const separator = typeof delimiterValue === 'string'
      ? delimiterValue
      : (delimiter === 'space' ? ' ' : ',')

    return uniqueItems.join(separator)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unique</h1>
        <p className="text-muted-foreground">
          입력된 텍스트에서 중복을 제거하고 고유한 값만 추출하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-6 w-6" />
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

        {/* Input/Output Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>입력</CardTitle>
              <CardDescription>
                처리할 텍스트를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`텍스트를 입력하세요...\n예시: apple, banana, apple, cherry, banana, date`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[350px] font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>중복 제거 결과</CardTitle>
                  <CardDescription>
                    정렬된 고유한 값들
                  </CardDescription>
                </div>
                {uniqueItems.length > 0 && (
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
              {uniqueItems.length > 0 ? (
                <div className="relative">
                  <Textarea
                    value={formatOutput()}
                    readOnly
                    className="min-h-[350px] font-mono text-sm resize-none bg-muted"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {uniqueItems.length}개 항목 (알파벳순 정렬됨)
                  </div>
                </div>
              ) : (
                <div className="min-h-[350px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm">
                    입력 텍스트를 입력하면 중복이 제거된 결과가 여기에 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Card */}
        {inputText.trim() && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>통계</CardTitle>
              <CardDescription>
                입력된 데이터의 통계 정보
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">전체 항목</p>
                  <p className="text-3xl font-bold">{statistics.totalCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">고유 항목</p>
                  <p className="text-3xl font-bold text-primary">{statistics.uniqueCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">중복 항목</p>
                  <p className="text-3xl font-bold text-destructive">{statistics.duplicateCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Item Count Card */}
        {itemCounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>요소별 카운트</CardTitle>
              <CardDescription>
                각 요소가 등장한 횟수 (많은 순서대로 정렬)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  {itemCounts.map(({ item, count }, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="font-mono text-sm flex-1 truncate pr-4" title={item}>
                        {item}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 bg-primary/20 rounded-full overflow-hidden min-w-[100px]">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                              width: `${(count / itemCounts[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-sm min-w-[3ch] text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Example Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-3">
              <p className="font-medium">💡 사용 예시</p>
              <div className="space-y-2">
                <div>
                  <p className="font-medium">입력:</p>
                  <pre className="bg-background p-2 rounded mt-1 text-xs font-mono">
apple, banana, apple, cherry, banana, date, apple
                  </pre>
                </div>
                <div>
                  <p className="font-medium">결과:</p>
                  <pre className="bg-background p-2 rounded mt-1 text-xs font-mono">
apple, banana, cherry, date
                  </pre>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    ✓ 전체 7개 항목 → 중복 제거 후 4개 항목 (3개 중복)
                    <br />
                    ✓ 알파벳순으로 자동 정렬됨
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
