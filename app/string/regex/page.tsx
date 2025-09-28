"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, FileText, CheckCircle, AlertCircle, Info } from "lucide-react"

interface RegexMatch {
  match: string
  index: number
  groups?: string[]
}

export default function RegexPage() {
  const [regexPattern, setRegexPattern] = useState("")
  const [textContent, setTextContent] = useState("")
  const [matches, setMatches] = useState<RegexMatch[]>([])
  const [regexError, setRegexError] = useState("")
  const [flags, setFlags] = useState("g")

  // Process regex when inputs change
  useEffect(() => {
    if (regexPattern && textContent) {
      try {
        const regex = new RegExp(regexPattern, flags)
        const foundMatches: RegexMatch[] = []
        let match

        // Use matchAll for global search
        if (flags.includes('g')) {
          const matchIterator = textContent.matchAll(regex)
          for (const m of matchIterator) {
            foundMatches.push({
              match: m[0],
              index: m.index || 0,
              groups: m.slice(1)
            })
          }
        } else {
          // Single match
          match = textContent.match(regex)
          if (match) {
            foundMatches.push({
              match: match[0],
              index: match.index || 0,
              groups: match.slice(1)
            })
          }
        }

        setMatches(foundMatches)
        setRegexError("")
      } catch (error) {
        setRegexError(error instanceof Error ? error.message : "정규식 오류")
        setMatches([])
      }
    } else {
      setMatches([])
      setRegexError("")
    }
  }, [regexPattern, textContent, flags])

  // Highlight matches in text
  const highlightMatches = (text: string, matches: RegexMatch[]) => {
    if (matches.length === 0) return text

    const parts = []
    let lastIndex = 0

    // Sort matches by index
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index)

    sortedMatches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }

      // Add highlighted match
      parts.push(
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
          {match.match}
        </mark>
      )

      lastIndex = match.index + match.match.length
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts
  }

  // Sample patterns
  const samplePatterns = [
    { name: "이메일", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
    { name: "전화번호", pattern: "\\d{2,3}-\\d{3,4}-\\d{4}" },
    { name: "URL", pattern: "https?://[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+" },
    { name: "숫자", pattern: "\\d+" },
    { name: "단어", pattern: "\\w+" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regex</h1>
        <p className="text-muted-foreground">
          정규식을 사용하여 텍스트에서 패턴을 찾아보세요
        </p>
      </div>

      <Separator />

      {/* Regex Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            정규식 패턴
          </CardTitle>
          <CardDescription>
            검색할 정규식 패턴을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="정규식 패턴을 입력하세요 (예: \d+, [a-zA-Z]+, \w+@\w+\.\w+)"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">플래그:</span>
              <Input
                placeholder="gmi"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="w-16 font-mono text-center"
              />
            </div>
          </div>

          {/* Sample patterns */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium self-center">샘플 패턴:</span>
            {samplePatterns.map((sample, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setRegexPattern(sample.pattern)}
              >
                {sample.name}
              </Badge>
            ))}
          </div>

          {/* Regex error */}
          {regexError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                정규식 오류: {regexError}
              </AlertDescription>
            </Alert>
          )}

          {/* Match results info */}
          {regexPattern && !regexError && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {matches.length === 0 ? (
                  "일치하는 결과가 없습니다"
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {matches.length}개의 일치하는 결과를 찾았습니다
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Text Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            검색할 텍스트
          </CardTitle>
          <CardDescription>
            정규식으로 검색할 텍스트를 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="검색할 텍스트를 입력하세요...

예시 텍스트:
홍길동의 이메일은 hong@example.com이고 전화번호는 010-1234-5678입니다.
김철수는 kim.chulsoo@gmail.com으로 연락하거나 02-987-6543으로 전화하세요.
웹사이트는 https://www.example.com을 방문해주세요."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm resize-none"
          />
        </CardContent>
      </Card>

      {/* Results Section */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>검색 결과</CardTitle>
            <CardDescription>
              정규식과 일치하는 부분이 하이라이트되어 표시됩니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Highlighted text */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">하이라이트된 텍스트:</h4>
              <div className="font-mono text-sm whitespace-pre-wrap break-words">
                {highlightMatches(textContent, matches)}
              </div>
            </div>

            {/* Match details */}
            <div>
              <h4 className="font-medium mb-2">일치하는 결과 목록:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {matches.map((match, index) => (
                  <div key={index} className="p-3 border rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">매치 #{index + 1}</span>
                      <Badge variant="secondary">위치: {match.index}</Badge>
                    </div>
                    <div className="font-mono bg-muted p-2 rounded">
                      "{match.match}"
                    </div>
                    {match.groups && match.groups.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">캡처 그룹:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.groups.map((group, gIndex) => (
                            <Badge key={gIndex} variant="outline" className="text-xs">
                              그룹 {gIndex + 1}: "{group}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>정규식 사용 가이드</CardTitle>
          <CardDescription>
            자주 사용되는 정규식 패턴들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">기본 패턴:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">\d</code>
                  <span className="text-muted-foreground">숫자 한 자리</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">\w</code>
                  <span className="text-muted-foreground">문자 (영문, 숫자, _)</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">\s</code>
                  <span className="text-muted-foreground">공백 문자</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">.</code>
                  <span className="text-muted-foreground">임의의 문자</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">수량자:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">+</code>
                  <span className="text-muted-foreground">1번 이상</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">*</code>
                  <span className="text-muted-foreground">0번 이상</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">?</code>
                  <span className="text-muted-foreground">0번 또는 1번</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">{"{n,m}"}</code>
                  <span className="text-muted-foreground">n번 이상 m번 이하</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}