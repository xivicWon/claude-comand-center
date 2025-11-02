import Link from 'next/link'

const mockIssues = [
  {
    id: '1',
    code: 'BUG-123',
    title: 'Fix login authentication error',
    type: 'BUG',
    priority: 'HIGH',
    status: 'TODO',
    assignee: 'John Doe',
    created: '2024-03-15',
    labels: ['auth', 'urgent'],
  },
  {
    id: '2',
    code: 'FEATURE-456',
    title: 'Add dark mode toggle',
    type: 'FEATURE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignee: 'Jane Smith',
    created: '2024-03-14',
    labels: ['ui', 'enhancement'],
  },
  {
    id: '3',
    code: 'TASK-789',
    title: 'Update documentation',
    type: 'TASK',
    priority: 'LOW',
    status: 'REVIEW',
    assignee: 'Bob Johnson',
    created: '2024-03-13',
    labels: ['docs'],
  },
]

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
}

export default function IssueList() {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left p-4 font-medium">Issue</th>
            <th className="text-left p-4 font-medium">Type</th>
            <th className="text-left p-4 font-medium">Priority</th>
            <th className="text-left p-4 font-medium">Status</th>
            <th className="text-left p-4 font-medium">Assignee</th>
            <th className="text-left p-4 font-medium">Created</th>
            <th className="text-left p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockIssues.map(issue => (
            <tr key={issue.id} className="border-b hover:bg-muted/30">
              <td className="p-4">
                <Link
                  href={`/issues/${issue.id}`}
                  className="hover:text-primary"
                >
                  <div>
                    <div className="font-medium">{issue.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.title}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="p-4">
                <span className="text-sm">{issue.type}</span>
              </td>
              <td className="p-4">
                <span className="text-sm">{issue.priority}</span>
              </td>
              <td className="p-4">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[issue.status as keyof typeof statusColors]}`}>
                  {issue.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {issue.assignee.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm">{issue.assignee}</span>
                </div>
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {issue.created}
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-claude/10 text-claude rounded hover:bg-claude/20">
                    Execute
                  </button>
                  <button className="text-xs px-3 py-1 border rounded hover:bg-muted">
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}