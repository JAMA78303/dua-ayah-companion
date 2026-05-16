import { redirect } from "next/navigation";

export default async function LegacyPropheticRedirect({
  params,
}: {
  params: Promise<{ prophet: string }>;
}) {
  const { prophet } = await params;
  redirect(`/prophets/${encodeURIComponent(prophet)}`);
}
