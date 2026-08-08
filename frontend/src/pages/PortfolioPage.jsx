import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../context/ToastContext';
import useTypingEffect from '../hooks/useTypingEffect';
import TechFlyIcons from '../components/TechFlyIcons';
import ScrollFX from '../components/ScrollFX/ScrollFX';
import ThemeToggle from '../components/ThemeToggle';
// import ProfileClock from '../components/ProfileClock';
import CinematicLayer from '../components/ScrollFX/CinematicLayer';
import useScrollCinematic from '../hooks/useScrollCinematic';
import useUnifiedScroll from '../hooks/useUnifiedScroll';
import useScrollReveal from '../hooks/useScrollReveal';
import { useExpandableList } from '../hooks/useExpandableList';
import ViewMoreButton from '../components/ViewMoreButton';
import { useLoading } from '../context/LoadingContext';
import {
  createMessage,
  getAbout,
  getCertifications,
  getPrimaryResume,
  getProjects,
  getSkills,
  trackVisit,
} from '../services/contentService';
import { getFileUrl, getResumeDownloadUrl } from '../services/api';
import { DEFAULT_ABOUT, DEFAULT_PROJECTS, DEFAULT_SKILLS } from '../utils/defaultData';
import renderFormattedText from '../utils/textFormat.jsx';

const handleEmailClick = (e, email) => {
  e.preventDefault();
  const mailtoLink = `mailto:${email}`;
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;

  // Try opening default mail app
  window.location.href = mailtoLink;

  // Fallback to Gmail web compose if no mail app opens
  setTimeout(() => {
    window.open(gmailLink, '_blank');
  }, 600);
};

// Builds a wa.me deep link from any phone number format (strips spaces,
// dashes, parentheses etc. and keeps a leading + / country code intact).
const getWhatsAppLink = (rawNumber, prefillMessage = "Hi! I'd like to connect with you.") => {
  const digitsOnly = (rawNumber || '').replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(prefillMessage)}`;
};

// Both modals only ever mount after the user clicks a project/certification
// card — code-splitting them out of the main bundle means their JS (plus
// anything they import) isn't downloaded/parsed until actually needed.
const ProjectDetailsModal = lazy(() => import('../components/ProjectDetailsModal'));
const CertificateModal = lazy(() => import('../components/CertificateModal'));

const skillCategories = ['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'TOOLS'];
const projectCategories = ['ALL', 'FULLSTACK', 'FRONTEND', 'BACKEND', 'AI'];

const ProjectCard = ({ project, onOpen, className = '' }) => {
  // Opens an external link (GitHub / Live demo) in a new tab, without also
  // triggering the card's own onClick (which opens the Details modal).
  const openLink = (e, url) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Video and Details both open the Details modal — that's where the video
  // (hosted file or YouTube embed) actually plays, see ProjectDetailsModal.
  const openDetails = (e) => {
    e.stopPropagation();
    onOpen(project);
  };

  return (
    <div className={`pr-card ${className}`.trim()} onClick={() => onOpen(project)}>
      <div className="pr-img-wrap">
   {project.image ? (
  <img className="pr-thumb" src={getFileUrl(project.image)} alt={project.title} loading="lazy" decoding="async" />
) : (
  <div className="pr-thumb" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34,197,94,.12), transparent 28%), #090909' }} />
)}
        <div className={`pr-badge-cat ${project.category === 'FULLSTACK' ? 'fs' : project.category === 'FRONTEND' ? 'fe' : project.category === 'AI' ? 'ai' : ''}`}>
          {project.category}
        </div>
        <div className="pr-badge-num">#{project.id ?? ''}</div>
        <div className="pr-img-hover">
          <div className="pr-hov-title">View details and open project actions</div>
          <div className="pr-hov-grid">
            <span className="hov-btn h-gh" onClick={(e) => openLink(e, project.githubUrl)}>GitHub</span>
            <span className="hov-btn h-lv" onClick={(e) => openLink(e, project.liveUrl)}>Demo</span>
            <span className="hov-btn h-vd" onClick={openDetails}>Video</span>
            <span className="hov-btn h-dt" onClick={openDetails}>Details</span>
          </div>
        </div>
      </div>
      <div className="pr-body">
        <div className="pr-tags">
          {(project.technologies || []).slice(0, 3).map((tag) => (
            <span key={tag} className={`pr-tag ${tag.toLowerCase().includes('react') ? 'cy' : tag.toLowerCase().includes('node') ? 'pu' : ''}`}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="pr-title">{project.title}</h3>
        <p className="pr-desc">{renderFormattedText(project.description)}</p>
      </div>
      <div className="pr-strip">
        <button type="button" className="pr-strip-btn gh" onClick={(e) => openLink(e, project.githubUrl)}>GitHub</button>
        <button type="button" className="pr-strip-btn lv" onClick={(e) => openLink(e, project.liveUrl)}>Live</button>
        <button type="button" className="pr-strip-btn vd" onClick={openDetails}>Video</button>
        <button type="button" className="pr-strip-btn dt" onClick={openDetails}>Details</button>
      </div>
    </div>
  );
};

const PortfolioPage = () => {
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [certifications, setCertifications] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loadingState, setLoadingState] = useState(true);
  const typingText = useTypingEffect(about.titles || DEFAULT_ABOUT.titles);
  const canvasRef = useRef(null);
  const ringRef = useRef(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { showTopBtn } = useUnifiedScroll({ topBtnThreshold: 480 });
  // Which "Who Am I?" stat card is open on tap (mobile/touch). Desktop
  // still uses plain CSS :hover and never touches this — see the
  // `(hover:hover)` guard in global.css.
  const [activeStat, setActiveStat] = useState(null);
  const statsRef = useRef(null);

  useEffect(() => {
    if (activeStat === null) return undefined;
    const handleOutside = (e) => {
      if (statsRef.current && !statsRef.current.contains(e.target)) {
        setActiveStat(null);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [activeStat]);

  const statTooltips = [
    `${about.projectsCompleted}+ Projects Completed`,
    `Learning + Practice: ${about.yearsExperience}+ years`,
    `${about.technologiesLearned}+ Technologies Learned`,
  ];
  const toggleStat = (idx) => setActiveStat((prev) => (prev === idx ? null : idx));

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const toast = useToast();
const { setAppReady } = useLoading();
  useScrollCinematic();

  // 3D tilt for the hero profile ring: rotates toward the cursor and
  // eases back to neutral on leave. Uses CSS custom props so the tilt
  // amount can be shared with layered translateZ depth in the CSS.
  const handleRingMove = (e) => {
    const ring = ringRef.current;
    if (!ring) return;
    const rect = ring.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ring.style.setProperty('--rx', `${(-py * 16).toFixed(2)}deg`);
    ring.style.setProperty('--ry', `${(px * 20).toFixed(2)}deg`);
    ring.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    ring.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };
  const resetRingTilt = () => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.style.setProperty('--rx', '0deg');
    ring.style.setProperty('--ry', '0deg');
    ring.style.setProperty('--mx', '0%');
    ring.style.setProperty('--my', '0%');
  };

  // Certifications: a standard step-by-step looping carousel — exactly
  // three cards visible at a time, the centered one scaled up, moving
  // ONE card per step (auto-play or arrows/dots), never a continuous
  // infinite scroll. The list is tripled (see certMarqueeItems) so the
  // "loop" from last -> first (and first -> last) is a normal one-card
  // CSS-transition slide; right after that transition finishes we silently
  // snap the index back into the middle copy (no transition, invisible to
  // the eye since all three copies are identical) so the index never grows
  // without bound. That's what makes the wrap "normal loop", not "infinite
  // auto-scroll".
  //
  // With only 1-2 certifications there's no third card to fill the loop
  // illusion with, so the tripling (and the wrap/autoplay machinery built
  // for it) is skipped entirely below — those counts just render the real
  // card(s) once, no repeats.
  const CERT_AUTOPLAY_MS = 4000; // advance one card every 3–5s
  const CERT_TRANSITION_MS = 440; // keep in sync with the CSS transition below

  const certTrackRef = useRef(null);
  const certIndexRef = useRef(0); // current index into the tripled list
  const certStepRef = useRef(0); // cached card width + gap, refreshed on mount/resize
  const certAutoplayRef = useRef(null); // setInterval id
  const certResumeTimerRef = useRef(null); // restarts autoplay after a manual nudge
  const certWrapTimeoutRef = useRef(null); // post-transition "snap back to middle copy"
  const [certActiveIndex, setCertActiveIndex] = useState(0); // logical 0..N-1, drives the dots
  const [certInstant, setCertInstant] = useState(false); // true only for the invisible wrap-correction frame
  const certCount = certifications.length;
  // Only triple the list when there are enough cards (3+) for the loop
  // illusion to make sense — with 1 or 2 certifications, tripling would
  // just show the same card(s) repeated, so render them once, as-is.
  const certMarqueeItems = certCount >= 3
    ? [...certifications, ...certifications, ...certifications]
    : certifications;

  // IMPORTANT: offsetWidth (layout size), NOT getBoundingClientRect() (the
  // rendered/post-transform box), so the cached step never picks up the
  // card's own scale transform.
  const getCertCardStep = () => {
    const track = certTrackRef.current;
    if (!track || !track.firstElementChild) return 0;
    const card = track.firstElementChild;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const step = card.offsetWidth + gap;
    certStepRef.current = step;
    return step;
  };

  // How far the track needs to shift so that whichever card is "active"
  // lands centered in the viewport, instead of flush against its left edge.
  const getCertCenterOffset = () => {
    const track = certTrackRef.current;
    const viewport = track?.parentElement;
    if (!track || !viewport || !track.firstElementChild) return 0;
    return (viewport.offsetWidth - track.firstElementChild.offsetWidth) / 2;
  };

  // Positions the track at a given (tripled-list) index and scales each
  // card by how many cards away it sits from that index, so the middle
  // card reads noticeably bigger than the two peeking in on either side.
  // Distance is computed from the index (not measured from the DOM), since
  // mid-transition getBoundingClientRect() would read a stale/half-animated
  // position — the index math stays correct regardless of animation state.
  const renderCertTrack = (index) => {
    const track = certTrackRef.current;
    const viewport = track?.parentElement;
    if (!track || !viewport) return;
    const step = certStepRef.current || getCertCardStep();
    const centerOffset = getCertCenterOffset();
    track.style.transform = `translateX(${(centerOffset - index * step).toFixed(1)}px)`;

    const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth : 0;
    const maxDist = viewport.offsetWidth / 2 + cardWidth / 2 || 1;
    Array.from(track.children).forEach((card, i) => {
      const dist = Math.abs((i - index) * step);
      const t = Math.min(dist / maxDist, 1);
      // Center card ~1.10x (spec: 1.08-1.12), easing down to ~0.90x for the
      // cards peeking in on either side — a subtler spread so the
      // "highlight" reads as emphasis rather than a jarring size jump.
      const scale = 1.1 - t * 0.2;
      card.style.transform = `scale(${scale.toFixed(3)})`;
      card.style.opacity = Math.max(1 - t * 0.35, 0.55).toFixed(2);
      card.style.zIndex = String(Math.round((1 - t) * 10));
      card.classList.toggle('cert-card--active', i === index);
    });
  };

  // Moves the track to an exact index in the tripled list. `instant` skips
  // the CSS transition for one frame (used only for the invisible
  // wrap-correction) then re-enables it on the next frame.
  const setCertTrackIndex = (index, { instant = false } = {}) => {
    certIndexRef.current = index;
    if (instant) setCertInstant(true);
    renderCertTrack(index);
    setCertActiveIndex(((index % certCount) + certCount) % certCount);
    if (instant) {
      requestAnimationFrame(() => requestAnimationFrame(() => setCertInstant(false)));
    }
  };

  // After every step's transition finishes, if we've drifted into the
  // first or last copy of the tripled list, silently re-center the index
  // back into the middle copy — invisible, since all three copies render
  // identically. This is what makes last -> first (and back) a normal,
  // bounded loop instead of an ever-growing "infinite scroll". Only
  // relevant when the list is actually tripled (certCount >= 3).
  const scheduleCertWrapCheck = () => {
    if (certWrapTimeoutRef.current) clearTimeout(certWrapTimeoutRef.current);
    certWrapTimeoutRef.current = setTimeout(() => {
      const idx = certIndexRef.current;
      if (idx >= certCount * 2) {
        setCertTrackIndex(idx - certCount, { instant: true });
      } else if (idx < certCount) {
        setCertTrackIndex(idx + certCount, { instant: true });
      }
    }, CERT_TRANSITION_MS + 30);
  };

  // The single building block for both auto-play and manual nav: move
  // exactly one card in `direction` (-1 or 1) via the normal CSS transition.
  const moveCert = (direction) => {
    if (!certStepRef.current) getCertCardStep();
    if (certCount < 3) {
      // No tripled list to loop through — step directly between the real
      // cards with a plain modulo wrap, no "snap back to middle copy"
      // correction needed since there's no illusion to maintain.
      const nextIndex = ((certIndexRef.current + direction) % certCount + certCount) % certCount;
      setCertTrackIndex(nextIndex);
      return;
    }
    setCertTrackIndex(certIndexRef.current + direction);
    scheduleCertWrapCheck();
  };

  const stopCertAutoplay = () => {
    if (certAutoplayRef.current) {
      clearInterval(certAutoplayRef.current);
      certAutoplayRef.current = null;
    }
  };
  const startCertAutoplay = () => {
    stopCertAutoplay();
    // 1-2 certifications: nothing to loop through automatically — leave
    // navigation to the arrows/dots only.
    if (certCount < 3) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    certAutoplayRef.current = setInterval(() => moveCert(1), CERT_AUTOPLAY_MS);
  };

  // Arrow-button navigation: step exactly one card, then briefly pause
  // auto-play so the click feels deliberate before it resumes on its own.
  const nudgeCert = (direction) => {
    moveCert(direction);
    stopCertAutoplay();
    if (certResumeTimerRef.current) clearTimeout(certResumeTimerRef.current);
    certResumeTimerRef.current = setTimeout(startCertAutoplay, 3500);
  };

  // Clicking a dot jumps straight to that card (within the currently
  // displayed copy, so it's still a normal slide, not a teleport) and
  // pauses auto-play briefly before it resumes.
  const scrollCertToIndex = (index) => {
    if (certCount < 3) {
      setCertTrackIndex(index);
    } else {
      const base = Math.floor(certIndexRef.current / certCount) * certCount;
      setCertTrackIndex(base + index);
      scheduleCertWrapCheck();
    }
    stopCertAutoplay();
    if (certResumeTimerRef.current) clearTimeout(certResumeTimerRef.current);
    certResumeTimerRef.current = setTimeout(startCertAutoplay, 3500);
  };

  const pauseCertMarquee = () => {
    if (certResumeTimerRef.current) clearTimeout(certResumeTimerRef.current);
    stopCertAutoplay();
  };
  const resumeCertMarquee = () => startCertAutoplay();

  useEffect(() => {
    if (!certCount) return undefined;
    getCertCardStep();
    // 3+ certifications: start in the middle copy of the tripled list so
    // there's always room to wrap smoothly in either direction from card
    // one. 1-2 certifications: there is no tripled list, so just start at
    // the first (only) copy.
    setCertTrackIndex(certCount >= 3 ? certCount : 0, { instant: true });
    startCertAutoplay();

    const handleResize = () => {
      getCertCardStep();
      renderCertTrack(certIndexRef.current);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      stopCertAutoplay();
      window.removeEventListener('resize', handleResize);
      if (certResumeTimerRef.current) clearTimeout(certResumeTimerRef.current);
      if (certWrapTimeoutRef.current) clearTimeout(certWrapTimeoutRef.current);
    };
  }, [certCount]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async (isInitialLoad = false) => {
      try {
    const [aboutResp, skillsResp, projectsResp, resumeResp, certificationsResp] = await Promise.allSettled([
          getAbout(),
          getSkills(),
          getProjects(),
          getPrimaryResume(),
          getCertifications(),
        ]);

        if (!isMounted) return;

        if (aboutResp.status === 'fulfilled' && aboutResp.value.success) {
          const payload = aboutResp.value.data;
          setAbout({
            name: payload.name || DEFAULT_ABOUT.name,
            title: payload.subtitle || payload.title || DEFAULT_ABOUT.title,
            summary: payload.summary || DEFAULT_ABOUT.summary,
            yearsExperience: payload.yearsExperience || DEFAULT_ABOUT.yearsExperience,
            projectsCompleted: payload.projectsCompleted || DEFAULT_ABOUT.projectsCompleted,
            technologiesLearned: payload.technologiesLearned || DEFAULT_ABOUT.technologiesLearned,
            strengths: payload.strengths?.length ? payload.strengths : DEFAULT_ABOUT.strengths,
            languages: payload.languages?.length ? payload.languages : DEFAULT_ABOUT.languages,
            education: payload.education?.length ? payload.education : DEFAULT_ABOUT.education,
            contactInfo: {
              email: payload.contactInfo?.email || DEFAULT_ABOUT.contactInfo.email,
              phone: payload.contactInfo?.phone || DEFAULT_ABOUT.contactInfo.phone,
              whatsapp: payload.contactInfo?.whatsapp || DEFAULT_ABOUT.contactInfo.whatsapp,
              linkedin: payload.contactInfo?.linkedin || DEFAULT_ABOUT.contactInfo.linkedin,
              github: payload.contactInfo?.github || DEFAULT_ABOUT.contactInfo.github,
            },
            location:
              payload.location?.city && payload.location?.state && payload.location?.country
                ? `${payload.location.city}, ${payload.location.state}, ${payload.location.country}`
                : DEFAULT_ABOUT.location,
            titles: payload.titles && payload.titles.length ? payload.titles : DEFAULT_ABOUT.titles,
            showGithubActivity: Boolean(payload.showGithubActivity),
            profileImage: payload.profileImage ? getFileUrl(payload.profileImage) : null,
          });
        }

        if (skillsResp.status === 'fulfilled' && skillsResp.value.success) {
          const sortedSkills = [...(skillsResp.value.data || DEFAULT_SKILLS)].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          setSkills(sortedSkills);
        }

        if (projectsResp.status === 'fulfilled' && projectsResp.value.success) {
          const enriched = (projectsResp.value.data || [])
            .map((project) => ({
              ...project,
              id: project._id,
              technologies: project.technologies || [],
            }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          if (enriched.length) {
            setProjects(enriched);
          }
        }

        if (resumeResp.status === 'fulfilled' && resumeResp.value.success) {
          setResumeData(resumeResp.value.data);
        }
        if (certificationsResp.status === 'fulfilled' && certificationsResp.value.success) {
          const sortedCertifications = [...(certificationsResp.value.data || [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          setCertifications(sortedCertifications);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isInitialLoad && isMounted) setLoadingState(false);
        setAppReady(true);
      }
    };

    loadData(true);

    const refetch = () => loadData(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    window.addEventListener('focus', refetch);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

    useEffect(() => {
    trackVisit(window.location.pathname || '/');
  }, []);

  // Premium mouse-follow glow: updates CSS vars consumed by .mouse-glow
  // in global.css. Uses rAF-throttling so it never fights the browser's
  // paint cycle, keeping the effect butter-smooth even on lower-end laptops.
  useEffect(() => {
    let frame = null;
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
        document.documentElement.style.setProperty('--my', `${e.clientY}px`);
        frame = null;
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.4,
      a: Math.random() * 0.2 + 0.04,
      c: Math.random() > 0.5 ? '34,197,94' : '6,182,212',
    }));

    let animationFrame;
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fill();
      });
      particles.forEach((a, index) => {
        for (let j = index + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(34,197,94,${0.04 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animationFrame = requestAnimationFrame(draw);
    };
    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Reveal-on-scroll + stats counters now live in useScrollReveal (see
  // hooks/useScrollReveal.js) — same replay-in-both-directions behaviour,
  // but with hysteresis so fast scrolling near a section's edge doesn't
  // flicker the animation on/off.
  useScrollReveal();

  // Nav active-link highlighting now runs inside useUnifiedScroll's single
  // rAF loop above, instead of its own separate 'scroll' listener.

  const filteredSkills = useMemo(
    () => (skillFilter === 'ALL' ? skills : skills.filter((skill) => skill.category === skillFilter)),
    [skills, skillFilter]
  );

  const filteredProjects = useMemo(
    () => (projectFilter === 'ALL' ? projects : projects.filter((project) => project.category === projectFilter)),
    [projects, projectFilter]
  );

  const skillsList = useExpandableList(filteredSkills, 10);
  const projectsList = useExpandableList(filteredProjects, 9);

  const downloadResume = async (event) => {
    event.preventDefault();
    if (!resumeData?.fileUrl) {
      toast.showToast('Resume is not available yet.', 'e');
      return;
    }

    // NOTE: we intentionally do NOT use getFileUrl() + anchor.download here.
    // The old code pointed the anchor straight at the static
    // '/uploads/resumes/...' file served by express.static(), which sends
    // no Content-Disposition header. Because the backend runs on a
    // different origin than the frontend, the browser ignores the
    // `download` attribute on cross-origin links and just opens the PDF
    // in a new tab instead of saving it.
    //
    // Fix: hit a dedicated backend endpoint that responds with
    // Content-Disposition: attachment (see backend/controllers/
    // resumeController.js -> downloadPrimaryResume). That header is what
    // actually forces a "Save file" download regardless of origin.
    const downloadUrl = getResumeDownloadUrl();
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `${about.name.replace(' ', '_')}_Resume.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.showToast('Resume download started', 's');
  };

  const submitForm = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.showToast('Please complete the form before sending.', 'e');
      return;
    }
    try {
      await createMessage(formData);
      toast.showToast('Message sent successfully!', 's');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.showToast('Unable to send message. Please try again later.', 'e');
      console.error(error);
    }
  };

  const openDetails = (project) => setSelectedProject(project);
  const closeDetails = () => setSelectedProject(null);

  const heroNameParts = about.name.split(' ');
  const firstName = heroNameParts[0] || 'Pravin';
  const lastName = heroNameParts.slice(1).join(' ') || 'Mali';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Pull the GitHub username out of the profile's github URL (works with
  // or without a trailing slash, query strings, etc). Falls back safely
  // if the admin panel only has a bare "https://github.com" saved (no
  // username yet) — otherwise the stats widgets below would try to load
  // data for a fake user called "github.com".
  const extractGithubUsername = (url) => {
    if (!url) return '';
    try {
      const { pathname } = new URL(url);
      const first = pathname.split('/').filter(Boolean)[0];
      return first || '';
    } catch {
      // not a valid absolute URL — try treating it as a bare username
      const cleaned = url.replace(/^https?:\/\//, '').replace(/^github\.com\/?/, '');
      return cleaned.split('/').filter(Boolean)[0] || '';
    }
  };
  const githubUsername = extractGithubUsername(about.contactInfo.github);
  const hasGithubUsername = Boolean(githubUsername);
  // Controlled from Admin → Settings → "Portfolio Sections" toggle, so it
  // can be switched on/off live without touching code.
  const showGithubActivity = about.showGithubActivity && hasGithubUsername;

  return (
    <>
     <ScrollFX />
      <CinematicLayer />
      <div className="mouse-glow" />
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <canvas id="pts" ref={canvasRef} />
      <nav>
       <div className="nav-logo">
  <div className="pm-logo-wrap">
    <div className="pm-logo-glow" />
    <img className="pm-logo-img" src="/images/logo-pm.png" alt="PM logo" />
  </div>
  {/* <span className="logo-text">PM<span className="dot">.</span>dev</span> */}
</div>
        <ul className="nav-links">
          <li><a href="#hero">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          {showGithubActivity && <li><a href="#activity">Activity</a></li>}
      
          <li><a href="#projects">Projects</a></li>
          {certifications.length > 0 && <li><a href="#certifications">Certifications</a></li>}
          <li><a href="#resume">Resume</a></li>
        
          <li><a href="#contact">Contact</a></li>
        </ul>
      <div className="nav-utils">
  <ThemeToggle />
  <button className="ham" type="button" onClick={() => setShowMobileMenu((current) => !current)}>
    <span />
    <span />
    <span />
  </button>
</div>
</nav>
      <div className={`mob-menu ${showMobileMenu ? 'open' : ''}`}>
        <a href="#hero" onClick={() => setShowMobileMenu(false)}>Home</a>
        <a href="#about" onClick={() => setShowMobileMenu(false)}>About</a>
        <a href="#skills" onClick={() => setShowMobileMenu(false)}>Skills</a>
        {showGithubActivity && <a href="#activity" onClick={() => setShowMobileMenu(false)}>Activity</a>}
        <a href="#projects" onClick={() => setShowMobileMenu(false)}>Projects</a>
            {certifications.length > 0 && <a href="#certifications" onClick={() => setShowMobileMenu(false)}>Certifications</a>}
        <a href="#resume" onClick={() => setShowMobileMenu(false)}>Resume</a>
        <a href="#contact" onClick={() => setShowMobileMenu(false)}>Contact</a>
      </div>
      <section id="hero" className="sfx-section">
        <div className="hero-grid reveal reveal-hero">
          <div>
            <div className="badge"><span className="bdot" />Open to Opportunities</div>
            <h1 className="hero-name">
              {firstName} <span>{lastName}</span>
            </h1>
            <div className="hero-role">
              {typingText}
              <span className="ctype" />
            </div>
            <p className="hero-desc">
              Passionate <strong>{about.title}</strong> from {about.location}. Strong in <strong>React.js, Node.js, Express.js</strong> and databases like <strong>MongoDB &amp; MySQL</strong>. I build responsive, clean web apps.
            </p>
            <div className="hero-btns">
              <a href="#contact" className="btn-p btn-p-glow"><span className="btn-p-shine" /><i className="fa-solid fa-briefcase" /><span>Hire Me</span></a>
              <a href="#resume" className="btn-s" onClick={downloadResume}><i className="fa-solid fa-download" /> Resume</a>
              <a href="#projects" className="btn-s"><i className="fa-solid fa-diagram-project" /> Projects</a>
            </div>
            <div className="hero-socials">
              <a className="soc" href={about.contactInfo.linkedin} title="LinkedIn" target="_blank" rel="noreferrer"><i className="fa-brands fa-linkedin" /></a>
              <a className="soc" href={about.contactInfo.github} title="GitHub" target="_blank" rel="noreferrer"><i className="fa-brands fa-github" /></a>
         <a className="soc"
  href={`mailto:${about.contactInfo.email}`}
  title="Send Email"
  onClick={(e) => handleEmailClick(e, about.contactInfo.email)}
>
  <i className="fa-regular fa-envelope" />
</a>
              <a className="soc" href={`tel:${about.contactInfo.phone}`} title="Call Pravin" aria-label="Call"><i className="fa-solid fa-phone" /></a>
              {getWhatsAppLink(about.contactInfo.whatsapp) && (
                <a className="soc" href={getWhatsAppLink(about.contactInfo.whatsapp)} title="Chat on WhatsApp" target="_blank" rel="noreferrer"><i className="fa-brands fa-whatsapp" /></a>
              )}
            </div>
            <div className="hero-loc"><i className="fa-solid fa-location-dot" /> <span>{about.location}</span>· Remote | Hybrid | On-site</div>
          </div>
          <div className="hero-visual">
            <TechFlyIcons />
            <div
              className="p-ring"
              ref={ringRef}
              onMouseMove={handleRingMove}
              onMouseLeave={resetRingTilt}
              onTouchMove={(e) => e.touches[0] && handleRingMove(e.touches[0])}
              onTouchEnd={resetRingTilt}
            >
              <div className="p-halo" />
              <div className="p-halo p-halo2" />
              <div className="r-outer">
                <div className="r-mid" />
                <span className="orbit-icon icon1" style={{ '--oc': '#8e75f7' }} title="Gemini">
                  <img
                    src="https://cdn.simpleicons.org/googlegemini"
                    alt="Gemini"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                  />
                  <i className="fa-solid fa-star" style={{ display: 'none' }} />
                </span>
                <span className="orbit-icon icon2" style={{ '--oc': '#10a37f' }} title="ChatGPT">
                  <img
                    src="https://cdn.simpleicons.org/openai"
                    alt="ChatGPT"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                  />
                  <i className="fa-solid fa-comment-dots" style={{ display: 'none' }} />
                </span>
                <span className="orbit-icon icon3" style={{ '--oc': '#d97757' }} title="Claude">
                  <img
                    src="https://cdn.simpleicons.org/claude"
                    alt="Claude"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                  />
                  <i className="fa-solid fa-brain" style={{ display: 'none' }} />
                </span>
                <span className="orbit-icon icon4" style={{ '--oc': '#00f5ff' }} title="Cursor">
                  <img
                    src="https://cdn.simpleicons.org/cursor"
                    alt="Cursor"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                  />
                  <i className="fa-solid fa-i-cursor" style={{ display: 'none' }} />
                </span>
              </div>
<div className="p-img-glow-ring" />
          <div className="p-img">
  {about.profileImage ? (
<img id="hero-photo" src={about.profileImage} alt={about.name} style={{ display: 'block' }} fetchpriority="high" decoding="async" />
  ) : (
    <div className="p-initials" id="hero-initials">{initials}</div>
  )}
  <div className="p-img-scan" />
  <div className="p-img-sheen" />
              </div>
              <div className="p-img-status"><span className="p-img-status-dot" />Available</div>
              <div className="fc fc1"><i className="devicon-react-original colored" /> React.js</div>
              <div className="fc fc2"><i className="devicon-nodejs-plain colored" /> Node.js + Express</div>
              <div className="fc fc3"><i className="devicon-mongodb-plain colored" /> MongoDB</div>
              <div className="p-shadow" />
            </div>
          </div>
        </div>
        <div className="sc-ind">
          <div className="sc-mouse"><div className="sc-whl" /></div>
          <div className="sc-txt">SCROLL</div>
        </div>
      </section>

      <section id="about" className="sfx-section">
        <div className="wrap">
          <div className="about-grid">
            <div className="reveal reveal-heading">
              <div className="s-tag">About Me</div>
              <h2 className="s-title">Who Am <span>I?</span></h2>
              <div className="s-line" />
              <p className="about-intro">{renderFormattedText(about.summary)}</p>
           <div className="stats-g" ref={statsRef}>
  {['Projects', 'Years Exp', 'Technologies'].map((label, idx) => {
    const counts = [about.projectsCompleted, about.yearsExperience, about.technologiesLearned];
    return (
      <div
        key={label}
        className={`s-card s-card-hover${activeStat === idx ? ' active' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={activeStat === idx}
        onClick={() => toggleStat(idx)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStat(idx); } }}
      >
        <div className="s-num" data-count={counts[idx]}>0</div>
        <div className="s-lbl">{label}</div>
        {/* Desktop (real hover devices) only — shown/hidden purely by CSS :hover */}
        <div className="s-tooltip">{statTooltips[idx]}</div>
      </div>
    );
  })}
</div>
{/* Touch/mobile only — tapping a card above opens this full-width panel
    instead of a cramped per-card popup, so it never overflows or overlaps
    its neighbours on narrow screens. */}
<div className={`stats-detail${activeStat !== null ? ' open' : ''}`}>
  {activeStat !== null ? statTooltips[activeStat] : ''}
</div>
            </div>
            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.7rem' }}>
                Languages
              </div>
              <div className="lang-grid" style={{ marginBottom: '2.5rem' }}>
                {about.languages.map((lang) => (
                  <div key={lang.name} className="lang-card">
                    <div className="lang-flag">{lang.flag}</div>
                    <div className="lang-name">{lang.name}</div>
                    <div className="lang-level">{lang.level}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '.62rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.65rem' }}>
                Key Strengths
              </div>
              <div className="strengths">
                {about.strengths.map((strength) => (
                  <span key={strength} className="str-tag">{strength}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <a href="#resume" className="dl-btn" onClick={downloadResume}><i className="fa-solid fa-download" /> Download Resume</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="sfx-section">
        <div className="wrap">
          <div className="reveal reveal-heading">
            <div className="s-tag">Skills</div>
            <h2 className="s-title">Technical <span>Arsenal</span></h2>
            <div className="s-line" />
          </div>
          <div className="tabs reveal">
            {skillCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`tab ${skillFilter === category ? 'active' : ''}`}
                onClick={() => setSkillFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
    
<div className="sk-grid reveal" id="sk-grid">
            {skillsList.visibleItems.map((skill, index) => (
              <div key={skill.id || skill.name} className={`sk-card ${skillsList.getItemClassName(index)}`.trim()}>
                <div className="sk-head">
                  <div className="sk-name-row">
                    <span className="sk-icon">{skill.icon}</span>
                    <div>
                      <div className="sk-name">{skill.name}</div>
                    </div>
                  </div>
                  <div className="sk-pct">{skill.proficiency}%</div>
                </div>
                <div className="sk-bar-bg">
                  <div className="sk-bar" data-pct={skill.proficiency} style={{ width: `${skill.proficiency}%` }} />
                </div>
                <div className="sk-cat">{skill.category}</div>
              </div>
            ))}
          </div>
          {skillsList.hasMore && <ViewMoreButton expanded={skillsList.expanded} onClick={skillsList.toggle} />}
        </div>
      </section>

      {showGithubActivity && (
      <section id="activity" className="sfx-section">
        <div className="wrap">
          <div className="reveal reveal-heading">
            <div className="s-tag">Open Source</div>
            <h2 className="s-title">GitHub <span>Activity</span></h2>
            <div className="s-line" />
          </div>

          <div className="gh-grid reveal">
            <a
              className="gh-card"
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                loading="lazy"
                src={`https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&hide_border=true&bg_color=00000000&title_color=22C55E&icon_color=06B6D4&text_color=94a3b8&count_private=true`}
                alt={`${githubUsername} GitHub stats`}
                onError={(e) => { e.currentTarget.closest('.gh-card').classList.add('gh-card-broken'); }}
              />
              <span className="gh-card-fallback"><i className="fa-brands fa-github" /> View GitHub Stats</span>
            </a>
            <a
              className="gh-card"
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                loading="lazy"
                src={`https://github-readme-streak-stats.herokuapp.com/?user=${githubUsername}&hide_border=true&background=00000000&ring=22C55E&fire=06B6D4&currStreakLabel=22C55E&sideLabels=94a3b8&sideNums=e8e8e8&dates=54617a&currStreakNum=e8e8e8`}
                alt={`${githubUsername} GitHub streak stats`}
                onError={(e) => { e.currentTarget.closest('.gh-card').classList.add('gh-card-broken'); }}
              />
              <span className="gh-card-fallback"><i className="fa-solid fa-fire" /> View Streak Stats</span>
            </a>
          </div>

          <a
            className="gh-graph-card reveal"
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="gh-graph-scroll">
              <img
                loading="lazy"
                className="gh-graph-img"
                src={`https://ghchart.rshah.org/22C55E/${githubUsername}`}
                alt={`${githubUsername} GitHub contribution graph`}
                onError={(e) => { e.currentTarget.closest('.gh-graph-card').classList.add('gh-card-broken'); }}
              />
              <span className="gh-card-fallback"><i className="fa-brands fa-github" /> View Contribution Graph</span>
            </div>
            <div className="gh-graph-foot"><i className="fa-brands fa-github" /> @{githubUsername} · Live contribution calendar</div>
          </a>
        </div>
      </section>
      )}

      <section id="projects" className="sfx-section">
        <div className="wrap">
          <div className="reveal reveal-heading">
            <div className="s-tag">Projects</div>
            <h2 className="s-title">My <span>Work</span></h2>
            <div className="s-line" />
          </div>
          <div className="pf-btns reveal">
            {projectCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`pf-btn ${projectFilter === category ? 'active' : ''}`}
                onClick={() => setProjectFilter(category)}
              >
                {category === 'AI' ? (
  <>
    <span className="ai-icon">
      <i className="fa-solid fa-robot" />
    </span>
    AI Projects
  </>
) : (
  category
)}
              </button>
            ))}
          </div>
    <div className="pr-grid reveal">
  {projectsList.visibleItems.map((project, index) => (
    <ProjectCard
      key={project.id || project.title}
      project={project}
      onOpen={openDetails}
      className={projectsList.getItemClassName(index)}
    />
  ))}
</div>
          {projectsList.hasMore && <ViewMoreButton expanded={projectsList.expanded} onClick={projectsList.toggle} />}
          <div style={{ marginTop: '2rem', textAlign: 'center' }} className="reveal visible">
            <a href={about.contactInfo.github} target="_blank" rel="noreferrer" className="btn-s" style={{ display: 'inline-flex' }}>
              <i className="fa-brands fa-github" /> More on GitHub <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </div>
      </section>


 {certifications.length > 0 && (
      <section id="certifications" className="sfx-section">
        <div className="wrap">
          <div className="reveal reveal-heading">
            <div className="s-tag">Achievements</div>
            <h2 className="s-title">My <span>Certifications</span></h2>
            <div className="s-line" />
            <p className="cert-subtitle">Professional certifications that validate my skills and knowledge</p>
          </div>

          <div className="cert-carousel-outer reveal">
            {certifications.length > 1 && (
              <button
                type="button"
                className="cert-arrow cert-arrow-left"
                onClick={() => nudgeCert(-1)}
                aria-label="Previous certification"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
            )}

            <div
              className="cert-marquee"
              onMouseEnter={pauseCertMarquee}
              onMouseLeave={resumeCertMarquee}
              onFocus={pauseCertMarquee}
              onBlur={resumeCertMarquee}
              onTouchStart={pauseCertMarquee}
              onTouchEnd={resumeCertMarquee}
            >
              <div className={`cert-track${certInstant ? ' cert-track--instant' : ''}`} ref={certTrackRef}>
                {certMarqueeItems.map((cert, index) => {
                  const isCanonical = certCount < 3
                    || (index >= certCount && index < certCount * 2);
                  return (
                  <div
                    className="cert-card"
                    key={`${cert._id}-${index}`}
                    aria-hidden={!isCanonical}
                    role="button"
                    tabIndex={isCanonical ? 0 : -1}
                    onClick={() => setSelectedCertificate(cert)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCertificate(cert); } }}
                  >
                    <div className="cert-img-wrap">
                      {cert.image ? (
                        <img src={getFileUrl(cert.image)} alt={cert.title} loading="lazy" />
                      ) : (
                        <div className="cert-img-fallback"><i className="fa-solid fa-certificate" /></div>
                      )}
                      <div className="cert-img-shine" />
                    </div>
                    <div className="cert-body">
                      <span className="cert-cat" data-cat={(cert.category || 'general').toLowerCase()}>{cert.category || 'General'}</span>
                      <div className="cert-title">{cert.title}</div>
                      <div className="cert-issuer">{cert.issuer}</div>
                      {cert.issueDate && (
                        <div className="cert-date">
                          <i className="fa-regular fa-calendar" />
                          {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      )}
                      {cert.description && <p className="cert-desc">{renderFormattedText(cert.description)}</p>}
                      {(cert.image || cert.credentialUrl) && (
                        <button
                          type="button"
                          className="cert-link cert-link-btn"
                          tabIndex={-1}
                          onClick={(e) => { e.stopPropagation(); setSelectedCertificate(cert); }}
                        >
                          View Credential <i className="fa-solid fa-arrow-up-right-from-square" />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {certifications.length > 1 && (
              <button
                type="button"
                className="cert-arrow cert-arrow-right"
                onClick={() => nudgeCert(1)}
                aria-label="Next certification"
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            )}
          </div>

          {certifications.length > 1 && (
            <div className="cert-dots">
              {certifications.map((cert, index) => (
                <button
                  key={cert._id}
                  type="button"
                  className={`cert-dot ${index === certActiveIndex ? 'active' : ''}`}
                  onClick={() => scrollCertToIndex(index)}
                  aria-label={`Go to certification ${index + 1}: ${cert.title}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      <section id="resume" className="sfx-section">
        <div className="wrap">
          <div className="reveal reveal-heading">
            <div className="s-tag">Resume</div>
            <h2 className="s-title">Education &amp; <span>Skills</span></h2>
            <div className="s-line" />
          </div>
          <div className="exp-grid reveal">
            <div>
              <div className="exp-h"><span><i className="fa-solid fa-graduation-cap" /></span> Education</div>
              {about.education.map((edu, idx) => (
                <div className="exp-item" key={`${edu.title}-${idx}`}>
                  <div className={`exp-per ${idx % 2 === 0 ? 'c' : 'm'}`}>{edu.period}</div>
                  <div className="exp-t">{edu.title}</div>
                  <div className="exp-co">{edu.institution}</div>
                  {edu.description && <div className="exp-desc">{renderFormattedText(edu.description)}</div>}
                </div>
              ))}
              <div style={{ marginTop: '1.3rem' }}>
                <a href="#" className="btn-p" onClick={downloadResume} style={{ display: 'inline-flex', textDecoration: 'none', fontSize: '.75rem' }}><i className="fa-solid fa-download" /> Download CV</a>
              </div>
            </div>
            <div>
              <div className="exp-h"><span><i className="fa-solid fa-laptop-code" /></span> Technical Skills</div>
              <div className="exp-item"><div className="exp-per">Frontend</div><div className="exp-t">React.js, JavaScript ES6+</div><div className="exp-co">HTML5 · CSS3 · Bootstrap · Tailwind CSS · Material UI</div></div>
              <div className="exp-item"><div className="exp-per">Backend</div><div className="exp-t">Node.js, Express.js, REST API</div><div className="exp-co">JWT Authentication · MVC Architecture</div></div>
              <div className="exp-item"><div className="exp-per c">Database</div><div className="exp-t">MongoDB &amp; MySQL</div><div className="exp-co">Mongoose · CRUD Operations · Basic Queries &amp; Joins</div></div>
              <div className="exp-item"><div className="exp-per" style={{ color: 'var(--purple)' }}>Tools</div><div className="exp-t">Git, GitHub, VS Code, Postman</div><div className="exp-co">AI Tools · Formik · Context API · C · C++</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="sfx-section">
        <div className="wrap">
          <div className="reveal reveal-heading" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="s-tag" style={{ justifyContent: 'center' }}>Contact</div>
            <h2 className="s-title">Get In <span>Touch</span></h2>
            <div className="s-line" style={{ margin: '.8rem auto 0' }} />
          </div>
          <div className="ct-grid reveal">
            <div className="ct-info">
              <div className="ct-card">
                <div className="ct-icon"><i className="fa-regular fa-envelope" /></div>
                <div>
                  <div className="ct-lbl">Email</div>
          <div className="ct-val">
  <a
    href={`mailto:${about.contactInfo.email}`}
    onClick={(e) => handleEmailClick(e, about.contactInfo.email)}
  >
    {about.contactInfo.email}
  </a>
</div>
                </div>
              </div>
              <div className="ct-card">
                <div className="ct-icon"><i className="fa-solid fa-phone" /></div>
                <div>
                  <div className="ct-lbl">Phone</div>
                  <div className="ct-val"><a href={`tel:${about.contactInfo.phone}`} target="_blank" rel="noreferrer">{about.contactInfo.phone}</a></div>
                </div>
              </div>
              {getWhatsAppLink(about.contactInfo.whatsapp) && (
                <a className="ct-card" href={getWhatsAppLink(about.contactInfo.whatsapp)} target="_blank" rel="noreferrer">
                  <div className="ct-icon"><i className="fa-brands fa-whatsapp" /></div>
                  <div>
                    <div className="ct-lbl">WhatsApp</div>
                    <div className="ct-val" style={{ color: 'var(--cyan)' }}>{about.contactInfo.whatsapp}</div>
                  </div>
                </a>
              )}
              <a className="ct-card" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(about.location)}`} target="_blank" rel="noreferrer">
                <div className="ct-icon"><i className="fa-solid fa-location-dot" /></div>
                <div>
                  <div className="ct-lbl">Location</div>
                  <div className="ct-val" style={{ color: 'var(--cyan)' }}>{about.location}</div>
                </div>
              </a>
              <div className="ct-card">
                <div className="ct-icon"><i className="fa-brands fa-linkedin" /></div>
                <div>
                  <div className="ct-lbl">LinkedIn</div>
                  <div className="ct-val"><a href={about.contactInfo.linkedin} target="_blank" rel="noreferrer">{about.contactInfo.linkedin.replace('https://', '')}</a></div>
                </div>
              </div>
              <div className="ct-card">
                <div className="ct-icon"><i className="fa-brands fa-github" /></div>
                <div>
                  <div className="ct-lbl">GitHub</div>
                  <div className="ct-val"><a href={about.contactInfo.github} target="_blank" rel="noreferrer">{about.contactInfo.github.replace('https://', '')}</a></div>
                </div>
              </div>
              <div className="ct-card">
                <div className="ct-icon"><i className="fa-solid fa-circle-check" /></div>
                <div>
                  <div className="ct-lbl">Status</div>
                  <div className="ct-val" style={{ color: 'var(--neon)' }}>✓ Open to opportunities</div>
                </div>
              </div>
            </div>
            <div className="ct-form">
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem' }}>Send a Message</h3>
              <div className="f-row">
                <div className="f-grp">
                  <label className="f-lbl">Name</label>
                  <input className="f-inp" type="text" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div className="f-grp">
                  <label className="f-lbl">Email</label>
                  <input className="f-inp" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="your@email.com" />
                </div>
              </div>
              <div className="f-row">
                <div className="f-grp">
                  <label className="f-lbl">Mobile Number</label>
                  <input className="f-inp" type="tel" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+91 00000 00000" />
                </div>
                <div className="f-grp">
                  <label className="f-lbl">Subject</label>
                  <input className="f-inp" type="text" value={formData.subject} onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Project / Job inquiry" />
                </div>
              </div>
              <div className="f-grp">
                <label className="f-lbl">Message</label>
                <textarea className="f-inp" rows="5" value={formData.message} onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))} placeholder="Tell me about the opportunity..." />
              </div>
              <button className="sub-btn" type="button" onClick={submitForm}><i className="fa-solid fa-paper-plane" /> Send Message</button>
            </div>
            
          </div>
          <button
  type="button"
  className={`top-btn ${showTopBtn ? 'show' : ''}`}
  onClick={scrollToTop}
  aria-label="Scroll to top"
  title="Back to top"
>
  <i className="fa-solid fa-arrow-up" />
</button>
        </div>
      </section>

      <footer>
     <p>Built by <span>{about.name}</span> · {about.title} · {about.location}</p>
      </footer>

     <Suspense fallback={null}>
        {selectedProject && <ProjectDetailsModal project={selectedProject} onClose={closeDetails} />}
        {selectedCertificate && <CertificateModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />}
      </Suspense>
    </>
  );
};

export default PortfolioPage;