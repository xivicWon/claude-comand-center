'use client'

import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'

export default function DashboardPage() {
  // React Query가 서버 상태 관리
  const { data: projects = [], isLoading, error } = useProjects()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/projects/new"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            New Project
          </Link>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Create Issue
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Issues</h3>
          </div>
          <div className="text-2xl font-bold">45</div>
          <p className="text-xs text-muted-foreground">
            +20% from last month
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">In Progress</h3>
          </div>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            3 critical issues
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Claude Executions</h3>
          </div>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">
            95% success rate
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Avg Resolution Time</h3>
          </div>
          <div className="text-2xl font-bold">2.4h</div>
          <p className="text-xs text-muted-foreground">
            -30min from last week
          </p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="rounded-lg border bg-card mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Link
              href="/dashboard/projects/new"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Link
                href="/dashboard/projects/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {project.key}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project.members.length} members</span>
                    <span>
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">BUG-123</span> was resolved by Claude
                </p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">FEATURE-456</span> moved to In Progress
                </p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm">
                  Claude is processing <span className="font-medium">TASK-789</span>
                </p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}