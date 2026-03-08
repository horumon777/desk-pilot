import type { Metadata } from "next";
import ShareContent from "./share-content";
import { getRank, getRankByLetter } from "@/lib/desk-rank";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const score = parseInt(params.s?.toString() || "0", 10);
  const rankParam = params.r?.toString() || "";

  // Rank: use `r` param if provided, otherwise compute from score
  const rankInfo = rankParam
    ? getRankByLetter(rankParam)
    : getRank(score);

  const title = `デスクスコア ${score}点 — ${rankInfo.rank}ランク | DESK AI`;
  const description = `${rankInfo.rank}ランク「${rankInfo.label}」達成！スコアは${score}/100点。あなたのデスクは何ランク？`;

  const ogParams = new URLSearchParams();
  ogParams.set("s", score.toString());
  ogParams.set("r", rankInfo.rank);
  if (params.f) ogParams.set("f", params.f.toString());
  if (params.e) ogParams.set("e", params.e.toString());
  if (params.p) ogParams.set("p", params.p.toString());
  if (params.a) ogParams.set("a", params.a.toString());
  if (params.m) ogParams.set("m", params.m.toString());

  const ogImageUrl = `/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `DESK AI ${rankInfo.rank}ランク スコア ${score}点`,
        },
      ],
      type: "website",
      siteName: "DESK AI",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function SharePage() {
  return <ShareContent />;
}
