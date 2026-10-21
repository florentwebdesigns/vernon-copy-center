/**
 * The Vernon Copy Center: call + booking analytics
 *
 * Same idea as the Stu Plumbing sheet. The website logs:
 *   Calls tab:    every time someone taps a phone number (time, device, page)
 *   Email tab:    every time someone taps the email address (time, device, page)
 *   Bookings tab: every quote request sent from the form (time, contact info, service, device, page)
 * Each booking is also texted to Katie (see SMS settings below) and emailed to NOTIFY_EMAIL,
 * where hitting Reply answers the customer directly.
 * The tabs are created automatically the first time something is logged.
 *
 * Setup: Extensions > Apps Script, replace everything in Code.gs with this file, save.
 * Then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone),
 * or, if you already deployed: Deploy > Manage deployments > pencil > Version: New version > Deploy
 * (that keeps the same URL).
 */
var NOTIFY_EMAIL = "copycenter@warwick.net";   // Katie gets an email for every booking ("" = off)

/* Text message alert for every booking. Two ways, use one:
 *  A) Free: carrier email-to-text. Put her CELL number + carrier gateway here, e.g.
 *     Verizon "9735551234@vtext.com", T-Mobile "9735551234@tmomail.net",
 *     US Cellular "9735551234@email.uscc.net". (AT&T ended its free gateway in 2025, use B.)
 *  B) Any carrier: Twilio. In Apps Script, Project Settings > Script Properties, add
 *     TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM (+1...) and TWILIO_TO (+1 her cell). */
var SMS_GATEWAY = "";
var CALLS = "Calls";
var EMAILS = "Email";
var BOOKINGS = "Bookings";
var CALL_HEADERS = ["Tapped Call", "Device", "Page"];
var EMAIL_HEADERS = ["Tapped Email", "Device", "Page"];
var BOOKING_HEADERS = ["Booked", "Name", "Email", "Phone", "Service", "Needed By", "Details", "Device", "Page"];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return ContentService.createTextOutput("ok");   // spam trap field
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (p.type === "call") {
      sheet_(CALLS, CALL_HEADERS).appendRow([new Date(), clean_(p.device), clean_(p.page)]);
    } else if (p.type === "email") {
      sheet_(EMAILS, EMAIL_HEADERS).appendRow([new Date(), clean_(p.device), clean_(p.page)]);
    } else if (p.type === "booking") {
      sheet_(BOOKINGS, BOOKING_HEADERS).appendRow([new Date(), clean_(p.name), clean_(p.email),
        clean_(p.phone), clean_(p.service), clean_(p.deadline), clean_(p.details),
        clean_(p.device), clean_(p.page)]);
      try { if (NOTIFY_EMAIL) notify_(p); } catch (err) { console.error(err); }
      text_(p);
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

function text_(p) {
  var sms = "New quote: " + (p.name || "Customer") + ", " + (p.service || "") +
    (p.phone ? ", " + p.phone : "") + (p.email ? ", " + p.email : "") +
    (p.deadline ? ", by " + p.deadline : "") + ". " + String(p.details || "").slice(0, 60);
  sms = sms.slice(0, 300);
  try {
    if (SMS_GATEWAY) MailApp.sendEmail(SMS_GATEWAY, "", sms);
    var props = PropertiesService.getScriptProperties().getProperties();
    if (props.TWILIO_SID && props.TWILIO_TOKEN && props.TWILIO_FROM && props.TWILIO_TO) {
      UrlFetchApp.fetch("https://api.twilio.com/2010-04-01/Accounts/" + props.TWILIO_SID + "/Messages.json", {
        method: "post",
        payload: { To: props.TWILIO_TO, From: props.TWILIO_FROM, Body: sms },
        headers: { Authorization: "Basic " + Utilities.base64Encode(props.TWILIO_SID + ":" + props.TWILIO_TOKEN) },
        muteHttpExceptions: true
      });
    }
  } catch (err) { console.error(err); }  // a failed text never blocks the booking row
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
