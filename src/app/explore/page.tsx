import { Metadata } from "next";
import ExploreClient from "./ExploreClient";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const category = typeof searchParams.category === "string" ? searchParams.category : "";

  let title = "Eksplorasi Karya";
  if (q) {
    title = `Pencarian: ${q}`;
  } else if (category && category !== "All") {
    title = `Kategori: ${category}`;
  }

  const ogUrl = new URL("https://karya.stmik.tazkia.ac.id/api/og/explore");
  if (q) ogUrl.searchParams.set("q", q);
  if (category) ogUrl.searchParams.set("category", category);

  return {
    title,
    openGraph: {
      title: `${title} - Karya STMIK Tazkia`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: `Banner for ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Karya STMIK Tazkia`,
      images: [ogUrl.toString()],
    },
  };
}

export default function Page() {
  return <ExploreClient />;
}
