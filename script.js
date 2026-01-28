document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     CONFIG
     ========================================================= */
const API = "https://knw-me.vercel.app/";

  const $ = id => document.getElementById(id);
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("id");

 /* =========================================================
   CYBERPUNK BACKGROUND (ENHANCED)
   ========================================================= */

const canvas = document.getElementById("cyber-bg");

if (canvas) {
  const ctx = canvas.getContext("2d");
  let w, h;

  const layers = [
    { count: 50, speed: 0.15, size: 1.2, alpha: 0.25 },
    { count: 35, speed: 0.35, size: 1.8, alpha: 0.35 },
    { count: 20, speed: 0.6, size: 2.4, alpha: 0.5 }
  ];

  let particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function init() {
    particles = [];
    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: layer.speed * (Math.random() * 0.6 + 0.4),
          vy: -layer.speed * (Math.random() * 0.6 + 0.4),
          size: layer.size,
          alpha: layer.alpha,
          pulse: Math.random() * Math.PI * 2
        });
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      // subtle glow pulse
      p.pulse += 0.02;
      const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.1;

      ctx.fillStyle = `rgba(252,238,9,${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x > w || p.y < 0) {
        p.x = Math.random() * w;
        p.y = h + 10;
      }
      if (Math.random() < 0.002) {
  ctx.fillStyle = "rgba(34,211,238,0.6)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size + 1, 0, Math.PI * 2);
  ctx.fill();
}

    }

    requestAnimationFrame(draw);
  }

  init();
  draw();
}


  /* =========================================================
     HOME PAGE LOGIC
     ========================================================= */
  if ($("name")) {

    /* ---------- ME / ABOUT ---------- */
    fetch(`${API}/`)
      .then(res => res.json())
      .then(me => {
        $("name").textContent = me.name;
        // $("role").textContent = me.role;
        // $("headline").textContent = me.headline;
        $("bio").textContent = me.bio;

        $("education").textContent =
          `${me.education.degree}, ${me.education.institution} (${me.education.duration})`;

        /* ---------- EXPERIENCE ---------- */
        const expContainer = $("experience-container");
        me.experience.forEach(exp => {
          const el = document.createElement("div");
          el.className = "item";
          el.innerHTML = `
            <div class="item-title">${exp.role} · ${exp.organization}</div>
            <div class="item-sub">${exp.duration}</div>
            <div class="item-sub">${exp.description}</div>
          `;
          expContainer.appendChild(el);
        });

        /* ---------- SKILLS ---------- */
        const skillMap = {
          languages: "languages",
          frameworks_and_tools: "frameworks_and_tools",
        };

        Object.entries(skillMap).forEach(([key, containerId]) => {
          const container = $(containerId);
          me.skills[key].forEach(skill => {
            const chip = document.createElement("span");
            chip.textContent = skill;
            container.appendChild(chip);
          });
        });

        /* ---------- SOCIAL LINKS ---------- */
        $("github").href = me.profiles.github;
        $("linkedin").href = me.profiles.linkedin;
        $("leetcode").href = me.profiles.leetcode;
      })
      .catch(err => console.error("Error loading profile:", err));

    /* ---------- PROJECT PREVIEW ---------- */
    fetch(`${API}/projects`)
      .then(res => res.json())
      .then(data => {
        const container = $("projects-container");
        data.projects.forEach(project => {
          const el = document.createElement("div");
          el.className = "item";
          el.innerHTML = `
            <div class="item-title">${project.title}</div>
            <div class="item-sub">${project.short_description}</div>
          `;
          el.onclick = () => {
            window.location.href = `project.html?id=${project.id}`;
          };
          container.appendChild(el);
        });
      })
      .catch(err => console.error("Error loading projects:", err));

    /* ---------- BLOG PREVIEW ---------- */
    fetch(`${API}/blogs`)
      .then(res => res.json())
      .then(data => {
        const container = $("blogs-container");
        data.blogs
          .filter(b => b.status === "published")
          .forEach(blog => {
            const el = document.createElement("div");
            el.className = "item";
            el.innerHTML = `
              <div class="item-title">${blog.title}</div>
              <div class="item-sub">${blog.short_description}</div>
            `;
            el.onclick = () => {
              window.location.href = `blog.html?id=${blog.id}`;
            };
            container.appendChild(el);
          });
      })
      .catch(err => console.error("Error loading blogs:", err));
  }

  /* =========================================================
     PROJECT DETAIL PAGE
     ========================================================= */
  if ($("project-title") && pageId) {
    fetch(`${API}/projects/${pageId}`)
      .then(res => res.json())
      .then(project => {
        $("project-title").textContent = project.title;
        $("project-category").textContent = project.category;
        $("project-desc").textContent = project.detailed_description;

        const techContainer = $("project-tech");
        project.tech_stack.forEach(tech => {
          const span = document.createElement("span");
          span.textContent = tech;
          techContainer.appendChild(span);
        });

        $("project-repo").href = project.repo;
      })
      .catch(err => console.error("Error loading project:", err));
  }

  /* =========================================================
     BLOG DETAIL PAGE
     ========================================================= */
  if ($("blog-title") && pageId) {
    fetch(`${API}/blogs/${pageId}`)
      .then(res => res.json())
      .then(blog => {
        $("blog-title").textContent = blog.title;
        $("blog-meta").textContent =
          `${blog.published_on} · ${blog.reading_time_minutes} min read`;
        $("blog-desc").textContent = blog.detailed_description;
      })
      .catch(err => console.error("Error loading blog:", err));
  }

});
