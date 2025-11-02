# Command Center 프로세스 명세서

## 1. 개요

### 1.1 문서 정보
- **문서명**: Command Center - Claude Code 통합 이슈 관리 시스템
- **버전**: 1.0
- **작성일**: 2025-11-02
- **작성자**: System Architect
- **검토자**: Development Team
- **승인자**: Project Manager

### 1.2 목적
본 시스템은 Jira와 유사한 이슈 트래킹 기능을 제공하면서, Claude Code와의 직접적인 통합을 통해 AI 기반 개발 작업의 효율성을 극대화하는 것을 목적으로 한다.

**핵심 목표**:
- 이슈 기반 작업 관리 체계 구축
- Claude Code로의 명령 전달 자동화
- 작업 진행 상황의 실시간 동기화
- AI 작업 결과의 체계적 관리

### 1.3 범위
**포함 사항**:
- 이슈 생성, 수정, 삭제 기능
- Claude Code 명령 생성 및 전달
- 작업 상태 추적 및 업데이트
- 작업 결과 저장 및 버전 관리

**제외 사항**:
- 복잡한 프로젝트 관리 기능 (간트 차트 등)
- 외부 CI/CD 시스템과의 직접 연동
- 팀 협업 기능 (초기 버전)

### 1.4 용어 정의
| 용어 | 정의 | 비고 |
|------|------|------|
| Issue | 작업 단위를 나타내는 티켓 | Jira의 Issue와 동일 개념 |
| Command | Claude Code로 전달되는 작업 명령 | 프롬프트 형태 |
| Sync | 시스템과 Claude Code 간 상태 동기화 | 양방향 동기화 |
| Workspace | 작업 공간 및 컨텍스트 | Claude Code 실행 환경 |
| Status | 이슈의 현재 진행 상태 | TODO, IN_PROGRESS, DONE 등 |

---

## 2. 워크플로우 정의

### 2.1 프로세스 개요도
```
[이슈 생성] → [명령 생성] → [Claude Code 전송] → [작업 실행]
     ↑                                                    ↓
[업데이트] ← [결과 동기화] ← [상태 모니터링] ← [진행상황 수신]
```

### 2.2 주요 단계별 설명

#### 2.2.1 이슈 생성 (Issue Creation)
- **목적**: 새로운 작업 단위 정의 및 등록
- **입력**: 제목, 설명, 타입, 우선순위, 레이블
- **출력**: Issue ID, 초기 상태
- **담당자/시스템**: 사용자 / Command Center
- **선행조건**: 유효한 프로젝트 선택
- **완료조건**: Issue가 DB에 저장되고 ID 발급

#### 2.2.2 명령 생성 (Command Generation)
- **목적**: Issue를 Claude Code가 이해할 수 있는 명령으로 변환
- **입력**: Issue 정보, 컨텍스트 데이터
- **출력**: 구조화된 Claude Code 명령
- **담당자/시스템**: Command Generator Module
- **선행조건**: Issue 상태가 'READY'
- **완료조건**: 유효한 명령 문자열 생성

#### 2.2.3 Claude Code 전송 (Command Transmission)
- **목적**: 생성된 명령을 Claude Code로 전달
- **입력**: Command 객체, 실행 옵션
- **출력**: Transmission ID, 응답 확인
- **담당자/시스템**: Integration Module
- **선행조건**: Claude Code API 연결 활성
- **완료조건**: 전송 확인 및 작업 ID 수신

#### 2.2.4 상태 모니터링 (Status Monitoring)
- **목적**: Claude Code 작업 진행 상황 추적
- **입력**: 작업 ID, 폴링 주기
- **출력**: 진행률, 중간 결과
- **담당자/시스템**: Monitoring Service
- **선행조건**: 작업이 실행 중
- **완료조건**: 작업 완료 또는 오류 발생

### 2.3 프로세스 흐름

| 순번 | 단계명 | 담당자 | 입력 | 활동 설명 | 출력 | 다음 단계 |
|------|--------|--------|------|-----------|------|-----------|
| 1 | 이슈 생성 | User | 이슈 정보 | 새 이슈 등록 | Issue ID | 명령 준비 |
| 2 | 명령 준비 | System | Issue | 컨텍스트 수집 | Context | 명령 생성 |
| 3 | 명령 생성 | System | Issue + Context | 프롬프트 생성 | Command | 검증 |
| 4 | 명령 검증 | System | Command | 유효성 확인 | Valid Command | 전송 |
| 5 | Claude 전송 | System | Command | API 호출 | Job ID | 모니터링 |
| 6 | 진행 모니터링 | System | Job ID | 상태 폴링 | Progress | 업데이트 |
| 7 | 결과 수신 | System | Job ID | 최종 결과 수집 | Result | 저장 |
| 8 | Issue 업데이트 | System | Result | 상태 갱신 | Updated Issue | 완료 |

### 2.4 분기 조건

| 분기점 | 조건 | True 경로 | False 경로 | 비고 |
|--------|------|-----------|------------|------|
| 명령 검증 | Command.isValid() | Claude 전송 | 오류 처리 | 재시도 3회 |
| API 응답 | Response.success | 모니터링 시작 | 재전송 | 지수 백오프 |
| 작업 상태 | Status == ERROR | 오류 처리 | 계속 모니터링 | 사용자 알림 |
| 결과 검증 | Result.complete | Issue 업데이트 | 부분 저장 | 재시도 옵션 |

---

## 3. 기능 요구사항

### 3.1 핵심 기능

#### F-001: 이슈 생성 및 관리
- **설명**: Jira 스타일의 이슈 생성, 수정, 삭제, 조회 기능
- **우선순위**: 높음
- **관련 워크플로우 단계**: 이슈 생성
- **입력 데이터**:
  - 제목 (string, 필수)
  - 설명 (markdown, 필수)
  - 타입 (TASK, BUG, FEATURE, 필수)
  - 우선순위 (HIGH, MEDIUM, LOW)
  - 레이블 (array of strings)
  - 첨부 파일 (array of files)
- **출력 데이터**:
  - Issue ID (unique identifier)
  - 생성 타임스탬프
  - 상태 (TODO, IN_PROGRESS, DONE)
- **비즈니스 규칙**:
  - Issue ID는 프로젝트 키-순번 형식 (예: CMD-001)
  - 설명은 마크다운 형식 지원
  - 파일 첨부는 최대 10MB
- **예외 처리**:
  - 중복 제목 검사 및 경고
  - 필수 필드 누락 시 검증 오류

#### F-002: Claude Code 명령 생성
- **설명**: 이슈 정보를 Claude Code가 실행할 수 있는 명령으로 변환
- **우선순위**: 높음
- **관련 워크플로우 단계**: 명령 생성
- **입력 데이터**:
  - Issue 객체
  - 프로젝트 컨텍스트 (코드베이스 정보)
  - 사용자 정의 프롬프트 템플릿
  - 실행 옵션 (모델 선택, 타임아웃 등)
- **출력 데이터**:
  - 구조화된 명령 객체
  - 예상 토큰 사용량
  - 실행 비용 추정치
- **비즈니스 규칙**:
  - 명령은 최대 8000 토큰 제한
  - 컨텍스트는 관련 파일만 포함
  - 민감 정보 자동 마스킹
- **예외 처리**:
  - 토큰 제한 초과 시 자동 분할
  - 컨텍스트 로드 실패 시 기본값 사용

#### F-003: Claude Code API 통합
- **설명**: Claude Code와의 양방향 통신 및 명령 전달
- **우선순위**: 높음
- **관련 워크플로우 단계**: Claude Code 전송, 상태 모니터링
- **입력 데이터**:
  - Command 객체
  - API 인증 정보
  - 실행 환경 설정
- **출력 데이터**:
  - Job ID
  - 실행 상태
  - 실시간 로그 스트림
- **비즈니스 규칙**:
  - API 호출 제한: 분당 60회
  - 타임아웃: 5분 (설정 가능)
  - 자동 재시도: 최대 3회
- **예외 처리**:
  - API 제한 도달 시 큐잉
  - 네트워크 오류 시 지수 백오프

#### F-004: 실시간 상태 동기화
- **설명**: Claude Code 작업 진행 상황을 실시간으로 추적 및 업데이트
- **우선순위**: 높음
- **관련 워크플로우 단계**: 상태 모니터링, 결과 동기화
- **입력 데이터**:
  - Job ID
  - 폴링 주기 (기본 5초)
  - 웹소켓 연결 정보
- **출력 데이터**:
  - 진행률 (percentage)
  - 중간 출력물
  - 에러 로그
  - 최종 결과
- **비즈니스 규칙**:
  - 웹소켓 우선, 폴링 폴백
  - 진행률은 10% 단위로 업데이트
  - 로그는 최대 1MB 저장
- **예외 처리**:
  - 연결 끊김 시 자동 재연결
  - 장시간 무응답 시 타임아웃

#### F-005: 결과 저장 및 버전 관리
- **설명**: Claude Code 실행 결과를 저장하고 버전 관리
- **우선순위**: 중간
- **관련 워크플로우 단계**: 결과 수신, Issue 업데이트
- **입력 데이터**:
  - 실행 결과 (코드, 문서 등)
  - 메타데이터 (실행 시간, 사용 모델 등)
  - 변경 사항 diff
- **출력 데이터**:
  - 결과 ID
  - 버전 번호
  - 변경 요약
- **비즈니스 규칙**:
  - 모든 결과는 버전 관리
  - 최대 10개 버전 보관
  - 자동 백업 일일 1회
- **예외 처리**:
  - 저장 공간 부족 시 알림
  - 손상된 데이터 검증 및 복구

### 3.2 보조 기능

#### F-101: 이슈 검색 및 필터링
- **설명**: JQL 스타일의 고급 검색 기능
- **우선순위**: 중간
- **관련 기능**: F-001

#### F-102: 템플릿 관리
- **설명**: 자주 사용하는 이슈 및 명령 템플릿 관리
- **우선순위**: 낮음
- **관련 기능**: F-001, F-002

#### F-103: 배치 작업
- **설명**: 여러 이슈를 한 번에 처리
- **우선순위**: 낮음
- **관련 기능**: F-001, F-003

---

## 4. 데이터 요구사항

### 4.1 입력 데이터

| 데이터명 | 타입 | 필수여부 | 설명 | 검증 규칙 |
|----------|------|----------|------|-----------|
| issue_title | string | 필수 | 이슈 제목 | 최대 200자 |
| issue_description | text | 필수 | 이슈 상세 설명 | 마크다운 형식 |
| issue_type | enum | 필수 | TASK, BUG, FEATURE | 정의된 값만 |
| priority | enum | 선택 | HIGH, MEDIUM, LOW | 기본값: MEDIUM |
| labels | array | 선택 | 태그 목록 | 최대 10개 |
| context_files | array | 선택 | 관련 파일 경로 | 유효 경로 검증 |
| prompt_template | string | 선택 | 사용자 정의 프롬프트 | 최대 4000자 |

### 4.2 출력 데이터

| 데이터명 | 타입 | 설명 | 형식 |
|----------|------|------|------|
| issue_id | string | 고유 식별자 | PRJ-XXXX |
| command_id | uuid | 명령 식별자 | UUID v4 |
| job_id | string | Claude 작업 ID | 알파뉴메릭 |
| execution_result | json | 실행 결과 | 구조화된 JSON |
| logs | array | 실행 로그 | 타임스탬프 포함 |
| metrics | object | 실행 메트릭 | 시간, 토큰, 비용 |

### 4.3 데이터 매핑

| 원본 데이터 | 대상 데이터 | 변환 규칙 | 비고 |
|-------------|-------------|-----------|------|
| issue_description | claude_prompt | 마크다운 → 평문 + 컨텍스트 | 토큰 최적화 |
| issue_type | command_type | TASK→code, BUG→fix, FEATURE→implement | 명령 유형 변환 |
| priority | execution_priority | HIGH→immediate, MEDIUM→normal, LOW→batch | 실행 우선순위 |
| labels | context_tags | 레이블 → Claude 컨텍스트 태그 | 메타데이터 포함 |

---

## 5. 인터페이스 요구사항

### 5.1 사용자 인터페이스

#### UI-001: 이슈 대시보드
- **목적**: 전체 이슈 현황 및 관리
- **사용자**: 개발자, 프로젝트 관리자
- **주요 기능**:
  - 이슈 목록 표시 (칸반/리스트 뷰)
  - 빠른 필터 및 검색
  - 드래그 앤 드롭 상태 변경
  - 일괄 작업 선택
- **화면 구성 요소**:
  - 상태별 컬럼 (TODO, IN_PROGRESS, DONE)
  - 이슈 카드 (제목, 타입, 우선순위, 진행률)
  - 필터 패널
  - 액션 툴바

#### UI-002: 이슈 상세 화면
- **목적**: 개별 이슈 상세 정보 및 Claude Code 실행
- **사용자**: 개발자
- **주요 기능**:
  - 이슈 정보 편집
  - Claude Code 명령 미리보기
  - 실행 버튼 및 옵션 설정
  - 실시간 진행 상황 표시
  - 결과 뷰어
- **화면 구성 요소**:
  - 이슈 정보 섹션
  - 명령 에디터
  - 실행 컨트롤
  - 로그 콘솔
  - 결과 패널

#### UI-003: Claude Code 명령 편집기
- **목적**: 명령 커스터마이징 및 테스트
- **사용자**: 고급 사용자
- **주요 기능**:
  - 프롬프트 편집
  - 컨텍스트 파일 선택
  - 토큰 카운터
  - 드라이 런
- **화면 구성 요소**:
  - 코드 에디터 (신택스 하이라이팅)
  - 파일 트리
  - 프리뷰 패널
  - 실행 옵션

### 5.2 시스템 인터페이스

#### SI-001: Claude Code API Interface
- **연계 시스템**: Claude Code CLI/API
- **프로토콜**: HTTPS/WebSocket
- **데이터 형식**: JSON
- **엔드포인트**:
  - POST /execute - 명령 실행
  - GET /status/{job_id} - 상태 조회
  - GET /result/{job_id} - 결과 조회
  - WS /stream/{job_id} - 실시간 스트림
- **호출 빈도**: 분당 최대 60회
- **타임아웃**: 30초 (조정 가능)

#### SI-002: Version Control Interface
- **연계 시스템**: Git Repository
- **프로토콜**: Git Protocol / HTTPS
- **데이터 형식**: Git Objects
- **주요 작업**:
  - 컨텍스트 파일 읽기
  - 결과 커밋
  - 브랜치 관리
- **호출 빈도**: 이슈당 평균 5-10회
- **타임아웃**: 10초

---

## 6. 비기능 요구사항

### 6.1 성능 요구사항
- **응답시간**:
  - 이슈 생성: < 1초
  - 명령 생성: < 2초
  - 대시보드 로드: < 3초
- **처리량**:
  - 동시 이슈 처리: 100개
  - 초당 API 호출: 10 TPS
- **동시 사용자**: 50명

### 6.2 보안 요구사항
- **인증 방식**: OAuth 2.0 / API Key
- **권한 관리**: RBAC (Role-Based Access Control)
- **데이터 암호화**:
  - 전송 중: TLS 1.3
  - 저장 시: AES-256
- **API 키 관리**: 환경 변수 / Secret Manager

### 6.3 가용성 요구사항
- **가동률**: 99.5% (월간)
- **백업 정책**:
  - 데이터베이스: 일일 증분, 주간 전체
  - 파일: 실시간 복제
- **복구 시간**:
  - RTO: 4시간
  - RPO: 1시간

---

## 7. 제약사항

### 7.1 기술적 제약사항
- Claude Code API 속도 제한 준수
- 토큰 사용량 제한 (월별 할당량)
- 웹소켓 연결 수 제한 (서버당 1000개)

### 7.2 비즈니스 제약사항
- 무료 티어: 월 100개 이슈 실행
- 유료 티어: 무제한 (API 비용 별도)
- 데이터 보관: 최대 1년

### 7.3 규제/법적 제약사항
- GDPR 준수 (EU 사용자)
- 소스 코드 라이선스 확인
- AI 생성 코드 저작권 고지

---

## 8. 역할 및 책임

| 역할 | 책임 | 권한 | 담당자 |
|------|------|------|--------|
| Admin | 시스템 전체 관리 | 모든 권한 | 시스템 관리자 |
| Developer | 이슈 생성 및 실행 | CRUD, Execute | 개발팀 |
| Viewer | 조회 전용 | Read Only | 이해관계자 |
| Claude Integration | API 연동 관리 | API 설정 | DevOps |

---

## 9. 예외 처리

### 9.1 예외 상황

| 예외 ID | 예외 상황 | 발생 조건 | 처리 방안 | 담당자 |
|---------|-----------|-----------|-----------|--------|
| E-001 | API 한도 초과 | 분당 60회 초과 | 큐에 저장 후 대기 | System |
| E-002 | Claude 응답 없음 | 30초 타임아웃 | 3회 재시도 | System |
| E-003 | 컨텍스트 로드 실패 | 파일 없음 | 기본 컨텍스트 사용 | System |
| E-004 | 토큰 한도 초과 | 8000 토큰 초과 | 명령 분할 실행 | System |
| E-005 | 저장 공간 부족 | 90% 사용 | 오래된 결과 아카이브 | Admin |

---

## 10. 테스트 시나리오

### 10.1 정상 시나리오

| 시나리오 ID | 시나리오명 | 테스트 단계 | 예상 결과 | 검증 방법 |
|-------------|------------|-------------|-----------|-----------|
| TS-001 | 단순 이슈 실행 | 1. 이슈 생성<br>2. 실행<br>3. 결과 확인 | 성공 완료 | 로그 검증 |
| TS-002 | 배치 실행 | 1. 10개 이슈 생성<br>2. 일괄 실행<br>3. 전체 완료 확인 | 모두 성공 | 상태 확인 |
| TS-003 | 실시간 모니터링 | 1. 장시간 작업 실행<br>2. 진행률 확인<br>3. 중간 결과 확인 | 실시간 업데이트 | UI 확인 |

### 10.2 예외 시나리오

| 시나리오 ID | 시나리오명 | 테스트 단계 | 예상 결과 | 검증 방법 |
|-------------|------------|-------------|-----------|-----------|
| TS-E001 | API 제한 도달 | 1. 60개 요청 연속 전송<br>2. 61번째 요청 | 큐 대기 | 큐 상태 확인 |
| TS-E002 | 네트워크 단절 | 1. 실행 중 네트워크 차단<br>2. 복구 | 자동 재연결 | 연결 로그 |
| TS-E003 | 잘못된 명령 | 1. 문법 오류 명령 전송<br>2. 오류 수신 | 에러 메시지 | 에러 로그 |

---

## 11. 구현 계획

### 11.1 단계별 구현 계획

| 단계 | 구현 내용 | 시작일 | 종료일 | 담당팀 | 산출물 |
|------|-----------|--------|--------|--------|--------|
| 1단계 | 기본 이슈 관리 | W1 | W2 | Backend | Issue CRUD API |
| 2단계 | Claude 통합 | W3 | W5 | Integration | API Connector |
| 3단계 | UI 구현 | W4 | W6 | Frontend | Web Dashboard |
| 4단계 | 실시간 동기화 | W6 | W7 | Full Stack | WebSocket |
| 5단계 | 테스트 및 안정화 | W8 | W9 | QA | Test Report |

### 11.2 의존성
- Claude Code API 액세스 키
- 데이터베이스 서버 (PostgreSQL)
- 메시지 큐 (Redis/RabbitMQ)
- 파일 스토리지 (S3 호환)

---

## 12. 변경 이력

| 버전 | 변경일 | 변경 내용 | 변경자 | 승인자 |
|------|--------|-----------|--------|--------|
| 1.0 | 2025-11-02 | 최초 작성 | System Architect | PM |

---

## 부록

### A. 참고 문서
- Claude Code API Documentation
- Jira REST API Reference
- WebSocket Protocol RFC 6455

### B. API 명세 예시

#### 이슈 생성 API
```json
POST /api/issues
{
  "title": "Fix authentication bug",
  "description": "Users cannot login with OAuth",
  "type": "BUG",
  "priority": "HIGH",
  "labels": ["auth", "urgent"],
  "context_files": ["src/auth/*.js"]
}

Response:
{
  "issue_id": "CMD-001",
  "status": "TODO",
  "created_at": "2025-11-02T10:00:00Z"
}
```

#### Claude Command 실행 API
```json
POST /api/claude/execute
{
  "issue_id": "CMD-001",
  "options": {
    "model": "claude-3-opus",
    "timeout": 300,
    "max_tokens": 4000
  }
}

Response:
{
  "job_id": "job_abc123",
  "status": "RUNNING",
  "stream_url": "wss://api/stream/job_abc123"
}
```

### C. 상태 전이 다이어그램
```
TODO → IN_PROGRESS → DONE
  ↓         ↓          ↓
BLOCKED   FAILED   ARCHIVED
```

### D. 데이터베이스 스키마

```sql
-- Issues 테이블
CREATE TABLE issues (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    priority VARCHAR(10),
    status VARCHAR(20) DEFAULT 'TODO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commands 테이블
CREATE TABLE commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id VARCHAR(20) REFERENCES issues(id),
    prompt TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Executions 테이블
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command_id UUID REFERENCES commands(id),
    job_id VARCHAR(100),
    status VARCHAR(20),
    result JSONB,
    logs TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);
```