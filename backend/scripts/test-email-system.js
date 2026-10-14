/**
 * Verification & Test Suite for APEX//1.0 Automated Registration Confirmation Email System
 */

import { generateRegistrationConfirmationEmail } from "../src/services/email-template.js";

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n🧪 Running APEX//1.0 Email System Verification Suite...\n");

  // Test 1: Template generation with full data
  console.log("--- 1. Testing Email Template Generation (Full Data) ---");
  const testData = {
    playerId: "APEX-9999",
    teamName: "Cyber Sentinels",
    leaderName: "Akash Lodhi",
    email: "lodhiakash286@gmail.com",
    phone: "+91 98765 43210",
    college: "LNCT Bhopal",
    teamSize: 3,
    members: [
      { full_name: "Akash Lodhi", position: 1 },
      { full_name: "Rohan Verma", position: 2 },
      { full_name: "Priya Sharma", position: 3 },
    ],
    preferredDomain: "Cybersecurity & Web3",
    pptFileName: "cyber_sentinels_apex.pdf",
    pptStoragePath: "submissions/1791965_cyber_sentinels_apex.pdf",
    paymentStatus: "paid",
    paymentAmount: 199,
    paymentId: "pay_test_apex_12345",
  };

  const { subject, html, text } = generateRegistrationConfirmationEmail(testData);

  assert(subject === "Registration Confirmed — APEX//1.0 | APEX-9999", "Subject matches required specification");
  assert(html.includes("APEX//1.0"), "HTML includes APEX//1.0 branding");
  assert(html.includes("STUDENT HACKATHON · BHOPAL"), "HTML includes header subtitle");
  assert(html.includes("REGISTRATION SUCCESSFUL"), "HTML includes success banner");
  assert(html.includes("YOUR JOURNEY STARTS HERE."), "HTML includes journey heading");
  assert(html.includes("APEX-9999"), "HTML includes registration ID badge");
  assert(html.includes("Hey Akash Lodhi,"), "HTML includes personalized greeting");
  assert(html.includes("Cyber Sentinels"), "HTML includes team name");
  assert(html.includes("LNCT Bhopal"), "HTML includes college");
  assert(html.includes("Rohan Verma, Priya Sharma"), "HTML includes team member names");
  assert(html.includes("25 November 2026"), "HTML includes exact Round 1 date");
  assert(html.includes("Shortlisting Round"), "HTML includes Round 1 format");
  assert(html.includes("Offline Grand Finale — Date To Be Announced"), "HTML includes Round 2 details");
  assert(html.includes("Bhopal, Madhya Pradesh"), "HTML includes location");
  assert(html.includes("ONE IDEA. NO LIMITS."), "HTML includes branded slogan");
  assert(html.includes("lodhiakash286@gmail.com"), "HTML includes organizing team contact email");
  assert(!html.includes("undefined") && !html.includes("null"), "HTML contains 0 undefined/null placeholders");

  assert(text.includes("APEX-9999"), "Plain-text contains registration ID");
  assert(text.includes("Cyber Sentinels"), "Plain-text contains team name");
  assert(text.includes("25 November 2026"), "Plain-text contains event date");

  // Test 2: Handling optional fields when empty
  console.log("\n--- 2. Testing Optional Fields Handling ---");
  const minimalData = {
    playerId: "APEX-1001",
    teamName: "Solo Hacker",
    leaderName: "John Solo",
    email: "john@apex1.dev",
    phone: "+91 99999 88888",
    teamSize: 1,
  };

  const minEmail = generateRegistrationConfirmationEmail(minimalData);
  assert(!minEmail.html.includes("College / Org:"), "Omits empty college field");
  assert(!minEmail.html.includes("Preferred Domain:"), "Omits empty domain field");
  assert(minEmail.html.includes("John Solo"), "Includes leader name in minimal email");
  assert(!minEmail.html.includes("undefined") && !minEmail.html.includes("null"), "Minimal email contains 0 undefined/null");

  // Test 3: Backend API Verification
  console.log("\n--- 3. Testing Backend Email API Endpoints ---");
  const API_BASE = "http://localhost:5001";
  try {
    // Check health
    const healthRes = await fetch(`${API_BASE}/api/health`);
    assert(healthRes.status === 200, "Backend API is online on port 5001");

    // Empty payload rejection
    const badRes = await fetch(`${API_BASE}/api/emails/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(badRes.status === 400, "Rejects empty payload with 400");

    // Send confirmation for existing test team
    const sendRes = await fetch(`${API_BASE}/api/emails/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: "APEX-1466", forceRetry: true }),
    });
    const sendJson = await sendRes.json();
    assert(sendRes.status === 200 && sendJson.success === true, "Successfully triggered email for APEX-1466");

    // Idempotency: Duplicate call should acknowledge already processed
    const dupRes = await fetch(`${API_BASE}/api/emails/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: "APEX-1466" }),
    });
    const dupJson = await dupRes.json();
    assert(dupRes.status === 200 && dupJson.data?.alreadySent === true, "Idempotency prevents duplicate email delivery");

    // Status check
    const statusRes = await fetch(`${API_BASE}/api/emails/status/APEX-1466`);
    const statusJson = await statusRes.json();
    assert(statusRes.status === 200 && statusJson.data?.status === "sent", "Status check returns email delivery details");
  } catch (apiErr) {
    console.error("  ❌ API endpoint test error:", apiErr.message);
    failed++;
  }

  console.log(`\n==================================================`);
  console.log(`Total tests passed: ${passed}`);
  console.log(`Total tests failed: ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
