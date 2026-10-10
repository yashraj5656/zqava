export default function manifest() {
  return {
    id: "/",
    name: "ZQAVA — Find Someone to Go With",
    short_name: "ZQAVA",
    description:
      "Find companions for coffee, movies, events, travel, gaming and more.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#080b0b",
    theme_color: "#080b0b",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/zqavab.jpg",
        sizes: "192x192",
        type: "image/jpg",
      },
      {
        src: "/zqavab.jpg",
        sizes: "512x512",
        type: "image/jpg",
      },
      {
        src: "/zqavab.jpg",
        sizes: "512x512",
        type: "image/jpg",
        purpose: "maskable",
      },
    ],
  };
}