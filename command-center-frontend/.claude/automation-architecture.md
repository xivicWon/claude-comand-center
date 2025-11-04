# Task Automation Architecture

## 개요
Task 상태가 "IN_PROGRESS"로 변경되면 자동으로 Claude Code를 실행하고, 완료 시 "REVIEW" 상태로 변경하며, 각 상태 변경마다 Slack으로 알림을 보내는 자동화 시스템.

## 워크플로우

```
Task: TODO → IN_PROGRESS
    ↓
[1] Backend Webhook 감지
    ↓
[2] Slack 알림: "Task started"
    ↓
[3] Issue 내용 파싱
    ↓
[4] Claude Code 실행
    ↓
[5] 실행 완료 대기
    ↓
[6] 완료 시 Task → REVIEW
    ↓
[7] Slack 알림: "Task completed, moved to review"
```

## 시스템 구성요소

### 1. Backend (FastAPI)

#### 1.1 Issue Status Change Listener
```python
# services/issue_watcher.py
class IssueStatusWatcher:
    """Issue 상태 변경을 감지하고 처리"""

    async def on_status_change(issue_id, old_status, new_status):
        # IN_PROGRESS로 변경 시
        if new_status == "IN_PROGRESS":
            await trigger_claude_execution(issue_id)

        # 모든 상태 변경 시 Slack 알림
        await send_slack_notification(issue_id, old_status, new_status)
```

#### 1.2 Claude Code Integration Service
```python
# services/claude_service.py
class ClaudeCodeService:
    """Claude Code CLI 실행 및 관리"""

    def execute_task(issue: Issue) -> ExecutionResult:
        # Issue 내용을 Claude 명령으로 변환
        prompt = format_issue_as_prompt(issue)

        # Claude Code 실행
        result = subprocess.run([
            "claude",
            "--project", issue.project.directory,
            "--prompt", prompt
        ])

        return result

    async def monitor_execution(execution_id: str):
        # 실행 상태 모니터링
        # 완료 시 Issue 상태를 REVIEW로 변경
        pass
```

#### 1.3 Slack Integration
```python
# services/slack_service.py
class SlackNotificationService:
    """Slack webhook 알림 전송"""

    async def notify_status_change(issue, old_status, new_status):
        webhook_url = get_project_slack_webhook(issue.project_id)

        message = {
            "text": f"Task {issue.code} moved from {old_status} to {new_status}",
            "attachments": [{
                "title": issue.title,
                "text": issue.description,
                "color": get_status_color(new_status)
            }]
        }

        await send_webhook(webhook_url, message)
```

#### 1.4 Execution Tracking
```python
# models/claude_execution.py
class ClaudeExecution:
    id: str
    issue_id: str
    status: Literal["RUNNING", "COMPLETED", "FAILED"]
    started_at: datetime
    completed_at: datetime | None
    output: str
    error: str | None
```

### 2. Database Schema

```sql
-- claude_executions 테이블
CREATE TABLE claude_executions (
    id UUID PRIMARY KEY,
    issue_id UUID REFERENCES issues(id),
    status VARCHAR(20),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    output TEXT,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- project_settings 테이블 (Slack webhook 등)
CREATE TABLE project_settings (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    slack_webhook_url VARCHAR(500),
    claude_auto_execute BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Frontend

#### 3.1 Project Settings Page
```
/dashboard/projects/[id]/settings
- Slack Webhook URL 입력
- Claude 자동 실행 활성화/비활성화
- 실행 히스토리 조회
```

#### 3.2 Execution Monitor Component
```
- 실시간 Claude 실행 상태 표시
- 진행 중인 Task 목록
- 실행 로그 스트리밍
```

#### 3.3 Issue Status Update Hook
```typescript
// hooks/useUpdateIssueStatus.ts
const updateIssueStatus = useMutation({
  mutationFn: async ({ issueId, status }) => {
    // Backend가 자동으로 Claude 실행 트리거
    return issueApi.updateStatus(issueId, status)
  }
})
```

## API Endpoints

### Backend Endpoints

```
POST   /api/issues/{id}/status
  - Issue 상태 변경
  - Webhook 트리거
  - Response: { success, data: Issue }

GET    /api/projects/{id}/executions
  - 프로젝트의 Claude 실행 히스토리
  - Response: { success, data: ClaudeExecution[] }

GET    /api/executions/{id}/stream
  - 실시간 실행 로그 스트리밍 (SSE)

POST   /api/projects/{id}/settings
  - 프로젝트 설정 업데이트 (Slack webhook 등)
  - Body: { slack_webhook_url, claude_auto_execute }

GET    /api/projects/{id}/settings
  - 프로젝트 설정 조회
```

## 보안 고려사항

1. **Slack Webhook URL 암호화**
   - DB에 평문 저장 금지
   - 환경변수 또는 암호화 저장

2. **Claude Code 실행 권한**
   - 프로젝트 디렉토리 접근 제한
   - Sandbox 환경에서 실행

3. **실행 시간 제한**
   - Timeout 설정 (예: 30분)
   - 무한 루프 방지

## 구현 우선순위

### Phase 1 (Core)
1. ✅ Issue 상태 변경 API
2. Backend - Issue 상태 변경 listener/webhook
3. Backend - Slack 알림 서비스
4. Frontend - 프로젝트 설정 페이지

### Phase 2 (Claude Integration)
5. Backend - Claude Code 실행 서비스
6. Backend - 실행 모니터링 및 자동 상태 변경
7. Frontend - 실행 상태 모니터링 UI

### Phase 3 (Advanced)
8. 실시간 로그 스트리밍 (SSE)
9. 실행 히스토리 대시보드
10. 실패 시 재시도 로직

## 설정 예시

```json
// Project Settings
{
  "slack_webhook_url": "https://hooks.slack.com/services/...",
  "claude_auto_execute": true,
  "execution_timeout_minutes": 30,
  "auto_move_to_review": true,
  "notify_on_statuses": ["IN_PROGRESS", "REVIEW", "DONE", "FAILED"]
}
```

## Slack 메시지 포맷

```json
{
  "text": "Task PROJ-123 moved to IN_PROGRESS",
  "attachments": [{
    "color": "#2196F3",
    "title": "Fix authentication bug",
    "text": "Users are unable to log in with Google OAuth...",
    "fields": [
      { "title": "Priority", "value": "HIGH", "short": true },
      { "title": "Type", "value": "BUG", "short": true },
      { "title": "Assignee", "value": "Claude", "short": true },
      { "title": "Project", "value": "Command Center", "short": true }
    ],
    "footer": "Command Center",
    "ts": 1234567890
  }]
}
```

## 다음 단계

1. Backend에서 Issue 상태 변경 endpoint 확인
2. Slack webhook 서비스 구현
3. 프로젝트 설정 API 구현
4. Frontend 설정 페이지 구현
5. Claude Code 통합 (가장 복잡)
