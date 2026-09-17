import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          <div
            style={{
              backgroundColor: "#f97316", // primary
              color: "#ffffff",
              padding: "16px 40px",
              borderRadius: "100px",
              fontSize: 32,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "4px",
              marginBottom: "30px",
              boxShadow: "10px 10px 0px #c2410c",
            }}
          >
            Karya STMIK Tazkia
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
