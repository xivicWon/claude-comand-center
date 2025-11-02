import * as fs from 'fs';
import * as path from 'path';

interface Project {
  id: string;
  name: string;
  description?: string;
  directory: string;
  fileTree?: string;
  gitRepo?: string;
  gitBranch?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  extension?: string;
}

// Mock data storage
let mockProjects: Project[] = [];

// Scan directory and build file tree
export const scanDirectory = async (dirPath: string, maxDepth: number = 5, currentDepth: number = 0): Promise<FileNode[]> => {
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // Skip common ignored directories
      if ([
        'node_modules',
        '.git',
        '.next',
        'dist',
        'build',
        '.vscode',
        '.idea',
        'coverage',
        '.DS_Store'
      ].includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const children = await scanDirectory(fullPath, maxDepth, currentDepth + 1);
        nodes.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children,
        });
      } else if (entry.isFile()) {
        const stats = await fs.promises.stat(fullPath);
        const ext = path.extname(entry.name);
        nodes.push({
          name: entry.name,
          path: fullPath,
          type: 'file',
          size: stats.size,
          extension: ext || undefined,
        });
      }
    }

    return nodes.sort((a, b) => {
      // Directories first, then files
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    return [];
  }
};

// Validate directory exists and is accessible
export const validateDirectory = async (dirPath: string): Promise<boolean> => {
  try {
    const stats = await fs.promises.stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

export const createProject = async (data: {
  name: string;
  description?: string;
  directory: string;
  gitRepo?: string;
  gitBranch?: string;
  ownerId: string;
}): Promise<Project> => {
  // Validate directory
  const isValid = await validateDirectory(data.directory);
  if (!isValid) {
    throw new Error('Invalid directory path or directory does not exist');
  }

  // Scan directory
  const fileTree = await scanDirectory(data.directory);

  const project: Project = {
    id: String(mockProjects.length + 1),
    name: data.name,
    description: data.description,
    directory: data.directory,
    fileTree: JSON.stringify(fileTree),
    gitRepo: data.gitRepo,
    gitBranch: data.gitBranch || 'main',
    ownerId: data.ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockProjects.push(project);
  return project;
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  return mockProjects.find(p => p.id === id) || null;
};

export const getProjectsByOwner = async (ownerId: string): Promise<Project[]> => {
  return mockProjects.filter(p => p.ownerId === ownerId);
};

export const getAllProjects = async (): Promise<Project[]> => {
  return mockProjects;
};

export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
  const index = mockProjects.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Project not found');
  }

  // If directory is being updated, validate and rescan
  if (data.directory && data.directory !== mockProjects[index].directory) {
    const isValid = await validateDirectory(data.directory);
    if (!isValid) {
      throw new Error('Invalid directory path or directory does not exist');
    }
    const fileTree = await scanDirectory(data.directory);
    data.fileTree = JSON.stringify(fileTree);
  }

  mockProjects[index] = {
    ...mockProjects[index],
    ...data,
    updatedAt: new Date(),
  };

  return mockProjects[index];
};

export const deleteProject = async (id: string): Promise<void> => {
  mockProjects = mockProjects.filter(p => p.id !== id);
};

export const rescanProject = async (id: string): Promise<Project> => {
  const project = await getProjectById(id);
  if (!project) {
    throw new Error('Project not found');
  }

  const fileTree = await scanDirectory(project.directory);
  return updateProject(id, {
    fileTree: JSON.stringify(fileTree),
  });
};
