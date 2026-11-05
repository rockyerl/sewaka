import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/dashboard",
        "/tasks",
        "/budget",
        "/vendors",
        "/guests",
        "/events",
        "/rundown",
        "/seserahan",
        "/documents",
        "/gallery",
        "/contracts",
        "/encyclopedia",
        "/timeline",
        "/wedding-day",
        "/subscription",
        "/settings",
        "/workspaces",
        "/invitation/",
      ],
    },
    sitemap: "https://sewaka.com/sitemap.xml",
  };
}
