// Mock implementation - replace with actual database queries

interface Issue {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  labels: string[];
  assigneeId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

let mockIssues: Issue[] = [
  {
    id: '1',
    code: 'CMD-001',
    title: 'Sample Issue',
    description: 'This is a sample issue',
    type: 'TASK',
    priority: 'MEDIUM',
    status: 'TODO',
    labels: ['sample'],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getAllIssues = async (filters: any = {}): Promise<Issue[]> => {
  // Mock implementation
  return mockIssues;
};

export const getIssueById = async (id: string): Promise<Issue | null> => {
  return mockIssues.find(issue => issue.id === id) || null;
};

export const createIssue = async (data: any): Promise<Issue> => {
  const issue: Issue = {
    id: String(mockIssues.length + 1),
    code: `CMD-${String(mockIssues.length + 1).padStart(3, '0')}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockIssues.push(issue);
  return issue;
};

export const updateIssue = async (id: string, data: any): Promise<Issue> => {
  const index = mockIssues.findIndex(issue => issue.id === id);
  if (index !== -1) {
    mockIssues[index] = { ...mockIssues[index], ...data, updatedAt: new Date() };
    return mockIssues[index];
  }
  throw new Error('Issue not found');
};

export const deleteIssue = async (id: string): Promise<void> => {
  mockIssues = mockIssues.filter(issue => issue.id !== id);
};

export const updateIssueStatus = async (id: string, status: string): Promise<Issue> => {
  return updateIssue(id, { status });
};

export const assignIssue = async (id: string, assigneeId: string): Promise<Issue> => {
  return updateIssue(id, { assigneeId });
};

export const addLabel = async (id: string, label: string): Promise<Issue> => {
  const issue = await getIssueById(id);
  if (issue && !issue.labels.includes(label)) {
    issue.labels.push(label);
    return updateIssue(id, { labels: issue.labels });
  }
  throw new Error('Issue not found');
};

export const removeLabel = async (id: string, label: string): Promise<Issue> => {
  const issue = await getIssueById(id);
  if (issue) {
    issue.labels = issue.labels.filter(l => l !== label);
    return updateIssue(id, { labels: issue.labels });
  }
  throw new Error('Issue not found');
};

export const searchIssues = async (query: string): Promise<Issue[]> => {
  return mockIssues.filter(issue =>
    issue.title.toLowerCase().includes(query.toLowerCase()) ||
    issue.description.toLowerCase().includes(query.toLowerCase())
  );
};

export const getIssueStats = async () => {
  const stats = {
    total: mockIssues.length,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  };

  mockIssues.forEach(issue => {
    stats.byStatus[issue.status] = (stats.byStatus[issue.status] || 0) + 1;
    stats.byType[issue.type] = (stats.byType[issue.type] || 0) + 1;
    stats.byPriority[issue.priority] = (stats.byPriority[issue.priority] || 0) + 1;
  });

  return stats;
};