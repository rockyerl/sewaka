import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { getPublicInvitationBySlug } from "@/features/guests/hooks/guest-queries";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const guestName = url.searchParams.get("to");

    const data = await getPublicInvitationBySlug(slug, guestName || undefined);

    if (!data) {
      return new Response("Not found", { status: 404 });
    }

    const { workspace, traditionInfo } = data;
    const couple =
      workspace.coupleOne && workspace.coupleTwo
        ? `${workspace.coupleOne} & ${workspace.coupleTwo}`
        : workspace.name;

    const weddingDate = workspace.weddingDate
      ? new Date(workspace.weddingDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

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
            backgroundColor: "#FDFBF7",
            backgroundImage:
              "radial-gradient(circle at 20px 20px, #5B132B 1px, transparent 0)",
            backgroundSize: "40px 40px",
            fontFamily: "serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              padding: "60px",
              border: "3px solid #D4AF37",
              borderRadius: "24px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "24px",
                fontWeight: 600,
                color: "#5B132B",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ fontSize: "32px" }}>✦</span>
              Undangan Pernikahan
              <span style={{ fontSize: "32px" }}>✦</span>
            </div>

            <div
              style={{
                fontSize: "64px",
                fontWeight: 700,
                color: "#5B132B",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {couple}
            </div>

            {weddingDate && (
              <div
                style={{
                  fontSize: "32px",
                  color: "#786C5A",
                  textAlign: "center",
                }}
              >
                {weddingDate}
              </div>
            )}

            {workspace.location && (
              <div
                style={{
                  fontSize: "24px",
                  color: "#A08F74",
                  textAlign: "center",
                }}
              >
                {workspace.location}
              </div>
            )}

            <div
              style={{
                marginTop: "20px",
                padding: "12px 32px",
                backgroundColor: "#5B132B",
                borderRadius: "12px",
                fontSize: "20px",
                fontWeight: 600,
                color: "#D4AF37",
                letterSpacing: "0.1em",
              }}
            >
              Sewaka Wedding
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
