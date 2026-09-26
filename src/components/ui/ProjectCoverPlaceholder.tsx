import { Code2, Monitor, Cpu, Fingerprint, Rocket, Sparkles } from "lucide-react";

interface ProjectCoverPlaceholderProps {
  id: string;
  title: string;
}

const GRADIENTS = [
  "from-blue-600 to-indigo-600",
  "from-violet-600 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

const ICONS = [Code2, Monitor, Cpu, Fingerprint, Rocket, Sparkles];

export function ProjectCoverPlaceholder({ id, title }: ProjectCoverPlaceholderProps) {
  // Use the ID to consistently pick the same gradient and icon for a project
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientClass = GRADIENTS[hash % GRADIENTS.length];
  const Icon = ICONS[hash % ICONS.length];
  
  // Get initials (up to 2 letters)
  const initials = title
    .split(" ")
    .map(word => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradientClass} relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
      
      {/* Content */}
      <Icon className="w-12 h-12 text-white/40 mb-3 absolute -bottom-2 -right-2 rotate-12 scale-150" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl mb-2">
          <span className="text-2xl font-black text-white tracking-widest">{initials}</span>
        </div>
      </div>
    </div>
  );
}
