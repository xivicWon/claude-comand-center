'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    directory: '',
    gitRepo: '',
    gitBranch: 'main',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [directoryValid, setDirectoryValid] = useState<boolean | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Reset directory validation when directory changes
    if (name === 'directory') {
      setDirectoryValid(null)
    }
  }

  const validateDirectory = async () => {
    if (!formData.directory.trim()) {
      setErrors(prev => ({ ...prev, directory: 'Directory path is required' }))
      return
    }

    setIsValidating(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/projects/validate-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ directory: formData.directory }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Validation failed')
      }

      setDirectoryValid(data.data.valid)
      if (!data.data.valid) {
        setErrors(prev => ({ ...prev, directory: 'Directory does not exist or is not accessible' }))
      }
    } catch (error) {
      setDirectoryValid(false)
      setErrors(prev => ({
        ...prev,
        directory: error instanceof Error ? error.message : 'Validation failed',
      }))
    } finally {
      setIsValidating(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (!formData.directory.trim()) {
      newErrors.directory = 'Directory path is required'
    }

    if (directoryValid === false) {
      newErrors.directory = 'Please validate the directory path'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create project')
      }

      // Redirect to projects list or project detail
      router.push('/dashboard')
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create project',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
      <p className="text-muted-foreground mb-8">
        Set up a new project by specifying a server directory to track
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="My Awesome Project"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="A brief description of your project..."
          />
        </div>

        {/* Directory Path */}
        <div>
          <label htmlFor="directory" className="block text-sm font-medium mb-2">
            Server Directory Path <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="directory"
              name="directory"
              value={formData.directory}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 border rounded-md ${
                errors.directory
                  ? 'border-red-500'
                  : directoryValid === true
                  ? 'border-green-500'
                  : 'border-gray-300'
              }`}
              placeholder="/path/to/your/project"
            />
            <button
              type="button"
              onClick={validateDirectory}
              disabled={isValidating || !formData.directory.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </button>
          </div>
          {directoryValid === true && (
            <p className="mt-1 text-sm text-green-600">✓ Directory is valid and accessible</p>
          )}
          {errors.directory && (
            <p className="mt-1 text-sm text-red-600">{errors.directory}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            The system will scan this directory to build a file tree
          </p>
        </div>

        {/* Git Repository (Optional) */}
        <div>
          <label htmlFor="gitRepo" className="block text-sm font-medium mb-2">
            Git Repository URL (Optional)
          </label>
          <input
            type="text"
            id="gitRepo"
            name="gitRepo"
            value={formData.gitRepo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="https://github.com/username/repo.git"
          />
        </div>

        {/* Git Branch */}
        <div>
          <label htmlFor="gitBranch" className="block text-sm font-medium mb-2">
            Git Branch
          </label>
          <input
            type="text"
            id="gitBranch"
            name="gitBranch"
            value={formData.gitBranch}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="main"
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || directoryValid !== true}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
