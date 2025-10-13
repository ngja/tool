# Developer Tools

개발자를 위한 다양한 유틸리티 도구 모음 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 15.5.4 with App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Language**: TypeScript
- **Build Tool**: Turbopack
- **Styling**: Dark/Light 모드 지원

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 [http://localhost:3001](http://localhost:3001)에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 주요 기능

### ⏰ Time Tools

#### Timer
- 카운트다운 타이머
- 알림 기능 (브라우저 Notification API)
- 프리셋 시간 설정 (1분, 3분, 5분, 10분, 15분, 30분, 1시간)
- 시각적 피드백 (완료 시 애니메이션)
- 일시정지/재개 기능

#### Time Converter
- 다양한 시간 형식 간 변환
- 타임존 지원 (date-fns-tz)
- Unix Timestamp, ISO 8601 등 지원
- 실시간 변환

### 📝 JSON Tools

#### JSON Formatter
- JSON 유효성 검증
- 자동 포맷팅 및 들여쓰기
- 에러 감지 및 표시
- 복사 기능
- 한국어 인터페이스

### 🔤 String Tools

#### Newline
- 텍스트 줄바꿈 처리
- 다양한 줄바꿈 옵션

#### Regex
- 정규표현식 테스트 도구
- 실시간 매칭 결과 표시
- 패턴 검증

#### Manipulator
- 문자열 구분자로 분할
- 각 부분에 접두사/접미사 추가
- 다양한 구분자 지원:
  - 줄바꿈
  - 쉼표 (,)
  - 마침표 (.)
  - 공백
  - 대시 (-)
  - 밑줄 (_)
  - 콜론 (:)
- SQL IN 절, 배열 리터럴 생성에 유용

#### Extractor
- 문자열에서 특정 패턴 추출
- 이메일, URL, 숫자 등 추출
- 커스텀 패턴 지원

#### Set Operations
- 두 텍스트 집합 간 연산
- **합집합 (A ∪ B)**: 두 집합의 모든 요소
- **교집합 (A ∩ B)**: 공통 요소
- **차집합 (A - B)**: A에만 있는 요소
- **차집합 (B - A)**: B에만 있는 요소
- 지원 구분자:
  - 쉼표 (,) - 기본값
  - 띄어쓰기
  - 줄바꿈
  - 세미콜론 (;)
  - 콜론 (:)
  - 대시 (-)
  - 파이프 (|)
- 중복 자동 제거 및 정렬
- 각 결과 개별 복사 기능

### 🎲 Random Tools

#### Roulette
- 커스텀 룰렛 생성
- 항목 추가/삭제
- 랜덤 선택 애니메이션
- 결과 히스토리

#### Lotto
- 로또 번호 생성기
- 1~45 범위에서 6개 번호 자동 추첨
- 여러 세트 한번에 생성
- 번호 정렬 옵션

## 프로젝트 구조

```
tool/
├── app/                      # Next.js App Router
│   ├── time/                # 시간 관련 도구
│   │   ├── timer/
│   │   └── converter/
│   ├── json/                # JSON 도구
│   │   └── formatter/
│   ├── string/              # 문자열 도구
│   │   ├── newline/
│   │   ├── regex/
│   │   ├── manipulator/
│   │   ├── extractor/
│   │   └── set-operations/
│   └── random/              # 랜덤 도구
│       ├── roulette/
│       └── lotto/
├── components/              # React 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── app-sidebar.tsx     # 사이드바 네비게이션
│   └── header.tsx          # 헤더 (breadcrumb, 테마 토글)
└── lib/                    # 유틸리티 함수
    └── utils.ts           # cn() 함수 등
```

## UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **다크 모드**: next-themes를 통한 테마 전환
- **접근성**: Radix UI 프리미티브 사용
- **애니메이션**: 부드러운 전환 효과
- **복사 기능**: 클립보드 API 지원
- **실시간 처리**: 입력 시 즉시 결과 표시
- **디바운싱**: 성능 최적화 (300ms)

## 개발 가이드

### 새로운 도구 추가하기

1. `app/` 디렉토리 내 카테고리 폴더에 새 경로 생성
2. `page.tsx` 파일 작성
3. `components/app-sidebar.tsx`에 메뉴 항목 추가

### shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add [컴포넌트명]
```

### 스타일 가이드

- Tailwind CSS v4 사용
- `lib/utils.ts`의 `cn()` 함수로 조건부 스타일링
- "new-york" 스타일 일관성 유지
- 디자인 토큰은 `app/globals.css`에 정의

## 라이선스

MIT

## 기여

이슈 및 풀 리퀘스트를 환영합니다.
