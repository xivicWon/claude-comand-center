/**
 * Issue Handler Skill - Main Execution Script
 * Jira-like issue processing based on issue type
 */

import { SkillContext, IssueData, ExecutionResult } from "./types";

// Issue type handlers registry
const IssueHandlers = {
  TASK: TaskHandler,
  BUG: BugHandler,
  FEATURE: FeatureHandler,
  HOTFIX: HotfixHandler,
  IMPROVEMENT: ImprovementHandler,
  EPIC: EpicHandler,
  STORY: StoryHandler,
  "SUB-TASK": SubTaskHandler,
};

/**
 * Main skill entry point
 */
export async function execute(context: SkillContext): Promise<ExecutionResult> {
  const startTime = Date.now();
  const { issue_code, issue_data } = context.inputs;

  console.log(`🎯 Processing issue: ${issue_code}`);

  try {
    // Parse issue code
    const [prefix, number] = issue_code.split("-");
    const issueType = issue_data?.type || detectIssueType(prefix);

    // Validate issue data
    validateIssue(issue_data);

    // Get appropriate handler
    const Handler = IssueHandlers[issueType];
    if (!Handler) {
      throw new Error(`Unsupported issue type: ${issueType}`);
    }

    // Initialize handler
    const handler = new Handler(context);

    // Execute workflow
    console.log(`⚙️  Executing ${issueType} workflow...`);
    const result = await handler.execute();

    // Calculate metrics
    const executionTime = Date.now() - startTime;
    const metrics = await calculateMetrics(result, executionTime);

    // Generate final result
    return {
      issue_id: issue_code,
      status: "success",
      actions_taken: result.actions,
      artifacts: result.artifacts,
      next_steps: result.nextSteps,
      metrics,
      message: `Successfully processed ${issueType} issue: ${issue_code}`,
    };
  } catch (error) {
    console.error(`❌ Error processing issue ${issue_code}:`, error);

    return {
      issue_id: issue_code,
      status: "failed",
      actions_taken: [],
      artifacts: [],
      next_steps: ["Manual intervention required"],
      metrics: {
        execution_time: Date.now() - startTime,
        tokens_used: 0,
        files_modified: 0,
        tests_run: 0,
        coverage: 0,
      },
      error: error.message,
    };
  }
}

/**
 * Base Handler Class
 */
abstract class IssueHandler {
  protected context: SkillContext;
  protected actions: any[] = [];
  protected artifacts: string[] = [];

  constructor(context: SkillContext) {
    this.context = context;
  }

  abstract execute(): Promise<{
    actions: any[];
    artifacts: string[];
    nextSteps: string[];
  }>;

  protected async runAction(actionName: string, params?: any) {
    console.log(`  📌 ${actionName}`);
    const result = await this.executeClaudeCommand(actionName, params);

    this.actions.push({
      action: actionName,
      result: result.success ? "completed" : "failed",
      timestamp: new Date().toISOString(),
      details: result.data,
    });

    return result;
  }

  protected async executeClaudeCommand(action: string, params: any) {
    // This would integrate with Claude Code API
    // For now, returning mock response
    return {
      success: true,
      data: `Executed ${action} successfully`,
    };
  }
}

/**
 * TASK Handler
 */
class TaskHandler extends IssueHandler {
  async execute() {
    console.log("📋 Processing TASK issue...");

    // Step 1: Analyze requirements
    await this.runAction("analyze_requirements", {
      description: this.context.inputs.issue_data.description,
    });

    // Step 2: Create implementation plan
    const plan = await this.runAction("generate_implementation_plan");

    // Step 3: Execute task
    await this.runAction("execute_task", { plan });

    // Step 4: Verify completion
    await this.runAction("verify_completion", {
      criteria: this.context.inputs.issue_data.acceptance_criteria,
    });

    return {
      actions: this.actions,
      artifacts: this.artifacts,
      nextSteps: [
        "Review implementation",
        "Update documentation",
        "Close issue",
      ],
    };
  }
}

/**
 * BUG Handler
 */
class BugHandler extends IssueHandler {
  async execute() {
    console.log("🐛 Processing BUG issue...");

    // Step 1: Reproduce bug
    const reproduction = await this.runAction("reproduce_bug", {
      description: this.context.inputs.issue_data.description,
      files: this.context.inputs.issue_data.context_files,
    });

    // Step 2: Find root cause
    const rootCause = await this.runAction("find_root_cause", {
      reproduction,
      stackTrace: this.extractStackTrace(),
    });

    // Step 3: Implement fix
    const fix = await this.runAction("implement_fix", {
      rootCause,
      files: this.context.inputs.issue_data.context_files,
    });

    // Step 4: Create regression test
    const test = await this.runAction("create_regression_test", {
      bug: reproduction,
      fix,
    });

    // Step 5: Verify fix
    await this.runAction("run_tests", {
      tests: [test],
      coverage: true,
    });

    this.artifacts.push("bug_fix.patch", "regression_test.spec.ts");

    return {
      actions: this.actions,
      artifacts: this.artifacts,
      nextSteps: ["Code review", "Deploy to staging", "Verify in production"],
    };
  }

  private extractStackTrace() {
    // Extract stack trace from description or attachments
    return (
      this.context.inputs.issue_data.description.match(
        /stack trace:[\s\S]*?(?=\n\n|$)/i
      )?.[0] || ""
    );
  }
}

/**
 * FEATURE Handler
 */
class FeatureHandler extends IssueHandler {
  async execute() {
    console.log("✨ Processing FEATURE issue...");

    // Step 1: Create design document
    const design = await this.runAction("create_design_doc", {
      title: this.context.inputs.issue_data.title,
      requirements: this.context.inputs.issue_data.description,
    });

    // Step 2: Break down into subtasks
    const subtasks = await this.runAction("create_subtasks", {
      feature: design,
      maxTasks: 10,
    });

    // Step 3: Implement core functionality
    const implementation = await this.runAction("implement_feature", {
      design,
      subtasks,
      tdd: true,
    });

    // Step 4: Write comprehensive tests
    const tests = await this.runAction("write_tests", {
      implementation,
      types: ["unit", "integration", "e2e"],
    });

    // Step 5: Generate documentation
    const docs = await this.runAction("generate_documentation", {
      implementation,
      formats: ["markdown", "jsdoc", "openapi"],
    });

    // Step 6: Validate checklist
    await this.runAction("validate_checklist", {
      checklist: [
        "Code follows style guide",
        "Tests pass with >80% coverage",
        "Documentation updated",
        "No security vulnerabilities",
        "Performance benchmarks pass",
      ],
    });

    this.artifacts.push(
      "design.md",
      "implementation.diff",
      "tests/",
      "docs/",
      "api.yaml"
    );

    return {
      actions: this.actions,
      artifacts: this.artifacts,
      nextSteps: [
        "Peer review",
        "QA testing",
        "Stakeholder demo",
        "Production deployment",
      ],
    };
  }
}

/**
 * HOTFIX Handler
 */
class HotfixHandler extends IssueHandler {
  async execute() {
    console.log("🚨 Processing HOTFIX issue...");

    // Step 1: Quick analysis (60 second timeout)
    const analysis = await this.runAction("quick_analysis", {
      description: this.context.inputs.issue_data.description,
      timeout: 60000,
    });

    // Step 2: Apply hotfix
    const hotfix = await this.runAction("apply_hotfix", {
      analysis,
      skipTests: false,
    });

    // Step 3: Run critical tests only
    await this.runAction("run_critical_tests", {
      hotfix,
    });

    // Step 4: Prepare deployment with rollback plan
    const deployment = await this.runAction("prepare_deployment", {
      hotfix,
      rollbackPlan: true,
    });

    this.artifacts.push("hotfix.patch", "rollback.sh", "deployment.yaml");

    return {
      actions: this.actions,
      artifacts: this.artifacts,
      nextSteps: [
        "IMMEDIATE: Deploy to production",
        "Monitor system health",
        "Prepare permanent fix",
        "Post-mortem analysis",
      ],
    };
  }
}

/**
 * IMPROVEMENT Handler
 */
class ImprovementHandler extends IssueHandler {
  async execute() {
    console.log("📈 Processing IMPROVEMENT issue...");

    // Step 1: Analyze current code quality
    const currentMetrics = await this.runAction("analyze_code_quality", {
      files: this.context.inputs.issue_data.context_files,
      metrics: ["complexity", "duplication", "coverage", "debt"],
    });

    // Step 2: Identify improvements
    const improvements = await this.runAction("suggest_improvements", {
      currentMetrics,
      categories: ["performance", "readability", "maintainability", "security"],
    });

    // Step 3: Apply refactoring
    const refactoring = await this.runAction("apply_refactoring", {
      improvements,
      preserveBehavior: true,
    });

    // Step 4: Run benchmarks
    const benchmarks = await this.runAction("run_benchmarks", {
      before: currentMetrics,
      after: refactoring,
    });

    this.artifacts.push(
      "quality_report.md",
      "refactoring.diff",
      "benchmark_results.json"
    );

    return {
      actions: this.actions,
      artifacts: this.artifacts,
      nextSteps: [
        "Review improvements",
        "Run full test suite",
        "Update documentation",
        "Merge to main branch",
      ],
    };
  }
}

/**
 * EPIC Handler
 */
class EpicHandler extends IssueHandler {
  async execute() {
    console.log("🎯 Processing EPIC issue...");

    // Epic requires breaking down into stories
    const stories = await this.runAction("create_stories", {
      epic: this.context.inputs.issue_data,
    });

    // Create roadmap
    const roadmap = await this.runAction("create_roadmap", {
      stories,
      timeline: this.context.inputs.issue_data.estimated_hours,
    });

    this.artifacts.push("epic_breakdown.md", "roadmap.md");

    return {
      actions: this.actions,
      artifacts: this.artifacts,
      nextSteps: [
        "Review epic breakdown",
        "Prioritize stories",
        "Assign to sprints",
        "Begin implementation",
      ],
    };
  }
}

/**
 * STORY Handler
 */
class StoryHandler extends IssueHandler {
  async execute() {
    console.log("📖 Processing STORY issue...");

    // Similar to feature but smaller scope
    return new FeatureHandler(this.context).execute();
  }
}

/**
 * SUB-TASK Handler
 */
class SubTaskHandler extends IssueHandler {
  async execute() {
    console.log("📎 Processing SUB-TASK issue...");

    // Similar to task but with parent context
    return new TaskHandler(this.context).execute();
  }
}

/**
 * Helper Functions
 */
function detectIssueType(prefix: string): string {
  const typeMap: Record<string, string> = {
    CMD: "TASK",
    BUG: "BUG",
    FEATURE: "FEATURE",
    FIX: "HOTFIX",
    IMPROVE: "IMPROVEMENT",
    EPIC: "EPIC",
    STORY: "STORY",
    TASK: "TASK",
  };

  return typeMap[prefix.toUpperCase()] || "TASK";
}

function validateIssue(issueData: IssueData) {
  if (!issueData) {
    throw new Error("Issue data is required");
  }

  if (!issueData.title || issueData.title.length > 200) {
    throw new Error("Invalid issue title");
  }

  if (!issueData.description) {
    throw new Error("Issue description is required");
  }
}

async function calculateMetrics(result: any, executionTime: number) {
  return {
    execution_time: executionTime,
    tokens_used: Math.floor(Math.random() * 5000) + 1000, // Mock
    files_modified: result.artifacts.length,
    tests_run: result.actions.filter((a: any) => a.action.includes("test"))
      .length,
    coverage: 85, // Mock
  };
}

// Export for Command Center integration
export default {
  name: "issue-handler",
  version: "1.0.0",
  execute,
};
