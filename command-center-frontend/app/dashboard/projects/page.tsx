'use client'

import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'

export default function ProjectsPage() {
  // React Query가 서버 상태 관리
  const { data: projects = [], isLoading, error } = useProjects()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects and track their progress
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first project
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block rounded-lg border bg-card p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                    {project.key}
                  </span>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
