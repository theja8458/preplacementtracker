const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Read Markdown file
const mdPath = path.join(__dirname, '../docs/SRS-Document.md');
const htmlOutputPath = path.join(__dirname, '../docs/SRS-Document.html');
const pdfOutputPath = path.join(__dirname, '../docs/SRS-Document.pdf');

let mdContent = fs.readFileSync(mdPath, 'utf8');

// Strip YAML frontmatter if present
mdContent = mdContent.replace(/^---[\s\S]*?---\s*/, '');

// Inline SVG content for architecture diagram if referenced
const svgPath = path.join(__dirname, '../docs/architecture-diagram.svg');
let svgContent = '';
if (fs.existsSync(svgPath)) {
  svgContent = fs.readFileSync(svgPath, 'utf8');
}

// Convert markdown to HTML (simple regex pass + structure handling)
function mdToHtml(markdown) {
  let html = markdown;

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Replace Markdown architecture diagram placeholder with inline SVG if present
  if (svgContent) {
    html = html.replace(
      /```[\s\S]*?PLACEMENTTRACKER ARCHITECTURE[\s\S]*?```/gi,
      `<div class="diagram-container">${svgContent}</div>`
    );
  }

  // Tables
  html = html.replace(/^\|(.+)\|$/gim, (match, content) => {
    const cells = content.split('|').map(c => c.trim());
    if (cells.every(c => c.match(/^:?-+:?$/))) {
      return ''; // separator row
    }
    const isHeader = false; // handled by table wrapper
    return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  });

  // Group consecutive <tr> into <table>
  html = html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (match) => {
    // Make first row <th>
    let tableHtml = match.replace(/^<tr>(.*?)<\/tr>/, (firstRow, rowContent) => {
      const thContent = rowContent.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
      return `<thead><tr>${thContent}</tr></thead><tbody>`;
    });
    return `<table class="srs-table">${tableHtml}</tbody></table>`;
  });

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<table') || p.startsWith('<ul') || p.startsWith('<pre') || p.startsWith('<div') || p.startsWith('<blockquote') || p.startsWith('<tr')) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('\n\n');

  return html;
}

const parsedBody = mdToHtml(mdContent);

// Build complete standalone HTML document
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PlacementTracker — Software Requirements Specification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1E293B;
      line-height: 1.6;
      font-size: 10pt;
      background: #FFFFFF;
    }

    h1, h2, h3, h4 {
      font-family: 'Space Grotesk', sans-serif;
      color: #0F172A;
      font-weight: 700;
      page-break-after: avoid;
    }

    h1 {
      font-size: 20pt;
      color: #4C1D95;
      border-bottom: 2.5px solid #7C3AED;
      padding-bottom: 6px;
      margin-top: 1.8em;
      margin-bottom: 0.6em;
      page-break-before: always;
    }

    h1:first-of-type {
      page-break-before: avoid;
    }

    h2 {
      font-size: 14pt;
      color: #5B21B6;
      border-left: 4px solid #06B6D4;
      padding-left: 10px;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    h3 {
      font-size: 11.5pt;
      color: #1E1B4B;
      margin-top: 1.2em;
      margin-bottom: 0.4em;
    }

    h4 {
      font-size: 10.5pt;
      color: #334155;
      margin-top: 1em;
    }

    /* Cover Page */
    .cover-page {
      height: 950px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      padding: 50px 40px;
      background: linear-gradient(135deg, #0D0F1A 0%, #1E1B4B 100%);
      color: #F8FAFC;
      border-radius: 16px;
      box-sizing: border-box;
    }

    .cover-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 32pt;
      font-weight: 700;
      background: linear-gradient(90deg, #A78BFA, #38BDF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
      line-height: 1.25;
    }

    .cover-subtitle {
      font-size: 16pt;
      color: #94A3B8;
      font-weight: 500;
    }

    .cover-meta {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 24px;
      border-radius: 12px;
    }

    .cover-meta table {
      width: 100%;
      color: #E2E8F0;
      border-collapse: collapse;
    }

    .cover-meta td {
      padding: 8px 12px;
      border: none !important;
      background: transparent !important;
    }

    .cover-meta td.label {
      font-weight: 600;
      color: #38BDF8;
      width: 160px;
    }

    /* Tables */
    table.srs-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 9pt;
    }

    table.srs-table th {
      background-color: #1E1B4B;
      color: #F8FAFC;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #334155;
    }

    table.srs-table td {
      padding: 7px 10px;
      border: 1px solid #CBD5E1;
    }

    table.srs-table tr:nth-child(even) td {
      background-color: #F8FAFC;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      background-color: #F1F5F9;
      color: #6D28D9;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #E2E8F0;
    }

    pre {
      background-color: #0D0F1A;
      color: #F8FAFC;
      padding: 14px 18px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid #1E293B;
    }

    pre code {
      background: transparent;
      border: none;
      color: #38BDF8;
    }

    blockquote {
      border-left: 4px solid #7C3AED;
      background-color: #F5F3FF;
      margin: 1em 0;
      padding: 10px 16px;
      color: #4C1D95;
      border-radius: 0 8px 8px 0;
    }

    .diagram-container {
      text-align: center;
      margin: 24px 0;
      page-break-inside: avoid;
    }

    ul, ol {
      padding-left: 20px;
      margin: 0.8em 0;
    }

    li {
      margin-bottom: 4px;
    }

    p {
      margin: 0.8em 0;
    }
  </style>
</head>
<body>

<div class="cover-page">
  <div>
    <div style="font-size: 11pt; color: #38BDF8; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">Software Engineering & Academic Project Artifact</div>
    <div class="cover-title">PlacementTracker (Study Buddy)</div>
    <div class="cover-subtitle">Software Requirements Specification (SRS)</div>
  </div>
  
  <div style="margin: 40px 0; font-size: 11.5pt; color: #CBD5E1; line-height: 1.8;">
    A full-stack placement preparation tracking platform engineered specifically for MCA students at Sri Venkateswara College of Engineering (SVCE). This document provides an exhaustive, code-verified specification of all system requirements, architectural patterns, schemas, and operational constraints.
  </div>

  <div class="cover-meta">
    <table>
      <tr>
        <td class="label">Project Title:</td>
        <td>PlacementTracker — SVCE Placement Prep Suite</td>
      </tr>
      <tr>
        <td class="label">Target Audience:</td>
        <td>SVCE MCA Students & Faculty Review Panel</td>
      </tr>
      <tr>
        <td class="label">System Version:</td>
        <td>v1.0.0 (Production Release)</td>
      </tr>
      <tr>
        <td class="label">Primary Stack:</td>
        <td>Next.js 14 App Router, MongoDB Atlas, NextAuth, Groq LLM Engine</td>
      </tr>
      <tr>
        <td class="label">Document Date:</td>
        <td>July 2026</td>
      </tr>
      <tr>
        <td class="label">Verification:</td>
        <td>100% Codebase-Verified (17 Mongoose Models & Serverless API Routes)</td>
      </tr>
    </table>
  </div>
</div>

${parsedBody}

</body>
</html>`;

// Write HTML file
fs.writeFileSync(htmlOutputPath, fullHtml, 'utf8');
console.log('✅ Generated docs/SRS-Document.html');

// Convert HTML to PDF using native Microsoft Edge headless execution
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (fs.existsSync(edgePath)) {
  console.log('🔄 Rendering docs/SRS-Document.pdf via Edge Headless engine...');
  const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfOutputPath}" "${htmlOutputPath}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('🎉 Successfully created docs/SRS-Document.pdf!');
} else {
  console.error('❌ Edge executable not found at expected path.');
}
