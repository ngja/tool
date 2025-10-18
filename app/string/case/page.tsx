"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Type, Copy, Check } from "lucide-react"

type CaseType =
  | 'camelCase'
  | 'PascalCase'
  | 'kebab-case'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE'
  | 'flatcase'
  | 'UPPERCASE'
  | 'lowercase'

type CaseInfo = {
  name: string
  description: string
  example: string
}

const CASE_INFO: Record<CaseType, CaseInfo> = {
  'camelCase': {
    name: 'camelCase',
    description: '첫 단어는 소문자, 이후 단어는 대문자로 시작',
    example: 'myVariableName'
  },
  'PascalCase': {
    name: 'PascalCase',
    description: '모든 단어를 대문자로 시작',
    example: 'MyVariableName'
  },
  'kebab-case': {
    name: 'kebab-case',
    description: '단어를 하이픈(-)으로 연결',
    example: 'my-variable-name'
  },
  'snake_case': {
    name: 'snake_case',
    description: '단어를 언더스코어(_)로 연결',
    example: 'my_variable_name'
  },
  'SCREAMING_SNAKE_CASE': {
    name: 'SCREAMING_SNAKE_CASE',
    description: '대문자로 변환 후 언더스코어(_)로 연결',
    example: 'MY_VARIABLE_NAME'
  },
  'flatcase': {
    name: 'flatcase',
    description: '모두 소문자로 변환 (구분자 없음)',
    example: 'myvariablename'
  },
  'UPPERCASE': {
    name: 'UPPERCASE',
    description: '모두 대문자로 변환 (띄어쓰기 유지)',
    example: 'MY VARIABLE NAME'
  },
  'lowercase': {
    name: 'lowercase',
    description: '모두 소문자로 변환 (띄어쓰기 유지)',
    example: 'my variable name'
  }
}

export default function CaseConverterPage() {
  const [inputText, setInputText] = useState("")
  const [convertedResults, setConvertedResults] = useState<Record<CaseType, string>>({
    'camelCase': '',
    'PascalCase': '',
    'kebab-case': '',
    'snake_case': '',
    'SCREAMING_SNAKE_CASE': '',
    'flatcase': '',
    'UPPERCASE': '',
    'lowercase': ''
  })
  const [copiedCase, setCopiedCase] = useState<CaseType | null>(null)

  // Parse input text into words
  const parseWords = (text: string): string[] => {
    if (!text.trim()) return []

    // Remove leading/trailing spaces and split by various delimiters
    // Support: spaces, hyphens, underscores, and camelCase/PascalCase
    const words: string[] = []

    // Replace common delimiters with spaces
    let processed = text
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before capital letters in camelCase
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle consecutive capitals

    // Split by spaces and filter empty strings
    return processed
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.toLowerCase())
  }

  // Convert to specific case
  const convertToCase = (words: string[], caseType: CaseType): string => {
    if (words.length === 0) return ''

    switch (caseType) {
      case 'camelCase':
        return words
          .map((word, index) =>
            index === 0
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join('')

      case 'PascalCase':
        return words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('')

      case 'kebab-case':
        return words.map(word => word.toLowerCase()).join('-')

      case 'snake_case':
        return words.map(word => word.toLowerCase()).join('_')

      case 'SCREAMING_SNAKE_CASE':
        return words.map(word => word.toUpperCase()).join('_')

      case 'flatcase':
        return words.join('').toLowerCase()

      case 'UPPERCASE':
        return words.map(word => word.toUpperCase()).join(' ')

      case 'lowercase':
        return words.map(word => word.toLowerCase()).join(' ')

      default:
        return ''
    }
  }

  // Process text whenever input changes
  useEffect(() => {
    const words = parseWords(inputText)

    const results: Record<CaseType, string> = {
      'camelCase': convertToCase(words, 'camelCase'),
      'PascalCase': convertToCase(words, 'PascalCase'),
      'kebab-case': convertToCase(words, 'kebab-case'),
      'snake_case': convertToCase(words, 'snake_case'),
      'SCREAMING_SNAKE_CASE': convertToCase(words, 'SCREAMING_SNAKE_CASE'),
      'flatcase': convertToCase(words, 'flatcase'),
      'UPPERCASE': convertToCase(words, 'UPPERCASE'),
      'lowercase': convertToCase(words, 'lowercase')
    }

    setConvertedResults(results)
  }, [inputText])

  // Copy to clipboard
  const copyToClipboard = async (caseType: CaseType) => {
    const text = convertedResults[caseType]
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopiedCase(caseType)

      setTimeout(() => {
        setCopiedCase(null)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Case Converter</h1>
        <p className="text-muted-foreground">
          텍스트를 다양한 케이스로 변환하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-6 w-6" />
              입력
            </CardTitle>
            <CardDescription>
              변환할 텍스트를 입력하세요. 공백, 하이픈, 언더스코어, camelCase 등 자동으로 인식합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="예: my variable name 또는 myVariableName 또는 my-variable-name"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] font-mono text-lg resize-none"
            />
            {inputText && (
              <div className="mt-2 text-xs text-muted-foreground">
                감지된 단어: {parseWords(inputText).length}개
                {parseWords(inputText).length > 0 && (
                  <span className="ml-2">
                    ({parseWords(inputText).map(w => `"${w}"`).join(', ')})
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(CASE_INFO) as CaseType[]).map((caseType) => {
            const info = CASE_INFO[caseType]
            const result = convertedResults[caseType]
            const isCopied = copiedCase === caseType

            return (
              <Card key={caseType} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-mono">
                        {info.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {info.description}
                      </CardDescription>
                    </div>
                    {result && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(caseType)}
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
                    <div className="p-3 rounded-lg bg-muted font-mono text-base break-all">
                      {result}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground text-sm text-center">
                      예: {info.example}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Examples Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-3">
              <p className="font-medium">💡 사용 예시</p>
              <div className="space-y-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">입력 형식:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <code className="bg-background px-1 py-0.5 rounded">my variable name</code> (공백으로 구분)</li>
                      <li>• <code className="bg-background px-1 py-0.5 rounded">myVariableName</code> (camelCase)</li>
                      <li>• <code className="bg-background px-1 py-0.5 rounded">MyVariableName</code> (PascalCase)</li>
                      <li>• <code className="bg-background px-1 py-0.5 rounded">my-variable-name</code> (kebab-case)</li>
                      <li>• <code className="bg-background px-1 py-0.5 rounded">my_variable_name</code> (snake_case)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">활용 사례:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• JavaScript/TypeScript 변수명 (camelCase)</li>
                      <li>• React 컴포넌트명 (PascalCase)</li>
                      <li>• CSS 클래스명 (kebab-case)</li>
                      <li>• Python 변수명 (snake_case)</li>
                      <li>• 환경 변수 (SCREAMING_SNAKE_CASE)</li>
                    </ul>
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
