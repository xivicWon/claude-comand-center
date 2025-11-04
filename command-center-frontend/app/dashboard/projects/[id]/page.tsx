'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useIssueStore } from '@/stores/issueStore'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { IssueStatus, IssueType, IssuePriority } from '@/types'
import { useProject } from '@/hooks/useProjects'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // React Query가 서버 상태 관리
  const { data: project, isLoading, error } = useProject(projectId)

  const { issues, updateIssue, addIssue } = useIssueStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    type: 'TASK' as IssueType,
    priority: 'MEDIUM' as IssuePriority,
  })

  const projectIssues = issues.filter((issue) => issue.project_id === projectId)

  const handleUpdateIssueStatus = (issueId: string, status: IssueStatus) => {
    updateIssue(issueId, { status })
  }

  const handleCreateIssue = () => {
    setShowCreateModal(true)
  }

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault()

    const issue = {
      id: `issue-${Date.now()}`,
      code: `${project?.key || 'ISSUE'}-${Date.now()}`,
      project_id: projectId,
      title: newIssue.title,
      description: newIssue.description,
      type: newIssue.type,
      priority: newIssue.priority,
      status: 'TODO' as IssueStatus,
      labels: [],
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    addIssue(issue)
    setShowCreateModal(false)
    setNewIssue({
      title: '',
      description: '',
      type: 'TASK',
      priority: 'MEDIUM',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-muted-foreground">Loading project...</div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-blue-600 hover:underline"
          >
            Go back to projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="hover:text-foreground"
          >
            Projects
          </button>
          <span>/</span>
          <span>{project.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                {project.key}
              </span>
            </div>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateIssue}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Issue
            </button>
            <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
              Settings
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Members:</span>
            <div className="flex -space-x-2">
              {project.members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {projectIssues.length} issues
          </div>
          <div className="text-sm text-muted-foreground">
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        projectId={projectId}
        issues={projectIssues}
        onUpdateIssue={handleUpdateIssueStatus}
        onCreateIssue={handleCreateIssue}
      />

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Issue</h2>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter issue title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Describe the issue..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newIssue.type}
                    onChange={(e) =>
                      setNewIssue({
                        ...newIssue,
                        type: e.target.value as IssueType,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="TASK">Task</option>
                    <option value="BUG">Bug</option>
                    <option value="FEATURE">Feature</option>
                    <option value="HOTFIX">Hotfix</option>
                    <option value="IMPROVEMENT">Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) =>
                      setNewIssue({
                        ...newIssue,
                        priority: e.target.value as IssuePriority,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Issue
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
