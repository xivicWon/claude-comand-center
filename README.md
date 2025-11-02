# Command Center Frontend

AI-Powered Issue Management System with Claude Code Integration

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.io Client
- **Package Manager**: npm

## 📁 Project Structure

```
command-center-frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── issues/           # Issue-related components
│   ├── claude/           # Claude integration components
│   └── shared/           # Shared components
├── lib/                   # Utilities and libraries
│   ├── api/              # API client
│   ├── utils/            # Utility functions
│   └── constants/        # Constants
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── public/               # Static files
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format with Prettier

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🎨 Features

### Issue Management
- **Kanban Board**: Drag-and-drop issue management
- **List View**: Traditional table view with sorting and filtering
- **Issue Types**: TASK, BUG, FEATURE, HOTFIX, IMPROVEMENT
- **Priority Levels**: CRITICAL, HIGH, MEDIUM, LOW
- **Status Tracking**: TODO, IN_PROGRESS, REVIEW, TESTING, DONE

### Claude Integration
- **Automatic Command Generation**: Convert issues to Claude commands
- **Real-time Execution**: Live progress tracking via WebSocket
- **Execution History**: View past executions and results
- **Command Preview**: Dry-run commands before execution

### Dashboard
- **Statistics**: Real-time metrics and analytics
- **Activity Feed**: Recent issue and execution updates
- **Quick Actions**: Create issues, execute commands

## 🏗️ Development

### Creating a New Component

```tsx
// components/MyComponent.tsx
export default function MyComponent() {
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### Using Zustand Store

```tsx
import { useIssueStore } from '@/stores/issueStore'

function MyComponent() {
  const { issues, addIssue } = useIssueStore()

  // Use store state and actions
}
```

### API Integration

```tsx
import { issuesApi } from '@/lib/api/issues'

// In a component or server action
const issues = await issuesApi.getAll()
```

### WebSocket Connection

```tsx
import { claudeWebSocket } from '@/lib/api/claude'

// Subscribe to execution updates
const unsubscribe = claudeWebSocket.subscribe(executionId, (data) => {
  console.log('Update:', data)
})

// Clean up
unsubscribe()
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t command-center-frontend .
docker run -p 3000:3000 command-center-frontend
```

## 🔧 Configuration

### Tailwind CSS

Customize the theme in `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: {...},
      claude: '#8b5cf6'
    }
  }
}
```

### API Endpoints

Configure API endpoints in `lib/api/client.ts`:
```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- shadcn for the beautiful UI components
- Claude by Anthropic for AI capabilities