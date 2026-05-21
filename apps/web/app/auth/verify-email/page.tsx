import ClientVerifyEmail from "./verify-email";

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return <ClientVerifyEmail searchParams={searchParams} />
}
