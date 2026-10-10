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



const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
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
      .field-error { color: #dc2626; font-size: 12px; font-weight: 600; margin-top: 6px; }
      .state-dropdown { position: absolute; top: calc(100% - 2px); left: 0; right: 0; max-height: 260px; overflow-y: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 12px 30px rgba(15,23,42,0.14); z-index: 1000; padding: 5px 0; }
      .state-option { padding: 11px 15px; font-size: 14px; font-weight: 500; color: #111827; cursor: pointer; border-bottom: 1px solid #f8fafc; }
      .state-option:hover { background: #f5f3ff; color: #4338ca; }

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



      .welcome-page {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        background: #f8fafc;
        color: #0f172a;
        isolation: isolate;
      }

      .welcome-page::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 12% 18%, rgba(99,102,241,0.13), transparent 24%),
          radial-gradient(circle at 88% 78%, rgba(124,58,237,0.10), transparent 25%),
          linear-gradient(135deg, #ffffff 0%, #f8fafc 52%, #f3f4ff 100%);
        pointer-events: none;
        z-index: -3;
      }

      .welcome-page::after {
        content: "";
        position: absolute;
        width: 55vw;
        height: 55vw;
        max-width: 760px;
        max-height: 760px;
        right: -22vw;
        top: 18%;
        border-radius: 50%;
        background: conic-gradient(from 180deg, transparent, rgba(99,102,241,0.10), transparent 35%, rgba(129,140,248,0.07), transparent 70%);
        filter: blur(24px);
        animation: auroraRotate 18s linear infinite;
        pointer-events: none;
        z-index: -2;
      }

      .welcome-grid {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px);
        background-size: 52px 52px;
        mask-image: linear-gradient(to bottom, black, transparent 78%);
        pointer-events: none;
        z-index: -1;
      }

      .welcome-orb {
        position: absolute;
        border-radius: 999px;
        pointer-events: none;
        filter: blur(1px);
        z-index: -1;
      }

      .orb-one {
        width: 300px;
        height: 300px;
        top: -170px;
        left: -100px;
        background: rgba(99,102,241,0.10);
        animation: softDrift 10s ease-in-out infinite;
      }

      .orb-two {
        width: 360px;
        height: 360px;
        right: -190px;
        bottom: -190px;
        background: rgba(124,58,237,0.08);
        animation: softDrift 12s 1s ease-in-out infinite reverse;
      }

      .effect-dot {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #6366f1;
        box-shadow: 0 0 0 6px rgba(99,102,241,0.08), 0 0 20px rgba(99,102,241,0.28);
        opacity: 0.55;
        pointer-events: none;
        z-index: 0;
      }

      .dot-one { left: 13%; top: 28%; animation: floatDot 6s ease-in-out infinite; }
      .dot-two { left: 52%; top: 16%; animation: floatDot 7s 1.4s ease-in-out infinite reverse; }
      .dot-three { right: 13%; top: 38%; animation: floatDot 8s 0.6s ease-in-out infinite; }
      .dot-four { right: 31%; bottom: 15%; animation: floatDot 6.5s 2s ease-in-out infinite reverse; }

      .welcome-nav {
        position: relative;
        z-index: 5;
        max-width: 1240px;
        margin: 0 auto;
        height: 100px;
        padding: 0 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(226,232,240,0.75);
      }

      .welcome-brand {
        position: relative;
        display: flex;
        align-items: center;
        height: 72px;
        min-width: 220px;
        overflow: visible;
      }

      .welcome-brand-name {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: #111827;
        font-family: 'Syne', sans-serif;
        font-size: 25px;
        font-weight: 900;
        letter-spacing: -0.045em;
        line-height: 1;
      }

      .welcome-brand-name::before {
        content: "";
        width: 9px;
        height: 30px;
        border-radius: 99px;
        background: linear-gradient(180deg, #6366f1, #7c3aed);
        box-shadow: 0 6px 18px rgba(99,102,241,0.25);
        animation: brandPulse 3s ease-in-out infinite;
      }

      .welcome-brand-name span {
        color: #4f46e5;
      }

      .welcome-nav-label {
        color: #64748b;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .welcome-main {
        position: relative;
        z-index: 2;
        width: min(1240px, calc(100% - 56px));
        min-height: calc(100vh - 132px);
        margin: 0 auto;
        padding: 42px 0 30px;
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(400px, 0.82fr);
        gap: 64px;
        align-items: center;
      }

      .welcome-copy {
        max-width: 670px;
        animation: welcomeIn 0.7s ease both;
      }

      .welcome-eyebrow {
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        border: 1px solid #c7d2fe;
        border-radius: 999px;
        background: rgba(238,242,255,0.78);
        color: #4338ca;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.14em;
        margin-bottom: 22px;
      }

      .welcome-title {
        margin: 0;
        max-width: 680px;
        color: #0f172a;
        font-size: clamp(44px, 4.7vw, 66px);
        line-height: 1.04;
        letter-spacing: -0.045em;
        font-weight: 900;
      }

      .welcome-title span {
        color: #4f46e5;
      }

      .welcome-description {
        max-width: 620px;
        margin: 24px 0 30px;
        color: #64748b;
        font-size: 17px;
        line-height: 1.75;
      }

      .welcome-actions {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .welcome-primary {
        display: inline-flex;
        align-items: center;
        gap: 16px;
        padding: 15px 20px 15px 22px;
        border: 0;
        border-radius: 12px;
        background: #4f46e5;
        color: #fff;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 12px 30px rgba(79,70,229,0.22);
        transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
      }

      .welcome-primary span {
        display: inline-flex;
        width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(255,255,255,0.14);
        font-size: 16px;
      }

      .welcome-primary:hover {
        transform: translateY(-2px);
        background: #4338ca;
        box-shadow: 0 16px 34px rgba(79,70,229,0.28);
      }

      .welcome-trust {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 22px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 700;
      }

      .welcome-trust i {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #cbd5e1;
      }

      .showcase-ring {
        position: absolute;
        width: 520px;
        height: 520px;
        border: 1px solid rgba(99,102,241,0.10);
        border-radius: 50%;
        animation: ringRotate 16s linear infinite;
        pointer-events: none;
      }

      .showcase-ring::before {
        content: "";
        position: absolute;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        top: 52px;
        left: 50%;
        background: #6366f1;
        box-shadow: 0 0 0 7px rgba(99,102,241,0.08), 0 0 22px rgba(99,102,241,0.35);
      }

      .showcase-panel::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 23px;
        padding: 1px;
        background: linear-gradient(120deg, rgba(99,102,241,0.35), transparent 35%, rgba(124,58,237,0.25), transparent 70%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: borderSweep 5s linear infinite;
        pointer-events: none;
      }

      .welcome-showcase {
        position: relative;
        min-height: 430px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: showcaseIn 0.85s 0.12s ease both;
      }

      .showcase-shadow {
        position: absolute;
        width: 340px;
        height: 260px;
        border-radius: 50%;
        background: rgba(99,102,241,0.09);
        filter: blur(45px);
      }

      .showcase-panel {
        position: relative;
        width: min(500px, 100%);
        padding: 30px;
        border: 1px solid #dbe4f0;
        border-radius: 22px;
        background: rgba(255,255,255,0.94);
        box-shadow: 0 30px 80px rgba(15,23,42,0.12);
        backdrop-filter: blur(18px);
      }

      .showcase-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding-bottom: 22px;
        border-bottom: 1px solid #eef2f7;
      }

      .showcase-kicker {
        margin-bottom: 7px;
        color: #6366f1;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .showcase-top h2 {
        margin: 0;
        color: #111827;
        font-size: 23px;
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      .showcase-status {
        flex-shrink: 0;
        padding: 6px 9px;
        border-radius: 7px;
        background: #ecfdf5;
        color: #047857;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .pathway {
        position: relative;
        padding: 24px 0 18px;
      }

      .path-line {
        position: absolute;
        left: 20px;
        top: 42px;
        bottom: 42px;
        width: 1px;
        background: #dbe4f0;
      }

      .path-step {
        position: relative;
        display: grid;
        grid-template-columns: 40px 1fr;
        gap: 14px;
        align-items: center;
        padding: 11px 0;
      }

      .path-number {
        position: relative;
        z-index: 1;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 10px;
        font-weight: 800;
      }

      .path-step.active .path-number {
        background: #eef2ff;
        border-color: #c7d2fe;
        color: #4338ca;
      }

      .path-step p {
        margin: 0 0 3px;
        color: #1e293b;
        font-size: 13px;
        font-weight: 800;
      }

      .path-step span {
        color: #94a3b8;
        font-size: 11px;
        font-weight: 500;
      }

      .showcase-quote {
        position: relative;
        text-align: center;
        padding: 22px 12px 14px;
        margin-top: 20px;
        border-top: 1px solid rgba(129, 140, 248, 0.20);
        color: #3730a3;
      }

      .quote-mark {
        display: block;
        font-family: Georgia, serif;
        font-size: 42px;
        line-height: 0.8;
        color: #8b5cf6;
      }

      .showcase-quote p {
        margin: 12px 0;
        font-family: "Segoe Script", "Brush Script MT", "URW Chancery L", cursive;
        font-size: clamp(17px, 2vw, 23px);
        font-style: italic;
        line-height: 1.6;
        font-weight: 600;
        color: #3730a3;
      }

      .quote-author {
        display: block;
        margin-top: 10px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #7c3aed;
      }

      .showcase-note {
        display: none;
        position: absolute;
        align-items: center;
        align-items: center;
        gap: 8px;
        padding: 10px 13px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: rgba(255,255,255,0.94);
        box-shadow: 0 14px 30px rgba(15,23,42,0.09);
        color: #475569;
        font-size: 10px;
        font-weight: 800;
      }

      .note-one {
        top: 54px;
        right: -18px;
      }

      .note-two {
        bottom: 58px;
        left: -20px;
      }

      .note-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 4px #ecfdf5;
      }

      .note-dot.purple {
        background: #6366f1;
        box-shadow: 0 0 0 4px #eef2ff;
      }

      .welcome-footer {
        position: relative;
        z-index: 2;
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 28px 22px;
        display: flex;
        justify-content: space-between;
        color: #94a3b8;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      @keyframes welcomeIn {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes showcaseIn {
        from { opacity: 0; transform: translateX(18px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes auroraRotate {
        from { transform: rotate(0deg) scale(1); }
        to { transform: rotate(360deg) scale(1.05); }
      }

      @keyframes floatDot {
        0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.35; }
        50% { transform: translate3d(0, -16px, 0); opacity: 0.85; }
      }

      @keyframes brandPulse {
        0%, 100% { opacity: 0.8; transform: scaleY(0.9); }
        50% { opacity: 1; transform: scaleY(1); }
      }

      @keyframes ringRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes borderSweep {
        0% { opacity: 0.45; }
        50% { opacity: 1; }
        100% { opacity: 0.45; }
      }

      @keyframes softDrift {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(10px, -8px, 0); }
      }

      @media (max-width: 768px) {
        .showcase-ring { width: 390px; height: 390px; }
        .welcome-brand { min-width: 180px; }
        .welcome-nav { height: 84px; padding: 0 18px; }
        .welcome-brand { min-width: 155px; height: 78px; }
        .welcome-brand-name { font-size: 22px; }
        .welcome-nav-label { font-size: 8px; }
        .welcome-main { width: min(100% - 36px, 680px); min-height: auto; padding: 34px 0 28px; grid-template-columns: 1fr; gap: 34px; }
        .welcome-title { font-size: clamp(38px, 10vw, 54px); }
        .welcome-description { font-size: 15px; }
        .welcome-showcase { min-height: auto; }
        .showcase-panel { padding: 22px; }
        .showcase-top h2 { font-size: 20px; }
        .welcome-footer { padding: 0 18px 18px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .welcome-page *, .welcome-page::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }

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

        .welcome-layout { grid-template-columns: 1fr !important; gap: 30px !important; }

        .welcome-title { font-size: 38px !important; }

        .welcome-page main { padding-top: 10px !important; }

        .welcome-visual { min-height: 300px !important; }

      }



      @media (max-width: 480px) {

        .welcome-nav-label { display: none !important; }
        .welcome-main { width: calc(100% - 28px) !important; padding-top: 28px !important; }
        .welcome-title { font-size: 36px !important; }
        .welcome-description { font-size: 14px !important; }
        .welcome-primary { width: 100% !important; justify-content: space-between !important; }
        .welcome-trust { font-size: 9px !important; }
        .showcase-top h2 { font-size: 20px !important; }
        .showcase-footer { grid-template-columns: 1fr !important; }
        .welcome-footer { flex-direction: column !important; gap: 5px !important; }

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





  const [student, setStudent]               = useState({ name: "", stream: "Science", mobile: "", state: "" });
  const [studentErrors, setStudentErrors] = useState({ name: "", mobile: "", state: "" });
  const [stateSearch, setStateSearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);

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

  const [showWelcome, setShowWelcome]       = useState(true);





  /* ── Student ── */

  const validateStudent = () => {
    const errors = { name: "", mobile: "", state: "" };
    const name = student.name.trim();
    const mobile = student.mobile.trim();
    const state = student.state.trim();

    if (!name) {
      errors.name = "Full name is required.";
    } else if (!/^[A-Za-z]+(?:[.'-][A-Za-z]+)*(?:\s+[A-Za-z]+(?:[.'-][A-Za-z]+)*)+$/.test(name)) {
      errors.name = "Enter your full name, e.g. Chaitanya Hire.";
    }

    if (!mobile) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      errors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!state) {
      errors.state = "Please select your state.";
    }

    setStudentErrors(errors);
    return !errors.name && !errors.mobile && !errors.state;
  };

  const saveStudent = async () => {
    if (!validateStudent()) return;
    try {
      const r = await fetch(`${API}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...student, user_id: null }),
      });
      if (!r.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error Saving Student");
    }
  };

  const goToWelcome = () => {
    setShowWelcome(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startCareerJourney = () => {
    setShowWelcome(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const getRoadmap = async () => {
    if (!validateStudent()) return;
    setLoading(true);
    setResult([]);
    setSearch("");
    setDrafted([]);
    try {
      // Save the student's details first. The backend updates the existing
      // record for the same mobile number instead of creating duplicates.
      const saveResponse = await fetch(`${API}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name.trim(),
          stream: student.stream.toLowerCase(),
          mobile: student.mobile.trim(),
          state: student.state.trim(),
          drafted_careers: "[]",
          custom_careers: "[]",
        }),
      });
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "Unable to save student details");
      }

      const roadmapResponse = await fetch(`${API}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stream: student.stream.toLowerCase() }),
      });
      if (!roadmapResponse.ok) {
        const errorData = await roadmapResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "Roadmap failed");
      }
      const data = await roadmapResponse.json();
      setResult(data.data ?? []);
      setActiveStream(student.stream);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Generate roadmap failed:", error);
      alert(error instanceof Error ? error.message : "Error Generating Career Roadmap");
    } finally {
      setLoading(false);
    }
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

          user_id: null,

          drafted_careers: JSON.stringify(drafted.filter((c: any) => !c.is_custom).map(c => c.course)),

          custom_careers: JSON.stringify(drafted.filter((c: any) => c.is_custom)),

        }),

      });

      setDraftSaved(true); setTimeout(() => setDraftSaved(false), 3000);

    } catch { alert("Error saving draft to DB"); }

  };



  const handlePDF = async () => {

    setPdfLoading(true);

    try { await generatePDF(student, activeStream, drafted, null); }

    catch { alert("PDF generation failed."); }

    setPdfLoading(false);

  };



  const filtered = result.filter(i =>

    i.course.toLowerCase().includes(search.toLowerCase()) ||

    i.jobs.toLowerCase().includes(search.toLowerCase())

  );



  /* ── Main application ── */

  const sm = getSM(activeStream);



  /* ════════════════════════════════

     WELCOME PAGE

  ════════════════════════════════ */

  if (showWelcome) {
    return (
      <>
        <FontStyle />
        <div className="welcome-page">
          <div className="welcome-grid" />
          <div className="welcome-orb orb-one" />
          <div className="welcome-orb orb-two" />
          <div className="effect-dot dot-one" />
          <div className="effect-dot dot-two" />
          <div className="effect-dot dot-three" />
          <div className="effect-dot dot-four" />

          <header className="welcome-nav">
            <div className="welcome-brand">
              <div className="welcome-brand-name">Know<span>letive</span></div>
            </div>
            <div className="welcome-nav-label">AI CAREER GUIDANCE</div>
          </header>

          <main className="welcome-main">
            <section className="welcome-copy">
              <div className="welcome-eyebrow">CAREER GUIDANCE PLATFORM</div>

              <h1 className="font-display welcome-title">
                Build your career path
                <span> with clarity.</span>
              </h1>

              <p className="welcome-description">
                Discover relevant career options, understand the path ahead, and build a personalised roadmap based on your academic stream and goals.
              </p>

              <div className="welcome-actions">
                <button className="welcome-primary" onClick={startCareerJourney}>
                  Start Your Career Journey
                  <span>→</span>
                </button>
              </div>

              <div className="welcome-trust">
                <span>Personalised guidance</span>
                <i />
                <span>6 career streams</span>
                <i />
                <span>Instant roadmap</span>
              </div>
            </section>

            <section className="welcome-showcase" aria-label="Career guidance preview">
              <div className="showcase-ring" />
              <div className="showcase-shadow" />
              <div className="showcase-panel">
                <div className="showcase-top">
                  <div>
                    <p className="showcase-kicker">YOUR CAREER JOURNEY</p>
                    <h2>From interest to direction.</h2>
                  </div>
                  <span className="showcase-status">READY</span>
                </div>

                <div className="pathway">
                  <div className="path-line" />

                  <div className="path-step active">
                    <div className="path-number">01</div>
                    <div>
                      <p>Student profile</p>
                      <span>Stream, location &amp; goals</span>
                    </div>
                  </div>

                  <div className="path-step">
                    <div className="path-number">02</div>
                    <div>
                      <p>Career options</p>
                      <span>Relevant paths &amp; opportunities</span>
                    </div>
                  </div>

                  <div className="path-step">
                    <div className="path-number">03</div>
                    <div>
                      <p>Personal roadmap</p>
                      <span>Exams, courses &amp; career direction</span>
                    </div>
                  </div>
                </div>

                <div className="showcase-quote">
                  <span className="quote-mark" aria-hidden="true">“</span>
                  <p>
                    Your dreams are the destination;
                    <br />
                    your choices are the journey.
                  </p>
                  <span className="quote-author">— Knowletive</span>
                </div>
              </div>


            </section>
          </main>

          <footer className="welcome-footer">
            <span>KNOWLETIVE</span>
            <span>AI-powered career guidance</span>
          </footer>
        </div>
      </>
    );
  }

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

            <button
              onClick={goToWelcome}
              aria-label="Back to welcome page"
              style={{ padding: "9px 17px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.color = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              ← Back
            </button>

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

                <div>
                  <KField
                    label="Full Name *"
                    placeholder="Enter your full name"
                    onChange={v => {
                      setStudent({ ...student, name: v });
                      if (studentErrors.name) setStudentErrors({ ...studentErrors, name: "" });
                    }}
                  />
                  {studentErrors.name && <p className="field-error">⚠ {studentErrors.name}</p>}
                </div>

                <div>
                  <KField
                    label="Mobile Number *"
                    placeholder="10-digit mobile number"
                    onChange={v => {
                      const value = v.replace(/\D/g, "").slice(0, 10);
                      setStudent({ ...student, mobile: value });
                      if (studentErrors.mobile) setStudentErrors({ ...studentErrors, mobile: "" });
                    }}
                  />
                  {studentErrors.mobile && <p className="field-error">⚠ {studentErrors.mobile}</p>}
                </div>

                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>State *</label>
                  <input
                    value={stateSearch}
                    placeholder="Search state..."
                    onFocus={() => setShowStateDropdown(true)}
                    onChange={e => {
                      const value = e.target.value;
                      setStateSearch(value);
                      setShowStateDropdown(true);
                      if (student.state) setStudent({ ...student, state: "" });
                      if (studentErrors.state) setStudentErrors({ ...studentErrors, state: "" });
                    }}
                    className="k-input"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "#fafafa", fontSize: 14, fontWeight: 500, color: "#111827" }}
                  />
                  {showStateDropdown && (
                    <div className="state-dropdown">
                      {INDIAN_STATES
                        .map((state, index) => ({ state, index, lower: state.toLowerCase(), query: stateSearch.trim().toLowerCase() }))
                        .filter(x => !x.query || x.lower.includes(x.query))
                        .sort((a, b) => {
                          const q = stateSearch.trim().toLowerCase();
                          if (!q) return a.index - b.index;
                          const aStart = a.lower.startsWith(q);
                          const bStart = b.lower.startsWith(q);
                          if (aStart && !bStart) return -1;
                          if (!aStart && bStart) return 1;
                          return a.index - b.index;
                        })
                        .map(({ state }) => (
                          <div
                            key={state}
                            className="state-option"
                            onMouseDown={e => {
                              e.preventDefault();
                              setStudent({ ...student, state });
                              setStateSearch(state);
                              setShowStateDropdown(false);
                              setStudentErrors({ ...studentErrors, state: "" });
                            }}
                          >
                            {state}
                          </div>
                        ))}
                      {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.trim().toLowerCase())).length === 0 && (
                        <div style={{ padding: 14, color: "#6b7280", fontSize: 13, textAlign: "center" }}>No state found</div>
                      )}
                    </div>
                  )}
                  {studentErrors.state && <p className="field-error">⚠ {studentErrors.state}</p>}
                </div>

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