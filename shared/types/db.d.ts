interface User {
  id: string;
  name: string | null;
  image: string;
  email: string;
  emailVerified: Date | null;
  accounts: Account[];
  servers: Server[];
  members: Member[];
  channels: Channel[];
  createdAt: Date;
  updatedAt: Date;
}

interface Account {
  userId?: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: boolean;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt: string;
  updatedAt: string;
  Profile: User;
}