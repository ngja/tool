"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy, Check, FileText, ArrowRight } from "lucide-react"

export default function NewlinePage() {
  const [searchText, setSearchText] = useState("")
  const [textareaContent, setTextareaContent] = useState("")
  const [result, setResult] = useState("")
  const [copied, setCopied] = useState(false)

  // Process text when inputs change
  useEffect(() => {
    if (textareaContent && searchText) {
      // Find searchText and add newline before each occurrence
      const processedText = textareaContent.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '\n' + searchText)
      setResult(processedText)
    } else {
      setResult("")
    }
  }, [searchText, textareaContent])

  // Copy functionality
  const copyToClipboard = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Newline</h1>
        <p className="text-muted-foreground">
          특정 텍스트 앞에 개행을 추가하는 도구
        </p>
      </div>

      <Separator />

      {/* Main Layout: Left Input, Right Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              입력
            </CardTitle>
            <CardDescription>
              찾을 텍스트와 처리할 내용을 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Small text input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">찾을 텍스트:</label>
              <Input
                placeholder="개행을 추가할 위치를 찾기 위한 텍스트를 입력하세요"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium">처리할 텍스트:</label>
              <Textarea
                placeholder="여러 줄의 텍스트를 입력하세요..."
                value={textareaContent}
                onChange={(e) => setTextareaContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Result */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                <div>
                  <CardTitle>결과</CardTitle>
                  <CardDescription>
                    찾은 텍스트 앞에 개행이 추가된 결과
                  </CardDescription>
                </div>
              </div>
              {result && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className={`transition-all duration-200 ${
                    copied ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-2">복사</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {result ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[450px] text-sm font-mono whitespace-pre-wrap break-words border">
                  {result}
                </pre>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg h-[450px] flex items-center justify-center text-muted-foreground border">
                  <div className="text-center space-y-2">
                    <FileText className="h-8 w-8 mx-auto" />
                    <p>왼쪽에서 텍스트를 입력하면</p>
                    <p>처리된 결과가 여기에 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Example/Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>사용 예시</CardTitle>
          <CardDescription>
            이 도구의 사용법을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">입력 예시:</h4>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="text-muted-foreground mb-2">찾을 텍스트:</p>
                <code className="text-xs bg-background px-2 py-1 rounded">console.log</code>
                <p className="text-muted-foreground mb-2 mt-3">처리할 텍스트:</p>
                <pre className="text-xs bg-background px-2 py-1 rounded whitespace-pre">Hello console.log("test") World console.log("debug") End</pre>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">결과 예시:</h4>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <pre className="text-xs bg-background px-2 py-1 rounded whitespace-pre-wrap">Hello{'\n'}console.log("test") World{'\n'}console.log("debug") End</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}