# API 호출 패턴 비교

## 현재 구조 (컴포넌트에서 API 호출)

### 현재 방식
```typescript
// 컴포넌트
const { setProjects, setLoading, setError } = useProjectStore()

useEffect(() => {
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await projectsApi.getAll()
      if (response.success && response.data) {
        setProjects(response.data)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  fetchProjects()
}, [])
```

### 장점
✅ **관심사 분리** - Store는 상태만, 컴포넌트는 데이터 페칭
✅ **유연성** - 각 컴포넌트가 필요에 따라 다르게 호출 가능
✅ **React Query와 통합 쉬움** - 서버 상태 관리 전문 라이브러리 사용 시
✅ **Store가 심플** - 순수한 상태 관리만 담당
✅ **테스트 쉬움** - API 모킹이 컴포넌트 레벨에서만 필요

### 단점
❌ **로직 중복** - 여러 컴포넌트에서 같은 패턴 반복
❌ **컴포넌트 복잡도 증가** - Loading/Error 처리 코드 반복
❌ **보일러플레이트** - 매번 try-catch, loading 처리 작성

---

## 대안 1: Store에 API 로직 포함

### Store 방식
```typescript
// stores/projectStore.ts
export const useProjectStore = create<ProjectStore>()((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  // API 호출 로직을 Store 안에
  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectsApi.getAll()
      if (response.success && response.data) {
        set({ projects: response.data, isLoading: false })
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await projectsApi.getById(id)
      if (response.success && response.data) {
        set((state) => ({
          projects: [...state.projects, response.data],
          isLoading: false
        }))
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
}))

// 컴포넌트 - 매우 깔끔!
const { fetchProjects } = useProjectStore()

useEffect(() => {
  fetchProjects()
}, [fetchProjects])
```

### 장점
✅ **컴포넌트 단순화** - 한 줄로 끝남
✅ **로직 재사용** - 여러 컴포넌트에서 같은 함수 사용
✅ **중앙 집중식 관리** - 모든 API 로직이 한 곳에
✅ **Loading/Error 자동 관리** - Store가 알아서 처리
✅ **일관성** - 모든 API 호출이 같은 패턴

### 단점
❌ **Store 비대화** - Store가 너무 많은 책임
❌ **의존성 증가** - Store가 API에 강하게 결합
❌ **테스트 복잡도** - Store 테스트 시 API도 모킹 필요
❌ **유연성 감소** - 특별한 경우 처리가 어려움
❌ **React Query와 충돌** - 서버 상태 관리가 중복됨

---

## 대안 2: React Query 사용 (권장 ⭐)

### React Query 방식
```typescript
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/projects'
import { useProjectStore } from '@/stores/projectStore'

export function useProjects() {
  const { setProjects } = useProjectStore()

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll()
      if (response.success && response.data) {
        setProjects(response.data)  // Store 동기화
        return response.data
      }
      throw new Error('Failed to fetch projects')
    },
    staleTime: 5 * 60 * 1000,  // 5분간 캐시
    retry: 3,
  })
}

// 컴포넌트 - 최고로 깔끔!
const { data: projects, isLoading, error } = useProjects()
```

### 장점
✅ **최고의 개발 경험** - 자동 캐싱, 리페칭, 에러 처리
✅ **성능 최적화** - 중복 요청 방지, 백그라운드 업데이트
✅ **DevTools** - React Query DevTools로 디버깅 쉬움
✅ **표준화** - 업계 표준 패턴
✅ **Store는 순수** - 상태만 관리
✅ **자동 리트라이** - 실패 시 자동 재시도
✅ **낙관적 업데이트** - UI 즉시 반영 후 서버 동기화

### 단점
❌ **학습 곡선** - React Query 사용법 익혀야 함
❌ **의존성 추가** - 이미 설치되어 있음 (package.json 확인)

---

## 비교표

| 특징 | 현재 (컴포넌트) | Store에 포함 | React Query |
|------|----------------|--------------|-------------|
| 컴포넌트 복잡도 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Store 복잡도 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 코드 중복 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 유연성 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 캐싱 | ❌ | ❌ | ✅ 자동 |
| 리트라이 | ❌ | 수동 | ✅ 자동 |
| 테스트 용이성 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 성능 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 학습 곡선 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 현재 프로젝트 상황

package.json 확인 결과:
```json
"@tanstack/react-query": "^5.62.2"
```
✅ **React Query가 이미 설치되어 있습니다!**

---

## 권장 사항

### 🎯 Best Practice: React Query + Zustand 조합

```typescript
// 1. Server State: React Query가 관리
// hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll()
      return response.data
    }
  })
}

// 2. Client State: Zustand가 관리
// stores/projectStore.ts
export const useProjectStore = create<ProjectStore>()((set) => ({
  selectedProjectId: null,
  filters: {},

  selectProject: (id) => set({ selectedProjectId: id }),
  setFilters: (filters) => set({ filters }),
}))

// 3. 컴포넌트
function ProjectsPage() {
  // 서버 상태
  const { data: projects, isLoading } = useProjects()

  // 클라이언트 상태
  const { selectedProjectId, selectProject } = useProjectStore()

  // 깔끔!
}
```

### 역할 분리
- **React Query**: 서버 데이터 (API 호출, 캐싱, 동기화)
- **Zustand**: UI 상태 (선택된 항목, 필터, 모달 open/close)

---

## 마이그레이션 가이드

### Step 1: Query Provider 설정
```typescript
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,  // 1분
      retry: 3,
    },
  },
})

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Step 2: Custom Hook 생성
```typescript
// hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll()
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch projects')
      }
      return response.data
    },
  })
}
```

### Step 3: 컴포넌트 단순화
```typescript
// Before
const { projects, isLoading, setProjects, setLoading } = useProjectStore()
useEffect(() => {
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await projectsApi.getAll()
      if (response.success && response.data) {
        setProjects(response.data)
      }
    } finally {
      setLoading(false)
    }
  }
  fetchProjects()
}, [])

// After
const { data: projects, isLoading } = useProjects()
```

---

## 결론

### 현재 방식을 유지한 이유
1. ✅ **단순성** - 초기 구조가 이해하기 쉬움
2. ✅ **유연성** - React Query 도입 준비 상태
3. ✅ **관심사 분리** - Store가 순수하게 유지됨

### 추천: React Query 도입
프로젝트에 **React Query가 이미 설치되어 있으므로**, 점진적으로 마이그레이션하는 것을 강력히 권장합니다.

**이유:**
- ✅ 자동 캐싱으로 성능 향상
- ✅ 중복 요청 방지
- ✅ 자동 리페칭으로 데이터 최신성 유지
- ✅ 더 나은 개발 경험
- ✅ 업계 표준 패턴

### 점진적 마이그레이션 전략
1. 먼저 가장 복잡한 API 호출부터 React Query로 전환
2. 새로운 기능은 React Query 사용
3. 기존 코드는 필요할 때 리팩토링

---

**결론:** Store에 API 로직을 넣을 수도 있지만, React Query를 사용하는 것이 현대적이고 효율적입니다. 이미 설치되어 있으니 도입을 권장합니다!
