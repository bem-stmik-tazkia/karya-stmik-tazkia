export type Project = {
  id: string;
  title: string;
  description: string;
  category: "Design" | "Tech" | "Art" | "Research" | "Major";
  tags: string[];
  imageUrl: string;
  studentId: string;
  badge?: string | null;
  views?: string;
  likes?: string;
};

export type Student = {
  id: string;
  name: string;
  major: string;
  bio: string;
  avatarUrl: string;
  socials: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    portfolio?: string;
  };
};

export const students: Student[] = [
  {
    id: "stu-1",
    name: "Alex Rivera",
    major: "Digital Design",
    bio: "Passionate about UI/UX and 3D modeling. I love creating digital experiences that feel tangible and intuitive.",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    socials: {
      portfolio: "https://example.com",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
    }
  },
  {
    id: "stu-2",
    name: "Sarah Chen",
    major: "Software Engineering",
    bio: "Full-stack developer with a focus on AI integrations and interactive web applications.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    }
  },
  {
    id: "stu-3",
    name: "Marcus Johnson",
    major: "Media Arts",
    bio: "Visual storyteller exploring the intersection of traditional art and digital media.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    socials: {
      portfolio: "https://example.com",
      instagram: "https://instagram.com",
    }
  }
];

export const projects: Project[] = [
  {
    id: "proj-1",
    title: "EcoTrack Mobile App",
    description: "A comprehensive UI/UX design for a mobile application that helps users track and reduce their daily carbon footprint through gamification.",
    category: "Design",
    tags: ["UI/UX", "Figma", "Mobile", "Sustainability"],
    imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-1",
    badge: "🔥 TOP PROJECT",
    views: "12.4k",
    likes: "3.2k"
  },
  {
    id: "proj-2",
    title: "Sentient: AI Chat Interface",
    description: "An experimental web interface for large language models, featuring real-time syntax highlighting, artifact generation, and a fluid dark-mode design.",
    category: "Tech",
    tags: ["React", "TypeScript", "Tailwind", "AI"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-2",
    badge: "👁️ TOP VIEWS",
    views: "24.1k",
    likes: "5.5k"
  },
  {
    id: "proj-3",
    title: "Neon Genesis Typography",
    description: "A digital art series exploring futuristic typography and cyberpunk aesthetics using Cinema4D and After Effects.",
    category: "Art",
    tags: ["Cinema4D", "Typography", "Cyberpunk", "3D"],
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-1",
    badge: "✨ STAFF PICK",
    views: "8.9k",
    likes: "1.2k"
  },
  {
    id: "proj-4",
    title: "Smart Campus Navigation",
    description: "An augmented reality (AR) prototype designed to help new students navigate the university campus using their smartphone cameras.",
    category: "Research",
    tags: ["AR", "Unity", "UX Research", "Mobile"],
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-3",
    badge: "🏆 BEST INNOVATION",
    views: "15.2k",
    likes: "4.8k"
  }
];
