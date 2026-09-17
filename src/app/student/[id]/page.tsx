import { Metadata, ResolvingMetadata } from "next";
import { getMahasiswaById } from "@/lib/data";
import StudentClient from "./StudentClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const student = await getMahasiswaById(id);

  if (!student) {
    return {
      title: "Profil Tidak Ditemukan - Karya STMIK Tazkia",
    };
  }

  const title = student.full_name;
  const description = student.bio || `Profil Mahasiswa ${student.prodi} Angkatan ${student.angkatan} di STMIK Tazkia.`;
  
  const ogUrl = new URL("https://karya.stmik.tazkia.ac.id/api/og/student");
  ogUrl.searchParams.set("name", student.full_name);
  if (student.prodi) ogUrl.searchParams.set("prodi", student.prodi);
  if (student.angkatan) ogUrl.searchParams.set("angkatan", student.angkatan.toString());
  if (student.avatar_url) ogUrl.searchParams.set("avatar", student.avatar_url);

  return {
    title: `${title} - Profil Mahasiswa`,
    description,
    openGraph: {
      title: `${title} - Profil Mahasiswa STMIK Tazkia`,
      description,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: `Profil ${title}`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Profil Mahasiswa STMIK Tazkia`,
      description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function StudentPage(props: Props) {
  return <StudentClient params={props.params} />;
}
