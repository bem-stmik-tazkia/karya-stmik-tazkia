const fs = require('fs');
const file = 'src/components/mahasiswa/NeobrutalismProfileView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import if not exists
if(!content.includes('KARYA_CATEGORIES')) {
    content = content.replace('import { NeobrutalismProjectCard, ProjectData } from "./NeobrutalismProjectCard";', 'import { NeobrutalismProjectCard, ProjectData } from "./NeobrutalismProjectCard";\nimport { KARYA_CATEGORIES } from "@/types/karya";');
}

const target = `              >
                {cat}
              </button>`;
const replacement = `              >
                {KARYA_CATEGORIES.find(c => c.value === cat)?.label || cat}
              </button>`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
