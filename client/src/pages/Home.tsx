import { FormEvent, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Asterisk,
  Award,
  Braces,
  Check,
  ChevronDown,
  Code2,
  Download,
  ExternalLink,
  Figma,
  Github,
  Globe2,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MonitorCog,
  Palette,
  Phone,
  Send,
  ServerCog,
  Sparkles,
  Sun,
  Terminal,
  X,
} from "lucide-react";

const profilePhoto = "/assets/IMG_3967.jpg";
const resumeFile = "/manus-storage/josh-velasco_be67e71f.jpg";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contacts", href: "#contacts" },
];

const services = [
  {
    number: "01",
    icon: MonitorCog,
    title: "Frontend Systems",
    description:
      "Responsive interfaces built with clean HTML, CSS, JavaScript, and a sharp eye for usability.",
    tags: ["HTML", "CSS", "JavaScript"],
  },
  {
    number: "02",
    icon: Palette,
    title: "Visual Design",
    description:
      "Clear visual direction, thoughtful layouts, and polished design systems that make ideas easier to use.",
    tags: ["Figma", "Prototyping", "Branding"],
  },
  {
    number: "03",
    icon: ServerCog,
    title: "IT Foundations",
    description:
      "Practical support across troubleshooting, systems thinking, documentation, and digital workflows.",
    tags: ["Problem solving", "Systems", "Support"],
  },
];

const certificates = [
  { id: "CERT / 01", title: "Gold Awardee", detail: "Exemplary Academic Performance · PCU College of Informatics", year: "2025–2026", image: "/certificates/83c95f42-645b-4803-b90b-e8d185b2939c.jpg", description: "Certificate of Recognition for Gold Awardee — Exemplary Academic Performance from the Philippine Christian University College of Informatics." },
  { id: "CERT / 02", title: "Academic Excellence", detail: "With Honors · Grade 11 · PCU Senior High School", year: "2022–2023", image: "/certificates/208aec10-45a0-4447-9236-366edc411ad5.jpg", description: "Academic Excellence with Honors recognition for first-semester performance during Grade 11 at Philippine Christian University Senior High School." },
  { id: "CERT / 03", title: "Academic Excellence Award", detail: "With High Honors · Grade 12 · PCU Senior High School", year: "2023–2024", image: "/certificates/7e8c3880-0a8f-4807-822a-dd979e12ffc1.jpg", description: "Academic Excellence Award with High Honors for outstanding academic performance during Grade 12 at Philippine Christian University Senior High School." },
  { id: "CERT / 04", title: "Research Presentation", detail: "Basic Education Research Festival · PCU", year: "2024", image: "/certificates/2544961e-ed0b-4e82-b30f-743cc1f59db9.jpg", description: "Certificate of Recognition for presenting “Learning Engagement and E-Learning Application toward Program Development Plan” during the Basic Education Research Festival." },
  { id: "CERT / 05", title: "Outstanding Dean’s Lister", detail: "B.S. Information Technology · PCU College of Informatics", year: "2025", image: "/certificates/d3c3cf8c-6c73-4b57-8f82-23ac270033ec.jpg", description: "Certificate of Recognition for 1st Year Outstanding Dean’s Lister in B.S. Information Technology, with a General Weighted Average of 1.31." },
];

type ChatMessage = { role: "user" | "model"; content: string };

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="section-heading reveal">
      <div>
        <p className="eyebrow"><Asterisk size={14} strokeWidth={2.5} /> {eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {copy && <p className="heading-copy">{copy}</p>}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [selectedCertificate, setSelectedCertificate] = useState<(typeof certificates)[number] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "model", content: "Hi — I’m Josh’s portfolio assistant. Ask me about his skills, certificates, or services." },
  ]);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (window.localStorage.getItem("josh-theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("josh-theme", theme);
  }, [theme]);

  useEffect(() => {
    const sections = navItems.map(({ href }) => document.querySelector(href)).filter(Boolean) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0.1, 0.3, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));

    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    reveals.forEach((item) => revealObserver.observe(item));

    return () => {
      observer.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(selectedCertificate));
    return () => document.body.classList.remove("modal-open");
  }, [selectedCertificate]);

  useEffect(() => {
    const core = document.querySelector<HTMLElement>(".cursor-core");
    const reticle = document.querySelector<HTMLElement>(".cursor-reticle");
    const label = document.querySelector<HTMLElement>(".cursor-label");
    if (!core || !reticle || !label || !window.matchMedia("(pointer: fine)").matches) return;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      core.classList.add("is-visible");
      reticle.classList.add("is-visible");
      label.classList.add("is-visible");
    };
    const render = () => {
      currentX += (targetX - currentX) * 0.32;
      currentY += (targetY - currentY) * 0.32;
      core.style.left = `${currentX}px`;
      core.style.top = `${currentY}px`;
      reticle.style.left = `${currentX}px`;
      reticle.style.top = `${currentY}px`;
      label.style.left = `${currentX + 19}px`;
      label.style.top = `${currentY + 17}px`;
      frame = window.requestAnimationFrame(render);
    };
    const enter = () => { reticle.classList.add("is-hovering"); label.classList.add("is-hovering"); label.textContent = "INTERACT"; };
    const leave = () => { reticle.classList.remove("is-hovering"); label.classList.remove("is-hovering"); label.textContent = ""; };
    const interactive = document.querySelectorAll<HTMLElement>("a, button, input, textarea, article");
    window.addEventListener("pointermove", move);
    interactive.forEach((item) => { item.addEventListener("mouseenter", enter); item.addEventListener("mouseleave", leave); });
    frame = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      interactive.forEach((item) => { item.removeEventListener("mouseenter", enter); item.removeEventListener("mouseleave", leave); });
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
    window.setTimeout(() => setSubmitted(false), 4500);
  };

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    const nextMessages = [...chatMessages, { role: "user" as const, content: message }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatError("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: nextMessages.slice(-12) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The assistant could not respond.");
      setChatMessages((current) => [...current, { role: "model", content: data.reply }]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "The assistant could not respond.");
    } finally {
      setChatLoading(false);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    target.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <div className="site-shell">
      <div className="grain" aria-hidden="true" />
      <div className="cursor-core" aria-hidden="true" /><div className="cursor-reticle" aria-hidden="true"><span /></div><div className="cursor-label" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Josh Velasco home">
          <span className="brand-mark"><Terminal size={16} /></span>
          <span>JR<span className="brand-dot">.</span>V</span>
        </a>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              className={activeSection === item.href.slice(1) ? "active" : ""}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              <span>0{navItems.indexOf(item) + 1}</span>{item.label}
            </a>
          ))}
        </nav>
        <div className="header-tools">
          <button className="theme-toggle" type="button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "light"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun size={15} /><span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <a className="header-cta" href="#contacts">Let's talk <ArrowUpRight size={16} /></a>
        </div>
        <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-orbit orbit-one" aria-hidden="true" />
          <div className="hero-orbit orbit-two" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow reveal"><span className="status-dot" /> Available for opportunities</p>
            <h1 className="reveal reveal-delay-1">Maangas gumawa ng<br /><em>wibsayt.</em></h1>
            <p className="hero-intro reveal reveal-delay-2">I’m Josh Raven R. Velasco — an IT student and creative technologist turning curious ideas into useful, human-centered experiences.</p>
            <div className="hero-actions reveal reveal-delay-3">
              <a className="button button-primary" href="#services">Explore services <ArrowDownRight size={17} /></a>
              <a className="button button-secondary" href={resumeFile} download="Josh-Raven-R-Velasco-Resume.jpg"><Download size={17} /> Download resume</a>
              <a className="text-link" href="#about">More about me <ArrowDownRight size={16} /></a>
            </div>
          </div>
          <div className="hero-visual reveal reveal-delay-2" onPointerMove={handlePointerMove}>
            <div className="visual-label label-top"><span>MANILA / PH</span><span>01 — 04</span></div>
            <div className="photo-frame portrait-frame">
              <div className="photo-glow" />
              <img src={profilePhoto} alt="Josh Raven R. Velasco in a navy blazer" />
              <div className="scan-line" />
              <span className="frame-corner corner-tl" /><span className="frame-corner corner-br" />
            </div>
            <div className="visual-label label-bottom"><span>BSIT STUDENT</span><span>EST. 2004</span></div>
            <div className="code-float"><span>const</span> future = <b>build()</b>;</div>
          </div>
          <div className="hero-foot reveal reveal-delay-3"><span>Scroll to explore</span><span className="line" /><span>01</span></div>
        </section>

        <section className="marquee-band" aria-label="Areas of focus">
          <div className="marquee-track"><div className="marquee-sequence"><span>DESIGN THE SYSTEM</span><Asterisk /><span>WRITE THE CODE</span><Asterisk /><span>LEARN IN PUBLIC</span><Asterisk /><span>DESIGN THE SYSTEM</span><Asterisk /><span>WRITE THE CODE</span><Asterisk /><span>LEARN IN PUBLIC</span><Asterisk /></div><div className="marquee-sequence" aria-hidden="true"><span>DESIGN THE SYSTEM</span><Asterisk /><span>WRITE THE CODE</span><Asterisk /><span>LEARN IN PUBLIC</span><Asterisk /><span>DESIGN THE SYSTEM</span><Asterisk /><span>WRITE THE CODE</span><Asterisk /><span>LEARN IN PUBLIC</span><Asterisk /></div></div>
        </section>

        <section className="section-pad about-section" id="about">
          <SectionHeading eyebrow="About me" title="A hybrid mind for the digital world." copy="A closer look at the person behind the pixels, prototypes, and problem-solving." />
          <div className="about-layout">
            <div className="about-statement reveal"><span className="giant-number">01</span><p>Technology is more than a tool — it’s a way to make complicated things feel simple. I’m learning how to do exactly that.</p><div className="signature">JRV<span> / 2026</span></div></div>
            <div className="about-details reveal reveal-delay-1">
              <p>As a college Information Technology student at Philippine Christian University Manila, I’m building a foundation across front-end development, visual design, prototyping, and back-end thinking.</p>
              <p>What drives me is the space between logic and creativity: a well-structured system that also feels intuitive, considered, and distinctly human.</p>
              <div className="detail-grid"><div><span>Currently</span><b>BS Information Technology</b></div><div><span>Based in</span><b>Manila, Philippines</b></div><div><span>Languages</span><b>English · Tagalog</b></div><div><span>Focus</span><b>Build &amp; evolve</b></div></div>
            </div>
          </div>
        </section>

        <section className="section-pad services-section" id="services">
          <SectionHeading eyebrow="Services" title="Where I can add value." copy="A growing toolkit shaped by curiosity, practice, and a bias toward making things better." />
          <div className="service-list">
            {services.map((service) => {
              const Icon = service.icon;
              return <article className="service-card reveal" key={service.number} onPointerMove={handlePointerMove}>
                <div className="service-top"><span className="service-number">{service.number}</span><Icon size={23} strokeWidth={1.6} /><ArrowUpRight className="service-arrow" size={21} /></div>
                <h3>{service.title}</h3><p>{service.description}</p>
                <div className="tag-row">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </article>;
            })}
          </div>
          <div className="toolkit reveal"><span className="toolkit-label">Current toolkit</span><div className="tool-list"><span><Code2 size={15} /> HTML / CSS / JS</span><span><Figma size={15} /> Figma</span><span><Braces size={15} /> UI systems</span><span><Github size={15} /> Git / GitHub</span></div></div>
        </section>

        <section className="section-pad certificates-section" id="certificates">
          <SectionHeading eyebrow="Certificates" title="Proof of progress." copy="A growing record of academic achievement, research, and recognition." />
          <div className="cert-grid">
            {certificates.map((certificate, index) => <button className="cert-card reveal" style={{ "--delay": `${index * 60}ms` } as React.CSSProperties} key={certificate.id} onClick={() => setSelectedCertificate(certificate)}>
              <div className="cert-preview"><img src={certificate.image} alt={`${certificate.title} certificate`} /></div><div className="cert-header"><span>{certificate.id}</span><Award size={20} /></div><div className="cert-content"><h3>{certificate.title}</h3><p>{certificate.detail}</p></div><div className="cert-footer"><span>{certificate.year}</span><span className="cert-link">View certificate <ArrowUpRight size={14} /></span></div>
            </button>)}
          </div>
        </section>

        <section className="section-pad contact-section" id="contacts">
          <div className="contact-panel reveal">
            <div className="contact-intro"><p className="eyebrow"><Sparkles size={14} /> Contacts</p><h2>Let’s make<br /><em>something useful.</em></h2><p>Have an idea, an opportunity, or just want to talk tech? My inbox is open.</p><div className="contact-meta"><a href="mailto:josh.velasco.coi@pcu.edu.ph"><Mail size={17} /> josh.velasco.coi@pcu.edu.ph</a><a href="tel:+639948670215"><Phone size={17} /> +63 994 867 0215</a><span><MapPin size={17} /> Sta. Ana, Manila</span></div><div className="social-row"><a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a><a href="mailto:josh.velasco.coi@pcu.edu.ph" aria-label="Email"><Mail size={18} /></a></div></div>
            <form className="contact-form" onSubmit={handleSubmit}><div className="form-heading"><span>START A CONVERSATION</span><Send size={18} /></div><label><span>Your name</span><input required name="name" placeholder="Jane Smith" /></label><label><span>Email address</span><input required type="email" name="email" placeholder="jane@company.com" /></label><label><span>What’s on your mind?</span><textarea required name="message" rows={4} placeholder="Tell me a little about your project..." /></label><button className="button button-primary" type="submit">{submitted ? <>Message queued <Check size={17} /></> : <>Send message <ArrowUpRight size={17} /></>}</button>{submitted && <p className="form-success">Thanks — this demo form is ready to connect to your inbox.</p>}</form>
          </div>
        </section>
      </main>

      <footer className="site-footer"><a className="brand" href="#top"><span className="brand-mark"><Terminal size={16} /></span><span>JR<span className="brand-dot">.</span>V</span></a><span>© 2026 Josh Raven R. Velasco</span><a href="#top">Back to top <ArrowUpRight size={14} /></a></footer>

      {chatOpen && <section className="chat-panel" aria-label="Portfolio AI assistant">
        <div className="chat-panel-header"><div><span className="chat-status"><span /> ONLINE</span><h2>Ask the assistant</h2></div><button className="chat-close" type="button" aria-label="Close AI assistant" onClick={() => setChatOpen(false)}><X size={18} /></button></div>
        <div className="chat-messages" aria-live="polite">
          {chatMessages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.content}</span></div>)}
          {chatLoading && <div className="chat-message model"><span className="chat-typing"><i /><i /><i /></span></div>}
        </div>
        {chatError && <p className="chat-error">{chatError}</p>}
        <form className="chat-form" onSubmit={handleChatSubmit}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Ask about Josh..." aria-label="Message the AI assistant" maxLength={4000} /><button type="submit" aria-label="Send message" disabled={chatLoading || !chatInput.trim()}><Send size={17} /></button></form>
      </section>}
      <button className={`chat-launcher ${chatOpen ? "is-open" : ""}`} type="button" aria-label={chatOpen ? "Close AI assistant" : "Open AI assistant"} aria-expanded={chatOpen} onClick={() => setChatOpen((open) => !open)}><MessageCircle size={21} /><span>{chatOpen ? "Close" : "Ask AI"}</span></button>

      {selectedCertificate && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedCertificate(null)}><div className="cert-modal" role="dialog" aria-modal="true" aria-labelledby="cert-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close certificate details" onClick={() => setSelectedCertificate(null)}><X size={20} /></button><img className="modal-certificate-image" src={selectedCertificate.image} alt={`${selectedCertificate.title} certificate`} /><p className="eyebrow">{selectedCertificate.id}</p><h2 id="cert-modal-title">{selectedCertificate.title}</h2><p>{selectedCertificate.description}</p><div className="modal-note"><span>ISSUED / RECOGNIZED</span><span>{selectedCertificate.year}</span></div></div></div>}
    </div>
  );
}
