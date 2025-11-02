# Issue Handler Skill - 사용 예시

## 1. Command Center에서 이슈 실행하기

### BUG 이슈 예시

```yaml
# Command Center Issue
issue_code: BUG-456
issue_data:
  title: "로그인 시 500 에러 발생"
  type: BUG
  priority: HIGH
  description: |
    ## 문제 상황
    OAuth 로그인 시도 시 500 Internal Server Error 발생

    ## 재현 단계
    1. 로그인 페이지 접속
    2. Google OAuth 선택
    3. 인증 완료 후 리다이렉트
    4. 500 에러 페이지 표시

    ## 예상 동작
    정상적으로 로그인되고 대시보드로 이동

    ## 스택 트레이스
    ```
    TypeError: Cannot read property 'id' of null
      at OAuthController.callback (oauth.controller.ts:45:23)
      at processTicksAndRejections (internal/process/task_queues.js:95:5)
    ```

  context_files:
    - src/auth/oauth.controller.ts
    - src/auth/oauth.service.ts
    - src/auth/strategies/google.strategy.ts

  labels:
    - authentication
    - urgent
    - production-bug
```

**실행 명령:**
```bash
/issue BUG-456
```

**예상 워크플로우:**
1. 버그 재현 시도
2. 스택 트레이스 분석으로 null 참조 오류 확인
3. oauth.controller.ts:45 라인 수정
4. null 체크 및 에러 핸들링 추가
5. 회귀 테스트 작성
6. 모든 테스트 실행 및 검증

---

### FEATURE 이슈 예시

```yaml
# Command Center Issue
issue_code: FEATURE-789
issue_data:
  title: "다크 모드 토글 기능 추가"
  type: FEATURE
  priority: MEDIUM
  description: |
    ## 요구사항
    사용자가 UI 테마를 라이트/다크 모드로 전환할 수 있는 기능

    ## 상세 기능
    - 헤더에 토글 스위치 추가
    - 사용자 설정 저장 (localStorage)
    - 시스템 테마 자동 감지 옵션
    - 부드러운 전환 애니메이션

    ## 기술 스펙
    - React Context API로 테마 상태 관리
    - CSS Variables로 색상 관리
    - Tailwind CSS 다크 모드 클래스 활용

  acceptance_criteria:
    - 토글 스위치로 테마 변경 가능
    - 페이지 새로고침 후에도 설정 유지
    - 모든 컴포넌트가 다크 모드 지원
    - WCAG 2.1 접근성 기준 충족

  context_files:
    - src/components/Header.tsx
    - src/styles/globals.css
    - src/contexts/ThemeContext.tsx

  estimated_hours: 16
```

**실행 명령:**
```bash
/handle-issue FEATURE-789
```

**예상 워크플로우:**
1. 설계 문서 작성
2. 작업을 하위 태스크로 분해:
   - ThemeContext 구현
   - 토글 컴포넌트 생성
   - 다크 모드 스타일 적용
   - localStorage 통합
3. TDD 방식으로 구현
4. 단위/통합/E2E 테스트 작성
5. 사용자 문서 및 API 문서 생성
6. 체크리스트 검증

---

### HOTFIX 이슈 예시

```yaml
# Command Center Issue
issue_code: HOTFIX-111
issue_data:
  title: "프로덕션 데이터베이스 연결 실패"
  type: HOTFIX
  priority: CRITICAL
  description: |
    ## 긴급 상황
    프로덕션 환경에서 데이터베이스 연결이 간헐적으로 실패

    ## 영향도
    - 영향 받는 사용자: 전체 (100%)
    - 서비스 가용성: 30% 저하
    - 발생 시작: 2024-03-15 14:00 UTC

    ## 증상
    - Connection timeout after 30s
    - Pool exhausted 에러
    - 동시 연결 수 초과

  context_files:
    - src/database/connection.ts
    - src/config/database.config.ts
    - docker-compose.yml
```

**실행 명령:**
```bash
/issue HOTFIX-111
```

**예상 워크플로우:**
1. 60초 내 빠른 분석
2. 연결 풀 설정 조정 (즉시 패치)
3. 핵심 연결 테스트만 실행
4. 롤백 계획 준비
5. 즉시 배포 준비

---

## 2. 이슈 타입별 자동 처리

### IMPROVEMENT 예시

```yaml
issue_code: IMPROVE-222
issue_data:
  title: "API 응답 속도 최적화"
  type: IMPROVEMENT
  description: |
    현재 /api/products 엔드포인트 응답 시간이 평균 2초
    목표: 500ms 이하로 개선

  context_files:
    - src/controllers/product.controller.ts
    - src/services/product.service.ts
    - src/repositories/product.repository.ts
```

**실행 결과:**
```json
{
  "actions_taken": [
    {
      "action": "analyze_code_quality",
      "details": {
        "current_metrics": {
          "complexity": 15,
          "query_count": 12,
          "avg_response_time": 2000
        }
      }
    },
    {
      "action": "suggest_improvements",
      "details": {
        "suggestions": [
          "Implement query batching",
          "Add Redis caching layer",
          "Optimize database indexes",
          "Use pagination for large datasets"
        ]
      }
    },
    {
      "action": "apply_refactoring",
      "details": {
        "changes": [
          "Added Redis cache with 5min TTL",
          "Implemented DataLoader for batching",
          "Created compound index on (category, price)"
        ]
      }
    },
    {
      "action": "run_benchmarks",
      "details": {
        "before": { "avg_time": 2000, "p95": 3500 },
        "after": { "avg_time": 350, "p95": 500 },
        "improvement": "82.5%"
      }
    }
  ]
}
```

---

## 3. 복합 시나리오

### EPIC 분해 예시

```yaml
issue_code: EPIC-333
issue_data:
  title: "사용자 대시보드 전면 개편"
  type: EPIC
  estimated_hours: 200
  description: |
    전체 사용자 대시보드 UX/UI 개편
    - 새로운 디자인 시스템 적용
    - 실시간 데이터 업데이트
    - 커스터마이징 가능한 위젯
    - 모바일 반응형 디자인
```

**자동 생성되는 스토리:**
1. STORY-334: 디자인 시스템 구축
2. STORY-335: 위젯 프레임워크 개발
3. STORY-336: 실시간 데이터 파이프라인
4. STORY-337: 모바일 레이아웃 구현
5. STORY-338: 사용자 설정 관리

---

## 4. 연계 실행

### 이슈 체인 실행

```typescript
// 버그 수정 후 자동으로 개선 작업 실행
const bugFix = await executeSkill('issue-handler', {
  issue_code: 'BUG-100',
  issue_data: { /* ... */ }
});

if (bugFix.status === 'success') {
  // 관련 코드 개선
  await executeSkill('issue-handler', {
    issue_code: 'IMPROVE-101',
    issue_data: {
      title: 'Refactor after bug fix',
      related_issues: ['BUG-100'],
      context_files: bugFix.artifacts
    }
  });
}
```

---

## 5. 커스텀 워크플로우

### 회사별 맞춤 설정

```yaml
# .claude/skills/issue-handler/custom-workflow.yaml

workflows:
  SECURITY_AUDIT:
    description: "보안 감사 워크플로우"
    steps:
      - action: scan_vulnerabilities
        tools: ["snyk", "sonarqube"]

      - action: check_dependencies
        validation: true

      - action: penetration_test
        timeout: 3600

      - action: generate_security_report
        format: "pdf"

  DATA_MIGRATION:
    description: "데이터 마이그레이션"
    steps:
      - action: backup_current_data
        required: true

      - action: validate_schema

      - action: run_migration_script
        rollback_on_error: true

      - action: verify_data_integrity

      - action: update_indexes
```

---

## 6. 모니터링 대시보드 연동

```javascript
// 실시간 이슈 처리 상태 모니터링
const monitor = new IssueMonitor();

monitor.on('issue:started', (data) => {
  updateDashboard({
    issue: data.issue_code,
    status: 'IN_PROGRESS',
    startTime: Date.now()
  });
});

monitor.on('action:completed', (data) => {
  addToTimeline({
    issue: data.issue_code,
    action: data.action,
    result: data.result,
    duration: data.duration
  });
});

monitor.on('issue:completed', (data) => {
  showNotification({
    type: 'success',
    message: `Issue ${data.issue_code} completed`,
    metrics: data.metrics
  });
});
```

---

## 7. CI/CD 통합

### GitHub Actions 통합

```yaml
# .github/workflows/issue-handler.yml
name: Auto Handle Issues

on:
  issues:
    types: [opened, labeled]

jobs:
  handle-issue:
    if: contains(github.event.label.name, 'auto-process')
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Extract Issue Data
        id: issue
        run: |
          echo "::set-output name=code::$(echo ${{ github.event.issue.title }} | grep -oP '[A-Z]+-\d+')"

      - name: Execute Issue Handler Skill
        run: |
          claude-code skill execute issue-handler \
            --issue-code "${{ steps.issue.outputs.code }}" \
            --issue-data "${{ toJSON(github.event.issue) }}"

      - name: Comment Results
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Issue processed successfully!'
            })
```

---

## 8. 테스트 실행

### 스킬 테스트

```bash
# 드라이런 모드로 테스트
claude-code skill test issue-handler \
  --dry-run \
  --issue-code "TEST-001" \
  --mock-data

# 특정 워크플로우만 테스트
claude-code skill test issue-handler \
  --workflow "BUG" \
  --verbose

# 벤치마크 실행
claude-code skill benchmark issue-handler \
  --iterations 10 \
  --report benchmark_results.json
```