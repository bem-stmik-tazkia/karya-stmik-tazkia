import { Metadata, ResolvingMetadata } from "next";
import { getKaryaById } from "@/lib/data";
import ProjectClient from "./ProjectClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const project = await getKaryaById(id);

  if (!project) {
    return {
      title: "Karya Tidak Ditemukan - Karya STMIK Tazkia",
    };
  }

  const title = project.title;
  const description = project.description;
  const imageUrl = project.image_url || "https://karya.stmik.tazkia.ac.id/api/og/explore";

  return {
    title,
    description,
    openGraph: {
      title: `${title} - Karya STMIK Tazkia`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Karya STMIK Tazkia`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProjectPage(props: Props) {
  return <ProjectClient params={props.params} />;
}
