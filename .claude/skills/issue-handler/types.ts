/**
 * Type definitions for Issue Handler Skill
 */

// Issue types enum
export enum IssueType {
  TASK = 'TASK',
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  HOTFIX = 'HOTFIX',
  IMPROVEMENT = 'IMPROVEMENT',
  EPIC = 'EPIC',
  STORY = 'STORY',
  SUB_TASK = 'SUB-TASK'
}

// Priority levels
export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  TRIVIAL = 'TRIVIAL'
}

// Issue status
export enum IssueStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  TESTING = 'TESTING',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

// Main issue data structure
export interface IssueData {
  title: string;
  description: string;
  type: IssueType;
  priority?: Priority;
  status?: IssueStatus;
  assignee?: string;
  labels?: string[];
  attachments?: string[];
  context_files?: string[];
  acceptance_criteria?: string[];
  estimated_hours?: number;
  parent_issue?: string;
  related_issues?: string[];
  due_date?: string;
  components?: string[];
  affected_versions?: string[];
  fix_versions?: string[];
}

// Skill context passed to handlers
export interface SkillContext {
  inputs: {
    issue_code: string;
    issue_data: IssueData;
  };
  config?: SkillConfig;
  environment?: Environment;
  user?: User;
}

// Skill configuration
export interface SkillConfig {
  auto_branch?: boolean;
  branch_naming?: string;
  commit_template?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  testing_enabled?: boolean;
  coverage_threshold?: number;
  notification_channels?: string[];
}

// Environment information
export interface Environment {
  workspace_path: string;
  git_repo?: string;
  branch?: string;
  language?: string;
  framework?: string;
  dependencies?: Record<string, string>;
}

// User information
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  permissions?: string[];
}

// Action result structure
export interface ActionResult {
  action: string;
  result: 'completed' | 'failed' | 'skipped';
  timestamp: string;
  details?: any;
  error?: string;
}

// Execution metrics
export interface ExecutionMetrics {
  execution_time: number;
  tokens_used: number;
  files_modified: number;
  tests_run: number;
  coverage: number;
  lines_added?: number;
  lines_removed?: number;
  complexity_delta?: number;
}

// Main execution result
export interface ExecutionResult {
  issue_id: string;
  status: 'success' | 'failed' | 'partial';
  actions_taken: ActionResult[];
  artifacts: string[];
  next_steps: string[];
  metrics: ExecutionMetrics;
  message?: string;
  error?: string;
  warnings?: string[];
  suggestions?: string[];
}

// Workflow step definition
export interface WorkflowStep {
  id: string;
  action: string;
  description: string;
  required?: boolean;
  timeout?: number;
  error_handling?: 'stop' | 'continue' | 'retry';
  validation?: boolean;
  tools?: string[];
  dependencies?: string[];
}

// Workflow definition
export interface Workflow {
  description: string;
  priority?: Priority;
  steps: WorkflowStep[];
  pre_conditions?: string[];
  post_conditions?: string[];
  rollback_strategy?: string;
}

// Claude command parameters
export interface ClaudeCommand {
  action: string;
  prompt: string;
  context?: any;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  tools?: string[];
}

// Git integration options
export interface GitOptions {
  auto_branch: boolean;
  branch_name: string;
  commit_message: string;
  push_to_remote?: boolean;
  create_pr?: boolean;
  pr_title?: string;
  pr_description?: string;
}

// Test execution options
export interface TestOptions {
  frameworks: string[];
  coverage: boolean;
  coverage_threshold: number;
  test_types: ('unit' | 'integration' | 'e2e')[];
  parallel?: boolean;
  timeout?: number;
}

// Notification options
export interface NotificationOptions {
  channels: ('slack' | 'email' | 'webhook')[];
  events: ('started' | 'completed' | 'failed' | 'blocked')[];
  recipients?: string[];
  webhook_url?: string;
  template?: string;
}