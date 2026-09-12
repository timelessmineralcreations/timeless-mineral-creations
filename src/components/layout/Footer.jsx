export default function Footer({
  settings = {},
}) {
  const socialLinks = [
    {
      name: "Facebook",
      url: settings.facebookUrl,
    },
    {
      name: "Instagram",
      url: settings.instagramUrl,
    },
    {
      name: "TikTok",
      url: settings.tiktokUrl,
    },
    {
      name: "Etsy",
      url: settings.etsyUrl,
    },
  ].filter(
    (social) => social.url
  );

  const businessName =
    settings.businessName ||
    "Timeless Mineral Creations";

  return (
    <footer
      style={{
        width: "100%",
        marginTop: "60px",
        borderTop:
          "1px solid rgba(255,255,255,.12)",
        background: "#080808",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "30px 20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            {businessName}
          </div>

          <div
            style={{
              fontSize: "13px",
              opacity: 0.6,
            }}
          >
            © {new Date().getFullYear()}{" "}
            {businessName}. All rights
            reserved.
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
            }}
          >
            {socialLinks.map(
              (social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#d9b56d",
                    textDecoration:
                      "none",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {social.name}
                </a>
              )
            )}
          </div>
        )}
      </div>
    </footer>
  );
}