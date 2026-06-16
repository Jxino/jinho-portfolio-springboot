gsap.utils.toArray(".journey-card").forEach((card, index) => {
  gsap.from(card, {
    opacity: 0,
    y: 80,
    duration: .4,
    ease: "power3.out",
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
    delay: index * 0.1,
  });
});

// HERO SECTION CYBER GRID TUNNEL BACKGROUND
function initLineWaves(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    speed = 0.3,
    innerLineCount = 32.0,
    outerLineCount = 40.0,
    warpIntensity = 1.0,
    rotation = -23,
    edgeFadeWidth = 0.0,
    colorCycleSpeed = 1.0,
    brightness = 0.2,
    color1 = '#1DCD9F',
    color2 = '#1DCD9F',
    color3 = '#1DCD9F',
    enableMouseInteraction = true,
    mouseInfluence = 2.0
  } = options;

  function hexToVec3(hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    ];
  }

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  const vertexShaderSrc = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentShaderSrc = `
    precision highp float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uSpeed;
    uniform float uBrightness;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec2 uMouse;
    uniform float uMouseInfluence;
    uniform bool uEnableMouse;

    float linePulse(float value, float thickness) {
      float distanceToLine = abs(fract(value) - 0.5);
      return 1.0 - smoothstep(0.5 - thickness, 0.5, distanceToLine);
    }

    mat2 rotate2D(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      float t = uTime * uSpeed;
      vec2 mouse = uMouse * 2.0 - 1.0;
      mouse.x *= uResolution.x / uResolution.y;

      if (uEnableMouse) {
        p += mouse * 0.08 * uMouseInfluence;
      }

      float radius = length(p);
      float angle = atan(p.y, p.x);
      float tunnelDepth = 1.0 / max(radius, 0.055);
      float travel = tunnelDepth + t * 2.7;

      float twist = sin(travel * 0.18 + t * 0.8) * 0.38;
      vec2 twisted = rotate2D(twist) * p;
      float twistedAngle = atan(twisted.y, twisted.x);

      float radialGrid = linePulse(travel * 1.35, 0.075);
      float angularGrid = linePulse((twistedAngle / 6.2831853) * 18.0 + sin(travel * 0.2) * 0.2, 0.06);
      float tunnelGrid = max(radialGrid, angularGrid);

      float centerGlow = exp(-radius * 4.2);
      float depthFade = smoothstep(0.05, 0.95, radius) * (1.0 - smoothstep(1.15, 1.85, radius));
      float pulse = sin(travel * 2.6 - t * 5.4) * 0.5 + 0.5;
      float grid = pow(tunnelGrid, 1.15) * depthFade;

      vec3 neonA = mix(uColor1, uColor2, sin(angle * 2.0 + t) * 0.5 + 0.5);
      vec3 neonB = mix(uColor2, uColor3, pulse);
      vec3 color = mix(neonA, neonB, centerGlow);

      vec3 col = color * (grid * 4.8 + centerGlow * 2.2 + radialGrid * pulse * 1.25) * max(uBrightness, 0.9);
      col += uColor3 * pow(centerGlow, 2.0) * 0.7;

      float vignette = 1.0 - smoothstep(0.72, 1.65, radius);
      float alpha = clamp((grid * 1.85 + centerGlow * 0.92) * vignette, 0.0, 1.0);

      gl_FragColor = vec4(col * vignette, alpha);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, vertexShaderSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Fullscreen quad
  const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uResLoc = gl.getUniformLocation(program, 'uResolution');
  const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');
  const uInnerLoc = gl.getUniformLocation(program, 'uInnerLines');
  const uOuterLoc = gl.getUniformLocation(program, 'uOuterLines');
  const uWarpLoc = gl.getUniformLocation(program, 'uWarpIntensity');
  const uRotLoc = gl.getUniformLocation(program, 'uRotation');
  const uFadeLoc = gl.getUniformLocation(program, 'uEdgeFadeWidth');
  const uCycleLoc = gl.getUniformLocation(program, 'uColorCycleSpeed');
  const uBrightLoc = gl.getUniformLocation(program, 'uBrightness');
  const uC1Loc = gl.getUniformLocation(program, 'uColor1');
  const uC2Loc = gl.getUniformLocation(program, 'uColor2');
  const uC3Loc = gl.getUniformLocation(program, 'uColor3');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
  const uMouseInfLoc = gl.getUniformLocation(program, 'uMouseInfluence');
  const uEnableMouseLoc = gl.getUniformLocation(program, 'uEnableMouse');

  // Set static uniforms
  const rotRad = (rotation * Math.PI) / 180;
  gl.uniform1f(uSpeedLoc, speed);
  gl.uniform1f(uInnerLoc, innerLineCount);
  gl.uniform1f(uOuterLoc, outerLineCount);
  gl.uniform1f(uWarpLoc, warpIntensity);
  gl.uniform1f(uRotLoc, rotRad);
  gl.uniform1f(uFadeLoc, edgeFadeWidth);
  gl.uniform1f(uCycleLoc, colorCycleSpeed);
  gl.uniform1f(uBrightLoc, brightness);
  gl.uniform3fv(uC1Loc, hexToVec3(color1));
  gl.uniform3fv(uC2Loc, hexToVec3(color2));
  gl.uniform3fv(uC3Loc, hexToVec3(color3));
  gl.uniform1f(uMouseInfLoc, mouseInfluence);
  gl.uniform1i(uEnableMouseLoc, enableMouseInteraction ? 1 : 0);

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let currentMouse = [0.5, 0.5];
  let targetMouse = [0.5, 0.5];

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    targetMouse = [
      (e.clientX - rect.left) / rect.width,
      1.0 - (e.clientY - rect.top) / rect.height
    ];
  }

  function handleMouseLeave() {
    targetMouse = [0.5, 0.5];
  }

  if (enableMouseInteraction) {
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
  }

  function resize() {
    const w = container.clientWidth || container.offsetWidth || window.innerWidth;
    const h = container.clientHeight || container.offsetHeight || window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResLoc, w, h);
  }

  window.addEventListener('resize', resize);

  let animationFrameId;

  function render(time) {
    animationFrameId = requestAnimationFrame(render);
    gl.uniform1f(uTimeLoc, time * 0.001);

    if (enableMouseInteraction) {
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      gl.uniform2f(uMouseLoc, currentMouse[0], currentMouse[1]);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Ensure layout is settled before first render
  requestAnimationFrame(() => {
    resize();
    animationFrameId = requestAnimationFrame(render);
  });

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    }
  };
}

// The bright theme uses a CSS aurora background instead of the WebGL tunnel.
// initLineWaves('line-waves-container');



particlesJS("particles-projects", {
  "particles": {
    "number": { "value": 50 },
    "color": { "value": "ffffff" },
    "shape": { "type": "circle" },
    "opacity": {
      "value": 0.5,
      "random": true
    },
    "size": {
      "value": 4,
      "random": true
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 3,
      "direction": "none",
      "out_mode": "out"
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": true, "mode": "push" }
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": { "opacity": 1 }
      },
      "push": { "particles_nb": 4 }
    }
  },
  "retina_detect": true
});

const projectIconMap = {
  "Spring Boot": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg",
  "Java": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
  "JPA": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hibernate/hibernate-original.svg",
  "MySQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
  "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  "Elasticsearch": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/elasticsearch/elasticsearch-original.svg",
  "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
  "PyTorch": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg",
  "FastAPI": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
  "Kafka": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apachekafka/apachekafka-original.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  "OpenCV": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original.svg",
  "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original-wordmark.svg",
  "RabbitMQ": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rabbitmq/rabbitmq-original.svg"
};

const fallbackProjectIcon = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function projectApiCandidates() {
  const sameOriginApi = `${window.location.origin}/api/projects`;
  if (window.location.protocol === "file:" || window.location.port === "4173") {
    return ["http://127.0.0.1:8080/api/projects", sameOriginApi];
  }
  return ["/api/projects", "http://127.0.0.1:8080/api/projects"];
}

async function fetchProjectData() {
  let lastError;
  for (const endpoint of projectApiCandidates()) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Project API returned ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function renderProjectCard(project) {
  const techBadges = (project.techStack || []).map((tech) => {
    const safeTech = escapeHtml(tech);
    const icon = projectIconMap[tech] || fallbackProjectIcon;
    return `
      <span class="flex items-center gap-1 bg-gray-100 px-2 py-1 text-xs rounded cursor-pointer">
        <img src="${icon}" alt="${safeTech}" class="w-4 h-4" />
        ${safeTech}
      </span>
    `;
  }).join("");

  return `
    <div class="project-card bg-white text-black shadow-xl rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      <img src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.title)} Screenshot" class="w-full h-60 object-cover" loading="lazy" decoding="async"/>
      <div class="p-6">
        <h3 class="text-2xl font-semibold mb-2">${escapeHtml(project.title)}</h3>
        <p class="text-gray-700 mb-4">${escapeHtml(project.description)}</p>
        <div class="flex flex-wrap gap-3 mb-4">
          ${techBadges}
        </div>
        <div class="flex gap-4">
          <a href="${escapeHtml(project.githubUrl)}" target="_blank"
            class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all text-sm">
            GitHub
          </a>
        </div>
      </div>
    </div>
  `;
}

async function loadPortfolioProjects() {
  const projectsGrid = document.getElementById("projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = `
    <div class="project-card bg-white text-black shadow-xl rounded-2xl overflow-hidden p-6 md:col-span-2">
      <p class="text-gray-700">Loading GitHub projects...</p>
    </div>
  `;

  try {
    const projects = await fetchProjectData();
    projectsGrid.innerHTML = projects.map(renderProjectCard).join("");
    projectsGrid.querySelectorAll(".project-card").forEach((card) => {
      card.style.opacity = "1";
      card.style.transform = "";
    });
  } catch (error) {
    console.error("Error loading portfolio projects:", error);
    projectsGrid.innerHTML = `
      <div class="project-card bg-white text-black shadow-xl rounded-2xl overflow-hidden p-6 md:col-span-2">
        <h3 class="text-2xl font-semibold mb-2">Projects could not be loaded</h3>
        <p class="text-gray-700 mb-4">Spring Boot API 서버가 실행 중인지 확인해 주세요.</p>
        <a href="https://github.com/Jxino" target="_blank"
          class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all text-sm">
          GitHub
        </a>
      </div>
    `;
  }
}

loadPortfolioProjects();

function initCertificationSlider() {
  const viewport = document.querySelector(".certification-viewport");
  const track = document.querySelector(".certification-track");
  const prevButton = document.querySelector(".certification-nav-prev");
  const nextButton = document.querySelector(".certification-nav-next");
  const items = Array.from(document.querySelectorAll(".certification-item"));

  if (!viewport || !track || !prevButton || !nextButton || items.length === 0) return;

  let currentIndex = 0;

  function getItemOffset(index) {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return items
      .slice(0, index)
      .reduce((offset, item) => offset + item.getBoundingClientRect().width + gap, 0);
  }

  function updateSlider() {
    const activeItem = items[currentIndex];
    const activeWidth = activeItem.getBoundingClientRect().width;
    const centeredOffset = getItemOffset(currentIndex) - ((viewport.clientWidth - activeWidth) / 2);

    track.style.transform = `translateX(${-centeredOffset}px)`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === items.length - 1;

    items.forEach((item, index) => {
      item.classList.toggle("is-active", index === currentIndex);
      item.setAttribute("aria-hidden", index === currentIndex ? "false" : "true");
    });
  }

  prevButton.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateSlider();
  });

  nextButton.addEventListener("click", () => {
    currentIndex = Math.min(items.length - 1, currentIndex + 1);
    updateSlider();
  });

  items.forEach((item) => {
    item.addEventListener("mouseenter", updateSlider);
    item.addEventListener("mouseleave", updateSlider);
  });

  window.addEventListener("resize", updateSlider);
  updateSlider();
}

initCertificationSlider();


gsap.registerPlugin(ScrollTrigger);
  
gsap.utils.toArray('.fade-in').forEach((el) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: "power3.out",
  });
});

  gsap.from("#about-text", {
    scrollTrigger: {
      trigger: "#about-text",
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    y: 50,
    duration: .4,
    ease: "power3.out",
    delay: 0.2
  });
  
  gsap.utils.toArray('.tech-category').forEach((section, index) => {
    gsap.from(section, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });

  gsap.utils.toArray('.reveal-section').forEach(section => {
    gsap.from(section, {
      opacity: 0,
      y: 60,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reset"
      }
    });
  });

// Performance Optimizations - Lazy Loading
document.addEventListener('DOMContentLoaded', function() {
  // Lazy loading for images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });

  // Preload critical images
  const criticalImages = [
    './assets/fluent-feather-cursor.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

});
  
document.addEventListener('DOMContentLoaded', function() {
  const typingIntroduction = document.getElementById('typing-introduction');

  if (typingIntroduction) {
    const lines = JSON.parse(typingIntroduction.dataset.lines || '[]');
    let lineIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    function typeIntroduction() {
      const line = lines[lineIndex] || '';
      characterIndex += deleting ? -1 : 1;
      typingIntroduction.textContent = line.slice(0, characterIndex);

      let delay = deleting ? 28 : 52;
      if (!deleting && characterIndex >= line.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && characterIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        delay = 350;
      }

      window.setTimeout(typeIntroduction, delay);
    }

    if (lines.length > 0) typeIntroduction();
  }

  const scrollBar = document.getElementById('scroll-bar');
  if (scrollBar) {
    scrollBar.addEventListener('click', function(e) {
      const rect = scrollBar.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percent = clickY / rect.height;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = percent * docHeight;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  }
});
  
