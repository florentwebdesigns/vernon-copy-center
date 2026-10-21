/**
 * The Vernon Copy Center: call + booking analytics
 *
 * Same idea as the Stu Plumbing sheet. The website logs:
 *   Calls tab:    every time someone taps a phone number (time, device, page)
 *   Bookings tab: every quote request sent from the form (time, contact info, service, device, page)
 * Each booking is also emailed to NOTIFY_EMAIL; hitting Reply answers the customer directly.
 * The tabs are created automatically the first time something is logged.
 *
 * Setup: Extensions > Apps Script, replace everything in Code.gs with this file, save.
 * Then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone),
 * or, if you already deployed: Deploy > Manage deployments > pencil > Version: New version > Deploy
 * (that keeps the same URL).
 */
var NOTIFY_EMAIL = "copycenter@warwick.net";   // Katie gets an email for every booking ("" = off)
var CALLS = "Calls";
var BOOKINGS = "Bookings";
var CALL_HEADERS = ["Tapped Call", "Device", "Page"];
var BOOKING_HEADERS = ["Booked", "Name", "Email", "Phone", "Service", "Needed By", "Details", "Device", "Page"];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return ContentService.createTextOutput("ok");   // spam trap field
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (p.type === "call") {
      sheet_(CALLS, CALL_HEADERS).appendRow([new Date(), clean_(p.device), clean_(p.page)]);
    } else if (p.type === "booking") {
      sheet_(BOOKINGS, BOOKING_HEADERS).appendRow([new Date(), clean_(p.name), clean_(p.email),
        clean_(p.phone), clean_(p.service), clean_(p.deadline), clean_(p.details),
        clean_(p.device), clean_(p.page)]);
      if (NOTIFY_EMAIL) notify_(p);
    }
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

function notify_(p) {
  var lines = [
    "New quote request from vernoncopycenter.com", "",
    "Name: " + (p.name || ""),
    "Email: " + (p.email || ""),
    "Phone: " + (p.phone || "-"),
    "Service: " + (p.service || ""),
    "Needed by: " + (p.deadline || "-"), "",
    "Project details:", p.details || "", "",
    "Reply to this email to answer " + (p.name || "the customer") + " directly."
  ];
  var msg = { to: NOTIFY_EMAIL, subject: "New quote request: " + (p.service || "website") + " from " + (p.name || "a customer"),
    body: lines.join("\n"), name: "Vernon Copy Center Website" };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || "")) msg.replyTo = p.email;
  MailApp.sendEmail(msg);
}

function doGet() {
  return ContentService.createTextOutput("Vernon Copy Center analytics is running.");
}

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sh;
}

// Text only: a value starting with = + - @ would otherwise run as a formula.
function clean_(v) {
  v = String(v || "").slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
