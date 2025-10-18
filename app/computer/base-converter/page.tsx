"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Binary, Copy, Check, AlertCircle, ArrowRight } from "lucide-react"

type BaseType = 2 | 8 | 10 | 16

type BaseInfo = {
  name: string
  description: string
  validChars: string
  example: string
}

const BASE_INFO: Record<BaseType, BaseInfo> = {
  2: {
    name: '2진법 (Binary)',
    description: '0, 1만 사용',
    validChars: '01',
    example: '1010'
  },
  8: {
    name: '8진법 (Octal)',
    description: '0-7 사용',
    validChars: '01234567',
    example: '12'
  },
  10: {
    name: '10진법 (Decimal)',
    description: '0-9 사용',
    validChars: '0123456789',
    example: '10'
  },
  16: {
    name: '16진법 (Hexadecimal)',
    description: '0-9, A-F 사용',
    validChars: '0123456789ABCDEFabcdef',
    example: 'A'
  }
}

export default function BaseConverterPage() {
  const [inputBase, setInputBase] = useState<BaseType>(10)
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string>("")
  const [results, setResults] = useState<Record<BaseType, string>>({
    2: '',
    8: '',
    10: '',
    16: ''
  })
  const [copiedBase, setCopiedBase] = useState<BaseType | null>(null)

  // Validate input based on selected base
  const validateInput = (value: string, base: BaseType): boolean => {
    if (!value.trim()) return true

    const validChars = BASE_INFO[base].validChars
    const trimmedValue = value.trim()

    // Check if all characters are valid for the selected base
    for (let char of trimmedValue) {
      if (!validChars.includes(char)) {
        return false
      }
    }

    return true
  }

  // Convert from any base to decimal using BigInt
  const toDecimal = (value: string, fromBase: BaseType): bigint | null => {
    try {
      const trimmedValue = value.trim().toUpperCase()
      if (!trimmedValue) return null

      // Use BigInt for large number support
      let decimal = 0n
      const base = BigInt(fromBase)

      for (let i = 0; i < trimmedValue.length; i++) {
        const char = trimmedValue[i]
        let digit: number

        if (char >= '0' && char <= '9') {
          digit = char.charCodeAt(0) - '0'.charCodeAt(0)
        } else if (char >= 'A' && char <= 'F') {
          digit = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10
        } else {
          return null
        }

        if (digit >= fromBase) {
          return null
        }

        decimal = decimal * base + BigInt(digit)
      }

      return decimal
    } catch (err) {
      return null
    }
  }

  // Convert from decimal to any base using BigInt
  const fromDecimal = (decimal: bigint, toBase: BaseType): string => {
    try {
      if (decimal === 0n) return '0'

      let result = ''
      let num = decimal
      const base = BigInt(toBase)

      while (num > 0n) {
        const remainder = Number(num % base)
        if (remainder < 10) {
          result = String.fromCharCode('0'.charCodeAt(0) + remainder) + result
        } else {
          result = String.fromCharCode('A'.charCodeAt(0) + remainder - 10) + result
        }
        num = num / base
      }

      return result
    } catch (err) {
      return ''
    }
  }

  // Process conversion whenever input changes
  useEffect(() => {
    setError("")

    if (!inputValue.trim()) {
      setResults({
        2: '',
        8: '',
        10: '',
        16: ''
      })
      return
    }

    // Validate input
    if (!validateInput(inputValue, inputBase)) {
      setError(`입력값이 ${BASE_INFO[inputBase].name}에 맞지 않습니다. ${BASE_INFO[inputBase].description}`)
      setResults({
        2: '',
        8: '',
        10: '',
        16: ''
      })
      return
    }

    // Convert to decimal first
    const decimal = toDecimal(inputValue, inputBase)

    if (decimal === null) {
      setError("변환할 수 없는 값입니다.")
      setResults({
        2: '',
        8: '',
        10: '',
        16: ''
      })
      return
    }

    // Check for negative numbers
    if (decimal < 0n) {
      setError("음수는 변환할 수 없습니다.")
      setResults({
        2: '',
        8: '',
        10: '',
        16: ''
      })
      return
    }

    // Convert to all bases
    const newResults: Record<BaseType, string> = {
      2: fromDecimal(decimal, 2),
      8: fromDecimal(decimal, 8),
      10: fromDecimal(decimal, 10),
      16: fromDecimal(decimal, 16)
    }

    setResults(newResults)
  }, [inputValue, inputBase])

  // Copy to clipboard
  const copyToClipboard = async (base: BaseType) => {
    const text = results[base]
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopiedBase(base)

      setTimeout(() => {
        setCopiedBase(null)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Clear all
  const clearAll = () => {
    setInputValue("")
    setError("")
    setResults({
      2: '',
      8: '',
      10: '',
      16: ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Base Converter</h1>
        <p className="text-muted-foreground">
          숫자를 2진법, 8진법, 10진법, 16진법으로 변환하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Binary className="h-6 w-6" />
              입력
            </CardTitle>
            <CardDescription>
              변환할 숫자와 현재 진법을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Input Base Selection */}
              <div className="space-y-2">
                <Label htmlFor="inputBase">입력 진법</Label>
                <Select
                  value={inputBase.toString()}
                  onValueChange={(value) => setInputBase(Number(value) as BaseType)}
                >
                  <SelectTrigger id="inputBase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2진법 (Binary)</SelectItem>
                    <SelectItem value="8">8진법 (Octal)</SelectItem>
                    <SelectItem value="10">10진법 (Decimal)</SelectItem>
                    <SelectItem value="16">16진법 (Hexadecimal)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {BASE_INFO[inputBase].description}
                </p>
              </div>

              {/* Input Value */}
              <div className="space-y-2">
                <Label htmlFor="inputValue">숫자 입력</Label>
                <Input
                  id="inputValue"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`예: ${BASE_INFO[inputBase].example}`}
                  className="font-mono text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  {inputValue.trim() && !error ? `입력: ${inputValue.trim()}` : '숫자를 입력하세요'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll} className="flex-1">
                전체 지우기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {([2, 8, 10, 16] as BaseType[]).map((base) => {
            const info = BASE_INFO[base]
            const result = results[base]
            const isCopied = copiedBase === base
            const isInputBase = base === inputBase

            return (
              <Card key={base} className={isInputBase ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {info.name}
                        {isInputBase && (
                          <span className="text-xs font-normal text-primary">
                            (입력)
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {info.description}
                      </CardDescription>
                    </div>
                    {result && !isInputBase && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(base)}
                        className={`ml-2 transition-all duration-200 ${
                          isCopied ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="p-4 rounded-lg bg-muted font-mono text-2xl break-all">
                      {result}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground text-sm text-center">
                      예: {info.example}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Conversion Flow Visualization */}
        {inputValue.trim() && !error && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">변환 과정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 flex-wrap">
                <div className="px-4 py-2 rounded-lg bg-background border font-mono break-all max-w-xs">
                  {inputValue.trim()} <sub>({inputBase})</sub>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                <div className="px-4 py-2 rounded-lg bg-background border font-mono break-all max-w-xs">
                  {results[10]} <sub>(10)</sub>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                <div className="flex gap-2 flex-wrap flex-1">
                  {([2, 8, 16] as BaseType[]).map((base) => (
                    base !== inputBase && (
                      <div key={base} className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 font-mono text-sm break-all max-w-xs">
                        {results[base]} <sub>({base})</sub>
                      </div>
                    )
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                입력값을 먼저 10진수로 변환한 후, 다른 진법으로 변환합니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Examples Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-3">
              <p className="font-medium">💡 사용 예시</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground">숫자 변환 예시:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between p-2 bg-background rounded">
                      <span>10진수: 255</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono">2진수: 11111111</span>
                    </div>
                    <div className="flex justify-between p-2 bg-background rounded">
                      <span>10진수: 255</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono">8진수: 377</span>
                    </div>
                    <div className="flex justify-between p-2 bg-background rounded">
                      <span>10진수: 255</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono">16진수: FF</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground">활용 사례:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>2진법:</strong> 컴퓨터 내부 데이터 표현</li>
                    <li>• <strong>8진법:</strong> Unix 파일 권한 (예: 755)</li>
                    <li>• <strong>10진법:</strong> 일상적인 숫자 표현</li>
                    <li>• <strong>16진법:</strong> 색상 코드, 메모리 주소</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="font-medium mb-2">자주 사용되는 값:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-background rounded">
                    <div className="font-mono">10<sub>(10)</sub> = 1010<sub>(2)</sub></div>
                  </div>
                  <div className="p-2 bg-background rounded">
                    <div className="font-mono">16<sub>(10)</sub> = 10<sub>(16)</sub></div>
                  </div>
                  <div className="p-2 bg-background rounded">
                    <div className="font-mono">100<sub>(10)</sub> = 64<sub>(16)</sub></div>
                  </div>
                  <div className="p-2 bg-background rounded">
                    <div className="font-mono">256<sub>(10)</sub> = 100<sub>(16)</sub></div>
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
