import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "Mahasiswa";
    const prodi = searchParams.get("prodi") || "STMIK Tazkia";
    const angkatan = searchParams.get("angkatan") || "";
    const avatar = searchParams.get("avatar");

    const subtitle = angkatan ? `${prodi} • Angkatan ${angkatan}` : prodi;

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
            backgroundImage: "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
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
              backgroundColor: "#1e3a8a", // secondary blue
              color: "#ffffff",
              padding: "12px 32px",
              borderRadius: "100px",
              fontSize: 24,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "40px",
              border: "4px solid #334155",
            }}
          >
            Profil Mahasiswa
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            {/* Avatar */}
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                backgroundColor: "#f97316", // primary
                border: "8px solid #ffffff",
                boxShadow: "8px 8px 0px #c2410c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                fontSize: "72px",
                fontWeight: "900",
                color: "#ffffff",
              }}
            >
              {avatar ? (
                <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>

            {/* User Details */}
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "600px" }}>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  textShadow: "4px 4px 0px #1e3a8a",
                  marginBottom: "20px",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: "#94a3b8", // muted foreground
                }}
              >
                {subtitle}
              </div>
            </div>
          </div>

          {/* Decorative shapes */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              backgroundColor: "#fbbf24", // accent yellow
              borderRadius: "16px",
              border: "4px solid #d97706",
              transform: "rotate(15deg)",
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
