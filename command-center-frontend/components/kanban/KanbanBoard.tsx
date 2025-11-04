'use client'

import { useState } from 'react'
import { Issue, IssueStatus } from '@/types'

interface KanbanBoardProps {
  projectId: string
  issues: Issue[]
  onUpdateIssue: (issueId: string, status: IssueStatus) => void
  onCreateIssue: () => void
}

const statusColumns: { status: IssueStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100' },
  { status: 'REVIEW', label: 'Review', color: 'bg-yellow-100' },
  { status: 'TESTING', label: 'Testing', color: 'bg-purple-100' },
  { status: 'DONE', label: 'Done', color: 'bg-green-100' },
]

const priorityColors = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
}

const typeIcons = {
  TASK: '📋',
  BUG: '🐛',
  FEATURE: '✨',
  HOTFIX: '🔥',
  IMPROVEMENT: '⚡',
}

export default function KanbanBoard({
  projectId,
  issues,
  onUpdateIssue,
  onCreateIssue,
}: KanbanBoardProps) {
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null)

  const getIssuesByStatus = (status: IssueStatus) => {
    return issues.filter((issue) => issue.status === status)
  }

  const handleDragStart = (issue: Issue) => {
    setDraggedIssue(issue)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: IssueStatus) => {
    if (draggedIssue && draggedIssue.status !== status) {
      onUpdateIssue(draggedIssue.id, status)
    }
    setDraggedIssue(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => {
        const columnIssues = getIssuesByStatus(column.status)
        return (
          <div
            key={column.status}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.status)}
          >
            <div className={`rounded-t-lg p-3 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.label}</h3>
                <span className="text-sm bg-white/50 px-2 py-1 rounded">
                  {columnIssues.length}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-b-lg p-3 min-h-[500px] space-y-3">
              {column.status === 'TODO' && (
                <button
                  onClick={onCreateIssue}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Issue
                </button>
              )}

              {columnIssues.map((issue) => (
                <div
                  key={issue.id}
                  draggable
                  onDragStart={() => handleDragStart(issue)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{typeIcons[issue.type]}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {issue.title}
                      </h4>
                      {issue.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {issue.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          priorityColors[issue.priority]
                        }`}
                        title={issue.priority}
                      />
                      <span className="text-xs text-gray-500">{issue.type}</span>
                    </div>

                    {issue.assignee && (
                      <div
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium"
                        title={issue.assignee.name}
                      >
                        {issue.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {issue.tags && issue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {issue.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
