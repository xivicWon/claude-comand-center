'use client'

import { useState } from 'react'
import Link from 'next/link'
import IssueBoard from '@/components/issues/IssueBoard'
import IssueList from '@/components/issues/IssueList'

export default function IssuesPage() {
  const [view, setView] = useState<'board' | 'list'>('board')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Issues</h1>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border p-1">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'board'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              List
            </button>
          </div>
          <Link
            href="/issues/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create Issue
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search issues..."
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <select className="px-3 py-2 border rounded-md">
          <option>All Types</option>
          <option>Task</option>
          <option>Bug</option>
          <option>Feature</option>
        </select>
        <select className="px-3 py-2 border rounded-md">
          <option>All Priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Issue View */}
      {view === 'board' ? <IssueBoard /> : <IssueList />}
    </div>
  )
}