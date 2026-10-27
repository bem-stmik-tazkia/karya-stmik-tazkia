import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Karya STMIK Tazkia - Galeri Inovasi Mahasiswa";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
        {/* Main Logo / Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {/* Authentic Web Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {/* Monogram KT SVG Icon */}
            <svg
              width="100"
              height="84"
              viewBox="0 0 155 130"
              fill="none"
              style={{
                filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.3))",
              }}
            >
              <g transform="translate(2, 2)">
                <rect x="10" y="10" width="28" height="108" rx="14" fill="#FF7F0A" />
                <rect x="54" y="26" width="17" height="78" fill="#FFFFFF" />
                <polygon points="67,63 105,26 126,26 80,72" fill="#FFFFFF" />
                <polygon points="75,58 128,104 107,104 65,68" fill="#FFFFFF" />
                <path d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z" fill="#FF7F0A" />
                <path d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z" fill="#FF7F0A" />
              </g>
            </svg>
            {/* Text Logo */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                letterSpacing: "-2px",
                display: "flex",
                gap: "20px",
                textShadow: "4px 4px 0px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ color: "#ffffff" }}>Karya</span>
              <span style={{ color: "#FF7F0A" }}>Tazkia</span>
            </div>
          </div>
          
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.1,
              textTransform: "uppercase",
              textShadow: "6px 6px 0px #1e3a8a",
              marginBottom: "30px",
              maxWidth: "1000px",
            }}
          >
            Galeri Portofolio & Inovasi Mahasiswa
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#94a3b8", // muted foreground
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Temukan karya digital, aplikasi, dan riset terbaik karya mahasiswa STMIK Tazkia.
        </div>

        {/* URL Banner */}
        <div
          style={{
            marginTop: "50px",
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(30, 64, 175, 0.2)",
            border: "4px solid #1e40af",
            padding: "16px 48px",
            borderRadius: "100px",
            fontSize: 28,
            fontWeight: 800,
            color: "#93c5fd",
            letterSpacing: "2px",
            boxShadow: "8px 8px 0px #1e3a8a",
          }}
        >
          karya.stmik.tazkia.ac.id
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            width: "80px",
            height: "80px",
            backgroundColor: "#fbbf24", // accent yellow
            borderRadius: "20px",
            border: "6px solid #d97706",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "50px",
            width: "60px",
            height: "60px",
            backgroundColor: "#1e40af", // secondary blue
            borderRadius: "50%",
            border: "6px solid #1e3a8a",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            right: "80px",
            width: "40px",
            height: "40px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
