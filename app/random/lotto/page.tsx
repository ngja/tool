"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sparkles, RotateCcw, Trash2 } from "lucide-react"

type LottoResult = {
  id: string
  numbers: number[]
  timestamp: Date
}

export default function LottoPage() {
  const [minNumber, setMinNumber] = useState(1)
  const [maxNumber, setMaxNumber] = useState(45)
  const [count, setCount] = useState(6)
  const [results, setResults] = useState<LottoResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const validateInputs = (): boolean => {
    setError(null)

    if (minNumber >= maxNumber) {
      setError("최소값은 최대값보다 작아야 합니다")
      return false
    }

    const range = maxNumber - minNumber + 1
    if (count > range) {
      setError(`선택 가능한 숫자는 최대 ${range}개입니다`)
      return false
    }

    if (count < 1) {
      setError("최소 1개 이상의 숫자를 선택해야 합니다")
      return false
    }

    if (minNumber < 0 || maxNumber < 0) {
      setError("음수는 사용할 수 없습니다")
      return false
    }

    return true
  }

  const generateNumbers = () => {
    if (!validateInputs()) {
      return
    }

    // Generate random numbers without duplicates
    const numbers: number[] = []
    const availableNumbers = Array.from(
      { length: maxNumber - minNumber + 1 },
      (_, i) => minNumber + i
    )

    // Fisher-Yates shuffle algorithm
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      numbers.push(availableNumbers[randomIndex])
      availableNumbers.splice(randomIndex, 1)
    }

    // Sort numbers in ascending order
    numbers.sort((a, b) => a - b)

    const newResult: LottoResult = {
      id: Date.now().toString(),
      numbers,
      timestamp: new Date()
    }

    setResults([newResult, ...results])
  }

  const clearResults = () => {
    setResults([])
  }

  const removeResult = (id: string) => {
    setResults(results.filter(result => result.id !== id))
  }

  const formatTimestamp = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // Get lotto ball color based on number (Korean Lotto style)
  const getLottoColor = (number: number) => {
    if (number >= 1 && number <= 10) {
      return { bg: '#FBC400', text: '#000000' } // Yellow
    } else if (number >= 11 && number <= 20) {
      return { bg: '#69C8F2', text: '#000000' } // Blue
    } else if (number >= 21 && number <= 30) {
      return { bg: '#FF7272', text: '#FFFFFF' } // Red
    } else if (number >= 31 && number <= 40) {
      return { bg: '#AAAAAA', text: '#000000' } // Gray
    } else if (number >= 41 && number <= 50) {
      return { bg: '#B0D840', text: '#000000' } // Green
    } else {
      // Default color for numbers outside typical lotto range
      return { bg: '#6366F1', text: '#FFFFFF' } // Indigo
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lotto</h1>
        <p className="text-muted-foreground">
          숫자 범위와 개수를 입력하여 랜덤 번호를 추출하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-4xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              번호 추출 설정
            </CardTitle>
            <CardDescription>
              추출할 숫자의 범위와 개수를 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minNumber">최소값</Label>
                <Input
                  id="minNumber"
                  type="number"
                  value={minNumber}
                  onChange={(e) => setMinNumber(parseInt(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxNumber">최대값</Label>
                <Input
                  id="maxNumber"
                  type="number"
                  value={maxNumber}
                  onChange={(e) => setMaxNumber(parseInt(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Count */}
            <div className="space-y-2">
              <Label htmlFor="count">추출 개수</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                className="text-lg"
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                {minNumber}부터 {maxNumber}까지 총 {maxNumber - minNumber + 1}개의 숫자 중에서 선택
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateNumbers}
              size="lg"
              className="w-full text-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              번호 추출하기
            </Button>

            {/* Quick Presets */}
            <div className="space-y-2">
              <Label>빠른 설정</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinNumber(1)
                    setMaxNumber(45)
                    setCount(6)
                  }}
                >
                  로또 6/45
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinNumber(1)
                    setMaxNumber(100)
                    setCount(10)
                  }}
                >
                  1-100 중 10개
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinNumber(1)
                    setMaxNumber(20)
                    setCount(5)
                  }}
                >
                  1-20 중 5개
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>추출 결과</CardTitle>
                  <CardDescription>
                    총 {results.length}개의 결과
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearResults}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  전체 삭제
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {result.numbers.map((number, index) => {
                        const color = getLottoColor(number)
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shadow-md"
                            style={{
                              backgroundColor: color.bg,
                              color: color.text
                            }}
                          >
                            {number}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(result.timestamp)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResult(result.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">💡 사용 팁</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>중복되지 않는 숫자가 추출됩니다</li>
                <li>결과는 자동으로 오름차순 정렬됩니다</li>
                <li>추출 개수는 숫자 범위를 초과할 수 없습니다</li>
                <li>여러 번 추출하여 결과를 비교할 수 있습니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
