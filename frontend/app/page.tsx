"use client";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { useState } from "react";

/* ── Types ── */
interface Career {
  course: string;
  duration: string;
  exam: string;
  course_fee: string;
  jobs: string;
  salary: string;
  is_custom?: boolean;
}

/* ── Helpers ── */
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email address.";
}

const STREAMS = [
  { key: "Science",    label: "Science & Technology", icon: "🔬", accent: "#6366f1", lightBg: "#eef2ff", border: "#c7d2fe", textColor: "#4338ca" },
  { key: "Commerce",   label: "Commerce & Business",  icon: "📊", accent: "#0891b2", lightBg: "#ecfeff", border: "#a5f3fc", textColor: "#0e7490" },
  { key: "Arts",       label: "Arts & Humanities",    icon: "🎨", accent: "#7c3aed", lightBg: "#f5f3ff", border: "#ddd6fe", textColor: "#6d28d9" },
  { key: "Vocational", label: "Vocational & Skills",  icon: "🔧", accent: "#d97706", lightBg: "#fffbeb", border: "#fde68a", textColor: "#b45309" },
  { key: "Government", label: "Government & Defence", icon: "🏛️", accent: "#059669", lightBg: "#ecfdf5", border: "#6ee7b7", textColor: "#047857" },
  { key: "Creative",   label: "Creative & Media",     icon: "🎬", accent: "#db2777", lightBg: "#fdf2f8", border: "#f9a8d4", textColor: "#be185d" },
];

/* ── getSM: find stream metadata by key (FIXED) ── */
function getSM(stream: string) {
  return STREAMS.find(s => s.key.toLowerCase() === stream.toLowerCase()) ?? STREAMS[0];
}

/* ── Styles ── */
function FontStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Inter', sans-serif; }
      .font-display { font-family: 'Syne', sans-serif; }
      .dot-bg { background: #f8fafc; background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px); background-size: 22px 22px; }
      .k-input { outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
      .k-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
      .career-card { transition: transform 0.18s, box-shadow 0.18s; }
      .career-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.10) !important; }
      .stream-pill { transition: all 0.16s; cursor: pointer; }
      .stream-pill:hover { transform: translateY(-1px); }
      .fade-up { animation: fadeUp 0.5s ease both; }
      .delay-1 { animation-delay: 0.1s; }
      .delay-2 { animation-delay: 0.2s; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .kspin { display: inline-block; animation: spin 0.8s linear infinite; }

      /* ── Responsive overrides ── */
      @media (max-width: 768px) {
        .auth-layout { flex-direction: column !important; }
        .auth-left { width: 100% !important; min-height: auto !important; padding: 32px 24px !important; }
        .auth-right { padding: 32px 20px !important; }
        .auth-logo { height: 72px !important; }
        .auth-heading { font-size: 26px !important; }
        .hero-pad { padding: 28px 20px !important; }
        .hero-h1 { font-size: 26px !important; }
        .form-pad { padding: 20px 16px !important; }
        .form-header-pad { padding: 16px 16px !important; }
        .nav-inner { padding: 0 14px !important; height: 68px !important; }
        .nav-logo { height: 52px !important; }
        .nav-badge { display: none !important; }
        .nav-user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .draft-header { flex-direction: column !important; align-items: flex-start !important; }
        .draft-btns { width: 100%; display: flex; flex-wrap: wrap; gap: 8px; }
        .draft-btns button { flex: 1 1 140px; }
        .results-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
        .results-actions { width: 100%; display: flex; flex-wrap: wrap; gap: 8px; }
        .results-actions input { width: 100% !important; }
        .results-grid { grid-template-columns: 1fr !important; }
        .card-grid { grid-template-columns: 1fr !important; }
        .stream-pills-wrap { gap: 6px !important; }
        .stream-pill { padding: 7px 12px !important; font-size: 12px !important; }
        .custom-career-grid { grid-template-columns: 1fr !important; }
        .form-actions { flex-direction: column !important; }
        .form-actions button { width: 100% !important; justify-content: center; }
        .student-info-grid { grid-template-columns: 1fr !important; }
      }

      @media (max-width: 480px) {
        .hero-h1 { font-size: 22px !important; }
        .auth-heading { font-size: 22px !important; }
        .section-title { font-size: 16px !important; }
        .career-card-title { font-size: 15px !important; }
      }
    `}</style>
  );
}

/* ── PDF Generator ── */
async function generatePDF(student: any, stream: string, drafted: any[], user: any) {
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  let y = 0;

  doc.setFillColor(30, 27, 75);
  doc.rect(0, 0, W, 44, "F");

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); img.src = "/logo.png"; });
    if (img.complete && img.naturalWidth > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const logoH = 24; const logoW = (img.naturalWidth / img.naturalHeight) * logoH;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 2, 9, logoW + 8, logoH + 4, 4, 4, "F");
      doc.addImage(dataUrl, "PNG", margin + 2, 11, logoW, logoH);
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255, 255, 255);
      doc.text("Knowletive", margin + logoW + 14, 22);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(199, 210, 254);
      doc.text("Training Minds, Placing Talents", margin + logoW + 14, 29);
      doc.text("AI Career Guidance Platform", margin + logoW + 14, 35);
    }
  } catch (_) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text("Knowletive", margin, 22);
  }

  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(199, 210, 254);
  doc.text("CAREER ROADMAP REPORT", W - margin, 19, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(167, 179, 230);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, W - margin, 26, { align: "right" });

  y = 54;

  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y, W - margin * 2, 54, 4, 4, "F");
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, y, W - margin * 2, 54, 4, 4, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(67, 56, 202);
  doc.text("STUDENT INFORMATION", margin + 6, y + 9);
  doc.setDrawColor(199, 210, 254); doc.line(margin + 4, y + 12, W - margin - 4, y + 12);

  const fields = [
    ["Student Name", student.name || "—"], ["Mobile", student.mobile || "—"],
    ["State", student.state || "—"], ["Stream / Field", stream || "—"],
    ["Prepared By", user?.name || "—"],
  ];
  const colW = (W - margin * 2 - 12) / 2;
  fields.forEach((f, i) => {
    const col = i % 2; const row = Math.floor(i / 2);
    const fx = margin + 6 + col * (colW + 6); const fy = y + 20 + row * 14;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(120, 120, 140);
    doc.text(f[0].toUpperCase(), fx, fy);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(17, 24, 39);
    doc.text(f[1], fx, fy + 5.5);
  });
  y += 64;

  const normalCareers = drafted.filter((c: any) => !c.is_custom);
  const customCareers = drafted.filter((c: any) => c.is_custom);

  if (normalCareers.length > 0) {
    doc.setFillColor(67, 56, 202);
    doc.roundedRect(margin, y, W - margin * 2, 11, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    doc.text(`SAVED CAREER OPTIONS  (${normalCareers.length} selected)`, margin + 5, y + 7.5);
    y += 16;

    const isGov = stream.toLowerCase() === "government";
    normalCareers.forEach((career: any, idx: number) => {
      if (y > 252) { doc.addPage(); y = 18; }
      const detailRows = [
        [isGov ? "Training Period" : "Duration", career.duration],
        [isGov ? "Exam / Recruitment" : "Entrance Exam", career.exam],
        [isGov ? "Exam Fee" : "Course Fee", career.course_fee],
        [isGov ? "Sector" : "Job Roles", career.jobs],
        [isGov ? "Age Limit" : "Salary", career.salary],
      ].filter(r => r[1] && r[1] !== "nan" && r[1] !== "NaN" && r[1].trim() !== "");

      const rowsPerCol = Math.ceil(detailRows.length / 2);
      const cardH = 16 + rowsPerCol * 11;
      doc.setFillColor(250, 251, 255); doc.setDrawColor(220, 225, 245);
      doc.roundedRect(margin, y, W - margin * 2, cardH, 3, 3, "FD");
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(margin, y, 3.5, cardH, 1.5, 1.5, "F");
      doc.setFillColor(238, 242, 255);
      doc.circle(margin + 11, y + 8.5, 5.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(67, 56, 202);
      doc.text(String(idx + 1), margin + 11, y + 10.5, { align: "center" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(17, 24, 39);
      doc.text(doc.splitTextToSize(career.course, W - margin * 2 - 32)[0], margin + 20, y + 9.5);

      detailRows.forEach((row, ri) => {
        const col = ri % 2; const rrow = Math.floor(ri / 2);
        const halfW = (W - margin * 2 - 14) / 2;
        const rx = margin + 6 + col * (halfW + 2); const ry = y + 16 + rrow * 11;
        doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(130, 130, 150);
        doc.text(row[0].toUpperCase(), rx, ry);
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(55, 65, 81);
        doc.text(doc.splitTextToSize(row[1], halfW - 4)[0], rx, ry + 5.5);
      });
      y += cardH + 5;
    });
  }

  if (customCareers.length > 0) {
    if (y > 252) { doc.addPage(); y = 18; }
    doc.setFillColor(244, 63, 94);
    doc.roundedRect(margin, y, W - margin * 2, 11, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    doc.text(`CUSTOM CAREER OPTIONS  (${customCareers.length} added manually)`, margin + 5, y + 7.5);
    y += 16;

    customCareers.forEach((career: any, idx: number) => {
      if (y > 252) { doc.addPage(); y = 18; }
      const detailRows = [
        ["Duration", career.duration], ["Entrance Exam", career.exam],
        ["Course Fee", career.course_fee], ["Job Roles", career.jobs], ["Salary", career.salary],
      ].filter(r => r[1] && r[1].trim() !== "");

      const rowsPerCol = Math.max(1, Math.ceil(detailRows.length / 2));
      const cardH = 16 + rowsPerCol * 11;
      doc.setFillColor(255, 241, 245); doc.setDrawColor(253, 164, 175);
      doc.roundedRect(margin, y, W - margin * 2, cardH, 3, 3, "FD");
      doc.setFillColor(244, 63, 94);
      doc.roundedRect(margin, y, 3.5, cardH, 1.5, 1.5, "F");
      doc.setFillColor(255, 228, 235);
      doc.circle(margin + 11, y + 8.5, 5.5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(190, 18, 60);
      doc.text(String(idx + 1), margin + 11, y + 10.5, { align: "center" });
      doc.setFillColor(244, 63, 94);
      doc.roundedRect(W - margin - 28, y + 4, 26, 7, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(255, 255, 255);
      doc.text("✏ CUSTOM", W - margin - 15, y + 8.8, { align: "center" });
      doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(17, 24, 39);
      doc.text(doc.splitTextToSize(career.course, W - margin * 2 - 50)[0], margin + 20, y + 9.5);

      if (detailRows.length > 0) {
        detailRows.forEach((row, ri) => {
          const col = ri % 2; const rrow = Math.floor(ri / 2);
          const halfW = (W - margin * 2 - 14) / 2;
          const rx = margin + 6 + col * (halfW + 2); const ry = y + 16 + rrow * 11;
          doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(130, 130, 150);
          doc.text(row[0].toUpperCase(), rx, ry);
          doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(55, 65, 81);
          doc.text(doc.splitTextToSize(row[1], halfW - 4)[0], rx, ry + 5.5);
        });
      } else {
        doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(160, 160, 170);
        doc.text("No additional details provided", margin + 6, y + 20);
      }
      y += cardH + 5;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 250, 252); doc.rect(0, 284, W, 13, "F");
    doc.setDrawColor(226, 232, 240); doc.line(0, 284, W, 284);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(150, 150, 165);
    doc.text("Knowletive — Training Minds, Placing Talents  |  AI Career Guidance Platform", margin, 291);
    doc.text(`Page ${p} of ${pageCount}`, W - margin, 291, { align: "right" });
  }

  doc.save(`Knowletive_${student.name || "Student"}_CareerReport.pdf`);
}

/* ══════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════ */
export default function Home() {
  const [user, setUser]                     = useState<any>(null);
  const [isReg, setIsReg]                   = useState(false);
  const [loginForm, setLoginForm]           = useState({ email: "", password: "" });
  const [regForm, setRegForm]               = useState({ name: "", email: "", password: "" });
  const [student, setStudent]               = useState({ name: "", stream: "Science", mobile: "", state: "" });
  const [result, setResult]                 = useState<Career[]>([]);
  const [search, setSearch]                 = useState("");
  const [loading, setLoading]               = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [activeStream, setActiveStream]     = useState("Science");
  const [drafted, setDrafted]               = useState<any[]>([]);
  const [pdfLoading, setPdfLoading]         = useState(false);
  const [draftSaved, setDraftSaved]         = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCareer, setCustomCareer]     = useState({ course: "", duration: "", exam: "", course_fee: "", jobs: "", salary: "" });
  const [customAdded, setCustomAdded]       = useState(false);
  const [loginEmailError, setLoginEmailError] = useState("");
  const [regEmailError, setRegEmailError]     = useState("");

  /* ── Auth ── */
  const handleLogin = async () => {
    const err = validateEmail(loginForm.email);
    if (err) { setLoginEmailError(err); return; }
    setLoginEmailError("");
    try {
      const r = await fetch(`${API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginForm) });
      const d = await r.json();
      if (d.status === "success") setUser(d.user); else alert("Invalid Email or Password");
    } catch { alert("Backend not connected"); }
  };

  const handleRegister = async () => {
    const err = validateEmail(regForm.email);
    if (err) { setRegEmailError(err); return; }
    setRegEmailError("");
    try {
      const r = await fetch(`${API}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(regForm) });
      const d = await r.json();
      alert(d.message);
      if (d.status === "success") setIsReg(false);
    } catch { alert("Register Error"); }
  };

  /* ── Student ── */
  const saveStudent = async () => {
    try {
      await fetch(`${API}/student`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...student, user_id: user.id }) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { alert("Error Saving Student"); }
  };

  const getRoadmap = async () => {
    if (!student.name.trim()) { alert("Please enter student name!"); return; }
    if (!student.mobile.trim()) { alert("Please enter mobile number!"); return; }
    if (!student.state.trim()) { alert("Please enter state!"); return; }
    setLoading(true); setResult([]); setSearch(""); setDrafted([]);
    try {
      const r = await fetch(`${API}/roadmap`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stream: student.stream.toLowerCase() }) });
      const d = await r.json();
      setResult(d.data ?? []);
      setActiveStream(student.stream);
    } catch { alert("Error Generating Career Roadmap"); }
    setLoading(false);
  };

  /* ── Draft ── */
  const toggleDraft = (career: any) => {
    setDrafted(prev => {
      const exists = prev.find(c => c.course === career.course);
      return exists ? prev.filter(c => c.course !== career.course) : [...prev, career];
    });
  };
  const isDrafted = (career: any) => drafted.some(c => c.course === career.course);

  const addCustomCareer = () => {
    if (!customCareer.course.trim()) { alert("Please enter at least the career name."); return; }
    setDrafted(prev => [...prev, { ...customCareer, is_custom: true }]);
    setCustomCareer({ course: "", duration: "", exam: "", course_fee: "", jobs: "", salary: "" });
    setShowCustomForm(false);
    setCustomAdded(true);
    setTimeout(() => setCustomAdded(false), 3000);
  };

  /* ── FIXED: backtick template literal ── */
  const saveDraftToDB = async () => {
    if (drafted.length === 0) { alert("No careers in draft to save."); return; }
    try {
      await fetch(`${API}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...student,
          user_id: user.id,
          drafted_careers: JSON.stringify(drafted.filter((c: any) => !c.is_custom).map(c => c.course)),
          custom_careers: JSON.stringify(drafted.filter((c: any) => c.is_custom)),
        }),
      });
      setDraftSaved(true); setTimeout(() => setDraftSaved(false), 3000);
    } catch { alert("Error saving draft to DB"); }
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try { await generatePDF(student, activeStream, drafted, user); }
    catch { alert("PDF generation failed."); }
    setPdfLoading(false);
  };

  const filtered = result.filter(i =>
    i.course.toLowerCase().includes(search.toLowerCase()) ||
    i.jobs.toLowerCase().includes(search.toLowerCase())
  );

  /* ════════════════════════════════
     AUTH SCREEN
  ════════════════════════════════ */
  if (!user) return (
    <>
      <FontStyle />
      <div className="dot-bg" style={{ minHeight: "100vh", display: "flex" }}>
        {/* Left panel */}
        <div className="auth-left" style={{ width: "44%", minHeight: "100vh", background: "linear-gradient(155deg, #1e1b4b 0%, #312e81 42%, #4338ca 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 56px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -90, right: -90, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "absolute", top: "38%", left: "25%", width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.12)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <div style={{ position: "relative" }}>
            <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 22, padding: "18px 26px", display: "inline-block", marginBottom: 32, boxShadow: "0 12px 40px rgba(0,0,0,0.28)" }}>
              <img className="auth-logo" src="/logo.png" alt="Knowletive" style={{ height: 120, width: "auto", objectFit: "contain", display: "block" }} />
            </div>
            <p style={{ color: "rgba(199,210,254,0.65)", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>AI Career Guidance</p>
            <h1 className="font-display auth-heading" style={{ color: "#fff", fontSize: 42, lineHeight: 1.18, marginBottom: 20 }}>Shape Your<br />Career Future</h1>
            <p style={{ color: "rgba(199,210,254,0.65)", fontSize: 15, lineHeight: 1.75, maxWidth: 340 }}>Explore hundreds of career paths across Science, Commerce, Arts, Vocational, Government &amp; Creative fields — all verified and up-to-date.</p>
          </div>
          <div style={{ position: "relative" }}>
            <p style={{ color: "rgba(199,210,254,0.45)", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>6 Career Streams</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STREAMS.map(s => (
                <span key={s.key} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(224,231,255,0.82)", padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {s.icon} {s.key}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
          <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
            <h1 className="font-display auth-heading" style={{ fontSize: 34, fontWeight: 900, color: "#111827", marginBottom: 6 }}>{isReg ? "Create account" : "Welcome back"}</h1>
            <p style={{ color: "#6b7280", fontSize: 14, fontWeight: 400, marginBottom: 36, lineHeight: 1.6 }}>{isReg ? "Join Knowletive and start exploring your ideal career." : "Sign in to continue to your career dashboard."}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {isReg && <KField label="Full Name" placeholder="Your full name" onChange={v => setRegForm({ ...regForm, name: v })} />}
              <KField label="Email Address" placeholder="you@email.com" type="email"
                onChange={v => {
                  if (isReg) { setRegForm({ ...regForm, email: v }); setRegEmailError(""); }
                  else { setLoginForm({ ...loginForm, email: v }); setLoginEmailError(""); }
                }} />
              {isReg && regEmailError && <p style={{ color: "#dc2626", fontSize: 12, fontWeight: 600, marginTop: -10 }}>⚠ {regEmailError}</p>}
              {!isReg && loginEmailError && <p style={{ color: "#dc2626", fontSize: 12, fontWeight: 600, marginTop: -10 }}>⚠ {loginEmailError}</p>}
              <KField label="Password" placeholder="••••••••" type="password" onChange={v => isReg ? setRegForm({ ...regForm, password: v }) : setLoginForm({ ...loginForm, password: v })} />
            </div>
            <button onClick={isReg ? handleRegister : handleLogin}
              style={{ width: "100%", marginTop: 28, padding: "15px 0", borderRadius: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 10px 28px rgba(79,70,229,0.3)" }}>
              {isReg ? "Create Account →" : "Sign In →"}
            </button>
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>{isReg ? "Already have an account? " : "New here? "}</span>
              <span onClick={() => setIsReg(!isReg)} style={{ fontSize: 13, color: "#4f46e5", fontWeight: 700, cursor: "pointer" }}>{isReg ? "Sign in" : "Create a free account"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /* ── sm is now safely defined after auth check ── */
  const sm = getSM(activeStream);

  /* ════════════════════════════════
     MAIN APP
  ════════════════════════════════ */
  return (
    <>
      <FontStyle />
      <div className="dot-bg" style={{ minHeight: "100vh" }}>

        {/* NAVBAR */}
        <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(18px)", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 24px rgba(0,0,0,0.06)" }}>
          <div className="nav-inner" style={{ maxWidth: 1300, margin: "0 auto", padding: "0 28px", height: 90, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img className="nav-logo" src="/logo.png" alt="Knowletive" style={{ height: 72, width: "auto", objectFit: "contain", display: "block" }} />
              <span className="nav-badge" style={{ background: "#eef2ff", color: "#4f46e5", fontSize: 13, fontWeight: 800, padding: "6px 16px", borderRadius: 99, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Powered</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Logged in as</p>
                <p className="nav-user-name" style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{user.name}</p>
              </div>
              <button onClick={() => { setUser(null); setResult([]); setDrafted([]); }}
                style={{ padding: "8px 16px", borderRadius: 10, background: "#fff1f2", border: "1px solid #fecdd3", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 16px 64px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* HERO */}
          <div className="fade-up" style={{ borderRadius: 24, padding: "48px 56px", position: "relative", overflow: "hidden", background: "linear-gradient(140deg, #1e1b4b 0%, #312e81 42%, #4338ca 100%)", boxShadow: "0 20px 60px rgba(67,56,202,0.22)" }}>
            <div className="hero-pad" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div style={{ position: "absolute", top: -70, right: -70, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
            <div style={{ position: "absolute", bottom: -50, right: 160, width: 220, height: 220, borderRadius: "50%", background: "rgba(99,102,241,0.18)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ color: "rgba(199,210,254,0.7)", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>🎯 Career Guidance System</p>
              <h1 className="font-display hero-h1" style={{ color: "#fff", fontSize: 40, lineHeight: 1.2, marginBottom: 14 }}>Discover Your Perfect<br />Career Path</h1>
              <p style={{ color: "rgba(199,210,254,0.68)", fontSize: 15, maxWidth: 580, lineHeight: 1.75 }}>Enter student details, select a stream, and instantly explore hundreds of verified career options with entrance exams, fees, and salary insights.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
                {STREAMS.map(s => (
                  <span key={s.key} style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(224,231,255,0.88)", padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{s.icon} {s.key}</span>
                ))}
              </div>
            </div>
          </div>

          {/* FORM CARD */}
          <div className="fade-up delay-1" style={{ background: "#ffffff", borderRadius: 24, border: "1px solid #f0f4f8", boxShadow: "0 4px 36px rgba(0,0,0,0.055)", overflow: "hidden" }}>
            <div className="form-header-pad" style={{ padding: "22px 36px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📋</div>
              <div>
                <h2 className="font-display section-title" style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Student Details</h2>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Fill in to generate a personalised career roadmap</p>
              </div>
            </div>
            <div className="form-pad" style={{ padding: "32px 36px" }}>
              <div className="student-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20, marginBottom: 28 }}>
                <KField label="Student Name *" placeholder="Full name" onChange={v => setStudent({ ...student, name: v })} />
                <KField label="Mobile Number *" placeholder="+91 00000 00000" onChange={v => setStudent({ ...student, mobile: v })} />
                <KField label="State" placeholder="e.g. Maharashtra" onChange={v => setStudent({ ...student, state: v })} />
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Stream / Field</label>
                  <div style={{ position: "relative" }}>
                    <select value={student.stream} onChange={e => setStudent({ ...student, stream: e.target.value })} className="k-input"
                      style={{ width: "100%", padding: "12px 40px 12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fafafa", fontSize: 14, fontWeight: 600, color: "#111827", cursor: "pointer" }}>
                      {STREAMS.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af", fontSize: 12 }}>▼</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Quick Select Stream</p>
                <div className="stream-pills-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {STREAMS.map(s => {
                    const active = student.stream === s.key;
                    return (
                      <button key={s.key} className="stream-pill" onClick={() => setStudent({ ...student, stream: s.key })}
                        style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "1.5px solid",
                          ...(active ? { background: s.lightBg, borderColor: s.border, color: s.textColor, boxShadow: `0 4px 16px ${s.accent}20` } : { background: "#fafafa", borderColor: "#e5e7eb", color: "#6b7280" }) }}>
                        <span style={{ fontSize: 16 }}>{s.icon}</span>{s.key}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button onClick={saveStudent}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "1.5px solid",
                    ...(saved ? { background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" } : { background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }) }}>
                  {saved ? "✅ Saved!" : "💾 Save Student"}
                </button>
                <button onClick={getRoadmap} disabled={loading}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 30px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", boxShadow: "0 8px 26px rgba(79,70,229,0.28)", opacity: loading ? 0.75 : 1 }}>
                  {loading ? <><span className="kspin">⟳</span>&nbsp;Generating...</> : <><span>🚀</span>Generate Career Roadmap</>}
                </button>
              </div>
            </div>
          </div>

          {/* CUSTOM CAREER */}
          <div className="fade-up delay-1" style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #fda4af", boxShadow: "0 4px 36px rgba(244,63,94,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "#fff1f5", border: "1px solid #fda4af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✏️</div>
                <div>
                  <h2 className="font-display section-title" style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Can't Find Your Career?</h2>
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>Add it manually — it will be saved to draft and database</p>
                </div>
              </div>
              <button onClick={() => setShowCustomForm(!showCustomForm)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1.5px solid #fda4af", background: "#fff1f5", color: "#be123c", whiteSpace: "nowrap" }}>
                {showCustomForm ? "✕ Close" : "✏️ Add Custom"}
              </button>
            </div>

            {showCustomForm && (
              <div style={{ padding: "0 20px 24px", borderTop: "1px solid #fff1f5" }}>
                <div style={{ background: "#fff8fa", borderRadius: 16, padding: "20px", border: "1px solid #fda4af", marginTop: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#be123c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>✏️ Fill Custom Career Details</p>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Career / Course Name *</label>
                    <input value={customCareer.course} onChange={e => setCustomCareer({ ...customCareer, course: e.target.value })}
                      placeholder="e.g. Drone Pilot, AI Researcher, Content Creator..." className="k-input"
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #fda4af", background: "#fff", fontSize: 14, fontWeight: 500, color: "#111827" }} />
                  </div>
                  <div className="custom-career-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
                    {[
                      { key: "duration", label: "Duration (Optional)", placeholder: "e.g. 2 years, 6 months" },
                      { key: "exam", label: "Entrance Exam (Optional)", placeholder: "e.g. JEE, NEET or None" },
                      { key: "course_fee", label: "Course Fee (Optional)", placeholder: "e.g. ₹50,000/year" },
                      { key: "jobs", label: "Job Roles (Optional)", placeholder: "e.g. Pilot, Researcher" },
                      { key: "salary", label: "Salary Range (Optional)", placeholder: "e.g. ₹5-10 LPA" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{f.label}</label>
                        <input value={(customCareer as any)[f.key]} onChange={e => setCustomCareer({ ...customCareer, [f.key]: e.target.value })}
                          placeholder={f.placeholder} className="k-input"
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 500, color: "#111827" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={addCustomCareer}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#f43f5e,#be123c)", color: "#fff", border: "none", boxShadow: "0 6px 20px rgba(244,63,94,0.28)" }}>
                      ✅ Add to Draft
                    </button>
                    <button onClick={() => { setCustomCareer({ course: "", duration: "", exam: "", course_fee: "", jobs: "", salary: "" }); setShowCustomForm(false); }}
                      style={{ padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#6b7280" }}>
                      Cancel
                    </button>
                  </div>
                  {customAdded && (
                    <div style={{ marginTop: 14, background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>Custom career added to draft successfully!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DRAFT PANEL */}
          {drafted.length > 0 && (
            <div className="fade-up" style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #c7d2fe", boxShadow: "0 4px 36px rgba(99,102,241,0.08)", overflow: "hidden" }}>
              <div className="draft-header" style={{ padding: "20px 20px", borderBottom: "1px solid #eef2ff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📌</div>
                  <div>
                    <h3 className="font-display section-title" style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Draft — Saved Career Options</h3>
                    <p style={{ fontSize: 12, color: "#6b7280" }}>
                      {drafted.filter((c: any) => !c.is_custom).length} from system
                      {drafted.filter((c: any) => c.is_custom).length > 0 && ` · ${drafted.filter((c: any) => c.is_custom).length} custom`}
                      {" "}· will be included in PDF
                    </p>
                  </div>
                </div>
                <div className="draft-btns" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={saveDraftToDB}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1.5px solid", whiteSpace: "nowrap",
                      ...(draftSaved ? { background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" } : { background: "#eef2ff", borderColor: "#c7d2fe", color: "#4338ca" }) }}>
                    {draftSaved ? "✅ Saved to DB!" : "💾 Save Draft"}
                  </button>
                  <button onClick={handlePDF} disabled={pdfLoading}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(220,38,38,0.25)", opacity: pdfLoading ? 0.75 : 1, whiteSpace: "nowrap" }}>
                    {pdfLoading ? <><span className="kspin">⟳</span>&nbsp;Generating...</> : <>📄 Download PDF</>}
                  </button>
                </div>
              </div>
              <div style={{ padding: "20px", display: "flex", flexWrap: "wrap", gap: 10 }}>
                {drafted.map((c: any, i) => (
                  <div key={i} style={{ background: c.is_custom ? "#fff1f5" : "#eef2ff", border: `1px solid ${c.is_custom ? "#fda4af" : "#c7d2fe"}`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.is_custom ? "#be123c" : "#4338ca" }}>{c.is_custom ? "✏️ " : ""}{i + 1}. {c.course}</span>
                    <button onClick={() => toggleDraft(c)} style={{ background: "none", border: "none", cursor: "pointer", color: c.is_custom ? "#fda4af" : "#a5b4fc", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {result.length > 0 && (
            <div className="fade-up delay-2">
              <div className="results-header" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 58, height: 58, borderRadius: 16, background: sm.lightBg, border: `1.5px solid ${sm.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{sm.icon}</div>
                  <div>
                    <h2 className="font-display section-title" style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{sm.label}</h2>
                    <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                      <span style={{ color: sm.textColor, fontWeight: 800 }}>{result.length}</span> career options available
                      {drafted.length > 0 && <span style={{ marginLeft: 10, color: "#4f46e5", fontWeight: 700 }}>· {drafted.length} in draft</span>}
                    </p>
                  </div>
                </div>
                <div className="results-actions" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {drafted.length > 0 && (
                    <button onClick={handlePDF} disabled={pdfLoading}
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(220,38,38,0.2)", opacity: pdfLoading ? 0.75 : 1, whiteSpace: "nowrap" }}>
                      {pdfLoading ? <><span className="kspin">⟳</span>&nbsp;PDF...</> : <>📄 Download PDF</>}
                    </button>
                  )}
                  <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9ca3af" }}>🔍</span>
                    <input className="k-input"
                      style={{ paddingLeft: 42, paddingRight: 18, paddingTop: 12, paddingBottom: 12, borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 14, fontWeight: 500, color: "#111827", width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                      placeholder="Search course or job role…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
              </div>

              {drafted.length === 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                  <p style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>Click <strong>📌 Save to Draft</strong> on any career card to add it to your report. Then download the PDF.</p>
                </div>
              )}

              <div className="results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                {filtered.map((item, idx) => (
                  <CareerCard key={idx} item={item} stream={activeStream} isDrafted={isDrafted(item)} onToggleDraft={() => toggleDraft(item)} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#374151" }}>No results found</p>
                  <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 6 }}>Try a different course or job keyword</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

/* ── CAREER CARD ── */
function CareerCard({ item, stream, isDrafted, onToggleDraft }: { item: Career; stream: string; isDrafted: boolean; onToggleDraft: () => void }) {
  const [exp, setExp] = useState(false);
  const sm = getSM(stream);
  const isGov = stream.toLowerCase() === "government";

  const rows = [
    { icon: "⏱️", label: isGov ? "Training Period"    : "Duration",      value: item.duration   },
    { icon: "📝", label: isGov ? "Exam / Recruitment" : "Entrance Exam", value: item.exam       },
    { icon: "💳", label: isGov ? "Exam Fee"           : "Course Fee",    value: item.course_fee },
    { icon: "💼", label: isGov ? "Sector"             : "Job Roles",     value: item.jobs       },
    { icon: "💰", label: isGov ? "Age Limit"          : "Salary",        value: item.salary     },
  ].filter(r => r.value && r.value !== "nan" && r.value !== "NaN" && r.value.trim() !== "");

  const preview = rows.slice(0, 3);
  const extra   = rows.slice(3);

  return (
    <div className="career-card" style={{ background: "#ffffff", borderRadius: 20, border: isDrafted ? "2px solid #6366f1" : "1px solid #f0f4f8", boxShadow: isDrafted ? "0 4px 24px rgba(99,102,241,0.15)" : "0 2px 18px rgba(0,0,0,0.05)", overflow: "hidden", position: "relative" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${sm.accent}, ${sm.accent}80)` }} />
      {isDrafted && <div style={{ position: "absolute", top: 12, right: 12, background: "#4f46e5", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 99 }}>📌 IN DRAFT</div>}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <h3 className="font-display career-card-title" style={{ fontSize: 17, fontWeight: 700, color: "#111827", lineHeight: 1.3, flex: 1, paddingRight: isDrafted ? 72 : 0 }}>{item.course}</h3>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: sm.lightBg, border: `1px solid ${sm.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{sm.icon}</div>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
        {preview.map((r, i) => <DRow key={i} {...r} color={sm.textColor} />)}
        {exp && extra.map((r, i) => <DRow key={i} {...r} color={sm.textColor} />)}
      </div>
      {extra.length > 0 && (
        <div style={{ padding: "0 20px" }}>
          <button onClick={() => setExp(!exp)} style={{ width: "100%", padding: "10px 0", borderRadius: 11, background: sm.lightBg, border: `1px solid ${sm.border}`, color: sm.textColor, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {exp ? "▲ Show Less" : `▼ ${extra.length} More Details`}
          </button>
        </div>
      )}
      <div style={{ padding: "12px 20px 16px" }}>
        <button onClick={onToggleDraft} style={{ width: "100%", padding: "9px 0", borderRadius: 11, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1.5px solid", transition: "all 0.18s",
          ...(isDrafted ? { background: "#eef2ff", borderColor: "#6366f1", color: "#4338ca" } : { background: "#fafafa", borderColor: "#e5e7eb", color: "#6b7280" }) }}>
          {isDrafted ? "✅ Remove from Draft" : "📌 Save to Draft"}
        </button>
      </div>
    </div>
  );
}

function DRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", lineHeight: 1.55 }}>{value}</p>
      </div>
    </div>
  );
}

function KField({ label, placeholder, type = "text", onChange }: { label: string; placeholder: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</label>
      <input type={type} placeholder={placeholder} className="k-input"
        style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fafafa", fontSize: 14, fontWeight: 500, color: "#111827" }}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
}