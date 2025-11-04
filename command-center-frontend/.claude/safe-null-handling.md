# 안전한 Null/Undefined 처리 방법

## 문제 상황

```typescript
// ❌ 위험: members가 undefined면 런타임 에러
project.members.length

// ⚠️ 현재 해결책: 하지만 직관적이지 않음
project.members?.length || 0
```

## 더 명시적이고 직관적인 방법들

### 방법 1: 기본값으로 빈 배열 설정 (★ 추천)

```typescript
// types/index.ts
export interface Project {
  id: string
  name: string
  members: User[]  // Optional 제거하고 필수로 설정
}

// API에서 받아올 때 정규화
const response = await projectsApi.getAll()
if (response.success && response.data) {
  const normalizedProjects = response.data.map(project => ({
    ...project,
    members: project.members || []  // undefined면 빈 배열
  }))
  setProjects(normalizedProjects)
}

// 사용할 때 안전하고 직관적
<span>{project.members.length} members</span>
```

**장점:**
- 가장 직관적이고 읽기 쉬움
- `?.` 없이 일반적인 코드 작성 가능
- 한 곳에서만 처리하면 됨

**단점:**
- API 응답 정규화 필요

---

### 방법 2: Helper 함수 사용

```typescript
// lib/utils/array.ts
export function getArrayLength<T>(arr: T[] | undefined | null): number {
  return Array.isArray(arr) ? arr.length : 0
}

export function safeArray<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : []
}

// 사용
<span>{getArrayLength(project.members)} members</span>

// 또는 map과 함께
{safeArray(project.members).map(member => (
  <div key={member.id}>{member.name}</div>
))}
```

**장점:**
- 명시적이고 읽기 쉬움
- 재사용 가능
- Array.isArray로 확실한 체크

**단점:**
- Helper 함수 관리 필요
- 함수 호출 오버헤드 (미미함)

---

### 방법 3: Guard Clause (명시적 체크)

```typescript
// 컴포넌트 최상단에서 체크
export default function ProjectCard({ project }: Props) {
  // 안전한 기본값 설정
  const members = project.members ?? []
  const memberCount = members.length

  return (
    <div>
      <span>{memberCount} members</span>
      {members.map(member => (
        <div key={member.id}>{member.name}</div>
      ))}
    </div>
  )
}
```

**장점:**
- 매우 명시적
- 컴포넌트 내에서 간단한 변수명 사용 가능
- 여러 곳에서 사용할 때 반복 제거

**단점:**
- 각 컴포�넌트마다 작성 필요

---

### 방법 4: Nullish Coalescing 연산자 (??)

```typescript
// Optional chaining 대신 nullish coalescing 사용
const memberCount = (project.members ?? []).length
const hasMembers = (project.members ?? []).length > 0

// 더 읽기 쉬운 버전
const members = project.members ?? []
<span>{members.length} members</span>
```

**장점:**
- `?.`보다 명시적
- "값이 없으면 기본값 사용"이라는 의도가 명확

**단점:**
- 여전히 약간의 학습 곡선

---

### 방법 5: Store 레벨에서 정규화

```typescript
// stores/projectStore.ts
export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set, get) => ({
        projects: [],

        // API 데이터를 받을 때 정규화
        setProjects: (projects) =>
          set({
            projects: projects.map(normalizeProject)
          }),

        addProject: (project) =>
          set((state) => ({
            projects: [...state.projects, normalizeProject(project)]
          })),
      }),
      { name: 'project-store' }
    )
  )
)

// 정규화 함수
function normalizeProject(project: any): Project {
  return {
    ...project,
    members: project.members || [],
    description: project.description || '',
    // 모든 optional 필드에 기본값 설정
  }
}
```

**장점:**
- 앱 전체에서 안전한 데이터 보장
- 컴포넌트는 정규화된 데이터만 다룸
- 가장 근본적인 해결책

**단점:**
- Store 로직이 복잡해질 수 있음

---

## 추천 조합 전략

### 1단계: Store에서 기본값 설정
```typescript
// stores/projectStore.ts
setProjects: (projects) =>
  set({
    projects: projects.map(p => ({
      ...p,
      members: p.members || []
    }))
  })
```

### 2단계: 타입을 필수로 변경
```typescript
// types/index.ts
export interface Project {
  members: User[]  // optional 제거
}
```

### 3단계: 컴포넌트에서 안전하게 사용
```typescript
// 이제 ? 없이 사용 가능
<span>{project.members.length} members</span>
{project.members.map(member => ...)}
```

---

## 실전 예제: 리팩토링

### Before (Optional Chaining 사용)
```typescript
<span>{project.members?.length || 0} members</span>

{project.members?.slice(0, 3).map(member => (
  <div key={member.id}>{member.name}</div>
))}
```

### After (Store 정규화 + 기본값)
```typescript
// stores/projectStore.ts - 한 번만 설정
const normalizeProject = (p: any): Project => ({
  ...p,
  members: p.members || [],
  description: p.description || '',
})

// 컴포넌트 - 깔끔하고 직관적
<span>{project.members.length} members</span>

{project.members.slice(0, 3).map(member => (
  <div key={member.id}>{member.name}</div>
))}
```

---

## 각 방법 비교표

| 방법 | 직관성 | 안전성 | 코드량 | 추천도 |
|------|--------|--------|--------|--------|
| Optional Chaining (`?.`) | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 기본값 설정 (Store) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Helper 함수 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Guard Clause | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Nullish Coalescing | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 결론 및 권장사항

### 최선의 방법: Store 레벨 정규화 + 기본값
```typescript
// 1. Store에서 정규화
setProjects: (projects) =>
  set({ projects: projects.map(normalizeProject) })

// 2. 타입을 필수로 변경
interface Project {
  members: User[]  // optional 제거
}

// 3. 코드가 깔끔해짐
project.members.length  // ✅ 안전하고 직관적!
```

**이유:**
- ✅ 가장 직관적 (물음표 없음)
- ✅ 한 곳에서만 관리
- ✅ 컴포넌트 코드가 깔끔
- ✅ 타입 안전성 유지
- ✅ 디버깅 쉬움

---

## 실제 적용 시 고려사항

### API 응답이 일관되지 않을 때
```typescript
// 방어적 프로그래밍
function normalizeProject(p: any): Project {
  return {
    id: p.id || '',
    name: p.name || 'Untitled',
    key: p.key || 'UNKNOWN',
    description: p.description || '',
    members: Array.isArray(p.members) ? p.members : [],
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString(),
  }
}
```

### 점진적 마이그레이션
1. 먼저 Store에 정규화 로직 추가
2. 타입은 optional 유지
3. 컴포넌트에서 `?.` 제거
4. 모든 곳에서 안정적이면 타입을 필수로 변경

---

**결론**: `?.`는 빠른 해결책이지만, **Store 레벨의 정규화**가 가장 깔끔하고 유지보수하기 좋은 방법입니다.
