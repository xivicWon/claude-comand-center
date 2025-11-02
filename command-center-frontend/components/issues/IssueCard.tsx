import Link from 'next/link'

interface IssueCardProps {
  issue: {
    id: string
    code: string
    title: string
    type: 'TASK' | 'BUG' | 'FEATURE'
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    status: string
    assignee?: string
    labels: string[]
  }
}

const typeColors = {
  TASK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  BUG: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  FEATURE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

const priorityColors = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-gray-400',
}

export default function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link href={`/issues/${issue.id}`}>
      <div className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {issue.code}
          </span>
          <div className={`w-2 h-2 rounded-full ${priorityColors[issue.priority]}`} />
        </div>

        <h4 className="font-medium text-sm mb-2 line-clamp-2">
          {issue.title}
        </h4>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[issue.type]}`}>
            {issue.type}
          </span>
        </div>

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {issue.labels.map(label => (
              <span
                key={label}
                className="text-xs px-2 py-0.5 bg-muted rounded"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {issue.assignee && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
              {issue.assignee.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-xs text-muted-foreground">
              {issue.assignee}
            </span>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              console.log('Execute Claude for', issue.code)
            }}
            className="flex-1 text-xs py-1 px-2 bg-claude/10 text-claude rounded hover:bg-claude/20 transition-colors"
          >
            Execute Claude
          </button>
        </div>
      </div>
    </Link>
  )
}