import type { } from 'next-auth'

type UserId = string;

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserId;
  }
}

declare module 'next-auth' {
  interface Session {
    apiToken: string;
    user: User & {
      id: UserId
    }
  }
} 