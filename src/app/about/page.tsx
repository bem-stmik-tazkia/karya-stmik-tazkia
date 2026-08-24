"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Lightbulb, Rocket } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import Link from "next/link";
import { StickerBadge } from "@/components/ui/StickerBadge";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Side: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex-1 space-y-8"
        >
          <div>
            <StickerBadge variant="success" className="mb-6 -rotate-2" icon={<Sparkles className="w-4 h-4 fill-current" />}>
              OUR MISSION
            </StickerBadge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase" style={{ textShadow: "3px 3px 0px var(--color-border)" }}>
              Elevating <span className="text-primary">Student</span> Brilliance
            </h1>
          </div>
          
          <div className="space-y-6 text-xl font-medium text-muted-foreground">
            <p>
              The STMIK Tazkia Student Portfolio Gallery is a dedicated platform designed to bridge the gap between academic creation and real-world opportunity.
            </p>
            <p>
              We believe that every line of code, every brushstroke, and every research paper represents a step toward innovation. This gallery serves as a living exhibition of our students' hard work, creativity, and technical prowess.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-4 border-border border-dashed">
            <div className="flex flex-col gap-3">
              <div className="w-14 h-14 bg-secondary text-secondary-foreground rounded-2xl border-4 border-secondary-shadow shadow-[0_4px_0_0_var(--color-secondary-shadow)] flex items-center justify-center rotate-3">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="font-black text-2xl uppercase">Community</h3>
              <p className="text-muted-foreground font-medium">Fostering collaboration among creators.</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl border-4 border-primary-shadow shadow-[0_4px_0_0_var(--color-primary-shadow)] flex items-center justify-center -rotate-3">
                <Rocket className="h-7 w-7" />
              </div>
              <h3 className="font-black text-2xl uppercase">Innovation</h3>
              <p className="text-muted-foreground font-medium">Pushing boundaries in tech and art.</p>
            </div>
          </div>
          
          <div className="pt-8">
            <Link href="/explore">
              <BouncyButton className="text-lg">
                EXPLORE PROJECTS
              </BouncyButton>
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Visuals */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="flex-1 relative"
        >
          {/* Main Image */}
          <div className="aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden border-8 border-border shadow-[0_12px_0_0_var(--color-border)] relative z-10 bg-card">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
              alt="Students collaborating"
              className="object-cover w-full h-full"
            />
          </div>
          
          {/* Decorative floating elements */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 z-20"
          >
            <StickerBadge variant="warning" className="text-lg px-6 py-3 rotate-12" icon={<Lightbulb className="w-6 h-6 fill-current" />}>
              CREATIVITY
            </StickerBadge>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -bottom-10 -left-10 z-20"
          >
            <div className="bg-card border-4 border-border shadow-[0_8px_0_0_var(--color-border)] p-6 rounded-[2rem] flex items-center gap-4 -rotate-6">
              <div className="text-4xl font-black text-primary">50+</div>
              <div className="font-bold text-muted-foreground leading-tight uppercase">
                Active<br/>Creators
              </div>
            </div>
          </motion.div>
          
          {/* Background Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </div>
  );
}
