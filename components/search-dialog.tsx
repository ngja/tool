"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Clock, Braces, Type, Dices, Cpu, Home } from "lucide-react"

type SearchContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextType>({
  open: false,
  setOpen: () => {},
})

export const useSearch = () => useContext(SearchContext)

type Tool = {
  title: string
  description: string
  url: string
  category: string
  icon: any
}

const tools: Tool[] = [
  // Home
  { title: "Dashboard", description: "홈(Home) 대시보드 - 모든 도구 모음", url: "/", category: "General", icon: Home },

  // Time
  { title: "Timer", description: "카운트다운 타이머", url: "/time/timer", category: "Time", icon: Clock },
  { title: "Time Converter", description: "다양한 시간 형식 변환", url: "/time/converter", category: "Time", icon: Clock },
  { title: "Cron", description: "Cron 표현식 생성기", url: "/time/cron", category: "Time", icon: Clock },

  // JSON
  { title: "JSON Formatter", description: "JSON 포맷팅 및 검증", url: "/json/formatter", category: "JSON", icon: Braces },
  { title: "JSON Converter", description: "JSON 데이터 변환", url: "/json/converter", category: "JSON", icon: Braces },

  // String
  { title: "Case", description: "대소문자 변환", url: "/string/case", category: "String", icon: Type },
  { title: "Newline", description: "줄바꿈 변환", url: "/string/newline", category: "String", icon: Type },
  { title: "Regex", description: "정규표현식 테스터", url: "/string/regex", category: "String", icon: Type },
  { title: "Manipulator", description: "문자열 조작 도구", url: "/string/manipulator", category: "String", icon: Type },
  { title: "Extractor", description: "문자열 추출 도구", url: "/string/extractor", category: "String", icon: Type },
  { title: "Set Operations", description: "집합 연산", url: "/string/set-operations", category: "String", icon: Type },

  // Random
  { title: "Roulette", description: "룰렛 랜덤 선택", url: "/random/roulette", category: "Random", icon: Dices },
  { title: "Lotto", description: "로또 번호 생성", url: "/random/lotto", category: "Random", icon: Dices },

  // Computer
  { title: "Sort", description: "정렬 알고리즘", url: "/computer/sort", category: "Computer", icon: Cpu },
  { title: "Encoding", description: "인코딩/디코딩", url: "/computer/encoding", category: "Computer", icon: Cpu },
  { title: "Base Converter", description: "진법 변환", url: "/computer/base-converter", category: "Computer", icon: Cpu },
  { title: "CIDR", description: "CIDR 계산기", url: "/computer/cidr", category: "Computer", icon: Cpu },
]

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
    </SearchContext.Provider>
  )
}

export function SearchDialog() {
  const { open, setOpen } = useSearch()
  const router = useRouter()

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  // Group tools by category
  const categories = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="도구 검색..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        {Object.entries(categories).map(([category, categoryTools]) => (
          <CommandGroup key={category} heading={category}>
            {categoryTools.map((tool) => (
              <CommandItem
                key={tool.url}
                value={`${tool.title} ${tool.description}`}
                onSelect={() => handleSelect(tool.url)}
              >
                <tool.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{tool.title}</span>
                  <span className="text-xs text-muted-foreground">{tool.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
