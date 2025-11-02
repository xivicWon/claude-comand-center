'use client'

import { useState } from 'react'
import IssueCard from './IssueCard'

interface Issue {
  id: string
  code: string
  title: string
  type: 'TASK' | 'BUG' | 'FEATURE'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  assignee?: string
  labels: string[]
}

// Mock data
const mockIssues: Issue[] = [
  {
    id: '1',
    code: 'BUG-123',
    title: 'Fix login authentication error',
    type: 'BUG',
    priority: 'HIGH',
    status: 'TODO',
    labels: ['auth', 'urgent'],
  },
  {
    id: '2',
    code: 'FEATURE-456',
    title: 'Add dark mode toggle',
    type: 'FEATURE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignee: 'John Doe',
    labels: ['ui', 'enhancement'],
  },
  {
    id: '3',
    code: 'TASK-789',
    title: 'Update documentation',
    type: 'TASK',
    priority: 'LOW',
    status: 'REVIEW',
    labels: ['docs'],
  },
]

const columns = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'DONE', title: 'Done' },
]

export default function IssueBoard() {
  const [issues, setIssues] = useState(mockIssues)

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('issueId', issueId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const issueId = e.dataTransfer.getData('issueId')

    setIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === issueId
          ? { ...issue, status: status as Issue['status'] }
          : issue
      )
    )
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {columns.map(column => (
        <div key={column.id} className="min-h-[600px]">
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              {column.title}
            </h3>
            <div className="text-xs text-muted-foreground mt-1">
              {issues.filter(issue => issue.status === column.id).length} issues
            </div>
          </div>
          <div
            className="space-y-3 min-h-[500px] p-2 rounded-lg bg-muted/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {issues
              .filter(issue => issue.status === column.id)
              .map(issue => (
                <div
                  key={issue.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, issue.id)}
                  className="cursor-move"
                >
                  <IssueCard issue={issue} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}