// Mock user service - replace with actual database queries

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

let mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '$2a$10$YourHashedPasswordHere', // password: admin123
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getUserById = async (id: string): Promise<User | null> => {
  return mockUsers.find(user => user.id === id) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return mockUsers.find(user => user.email === email) || null;
};

export const createUser = async (data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> => {
  const user: User = {
    id: String(mockUsers.length + 1),
    ...data,
    role: 'developer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUsers.push(user);
  return user;
};

export const updateUser = async (id: string, data: any): Promise<User> => {
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...data, updatedAt: new Date() };
    return mockUsers[index];
  }
  throw new Error('User not found');
};

export const deleteUser = async (id: string): Promise<void> => {
  mockUsers = mockUsers.filter(user => user.id !== id);
};

export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
  return mockUsers.map(({ password, ...user }) => user);
};