"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Binary, Copy, Check, ArrowRightLeft, AlertCircle } from "lucide-react"

type EncodingType = 'base64' | 'hex' | 'url'
type OperationType = 'encode' | 'decode'

export default function EncodingPage() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [encodingType, setEncodingType] = useState<EncodingType>('base64')
  const [operationType, setOperationType] = useState<OperationType>('encode')
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // Encoding functions
  const encodeBase64 = (text: string): string => {
    try {
      // Convert string to UTF-8 bytes and then to base64
      const utf8Bytes = new TextEncoder().encode(text)
      const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('')
      return btoa(binaryString)
    } catch (err) {
      throw new Error("Base64 인코딩 실패")
    }
  }

  const decodeBase64 = (text: string): string => {
    try {
      // Decode base64 to binary string and then to UTF-8
      const binaryString = atob(text.trim())
      const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch (err) {
      throw new Error("Base64 디코딩 실패: 올바른 Base64 형식이 아닙니다")
    }
  }

  const encodeHex = (text: string): string => {
    try {
      const utf8Bytes = new TextEncoder().encode(text)
      return Array.from(utf8Bytes, byte => byte.toString(16).padStart(2, '0')).join('')
    } catch (err) {
      throw new Error("Hex 인코딩 실패")
    }
  }

  const decodeHex = (text: string): string => {
    try {
      const hexString = text.trim().replace(/\s+/g, '')
      if (hexString.length % 2 !== 0) {
        throw new Error("올바르지 않은 Hex 형식입니다 (홀수 길이)")
      }
      if (!/^[0-9a-fA-F]*$/.test(hexString)) {
        throw new Error("올바르지 않은 Hex 형식입니다 (유효하지 않은 문자)")
      }
      const bytes = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      return new TextDecoder().decode(bytes)
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
      throw new Error("Hex 디코딩 실패")
    }
  }

  const encodeURL = (text: string): string => {
    try {
      return encodeURIComponent(text)
    } catch (err) {
      throw new Error("URL 인코딩 실패")
    }
  }

  const decodeURL = (text: string): string => {
    try {
      return decodeURIComponent(text.trim())
    } catch (err) {
      throw new Error("URL 디코딩 실패: 올바른 URL 인코딩 형식이 아닙니다")
    }
  }

  // Process text automatically whenever inputs change
  useEffect(() => {
    setError("")

    if (!inputText.trim()) {
      setOutputText("")
      return
    }

    try {
      let result = ""

      if (operationType === 'encode') {
        switch (encodingType) {
          case 'base64':
            result = encodeBase64(inputText)
            break
          case 'hex':
            result = encodeHex(inputText)
            break
          case 'url':
            result = encodeURL(inputText)
            break
        }
      } else {
        switch (encodingType) {
          case 'base64':
            result = decodeBase64(inputText)
            break
          case 'hex':
            result = decodeHex(inputText)
            break
          case 'url':
            result = decodeURL(inputText)
            break
        }
      }

      setOutputText(result)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("처리 중 오류가 발생했습니다")
      }
      setOutputText("")
    }
  }, [inputText, encodingType, operationType])

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
    setError("")
  }

  // Swap input and output
  const swapTexts = () => {
    if (!outputText) return

    setInputText(outputText)
    setOutputText("")
    setError("")
    setOperationType(operationType === 'encode' ? 'decode' : 'encode')
  }

  // Get encoding type label
  const getEncodingLabel = (type: EncodingType): string => {
    switch (type) {
      case 'base64':
        return 'Base64'
      case 'hex':
        return 'Hex (16진수)'
      case 'url':
        return 'URL'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Encoding</h1>
        <p className="text-muted-foreground">
          텍스트를 Base64, Hex, URL 형식으로 인코딩하거나 디코딩하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Binary className="h-6 w-6" />
              인코딩 설정
            </CardTitle>
            <CardDescription>
              인코딩 타입과 작업 방식을 선택하면 실시간으로 결과가 업데이트됩니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Encoding Type Tabs */}
            <div className="space-y-2">
              <Label>인코딩 타입</Label>
              <Tabs value={encodingType} onValueChange={(value) => setEncodingType(value as EncodingType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="base64">Base64</TabsTrigger>
                  <TabsTrigger value="hex">Hex</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Operation Type */}
            <div className="space-y-2">
              <Label>작업 방식</Label>
              <div className="flex gap-2">
                <Button
                  variant={operationType === 'encode' ? 'default' : 'outline'}
                  onClick={() => setOperationType('encode')}
                  className="flex-1"
                >
                  인코딩 (Encode)
                </Button>
                <Button
                  variant={operationType === 'decode' ? 'default' : 'outline'}
                  onClick={() => setOperationType('decode')}
                  className="flex-1"
                >
                  디코딩 (Decode)
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={swapTexts} disabled={!outputText} className="flex-1">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                입출력 교환
              </Button>
              <Button variant="outline" onClick={clearAll} className="flex-1">
                전체 지우기
              </Button>
            </div>

            {/* Current Settings Display */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">현재 설정:</span>
              <Badge variant="secondary">{getEncodingLabel(encodingType)}</Badge>
              <Badge variant={operationType === 'encode' ? 'default' : 'outline'}>
                {operationType === 'encode' ? 'Encode' : 'Decode'}
              </Badge>
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

        {/* Input/Output Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>입력</CardTitle>
              <CardDescription>
                {operationType === 'encode' ? '인코딩할 텍스트를 입력하세요' : '디코딩할 텍스트를 입력하세요'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={
                  operationType === 'encode'
                    ? '예시: Hello World!'
                    : encodingType === 'base64'
                    ? '예시: SGVsbG8gV29ybGQh'
                    : encodingType === 'hex'
                    ? '예시: 48656c6c6f20576f726c6421'
                    : '예시: Hello%20World%21'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {inputText.length} 문자
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
                    {operationType === 'encode' ? '인코딩된 텍스트' : '디코딩된 텍스트'}
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
                    {outputText.length} 문자
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-sm text-center px-4">
                    입력 텍스트를 입력하면 결과가 자동으로 표시됩니다
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
                  <p className="font-medium">Base64 인코딩</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">원본:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono break-all">
Hello World!
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Base64:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono break-all">
SGVsbG8gV29ybGQh
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Hex 인코딩</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">원본:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono break-all">
Hello
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Hex:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono break-all">
48656c6c6f
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium">URL 인코딩</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">원본:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono break-all">
https://example.com/search?q=Hello World!
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">URL Encoded:</p>
                      <pre className="bg-background p-2 rounded text-xs font-mono break-all">
https%3A%2F%2Fexample.com%2Fsearch%3Fq%3DHello%20World!
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="font-medium mb-2">특징</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li><strong>Base64:</strong> 바이너리 데이터를 ASCII 문자로 인코딩 (이메일, JSON 등에서 사용)</li>
                  <li><strong>Hex:</strong> 바이트를 16진수로 표현 (디버깅, 해시값 표현 등에서 사용)</li>
                  <li><strong>URL:</strong> URL에 안전한 형식으로 인코딩 (특수 문자를 %XX 형식으로 변환)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
