"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Copy, Check, ArrowRight, AlertCircle, FileJson, FileCode, Table, FileType, Code } from "lucide-react"

type InputFormat = 'xml' | 'csv' | 'yaml' | 'java-tostring'

interface ConversionError {
  message: string
  details?: string
}

export default function JsonConverterPage() {
  const [inputFormat, setInputFormat] = useState<InputFormat>('java-tostring')
  const [inputText, setInputText] = useState("")
  const [outputJson, setOutputJson] = useState("")
  const [error, setError] = useState<ConversionError | null>(null)
  const [copied, setCopied] = useState(false)

  // Convert XML to JSON
  const convertXmlToJson = (xml: string): any => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, "text/xml")

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror")
    if (parserError) {
      throw new Error("Invalid XML format")
    }

    const xmlToJsonRecursive = (node: any): any => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        return text || null
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const obj: any = {}

        // Handle attributes
        if (node.attributes && node.attributes.length > 0) {
          obj["@attributes"] = {}
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i]
            obj["@attributes"][attr.name] = attr.value
          }
        }

        // Handle child nodes
        const children = Array.from(node.childNodes)
        const elementChildren = children.filter((child: any) => child.nodeType === Node.ELEMENT_NODE)
        const textChildren = children.filter((child: any) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim())

        if (elementChildren.length === 0 && textChildren.length > 0) {
          // Just text content
          const text = textChildren.map((child: any) => child.textContent).join('').trim()
          if (Object.keys(obj).length === 0) {
            return text
          }
          obj["#text"] = text
        } else if (elementChildren.length > 0) {
          // Group children by tag name
          const grouped: any = {}
          elementChildren.forEach((child: any) => {
            const tagName = child.nodeName
            const childObj = xmlToJsonRecursive(child)

            if (grouped[tagName]) {
              if (Array.isArray(grouped[tagName])) {
                grouped[tagName].push(childObj)
              } else {
                grouped[tagName] = [grouped[tagName], childObj]
              }
            } else {
              grouped[tagName] = childObj
            }
          })
          Object.assign(obj, grouped)
        }

        return Object.keys(obj).length === 0 ? null : obj
      }

      return null
    }

    const result = xmlToJsonRecursive(xmlDoc.documentElement)
    return { [xmlDoc.documentElement.nodeName]: result }
  }

  // Convert CSV to JSON
  const convertCsvToJson = (csv: string): any => {
    const lines = csv.trim().split('\n').map(line => line.trim()).filter(line => line)

    if (lines.length === 0) {
      throw new Error("CSV is empty")
    }

    // Parse CSV line considering quoted fields
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCsvLine(lines[0])
    const data = lines.slice(1).map(line => {
      const values = parseCsvLine(line)
      const obj: any = {}

      headers.forEach((header, index) => {
        let value: any = values[index] || ''

        // Try to parse as number
        if (value && !isNaN(value) && value !== '') {
          value = Number(value)
        }
        // Try to parse as boolean
        else if (value.toLowerCase() === 'true') {
          value = true
        } else if (value.toLowerCase() === 'false') {
          value = false
        }
        // Remove quotes if present
        else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }

        obj[header] = value
      })

      return obj
    })

    return data
  }

  // Convert YAML to JSON
  const convertYamlToJson = (yaml: string): any => {
    const lines = yaml.split('\n')
    const stack: any[] = [{ indent: -1, obj: {} }]
    let currentObj = stack[0].obj

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim() || line.trim().startsWith('#')) continue

      const indent = line.search(/\S/)
      const trimmed = line.trim()

      // Pop stack until we find the right parent
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop()
      }
      currentObj = stack[stack.length - 1].obj

      // List item
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim()

        if (!Array.isArray(currentObj)) {
          const parent = stack[stack.length - 2]?.obj
          const lastKey = stack[stack.length - 1].key
          if (parent && lastKey) {
            parent[lastKey] = []
            currentObj = parent[lastKey]
            stack[stack.length - 1].obj = currentObj
          }
        }

        if (value.includes(':')) {
          const newObj: any = {}
          currentObj.push(newObj)
          stack.push({ indent, obj: newObj, key: null })
          currentObj = newObj

          const [k, ...vParts] = value.split(':')
          const v = vParts.join(':').trim()
          if (v) {
            currentObj[k.trim()] = parseYamlValue(v)
          } else {
            stack.push({ indent: indent + 2, obj: {}, key: k.trim() })
            currentObj[k.trim()] = {}
            currentObj = currentObj[k.trim()]
          }
        } else {
          currentObj.push(parseYamlValue(value))
        }
      }
      // Key-value pair
      else if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':')
        const key = trimmed.substring(0, colonIndex).trim()
        const value = trimmed.substring(colonIndex + 1).trim()

        if (value === '') {
          // Nested object
          currentObj[key] = {}
          stack.push({ indent, obj: currentObj[key], key })
          currentObj = currentObj[key]
        } else if (value === '[]') {
          currentObj[key] = []
        } else if (value === '{}') {
          currentObj[key] = {}
        } else {
          currentObj[key] = parseYamlValue(value)
        }
      }
    }

    return stack[0].obj
  }

  const parseYamlValue = (value: string): any => {
    value = value.trim()

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1)
    }

    // Boolean
    if (value === 'true') return true
    if (value === 'false') return false

    // Null
    if (value === 'null' || value === '~') return null

    // Number
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value)
    }

    return value
  }

  // Convert Java toString to JSON
  const convertJavaToStringToJson = (javaString: string): any => {
    // Handle common Java toString formats
    // Example: ClassName{field1=value1, field2=value2}
    // Example: ClassName(field1=value1, field2=value2)

    const trimmed = javaString.trim()

    // Try to extract class name and content
    const match = trimmed.match(/^(\w+)[\{\(](.*)[\}\)]$/)

    if (!match) {
      throw new Error("Invalid Java toString format. Expected format: ClassName{field=value, ...}")
    }

    const className = match[1]
    const content = match[2]

    const obj: any = {
      _className: className
    }

    if (!content.trim()) {
      return obj
    }

    // Parse key=value pairs
    const pairs: string[] = []
    let current = ''
    let depth = 0
    let inQuotes = false

    for (let i = 0; i < content.length; i++) {
      const char = content[i]

      if (char === '"' || char === "'") {
        inQuotes = !inQuotes
        current += char
      } else if (!inQuotes) {
        if (char === '{' || char === '(' || char === '[') {
          depth++
          current += char
        } else if (char === '}' || char === ')' || char === ']') {
          depth--
          current += char
        } else if (char === ',' && depth === 0) {
          pairs.push(current.trim())
          current = ''
        } else {
          current += char
        }
      } else {
        current += char
      }
    }

    if (current.trim()) {
      pairs.push(current.trim())
    }

    // Parse each pair
    pairs.forEach(pair => {
      const equalIndex = pair.indexOf('=')
      if (equalIndex === -1) return

      const key = pair.substring(0, equalIndex).trim()
      let value = pair.substring(equalIndex + 1).trim()

      // Parse the value
      obj[key] = parseJavaValue(value)
    })

    return obj
  }

  const parseJavaValue = (value: string): any => {
    value = value.trim()

    // Null
    if (value === 'null') return null

    // Boolean
    if (value === 'true') return true
    if (value === 'false') return false

    // String with quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1)
    }

    // Number
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value)
    }

    // Array
    if (value.startsWith('[') && value.endsWith(']')) {
      const content = value.slice(1, -1).trim()
      if (!content) return []

      const items = content.split(',').map(item => parseJavaValue(item.trim()))
      return items
    }

    // Nested object
    if (value.match(/^\w+[\{\(].*[\}\)]$/)) {
      return convertJavaToStringToJson(value)
    }

    // Default: return as string
    return value
  }

  // Main conversion function
  const convertToJson = (input: string, format: InputFormat) => {
    if (!input.trim()) {
      setOutputJson("")
      setError(null)
      return
    }

    try {
      let result: any

      switch (format) {
        case 'xml':
          result = convertXmlToJson(input)
          break
        case 'csv':
          result = convertCsvToJson(input)
          break
        case 'yaml':
          result = convertYamlToJson(input)
          break
        case 'java-tostring':
          result = convertJavaToStringToJson(input)
          break
        default:
          throw new Error("Unsupported format")
      }

      setOutputJson(JSON.stringify(result, null, 2))
      setError(null)
    } catch (err) {
      setOutputJson("")
      setError({
        message: err instanceof Error ? err.message : "Conversion failed",
        details: "입력 형식을 확인해주세요"
      })
    }
  }

  // Update conversion when input or format changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertToJson(inputText, inputFormat)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputText, inputFormat])

  // Copy functionality
  const copyToClipboard = async () => {
    if (!outputJson) return

    try {
      await navigator.clipboard.writeText(outputJson)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Sample data for each format
  const samples: Record<InputFormat, string> = {
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>John Doe</name>
    <email>john@example.com</email>
    <age>30</age>
  </user>
  <user id="2">
    <name>Jane Smith</name>
    <email>jane@example.com</email>
    <age>25</age>
  </user>
</users>`,
    csv: `name,age,city,active
John Doe,30,Seoul,true
Jane Smith,25,Busan,false
Bob Johnson,35,Incheon,true`,
    yaml: `users:
  - name: John Doe
    age: 30
    email: john@example.com
    active: true
  - name: Jane Smith
    age: 25
    email: jane@example.com
    active: false
settings:
  theme: dark
  notifications: true`,
    'java-tostring': `User{id=1, name=John Doe, email=john@example.com, age=30, active=true, roles=[admin, user]}`
  }

  const loadSample = () => {
    setInputText(samples[inputFormat])
  }

  const clearAll = () => {
    setInputText("")
  }

  const formatDescriptions: Record<InputFormat, string> = {
    xml: "XML 문서를 JSON으로 변환합니다",
    csv: "CSV 데이터를 JSON 배열로 변환합니다",
    yaml: "YAML 형식을 JSON으로 변환합니다",
    'java-tostring': "Java toString() 출력을 JSON으로 변환합니다"
  }

  const formatButtons: Array<{ format: InputFormat; label: string; icon: any }> = [
    { format: 'java-tostring', label: 'Java toString', icon: Code },
    { format: 'xml', label: 'XML', icon: FileCode },
    { format: 'yaml', label: 'YAML', icon: FileType },
    { format: 'csv', label: 'CSV', icon: Table },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON Converter</h1>
        <p className="text-muted-foreground">
          다양한 데이터 형식을 JSON으로 변환하세요
        </p>
      </div>

      <Separator />

      <div className="max-w-7xl space-y-6">
        {/* Format Selection Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>입력 형식 선택</CardTitle>
            <CardDescription>
              변환할 데이터의 형식을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {formatButtons.map(({ format, label, icon: Icon }) => (
                <Button
                  key={format}
                  variant={inputFormat === format ? "default" : "outline"}
                  size="lg"
                  onClick={() => setInputFormat(format)}
                  className={`transition-all duration-200 ${
                    inputFormat === format
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {formatDescriptions[inputFormat]}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                샘플 불러오기
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
                {inputFormat.toUpperCase()} 형식의 데이터를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`${inputFormat.toUpperCase()} 데이터를 입력하세요...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[500px] font-mono text-sm resize-none"
              />

              {/* Error display */}
              {error && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                      변환 오류
                    </p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error.message}
                    </p>
                    {error.details && (
                      <p className="text-red-600 dark:text-red-400 text-xs">
                        {error.details}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    JSON 결과
                  </CardTitle>
                  <CardDescription>
                    변환된 JSON 데이터
                  </CardDescription>
                </div>
                {outputJson && (
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
              {outputJson ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap break-words">
                  {outputJson}
                </pre>
              ) : inputText.trim() && error ? (
                <div className="bg-muted/50 p-4 rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>올바른 형식의 데이터를 입력해주세요</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileJson className="h-8 w-8 mx-auto mb-2" />
                    <p>변환된 JSON이 여기에 표시됩니다</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Format Examples Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-3">
              <p className="font-medium">💡 형식별 예시</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium mb-1">CSV:</p>
                  <pre className="bg-background p-2 rounded text-xs font-mono">
name,age,city{'\n'}John,30,Seoul
                  </pre>
                </div>
                <div>
                  <p className="font-medium mb-1">XML:</p>
                  <pre className="bg-background p-2 rounded text-xs font-mono">
{'<user>'}{'\n'}  {'<name>John</name>'}{'\n'}{'</user>'}
                  </pre>
                </div>
                <div>
                  <p className="font-medium mb-1">YAML:</p>
                  <pre className="bg-background p-2 rounded text-xs font-mono">
user:{'\n'}  name: John{'\n'}  age: 30
                  </pre>
                </div>
                <div>
                  <p className="font-medium mb-1">Java toString:</p>
                  <pre className="bg-background p-2 rounded text-xs font-mono">
User{'{'}name=John, age=30{'}'}
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
