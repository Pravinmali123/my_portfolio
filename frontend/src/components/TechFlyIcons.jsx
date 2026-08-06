// Floating tech/AI icons that drift in from the edges of the hero section
// and get "absorbed" into the profile photo, giving a modern animated feel.
// Each icon tries a brand image first (Simple Icons CDN) and silently falls
// back to a Devicon/FontAwesome glyph if that brand isn't on the CDN.

export const TECH_ICONS = [
  // ===========================
  // AI TOOLS
  // ===========================
  {
    name: "ChatGPT",
    img: "https://cdn.simpleicons.org/openai",
    fallback: "fa-solid fa-comment-dots",
    color: "#10A37F",
  },
  {
    name: "Gemini",
    img: "https://cdn.simpleicons.org/googlegemini",
    fallback: "fa-solid fa-star",
    color: "#8E75F7",
  },
  {
    name: "Claude",
    img: "https://cdn.simpleicons.org/claude",
    fallback: "fa-solid fa-brain",
    color: "#D97757",
  },
  {
    name: "Perplexity",
    img: "https://cdn.simpleicons.org/perplexity",
    fallback: "fa-solid fa-magnifying-glass",
    color: "#20B2AA",
  },
//   {
//     name: "Lovable",
//     img: "https://cdn.simpleicons.org/lovable",
//     fallback: "fa-solid fa-wand-magic-sparkles",
//     color: "#FF6B6B",
//   },
//   {
//     name: "Cursor",
//     img: "https://cdn.simpleicons.org/cursor",
//     fallback: "fa-solid fa-i-cursor",
//     color: "#00E5FF",
//   },
//   {
//     name: "GitHub Copilot",
//     img: "https://cdn.simpleicons.org/githubcopilot",
//     fallback: "fa-brands fa-github",
//     color: "#8957E5",
//   },
  {
    name: "Bolt.new",
    img: "https://cdn.simpleicons.org/stackblitz",
    fallback: "fa-solid fa-bolt",
    color: "#1269D3",
  },
  {
    name: "V0",
    img: null,
    fallback: "fa-solid fa-v",
    color: "#FFFFFF",
  },
  {
    name: "Antigravity",
    img: null,
    fallback: "fa-solid fa-satellite",
    color: "#39FF14",
  },

  // ===========================
  // FRONTEND
  // ===========================
  {
    name: "HTML5",
    img: null,
    fallback: "devicon-html5-plain colored",
    color: "#E34F26",
  },
  {
    name: "CSS3",
    img: null,
    fallback: "devicon-css3-plain colored",
    color: "#1572B6",
  },
  {
    name: "JavaScript",
    img: null,
    fallback: "devicon-javascript-plain colored",
    color: "#F7DF1E",
  },
  {
    name: "TypeScript",
    img: null,
    fallback: "devicon-typescript-plain colored",
    color: "#3178C6",
  },
  {
    name: "React",
    img: null,
    fallback: "devicon-react-original colored",
    color: "#61DAFB",
  },
//   {
//     name: "Next.js",
//     img: null,
//     fallback: "devicon-nextjs-original",
//     color: "#FFFFFF",
//   },
  {
    name: "Redux",
    img: null,
    fallback: "devicon-redux-original colored",
    color: "#764ABC",
  },
  {
    name: "Tailwind CSS",
    img: null,
    fallback: "devicon-tailwindcss-original colored",
    color: "#06B6D4",
  },
  {
    name: "Bootstrap",
    img: null,
    fallback: "devicon-bootstrap-plain colored",
    color: "#7952B3",
  },

  // ===========================
  // BACKEND
  // ===========================
  {
    name: "Node.js",
    img: null,
    fallback: "devicon-nodejs-plain colored",
    color: "#83CD29",
  },
  {
    name: "Express.js",
    img: null,
    fallback: "devicon-express-original",
    color: "#FFFFFF",
  },
  {
    name: "Python",
    img: null,
    fallback: "devicon-python-plain colored",
    color: "#3776AB",
  },
  {
    name: "PHP",
    img: null,
    fallback: "devicon-php-plain colored",
    color: "#777BB4",
  },

  // ===========================
  // DATABASE
  // ===========================
  {
    name: "MongoDB",
    img: null,
    fallback: "devicon-mongodb-plain colored",
    color: "#47A248",
  },
  {
    name: "MySQL",
    img: null,
    fallback: "devicon-mysql-plain colored",
    color: "#4479A1",
  },
  {
    name: "PostgreSQL",
    img: null,
    fallback: "devicon-postgresql-plain colored",
    color: "#336791",
  },
  {
    name: "Firebase",
    img: null,
    fallback: "devicon-firebase-plain colored",
    color: "#FFCA28",
  },
  {
    name: "Supabase",
    img: "https://cdn.simpleicons.org/supabase",
    fallback: "fa-solid fa-database",
    color: "#3ECF8E",
  },

  // ===========================
  // TOOLS
  // ===========================
  {
    name: "Git",
    img: null,
    fallback: "devicon-git-plain colored",
    color: "#F05032",
  },
  {
    name: "GitHub",
    img: null,
    fallback: "devicon-github-original",
    color: "#FFFFFF",
  },
  {
    name: "VS Code",
    img: null,
    fallback: "devicon-vscode-plain colored",
    color: "#007ACC",
  },
  {
    name: "Postman",
    img: null,
    fallback: "devicon-postman-plain colored",
    color: "#FF6C37",
  },
  {
    name: "NPM",
    img: null,
    fallback: "devicon-npm-original-wordmark colored",
    color: "#CB3837",
  },
  {
    name: "Vite",
    img: null,
    fallback: "devicon-vitejs-plain colored",
    color: "#646CFF",
  },

  // ===========================
  // CLOUD
  // ===========================
  {
    name: "AWS",
    img: "https://cdn.simpleicons.org/amazonaws",
    fallback: "fa-brands fa-aws",
    color: "#FF9900",
  },
//   {
//     name: "Vercel",
//     img: "https://cdn.simpleicons.org/vercel",
//     fallback: "fa-solid fa-cloud",
//     color: "#FFFFFF",
//   },
  {
    name: "Netlify",
    img: "https://cdn.simpleicons.org/netlify",
    fallback: "fa-solid fa-cloud",
    color: "#00C7B7",
  },
//   {
//     name: "Render",
//     img: "https://cdn.simpleicons.org/render",
//     fallback: "fa-solid fa-server",
//     color: "#46E3B7",
//   },

  // ===========================
  // DESIGN
  // ===========================
  {
    name: "Figma",
    img: null,
    fallback: "devicon-figma-plain colored",
    color: "#F24E1E",
  },
  {
    name: "Canva",
    img: "https://cdn.simpleicons.org/canva",
    fallback: "fa-solid fa-palette",
    color: "#00C4CC",
  },

  // ===========================
  // CMS
  // ===========================
  {
    name: "WordPress",
    img: null,
    fallback: "devicon-wordpress-plain colored",
    color: "#21759B",
  },
];

// Spread the icons evenly around a circle so they fly in from every side,
// each with its own timing so the animation never looks synced/robotic.
// Small glowing "data particles" that stream in from beyond the profile
// ring and get absorbed into the photo — no bulky circle badges, just the
// glyph + a soft comet trail, so it reads as a subtle tech/AI signal rather
// than a row of stickers.
// Spread icons around a wide circle — well outside the ring's own chips/
// orbit icons — so the new layer never visually collides with them.
function buildLayout(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i + (i % 2 === 0 ? 9 : -9);
    const radius = 250 + (i % 3) * 26;
    const rad = (angle * Math.PI) / 180;
    const sx = Math.cos(rad) * radius;
    const sy = Math.sin(rad) * radius;
    const trailAngle = (Math.atan2(sy, sx) * 180) / Math.PI;
    return {
      sx,
      sy,
      trailAngle,
      duration: 6.5 + (i % 4) * 1.3,
      delay: (i % 3) * 0.18,
    };
  });
}

const LAYOUT = buildLayout(TECH_ICONS.length);

function IconGlyph({ icon }) {
  if (!icon.img) {
    return <i className={icon.fallback} style={{ color: icon.color, fontSize: '1.3rem' }} />;
  }
  return (
    <>
      <img
        src={icon.img}
        alt={icon.name}
        width="26"
        height="26"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling.style.display = 'inline-flex';
        }}
      />
      <i
        className={icon.fallback}
        style={{ display: 'none', color: icon.color, fontSize: '1.3rem' }}
      />
    </>
  );
}

export default function TechFlyIcons() {
  return (
    <div className="tech-fly-bg" aria-hidden="true">
      {TECH_ICONS.map((icon, i) => {
        const { sx, sy, trailAngle, duration, delay } = LAYOUT[i];
        return (
          <span
            key={icon.name}
            className="fly-icon"
            title={icon.name}
            style={{
              '--sx': `${sx}px`,
              '--sy': `${sy}px`,
              '--glow': icon.color,
              '--trail-rot': `${trailAngle}deg`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <i className="fly-trail" />
            <IconGlyph icon={icon} />
          </span>
        );
      })}
    </div>
  );
}