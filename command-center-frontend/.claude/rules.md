# Command Center Frontend - Development Rules

## Code Quality Workflow

### 1. 작업 완료 후 필수 체크

모든 기능 구현이 완료되면 **반드시** 다음 단계를 순차적으로 실행:

#### Step 1: TypeScript 타입 체크
```bash
npm run type-check
```
- 타입 오류를 빠르게 발견
- 빌드보다 빠른 피드백
- 커밋 전 필수 실행

#### Step 2: 프로덕션 빌드
```bash
npm run build
```
- 최종 검증 및 최적화
- 런타임 오류 사전 발견
- 배포 전 필수 실행

#### Step 3: 브라우저 검증 ⭐ 중요
```bash
npm run dev
```
개발 서버 실행 후 **반드시** 브라우저에서 확인:

1. **브라우저 콘솔 확인**
   - 개발자 도구 열기 (F12 또는 Cmd+Option+I)
   - Console 탭에서 에러/경고 확인
   - 빨간색 에러가 없어야 함

2. **네트워크 탭 확인**
   - API 요청 실패 여부 확인
   - 404, 500 에러 없어야 함

3. **실제 기능 테스트**
   - 구현한 기능이 정상 작동하는지 클릭해보기
   - 페이지 이동이 정상적인지 확인
   - CSS가 제대로 적용되었는지 시각적 확인

4. **CSS 이슈 체크**
   - 레이아웃 깨짐 없는지 확인
   - 반응형 디자인 정상 작동 확인
   - Tailwind 클래스가 적용되는지 확인

**일반적인 브라우저 에러:**
- `Hydration failed` - 서버/클라이언트 렌더링 불일치
- `Failed to fetch` - API 요청 실패
- `Cannot read property of undefined` - null/undefined 접근
- CSS 적용 안 됨 - Tailwind 설정 또는 클래스명 오류

### 2. 타입 안전성 규칙

#### Optional Chaining 사용
```typescript
// ❌ Bad - 런타임 오류 발생 가능
project.members.length

// ✅ Good - 안전한 접근
project.members?.length || 0
```

#### 타입 명시
```typescript
// ❌ Bad - any 타입 사용
const [data, setData] = useState<any>(null)

// ✅ Good - 명시적 타입
const [data, setData] = useState<Project | null>(null)
```

#### Optional 필드 처리
```typescript
// ❌ Bad - undefined 체크 없음
const userName = user.name.toUpperCase()

// ✅ Good - 안전한 처리
const userName = user.name?.toUpperCase() ?? 'Unknown'
```

### 3. 개발 워크플로우

#### 개발 중
```bash
npm run dev
```
- 자동 타입 체크 및 Hot Reload
- 브라우저에서 실시간 오류 확인

#### 커밋 전
```bash
npm run type-check
```
- TypeScript 타입 오류 확인
- 빠른 피드백 루프

#### 배포 전
```bash
npm run build
```
- 프로덕션 빌드 성공 확인
- 최적화 및 번들 크기 확인

### 4. 타입 정의 규칙

#### 중앙 집중식 타입 관리
```typescript
// ✅ Good - types/index.ts에 모든 타입 정의
export interface Project { ... }
export interface Issue { ... }

// ❌ Bad - 각 파일마다 중복 정의
```

#### Store와 타입 분리
```typescript
// stores/projectStore.ts
import { Project } from '@/types'  // ✅ 타입 import

// ❌ 직접 정의하지 않음
export interface Project { ... }
```

### 5. API 연동 규칙

#### 항상 타입 안전한 API 호출
```typescript
// ✅ Good - ApiResponse 타입 사용
const response = await projectsApi.getAll()
if (response.success && response.data) {
  setProjects(response.data)
}

// ❌ Bad - 타입 체크 없음
const projects = await fetch('/api/projects').then(r => r.json())
```

#### 에러 처리 필수
```typescript
try {
  const response = await projectsApi.getAll()
  // 성공 처리
} catch (error) {
  console.error('Failed to fetch:', error)
  setError(error instanceof Error ? error.message : 'Unknown error')
}
```

### 6. 컴포넌트 작성 규칙

#### Props 타입 명시
```typescript
// ✅ Good
interface KanbanBoardProps {
  projectId: string
  issues: Issue[]
  onUpdateIssue: (issueId: string, status: IssueStatus) => void
}

export default function KanbanBoard({ projectId, issues, onUpdateIssue }: KanbanBoardProps) {
  // ...
}
```

#### 배열 렌더링 시 Optional Chaining
```typescript
// ✅ Good
{project.members?.map((member) => (
  <div key={member.id}>{member.name}</div>
))}

// ❌ Bad - members가 undefined일 수 있음
{project.members.map((member) => (
  <div key={member.id}>{member.name}</div>
))}
```

### 7. State 관리 규칙

#### Zustand Store 타입 안전성
```typescript
interface ProjectStore {
  projects: Project[]
  isLoading: boolean
  error: string | null

  setProjects: (projects: Project[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}
```

#### Store 사용 시 구조 분해
```typescript
// ✅ Good - 필요한 것만 가져오기
const { projects, isLoading, setProjects } = useProjectStore()

// ❌ Bad - 전체 store 가져오기
const store = useProjectStore()
```

### 8. 체크리스트

작업 완료 전 확인사항:

- [ ] `npm run type-check` 통과
- [ ] `npm run build` 성공
- [ ] **브라우저 개발자 도구 콘솔 확인** (에러 0개)
- [ ] **브라우저에서 실제 기능 동작 테스트**
- [ ] **CSS가 정상 적용되었는지 시각적 확인**
- [ ] Optional chaining (`?.`) 사용 확인 (또는 Mapper로 처리)
- [ ] 모든 API 호출에 에러 처리 추가
- [ ] 타입 정의가 중앙화되어 있는지 확인
- [ ] 런타임 오류 가능성 검토

### 9. 금지사항

#### ❌ 절대 하지 말 것
```typescript
// any 타입 사용
const data: any = await fetch(...)

// @ts-ignore 주석 사용
// @ts-ignore
const value = obj.property

// 타입 체크 없이 직접 접근
project.members.length

// 타입 단언(assertion) 남용
const project = data as Project
```

### 10. 자동화 권장사항

#### Git Pre-commit Hook (선택사항)
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run type-check"
    }
  }
}
```

#### VS Code 설정 권장
```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Summary

**핵심 원칙**: 작업 완료 후 항상 3단계 검증 필수

```bash
# 1단계: 타입 체크
npm run type-check

# 2단계: 빌드
npm run build

# 3단계: 브라우저 검증 ⭐ 매우 중요
npm run dev
# → 브라우저에서 F12 열고 콘솔 에러 확인
# → 실제 기능 클릭해서 동작 확인
# → CSS 시각적 확인
```

이 규칙을 따르면:
- ✅ 런타임 오류 사전 방지
- ✅ 타입 안전성 보장
- ✅ CSS 이슈 조기 발견
- ✅ 브라우저 에러 사전 차단
- ✅ 프로덕션 배포 신뢰성 향상
- ✅ 디버깅 시간 단축
