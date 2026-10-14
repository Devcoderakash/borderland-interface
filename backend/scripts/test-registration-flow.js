/**
 * Comprehensive Automated Test Suite for APEX 1.0 Registration & Storage System
 * Covers all 17 scenarios specified in the Master Prompt.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_BASE = "http://localhost:5001";
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log("\n🚀 Starting APEX 1.0 End-to-End Registration & Supabase Test Suite...\n");

  // 1. Health check
  console.log("--- 1. Health Check ---");
  const healthRes = await fetch(`${API_BASE}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === "OK", "Server is healthy on port 5001");

  // 2. Reject missing file
  console.log("\n--- 2. Reject Missing File on Upload ---");
  const emptyUploadRes = await fetch(`${API_BASE}/api/upload/ppt`, { method: "POST" });
  const emptyUploadData = await emptyUploadRes.json();
  assert(emptyUploadRes.status === 400 && emptyUploadData.error === "No file uploaded.", "Missing file rejected with 400");

  // 3. Reject unsupported file type (.txt)
  console.log("\n--- 3. Reject Unsupported File Type ---");
  const txtFormData = new FormData();
  txtFormData.append("ppt", new Blob(["Malicious text script"], { type: "text/plain" }), "script.txt");
  const txtUploadRes = await fetch(`${API_BASE}/api/upload/ppt`, { method: "POST", body: txtFormData });
  const txtUploadData = await txtUploadRes.json();
  assert(txtUploadRes.status === 400 && txtUploadData.error.includes("Only PDF, PPT, and PPTX files are allowed"), "Invalid file type rejected with 400");

  // 4. Reject oversized file (> 20MB)
  console.log("\n--- 4. Reject Oversized File (> 20MB) ---");
  const largeBlob = new Blob([new Uint8Array(21 * 1024 * 1024)], { type: "application/pdf" });
  const largeFormData = new FormData();
  largeFormData.append("ppt", largeBlob, "oversized.pdf");
  const largeUploadRes = await fetch(`${API_BASE}/api/upload/ppt`, { method: "POST", body: largeFormData });
  const largeUploadData = await largeUploadRes.json();
  assert(largeUploadRes.status === 413, "Oversized file rejected with 413 Payload Too Large");

  // 5. Upload valid PDF
  console.log("\n--- 5. Upload Valid PDF Presentation ---");
  const pdfBlob = new Blob(["%PDF-1.4 APEX 1.0 Idea Presentation Sample"], { type: "application/pdf" });
  const pdfFormData = new FormData();
  pdfFormData.append("ppt", pdfBlob, "apex_idea.pdf");
  const pdfUploadRes = await fetch(`${API_BASE}/api/upload/ppt`, { method: "POST", body: pdfFormData });
  const pdfUploadData = await pdfUploadRes.json();
  assert(pdfUploadRes.status === 200 && pdfUploadData.success === true, "PDF uploaded successfully");
  assert(typeof pdfUploadData.storagePath === "string" && pdfUploadData.storagePath.startsWith("submissions/"), "Storage path generated in submissions/ directory");
  assert(typeof pdfUploadData.url === "string" && pdfUploadData.url.includes("token="), "Short-lived signed preview URL returned");

  // 6. Upload valid PPTX
  console.log("\n--- 6. Upload Valid PPTX Presentation ---");
  const pptxBlob = new Blob(["PK\x03\x04 PPTX Mock Header"], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
  const pptxFormData = new FormData();
  pptxFormData.append("ppt", pptxBlob, "apex_deck.pptx");
  const pptxUploadRes = await fetch(`${API_BASE}/api/upload/ppt`, { method: "POST", body: pptxFormData });
  const pptxUploadData = await pptxUploadRes.json();
  assert(pptxUploadRes.status === 200 && pptxUploadData.success === true, "PPTX uploaded successfully to Supabase Storage");

  // 7. Verify unauthorized public access to private file is blocked
  console.log("\n--- 7. Security: Verify Direct Public Access to Storage Bucket is Denied ---");
  const publicUrl = `https://vnawxsgxcobfcbywykdb.supabase.co/storage/v1/object/public/apex-presentations/${pdfUploadData.storagePath}`;
  const unauthRes = await fetch(publicUrl);
  assert(unauthRes.status === 404 || unauthRes.status === 400 || unauthRes.status === 403, "Public unauthenticated access to private bucket blocked");

  // 8. Verify authorized signed URL download works
  console.log("\n--- 8. Security: Verify Download with Backend-Signed URL Works ---");
  const signedDownloadRes = await fetch(pdfUploadData.url);
  const downloadedContent = await signedDownloadRes.text();
  assert(signedDownloadRes.status === 200 && downloadedContent.includes("APEX 1.0 Idea Presentation Sample"), "Authorized signed URL securely retrieves private presentation file");

  // 9. Validation: Reject missing required registration fields
  console.log("\n--- 9. Reject Incomplete Registration Payload ---");
  const invalidRegRes = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_name: "Incomplete" }),
  });
  assert(invalidRegRes.status === 400, "Incomplete payload rejected with 400 Validation Error");

  // 10. Validation: Reject invalid email and phone
  console.log("\n--- 10. Reject Invalid Email and Phone Formats ---");
  const badFormatRes = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_name: "Test Bad Format",
      leader_name: "John Doe",
      email: "not-an-email",
      phone: "123",
      college: "Bhopal Tech",
      team_size: 2,
    }),
  });
  const badFormatData = await badFormatRes.json();
  assert(badFormatRes.status === 400 && badFormatData.details?.email, "Invalid email caught by schema");

  // 11. Create full registration order with PPT metadata
  console.log("\n--- 11. Create Valid Registration Order with PPT Metadata ---");
  const testEmail = `apex.test.${Date.now()}@example.com`;
  const validRegRes = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_name: "Nova Hackers",
      leader_name: "Sameer Khan",
      email: testEmail,
      phone: "+919876543299",
      college: "NIT Bhopal",
      team_size: 2,
      ppt_url: pdfUploadData.storagePath,
      ppt_storage_path: pdfUploadData.storagePath,
      ppt_file_name: pdfUploadData.fileName,
      ppt_file_type: pdfUploadData.mimeType,
      ppt_file_size: pdfUploadData.size,
      preferred_domain: "FinTech & Security",
      members: [{ full_name: "Ananya Roy", position: 2 }],
    }),
  });
  const orderData = await validRegRes.json();
  assert(validRegRes.status === 200 && orderData.orderId, "Order created with orderId: " + orderData.orderId);
  assert(orderData.amount === 19900 && orderData.amountInRupees === 199, "Registration fee strictly calculated server-side: ₹199");
  assert(orderData.playerId && orderData.playerId.startsWith("APEX-"), "Player reference generated: " + orderData.playerId);

  // 12. Check registration status endpoint
  console.log("\n--- 12. Query Registration Status by Player ID ---");
  const statusRes = await fetch(`${API_BASE}/api/registrations/${orderData.playerId}/status`);
  const statusData = await statusRes.json();
  assert(statusRes.status === 200 && statusData.payment_status === "pending", "Status endpoint returns pending before payment");

  // 13. Verify payment signature security
  console.log("\n--- 13. Payment Verification: Tampered Signature Rejection ---");
  const tamperedVerifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: "pay_tampered_123",
      razorpay_signature: "tampered_fake_signature",
      teamId: orderData.teamId,
    }),
  });
  assert(tamperedVerifyRes.status === 400, "Tampered payment signature rejected with 400");

  // 14. Verify payment with valid signature
  console.log("\n--- 14. Payment Verification: Cryptographic Signature Confirmation ---");
  const envContent = fs.readFileSync(path.resolve("backend/.env"), "utf8");
  const secretMatch = envContent.match(/RAZORPAY_KEY_SECRET=["\x27]?([^"\x27\r\n]+)/);
  const secret = secretMatch ? secretMatch[1] : "";
  const paymentId = `pay_test_${Date.now()}`;
  const validSignature = crypto.createHmac("sha256", secret).update(`${orderData.orderId}|${paymentId}`).digest("hex");

  const validVerifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      teamId: orderData.teamId,
    }),
  });
  const validVerifyData = await validVerifyRes.json();
  assert(validVerifyRes.status === 200 && validVerifyData.status === "paid", "Payment verified and registration confirmed");

  // 15. Verify duplicate registration prevention for paid email
  console.log("\n--- 15. Idempotency: Prevent Duplicate Paid Registrations ---");
  const duplicateRegRes = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      team_name: "Nova Clone",
      leader_name: "Sameer Khan",
      email: testEmail,
      phone: "+919876543299",
      college: "NIT Bhopal",
      team_size: 2,
      ppt_url: pdfUploadData.storagePath,
      members: [{ full_name: "Ananya Roy", position: 2 }],
    }),
  });
  const duplicateData = await duplicateRegRes.json();
  assert(duplicateRegRes.status === 500 && duplicateData.error.includes("already registered with a confirmed payment"), "Duplicate registration blocked for already-paid email");

  // 16. Admin registrations listing & details
  console.log("\n--- 16. Admin Registration Management ---");
  const adminRegRes = await fetch(`${API_BASE}/api/admin/registrations`);
  const adminRegData = await adminRegRes.json();
  const confirmedTeam = adminRegData.find((t) => t.id === orderData.teamId);
  assert(Array.isArray(adminRegData), "Admin registrations endpoint returns team list");
  assert(confirmedTeam && confirmedTeam.payment_status === "paid" && confirmedTeam.status === "approved", "Confirmed team visible in admin with paid status");
  assert(confirmedTeam && confirmedTeam.ppt_storage_path === pdfUploadData.storagePath, "PPT metadata persisted with storage path");

  // 17. Admin PPT signed URL generation
  console.log("\n--- 17. Admin Presentation Download URL Generation ---");
  const adminPptRes = await fetch(`${API_BASE}/api/admin/registrations/${orderData.teamId}/ppt-url`);
  const adminPptData = await adminPptRes.json();
  assert(adminPptRes.status === 200 && adminPptData.signedUrl && adminPptData.expiresIn === 3600, "Admin can generate 1-hour signed URL to download private submission");

  console.log("\n========================================================");
  console.log(`Test Results: ${testsPassed} passed, ${testsFailed} failed.`);
  console.log("========================================================\n");

  if (testsFailed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Test runner error:", e);
  process.exit(1);
});
