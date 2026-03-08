import type { Metadata } from "next";
import ShareContent from "./share-content";

const DESK_TYPE_NAMES: Record<string, string> = {
  pragmatic: "質実剛健型",
  luxury: "ラグジュアリー型",
  minimalist: "ミニマリスト型",
  gadgetOtaku: "ガジェットオタク型",
  aspiring: "上昇志向型",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const score = params.s?.toString() || "0";
  const type = params.t?.toString() || "aspiring";
  const typeName = DESK_TYPE_NAMES[type] || "上昇志向型";

  const title = `デスクスコア ${score}点 — ${typeName} | DESK AI`;
  const description = `私のデスクタイプは「${typeName}」。スコアは${score}/100点。あなたのデスクは何点？AIが60秒で診断します。`;

  const ogParams = new URLSearchParams();
  ogParams.set("s", score);
  ogParams.set("t", type);
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
          alt: `DESK AI スコア ${score}点`,
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
