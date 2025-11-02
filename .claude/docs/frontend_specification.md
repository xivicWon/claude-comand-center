# Frontend 환경 명세서 - Command Center

## 1. 기술 스택 개요

### 1.1 추천 기술 스택
| 구분 | 기술 | 버전 | 선정 사유 |
|------|------|------|-----------|
| **Framework** | Next.js | 14.x | App Router, SSR/SSG, 최적화된 성능 |
| **Language** | TypeScript | 5.x | 타입 안정성, 개발 생산성 |
| **UI Library** | React | 18.x | 컴포넌트 기반, 생태계 |
| **상태 관리** | Zustand + TanStack Query | Latest | 간단함, 서버 상태 최적화 |
| **스타일링** | Tailwind CSS + shadcn/ui | 3.x | 빠른 개발, 일관된 디자인 |
| **실시간 통신** | Socket.io Client | 4.x | WebSocket 추상화, 폴백 지원 |
| **코드 에디터** | Monaco Editor | Latest | VS Code 기반, 풍부한 기능 |
| **차트/시각화** | Recharts + D3.js | Latest | 대시보드 시각화 |

### 1.2 대안 기술 스택 비교

#### Option A: Next.js + TypeScript (추천) ⭐
**장점:**
- 풀스택 프레임워크로 API Routes 지원
- 뛰어난 SEO와 초기 로딩 성능
- Vercel 플랫폼과의 완벽한 통합
- App Router의 서버 컴포넌트 활용

**단점:**
- 학습 곡선이 다소 있음
- 빌드 시간이 길 수 있음

#### Option B: Vite + React + TypeScript
**장점:**
- 빠른 개발 서버 (HMR)
- 간단한 설정
- 빌드 속도 빠름

**단점:**
- SSR 구현 복잡
- SEO 최적화 추가 작업 필요

#### Option C: Remix
**장점:**
- 네스티드 라우팅
- 우수한 데이터 로딩 패턴
- 폼 처리 최적화

**단점:**
- 생태계가 상대적으로 작음
- 커뮤니티 리소스 부족

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조 (Next.js 14 App Router)
```
command-center-frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # 대시보드 라우트 그룹
│   │   ├── layout.tsx       # 대시보드 레이아웃
│   │   ├── page.tsx         # 대시보드 홈
│   │   ├── issues/          # 이슈 관리
│   │   │   ├── page.tsx     # 이슈 목록
│   │   │   ├── [id]/        # 이슈 상세
│   │   │   └── new/         # 이슈 생성
│   │   └── claude/          # Claude 실행 관리
│   │       ├── commands/    # 명령 관리
│   │       └── executions/  # 실행 이력
│   ├── api/                 # API Routes
│   │   ├── auth/
│   │   ├── issues/
│   │   └── claude/
│   ├── layout.tsx           # 루트 레이아웃
│   └── globals.css          # 글로벌 스타일
├── components/              # 재사용 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── issues/             # 이슈 관련 컴포넌트
│   │   ├── IssueCard.tsx
│   │   ├── IssueForm.tsx
│   │   ├── IssueBoard.tsx  # 칸반 보드
│   │   └── IssueFilters.tsx
│   ├── claude/             # Claude 관련 컴포넌트
│   │   ├── CommandEditor.tsx
│   │   ├── ExecutionLog.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── ResultViewer.tsx
│   └── shared/             # 공통 컴포넌트
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── LoadingState.tsx
├── hooks/                  # 커스텀 훅
│   ├── useIssues.ts
│   ├── useClaudeExecution.ts
│   ├── useWebSocket.ts
│   └── useAuth.ts
├── lib/                    # 유틸리티
│   ├── api/               # API 클라이언트
│   │   ├── client.ts
│   │   ├── issues.ts
│   │   └── claude.ts
│   ├── utils/             # 헬퍼 함수
│   ├── constants/         # 상수
│   └── validators/        # 유효성 검사
├── stores/                # Zustand 스토어
│   ├── authStore.ts
│   ├── issueStore.ts
│   └── executionStore.ts
├── types/                 # TypeScript 타입
│   ├── issue.ts
│   ├── claude.ts
│   └── api.ts
├── public/               # 정적 파일
├── tests/               # 테스트 파일
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── config/              # 설정 파일
    ├── site.ts
    └── navigation.ts
```

---

## 3. 핵심 컴포넌트 명세

### 3.1 Issue Board (칸반 보드)
```typescript
// 주요 기능
interface IssueBoardProps {
  projectId: string;
  filters?: IssueFilters;
  onIssueUpdate: (issue: Issue) => void;
  onExecute: (issueId: string) => void;
}

// 기능 요구사항
- Drag & Drop으로 상태 변경
- 실시간 업데이트 (WebSocket)
- 필터링 및 검색
- 일괄 작업 선택
- 진행률 표시
```

### 3.2 Claude Command Editor
```typescript
interface CommandEditorProps {
  issue: Issue;
  context?: ProjectContext;
  onExecute: (command: Command) => void;
}

// 핵심 기능
- Monaco Editor 기반 코드 편집
- 프롬프트 템플릿
- 토큰 카운터
- 컨텍스트 파일 선택기
- 실행 옵션 설정
```

### 3.3 Execution Monitor
```typescript
interface ExecutionMonitorProps {
  executionId: string;
  onComplete: (result: ExecutionResult) => void;
}

// 실시간 모니터링
- 진행률 바
- 로그 스트리밍
- 중간 결과 표시
- 에러 핸들링
- 중단/재시작 컨트롤
```

---

## 4. 상태 관리 전략

### 4.1 클라이언트 상태 (Zustand)
```typescript
// stores/issueStore.ts
interface IssueStore {
  // State
  issues: Issue[];
  selectedIssue: Issue | null;
  filters: IssueFilters;

  // Actions
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  setFilters: (filters: IssueFilters) => void;
}

// stores/executionStore.ts
interface ExecutionStore {
  executions: Map<string, Execution>;
  activeExecution: string | null;

  startExecution: (issueId: string) => void;
  updateProgress: (id: string, progress: number) => void;
  completeExecution: (id: string, result: any) => void;
}
```

### 4.2 서버 상태 (TanStack Query)
```typescript
// hooks/useIssues.ts
export const useIssues = (projectId: string) => {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => fetchIssues(projectId),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: true,
  });
};

// hooks/useClaudeExecution.ts
export const useExecuteCommand = () => {
  return useMutation({
    mutationFn: executeCommand,
    onSuccess: (data) => {
      // WebSocket 구독 시작
      subscribeToExecution(data.jobId);
    },
  });
};
```

---

## 5. 실시간 통신 구현

### 5.1 WebSocket 연결 관리
```typescript
// lib/websocket.ts
class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;

  connect(url: string, options: SocketOptions) {
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      ...options
    });

    this.setupEventListeners();
  }

  subscribeToExecution(jobId: string) {
    this.socket?.emit('subscribe', { jobId });

    this.socket?.on(`execution:${jobId}:progress`, (data) => {
      // 진행률 업데이트
      executionStore.updateProgress(jobId, data.progress);
    });

    this.socket?.on(`execution:${jobId}:complete`, (data) => {
      // 완료 처리
      executionStore.completeExecution(jobId, data.result);
    });
  }
}
```

### 5.2 실시간 이벤트 처리
```typescript
// 이벤트 타입
type RealtimeEvents = {
  'issue:created': (issue: Issue) => void;
  'issue:updated': (issue: Issue) => void;
  'issue:deleted': (issueId: string) => void;
  'execution:started': (execution: Execution) => void;
  'execution:progress': (data: ProgressData) => void;
  'execution:completed': (result: ExecutionResult) => void;
  'execution:failed': (error: ExecutionError) => void;
};
```

---

## 6. UI/UX 디자인 시스템

### 6.1 컴포넌트 라이브러리 (shadcn/ui)
```bash
# 설치할 컴포넌트
npx shadcn-ui@latest add button card dialog form input label
npx shadcn-ui@latest add select tabs table toast dropdown-menu
npx shadcn-ui@latest add progress skeleton alert badge
```

### 6.2 테마 설정
```css
/* tailwind.config.ts */
{
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        claude: '#8b5cf6', // Claude 브랜드 컬러
      }
    }
  }
}
```

### 6.3 반응형 디자인 브레이크포인트
```typescript
// Mobile First Approach
const breakpoints = {
  sm: '640px',   // 태블릿
  md: '768px',   // 소형 노트북
  lg: '1024px',  // 데스크톱
  xl: '1280px',  // 대형 모니터
  '2xl': '1536px' // 초대형 모니터
};
```

---

## 7. 성능 최적화 전략

### 7.1 코드 분할 및 지연 로딩
```typescript
// 동적 임포트
const MonacoEditor = dynamic(
  () => import('@/components/claude/CommandEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />
  }
);

// 라우트 기반 코드 분할 (Next.js 자동 처리)
```

### 7.2 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Command Center"
  width={200}
  height={50}
  priority // LCP 최적화
  placeholder="blur"
/>
```

### 7.3 캐싱 전략
```typescript
// API 응답 캐싱
const cacheStrategy = {
  issues: {
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  },
  userProfile: {
    staleTime: 30 * 60 * 1000, // 30분
    cacheTime: 60 * 60 * 1000, // 1시간
  },
  staticData: {
    staleTime: Infinity, // 무제한
  }
};
```

### 7.4 번들 최적화
```javascript
// next.config.js
module.exports = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## 8. 개발 환경 설정

### 8.1 필수 도구
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:e2e": "playwright test",
    "storybook": "storybook dev -p 6006"
  }
}
```

### 8.2 VS Code 설정
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### 8.3 환경 변수
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_CLAUDE_API_KEY=your_key_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

---

## 9. 테스트 전략

### 9.1 단위 테스트 (Jest + React Testing Library)
```typescript
// components/issues/IssueCard.test.tsx
describe('IssueCard', () => {
  it('should render issue information correctly', () => {
    const issue = mockIssue();
    render(<IssueCard issue={issue} />);

    expect(screen.getByText(issue.title)).toBeInTheDocument();
    expect(screen.getByText(issue.status)).toBeInTheDocument();
  });

  it('should trigger onExecute when execute button clicked', () => {
    const onExecute = jest.fn();
    render(<IssueCard issue={mockIssue()} onExecute={onExecute} />);

    fireEvent.click(screen.getByRole('button', { name: /execute/i }));
    expect(onExecute).toHaveBeenCalled();
  });
});
```

### 9.2 E2E 테스트 (Playwright)
```typescript
// tests/e2e/issue-workflow.spec.ts
test('complete issue workflow', async ({ page }) => {
  // 1. 이슈 생성
  await page.goto('/issues/new');
  await page.fill('[name="title"]', 'Fix authentication bug');
  await page.fill('[name="description"]', 'Users cannot login');
  await page.click('button[type="submit"]');

  // 2. Claude 실행
  await page.click('[data-testid="execute-claude"]');
  await page.waitForSelector('[data-testid="execution-progress"]');

  // 3. 결과 확인
  await page.waitForSelector('[data-testid="execution-complete"]', {
    timeout: 60000
  });

  expect(await page.textContent('[data-testid="status"]')).toBe('DONE');
});
```

---

## 10. 배포 전략

### 10.1 Vercel 배포 (추천)
```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"], # US East
  "functions": {
    "app/api/claude/execute/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### 10.2 Docker 배포
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 11. 모니터링 및 분석

### 11.1 에러 트래킹 (Sentry)
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
});
```

### 11.2 사용자 분석 (PostHog)
```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js';

export const trackEvent = (event: string, properties?: any) => {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
};

// 사용 예시
trackEvent('issue_created', {
  issueType: 'BUG',
  priority: 'HIGH',
  withClaudeCommand: true
});
```

### 11.3 성능 모니터링
```typescript
// Web Vitals 측정
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const { id, name, label, value } = metric;

  // Analytics로 전송
  trackEvent('web_vitals', {
    metric: name,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    label: label
  });
}
```

---

## 12. 보안 고려사항

### 12.1 인증/인가
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // CSRF 토큰 검증
  if (request.method !== 'GET') {
    const csrfToken = request.headers.get('x-csrf-token');
    if (!validateCSRFToken(csrfToken)) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }
}
```

### 12.2 입력 검증
```typescript
// lib/validators/issue.ts
import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  type: z.enum(['TASK', 'BUG', 'FEATURE']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  labels: z.array(z.string()).max(10).optional(),
});

// XSS 방지
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};
```

---

## 13. 접근성 (A11y)

### 13.1 ARIA 레이블 및 역할
```tsx
// 접근성을 고려한 컴포넌트
<button
  aria-label="Execute Claude command"
  aria-pressed={isExecuting}
  aria-disabled={!canExecute}
  role="button"
  tabIndex={0}
>
  <span aria-hidden="true">▶</span>
  <span className="sr-only">Execute</span>
</button>
```

### 13.2 키보드 네비게이션
```typescript
// hooks/useKeyboardNavigation.ts
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: 검색
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }

      // Cmd/Ctrl + Enter: 실행
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        executeCommand();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

---

## 14. 개발 로드맵

### Phase 1: 기초 구축 (Week 1-2)
- [ ] Next.js 프로젝트 초기 설정
- [ ] TypeScript 설정 및 타입 정의
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] 기본 레이아웃 구현
- [ ] 라우팅 구조 설정

### Phase 2: 핵심 기능 (Week 3-4)
- [ ] 이슈 CRUD UI
- [ ] 칸반 보드 구현
- [ ] Claude 명령 에디터
- [ ] 실행 모니터링 화면

### Phase 3: 실시간 기능 (Week 5)
- [ ] WebSocket 연결 구현
- [ ] 실시간 진행률 업데이트
- [ ] 로그 스트리밍

### Phase 4: 고급 기능 (Week 6-7)
- [ ] 고급 검색 및 필터
- [ ] 배치 작업
- [ ] 템플릿 관리
- [ ] 결과 비교 뷰

### Phase 5: 최적화 및 배포 (Week 8)
- [ ] 성능 최적화
- [ ] 테스트 작성
- [ ] 문서화
- [ ] 배포 파이프라인 구축

---

## 15. 예상 비용

### 15.1 개발 비용
| 항목 | 예상 시간 | 시간당 비용 | 총 비용 |
|------|-----------|-------------|---------|
| Frontend 개발 | 320시간 | $100 | $32,000 |
| UI/UX 디자인 | 80시간 | $80 | $6,400 |
| 테스트 작성 | 40시간 | $80 | $3,200 |
| **총 개발 비용** | | | **$41,600** |

### 15.2 운영 비용 (월간)
| 서비스 | 티어 | 월 비용 |
|--------|------|---------|
| Vercel | Pro | $20 |
| Sentry | Team | $26 |
| PostHog | Free | $0 |
| Claude API | Usage-based | ~$500 |
| **총 운영 비용** | | **~$546/월** |

---

## 부록

### A. 참고 자료
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Socket.io Documentation](https://socket.io/docs)

### B. 개발 체크리스트
```markdown
## Pre-Development
- [ ] 디자인 시스템 확정
- [ ] API 명세 확인
- [ ] 개발 환경 구축
- [ ] Git 저장소 설정

## Development
- [ ] 컴포넌트 개발
- [ ] 상태 관리 구현
- [ ] API 연동
- [ ] 실시간 통신 구현
- [ ] 테스트 작성

## Pre-Launch
- [ ] 성능 테스트
- [ ] 보안 감사
- [ ] 접근성 검증
- [ ] 브라우저 호환성 테스트
- [ ] 최종 QA
```

### C. 브라우저 지원
| 브라우저 | 최소 버전 |
|----------|-----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | iOS 14+ |
| Chrome Mobile | Android 10+ |