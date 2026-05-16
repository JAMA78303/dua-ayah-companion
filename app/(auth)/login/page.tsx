import { LoginClient } from "./LoginClient";

function safeNext(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const params = await searchParams;
  return <LoginClient next={safeNext(params.next)} reason={params.reason ?? null} />;
}
