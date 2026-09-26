import { createClient } from "@supabase/supabase-js";

// Load from .env.local by default if running in Next.js context or use dotenv, but we can pass env variables when running.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching repositories from GitHub...");
  const res = await fetch("https://api.github.com/orgs/idtazkia/repos?per_page=100");
  const repos = await res.json();
  
  const umkmRepos = repos.filter(repo => repo.name.startsWith("umkm-2025"));
  console.log(`Found ${umkmRepos.length} repos starting with 'umkm-2025'.`);
  
  for (const repo of umkmRepos) {
    const slug = repo.name.toLowerCase();
    
    // Some sensible defaults
    const category = "Technology"; // Web & Sistem
    const techStack = repo.language ? [repo.language] : ["Web"];
    
    const karya = {
      title: repo.name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()), // e.g. Umkm 2025 Sapa Tazkia Ai Code
      slug: slug,
      category: category,
      description: repo.description || `Repositori proyek ${repo.name}.`,
      github_url: repo.html_url,
      live_url: repo.homepage || null,
      views: 0,
      likes: 0,
      status: "approved",
      tech_stack: techStack,
    };

    console.log(`Checking if '${slug}' already exists...`);
    const { data: existing } = await supabase
      .from('karya')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
      
    if (existing) {
       console.log(`- Skipping ${slug}, already exists.`);
       continue;
    }

    const { data, error } = await supabase
      .from('karya')
      .insert(karya)
      .select()
      .single();
      
    if (error) {
       console.error(`- Error inserting ${slug}:`, error.message);
    } else {
       console.log(`+ Inserted ${slug} successfully!`);
    }
  }
}

main().catch(console.error);
