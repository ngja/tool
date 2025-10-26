"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, Braces, Type, Dices, Cpu, ChevronRight } from "lucide-react"
import Link from "next/link"

type Tool = {
  title: string
  description: string
  url: string
}

type Category = {
  title: string
  description: string
  icon: any
  tools: Tool[]
  color: string
}

const categories: Category[] = [
  {
    title: "Time",
    description: "시간 관련 도구",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    tools: [
      {
        title: "Timer",
        description: "카운트다운 타이머",
        url: "/time/timer",
      },
      {
        title: "Time Converter",
        description: "다양한 시간 형식 변환",
        url: "/time/converter",
      },
      {
        title: "Cron",
        description: "Cron 표현식 생성기",
        url: "/time/cron",
      },
    ],
  },
  {
    title: "JSON",
    description: "JSON 처리 도구",
    icon: Braces,
    color: "text-green-600 dark:text-green-400",
    tools: [
      {
        title: "JSON Formatter",
        description: "JSON 포맷팅 및 검증",
        url: "/json/formatter",
      },
      {
        title: "JSON Converter",
        description: "JSON 데이터 변환",
        url: "/json/converter",
      },
    ],
  },
  {
    title: "String",
    description: "문자열 처리 도구",
    icon: Type,
    color: "text-purple-600 dark:text-purple-400",
    tools: [
      {
        title: "Case",
        description: "대소문자 변환",
        url: "/string/case",
      },
      {
        title: "Newline",
        description: "줄바꿈 변환",
        url: "/string/newline",
      },
      {
        title: "Regex",
        description: "정규표현식 테스터",
        url: "/string/regex",
      },
      {
        title: "Manipulator",
        description: "문자열 조작 도구",
        url: "/string/manipulator",
      },
      {
        title: "Extractor",
        description: "문자열 추출 도구",
        url: "/string/extractor",
      },
      {
        title: "Unique",
        description: "중복 제거 및 요소별 카운트",
        url: "/string/unique",
      },
      {
        title: "Set Operations",
        description: "집합 연산",
        url: "/string/set-operations",
      },
    ],
  },
  {
    title: "Random",
    description: "무작위 생성 도구",
    icon: Dices,
    color: "text-orange-600 dark:text-orange-400",
    tools: [
      {
        title: "Roulette",
        description: "룰렛 랜덤 선택",
        url: "/random/roulette",
      },
      {
        title: "Lotto",
        description: "로또 번호 생성",
        url: "/random/lotto",
      },
    ],
  },
  {
    title: "Computer",
    description: "컴퓨터 과학 도구",
    icon: Cpu,
    color: "text-red-600 dark:text-red-400",
    tools: [
      {
        title: "Sort",
        description: "정렬 알고리즘",
        url: "/computer/sort",
      },
      {
        title: "Encoding",
        description: "인코딩/디코딩",
        url: "/computer/encoding",
      },
      {
        title: "Base Converter",
        description: "진법 변환",
        url: "/computer/base-converter",
      },
      {
        title: "CIDR",
        description: "CIDR 계산기",
        url: "/computer/cidr",
      },
    ],
  },
]

export default function Home() {
  const totalTools = categories.reduce((sum, cat) => sum + cat.tools.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          개발자를 위한 다양한 유틸리티 도구 모음
        </p>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 카테고리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              사용 가능한 도구
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTools}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              정상
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">도구 모음</h2>

        {categories.map((category) => (
          <Card key={category.title} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${category.color} bg-opacity-10 dark:bg-opacity-20`} style={{ backgroundColor: `${category.color.includes('blue') ? '#3b82f620' : category.color.includes('green') ? '#22c55e20' : category.color.includes('purple') ? '#a855f720' : category.color.includes('orange') ? '#f9731620' : '#ef444420'}` }}>
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                </div>
                <div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool) => (
                  <Link
                    key={tool.url}
                    href={tool.url}
                    className="group relative rounded-lg border p-4 hover:bg-accent hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Guide */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>빠른 시작 가이드</CardTitle>
          <CardDescription>
            도구 사용을 시작하는 방법
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">카테고리 선택</p>
                <p className="text-muted-foreground">
                  위의 카테고리 중 필요한 도구가 포함된 카테고리를 선택하세요
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">도구 클릭</p>
                <p className="text-muted-foreground">
                  사용하고 싶은 도구를 클릭하여 해당 페이지로 이동하세요
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">도구 사용</p>
                <p className="text-muted-foreground">
                  각 도구의 인터페이스를 통해 원하는 작업을 수행하세요
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
