import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");

    const hasQuery = Boolean(q);
    const hasCategory = Boolean(category && category !== "All");

    const title = hasQuery
      ? `Hasil Pencarian: "${q}"`
      : "Eksplorasi Portofolio Karya";

    const subtitle = "Galeri Inovasi Mahasiswa STMIK Tazkia";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a", // dark background
            backgroundImage: "radial-gradient(circle at 25px 25px, #334155 2%, transparent 0%), radial-gradient(circle at 75px 75px, #334155 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            fontFamily: "sans-serif",
            padding: "80px",
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f97316", // primary orange
              color: "#ffffff",
              padding: "12px 32px",
              borderRadius: "100px",
              fontSize: 24,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "40px",
              boxShadow: "8px 8px 0px #c2410c",
            }}
          >
            Karya STMIK Tazkia
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.2,
              textTransform: "uppercase",
              textShadow: "4px 4px 0px #1e3a8a", // secondary shadow
              marginBottom: hasCategory ? "30px" : "40px",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>

          {/* Category Badge */}
          {hasCategory && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1e3a8a", // secondary blue
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: "16px",
                fontSize: 28,
                fontWeight: 700,
                textTransform: "uppercase",
                border: "4px solid #334155",
                marginBottom: "40px",
              }}
            >
              Kategori: {category}
            </div>
          )}

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#94a3b8", // muted foreground
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            {subtitle}
          </div>

          {/* Decorative shapes */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              backgroundColor: "#fbbf24", // accent yellow
              borderRadius: "16px",
              border: "4px solid #d97706",
              transform: "rotate(-15deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "40px",
              height: "40px",
              backgroundColor: "#1e40af", // secondary
              borderRadius: "50%",
              border: "4px solid #1e3a8a",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
