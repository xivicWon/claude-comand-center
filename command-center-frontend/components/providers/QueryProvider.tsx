'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * React Query Provider
 *
 * 전역 설정:
 * - staleTime: 5분 - 데이터가 5분간 fresh 상태 유지
 * - gcTime: 10분 - 사용하지 않는 데이터는 10분 후 가비지 컬렉션
 * - retry: 3 - 실패 시 3번 재시도
 * - refetchOnWindowFocus: false - 윈도우 포커스 시 자동 리페칭 비활성화
 */
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분간 데이터가 fresh 상태 유지
            staleTime: 5 * 60 * 1000,

            // 10분간 캐시 유지
            gcTime: 10 * 60 * 1000,

            // 실패 시 3번 재시도
            retry: 3,

            // 재시도 간격 (exponential backoff)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // 윈도우 포커스 시 자동 리페칭 비활성화
            refetchOnWindowFocus: false,

            // 마운트 시 자동 리페칭
            refetchOnMount: true,
          },
          mutations: {
            // Mutation 실패 시 3번 재시도
            retry: 3,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools 사용 시 설치: npm install @tanstack/react-query-devtools */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )} */}
    </QueryClientProvider>
  )
}
