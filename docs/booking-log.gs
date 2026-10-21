/**
 * The Vernon Copy Center: booking log + dashboard
 *
 * Every quote request sent from vernoncopycenter.com lands as a row in the "Requests" tab.
 * The "Dashboard" tab shows totals, requests by service, month and weekday, open jobs and
 * upcoming deadlines, with charts, all updating live.
 *
 * Setup (once):
 *  1. Create a Google Sheet (for example "Vernon Copy Center Bookings").
 *  2. Extensions > Apps Script. Delete what's there, paste this whole file, Save.
 *  3. In the function dropdown pick "setup" and click Run. Approve the permissions.
 *     This builds the Requests and Dashboard tabs.
 *  4. Deploy > New deployment > type "Web app".
 *     Execute as: Me. Who has access: Anyone. Deploy, then copy the Web app URL.
 *  5. Send that URL to be added to the website (QUOTE_LOG in script.js).
 *
 * Optional: put an email address in NOTIFY_EMAIL to get an email for each new request.
 * If you edit this file later, use Deploy > Manage deployments > Edit > New version,
 * so the website URL stays the same.
 */

var NOTIFY_EMAIL = "";            // e.g. "copycenter@warwick.net" (blank = no emails)
var TZ = "America/New_York";

var REQ = "Requests";
var DASH = "Dashboard";
var HEADERS = ["Received", "Name", "Email", "Phone", "Service", "Needed by", "Project details",
  "Status", "Notes", "Source page"];
var SERVICES = ["Printing", "Copying", "Graphic design", "Business services", "Notary",
  "Document shredding", "Other / Not sure yet"];
var STATUSES = ["New", "Contacted", "Quoted", "In progress", "Ready for pickup", "Completed", "Cancelled"];

var BLUE = "#0b47b0", BLUE_DEEP = "#08368a", PINK = "#f0168c", PINK_SOFT = "#fde3f1",
  BLUE_SOFT = "#e8effb", INK = "#0b1a3d";

/* ---------- website endpoint ---------- */

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return ContentService.createTextOutput("ok");   // honeypot: bots fill hidden fields
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = requestsSheet_();
    var clean = function (v, max) {
      v = String(v || "").trim().slice(0, max || 2000);
      return /^[=+\-@]/.test(v) ? "'" + v : v;     // text only, never a formula
    };
    var needed = "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(p.deadline || "")) {
      var d = p.deadline.split("-");
      needed = new Date(+d[0], +d[1] - 1, +d[2]);
    }
    sh.appendRow([new Date(), clean(p.name, 200), clean(p.email, 200), clean(p.phone, 40),
      clean(p.service, 80), needed, clean(p.details), "New", "", clean(p.page, 300)]);
    if (NOTIFY_EMAIL) notify_(p, needed);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

function doGet() {
  return ContentService.createTextOutput("Vernon Copy Center booking log is running.");
}

function notify_(p, needed) {
  var body = [
    "New quote request from vernoncopycenter.com", "",
    "Name: " + (p.name || ""), "Email: " + (p.email || ""), "Phone: " + (p.phone || "-"),
    "Service: " + (p.service || ""),
    "Needed by: " + (needed ? Utilities.formatDate(needed, TZ, "EEE, MMM d, yyyy") : "-"), "",
    "Project details:", p.details || "", "",
    "Open the sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join("\n");
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: p.email || NOTIFY_EMAIL,
    subject: "New quote request: " + (p.service || "Copy Center") + " from " + (p.name || "website"),
    body: body
  });
}

/* ---------- one-time setup ---------- */

function setup() {
  requestsSheet_();
  buildDashboard();
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DASH));
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Copy Center")
    .addItem("Rebuild dashboard", "buildDashboard")
    .addItem("Add a test request", "addTestRequest")
    .addToUi();
}

function addTestRequest() {
  doPost({ parameter: { name: "Test Customer", email: "test@example.com", phone: "973-555-0100",
    service: "Printing", deadline: Utilities.formatDate(new Date(Date.now() + 5 * 864e5), TZ, "yyyy-MM-dd"),
    details: "Test request: 100 color flyers, 8.5 x 11. Delete this row when you're done.", page: "test" } });
}

function requestsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TZ);
  var sh = ss.getSheetByName(REQ);
  if (!sh) {
    sh = ss.insertSheet(REQ, 0);
    var blank = ss.getSheetByName("Sheet1");
    if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  }
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold").setFontColor("#ffffff").setBackground(BLUE).setFontFamily("Poppins");
    sh.setRowHeight(1, 34);
    sh.getRange(1, 1, 1, HEADERS.length).setVerticalAlignment("middle");
    var widths = [150, 160, 210, 120, 150, 120, 380, 140, 220, 160];
    widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
    sh.getRange("A2:A").setNumberFormat("mmm d, yyyy h:mm am/pm");
    sh.getRange("F2:F").setNumberFormat("ddd, mmm d, yyyy");
    sh.getRange("G2:G").setWrap(true);
    sh.getRange("A2:J").setVerticalAlignment("top").setFontFamily("Poppins").setFontColor(INK);
    sh.getRange("A1:J").applyRowBanding(SpreadsheetApp.BandingTheme.BLUE, true, false)
      .setHeaderRowColor(BLUE).setFirstRowColor("#ffffff").setSecondRowColor(BLUE_SOFT);

    var status = sh.getRange("H2:H");
    status.setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(STATUSES, true).setAllowInvalid(false).build());
    var colors = { "New": [PINK, "#ffffff"], "Contacted": ["#fff3c4", INK], "Quoted": ["#dbe7ff", BLUE_DEEP],
      "In progress": ["#cfe0ff", BLUE_DEEP], "Ready for pickup": [PINK_SOFT, "#a80a5e"],
      "Completed": ["#d9f2e4", "#12643e"], "Cancelled": ["#eceff4", "#6b7385"] };
    var rules = Object.keys(colors).map(function (s) {
      return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s)
        .setBackground(colors[s][0]).setFontColor(colors[s][1]).setBold(s === "New")
        .setRanges([status]).build();
    });
    // deadline within 3 days on an open job: pink text
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($F2<>"",$F2-TODAY()<=3,$H2<>"Completed",$H2<>"Cancelled")')
      .setFontColor(PINK).setBold(true).setRanges([sh.getRange("F2:F")]).build());
    sh.setConditionalFormatRules(rules);
  }
  return sh;
}

/* ---------- dashboard ---------- */

function buildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var old = ss.getSheetByName(DASH);
  if (old) ss.deleteSheet(old);
  var d = ss.insertSheet(DASH, 0);
  d.setHiddenGridlines(true);
  d.getRange("A1:L60").setFontFamily("Poppins").setFontColor(INK).setVerticalAlignment("middle");
  for (var c = 1; c <= 12; c++) d.setColumnWidth(c, 118);
  d.setColumnWidth(1, 150);

  // title band
  d.getRange("A1:L1").merge().setValue("Vernon Copy Center  ·  Booking dashboard")
    .setBackground(BLUE).setFontColor("#ffffff").setFontSize(18).setFontWeight("bold");
  d.setRowHeight(1, 52);
  d.getRange("A2:L2").merge().setFormula('="Updated live from the website  ·  "&TEXT(NOW(),"ddd mmm d, h:mm am/pm")')
    .setBackground(PINK).setFontColor("#ffffff").setFontSize(10);

  // KPI cards
  var R = "Requests!";
  var kpis = [
    ["Total requests", "=COUNTA(" + R + "B2:B)"],
    ["Today", "=COUNTIFS(" + R + "A2:A,\">=\"&TODAY())"],
    ["This week", "=COUNTIFS(" + R + "A2:A,\">=\"&(TODAY()-WEEKDAY(TODAY(),3)))"],
    ["This month", "=COUNTIFS(" + R + "A2:A,\">=\"&(EOMONTH(TODAY(),-1)+1))"],
    ["Open jobs", "=COUNTIFS(" + R + "B2:B,\"<>\"," + R + "H2:H,\"<>Completed\"," + R + "H2:H,\"<>Cancelled\")"],
    ["Completed", "=COUNTIF(" + R + "H2:H,\"Completed\")"]
  ];
  kpis.forEach(function (k, i) {
    var col = 1 + i * 2;
    d.getRange(4, col, 1, 2).merge().setValue(k[0]).setFontSize(9).setFontColor("#46536f")
      .setBackground(BLUE_SOFT).setHorizontalAlignment("center");
    d.getRange(5, col, 1, 2).merge().setFormula(k[1]).setFontSize(26).setFontWeight("bold")
      .setFontColor(i === 4 ? PINK : BLUE).setBackground(BLUE_SOFT).setHorizontalAlignment("center");
    d.getRange(4, col, 2, 2).setBorder(true, true, true, true, null, null, "#ffffff",
      SpreadsheetApp.BorderStyle.SOLID_THICK);
  });
  d.setRowHeight(5, 56);

  // tables
  function head(range, title) {
    d.getRange(range).merge().setValue(title).setBackground(BLUE).setFontColor("#ffffff").setFontWeight("bold");
  }
  // by service (A8:B15)
  head("A7:B7", "Requests by service");
  d.getRange("A8:B8").setValues([["Service", "Requests"]]).setFontWeight("bold").setFontColor(BLUE);
  SERVICES.forEach(function (s, i) {
    d.getRange(9 + i, 1).setValue(s);
    d.getRange(9 + i, 2).setFormula("=COUNTIF(" + R + "E2:E,A" + (9 + i) + ")");
  });
  // by month, last 12 (D8:E20)
  head("D7:E7", "Last 12 months");
  d.getRange("D8:E8").setValues([["Month", "Requests"]]).setFontWeight("bold").setFontColor(BLUE);
  for (var m = 0; m < 12; m++) {
    var r = 9 + m;
    d.getRange(r, 4).setFormula("=EDATE(EOMONTH(TODAY(),-1)+1," + (m - 11) + ")").setNumberFormat("mmm yyyy");
    d.getRange(r, 5).setFormula("=COUNTIFS(" + R + "A2:A,\">=\"&D" + r + "," + R + "A2:A,\"<\"&EDATE(D" + r + ",1))");
  }
  // by weekday (G8:H15)
  head("G7:H7", "Busiest days");
  d.getRange("G8:H8").setValues([["Day", "Requests"]]).setFontWeight("bold").setFontColor(BLUE);
  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(function (day, i) {
    d.getRange(9 + i, 7).setValue(day);
    d.getRange(9 + i, 8).setFormula("=SUMPRODUCT((" + R + "A2:A<>\"\")*(WEEKDAY(" + R + "A2:A,2)=" + (i + 1) + "))");
  });
  // by status (J8:K15)
  head("J7:K7", "Job status");
  d.getRange("J8:K8").setValues([["Status", "Jobs"]]).setFontWeight("bold").setFontColor(BLUE);
  STATUSES.forEach(function (s, i) {
    d.getRange(9 + i, 10).setValue(s);
    d.getRange(9 + i, 11).setFormula("=COUNTIF(" + R + "H2:H,J" + (9 + i) + ")");
  });
  d.getRange("A9:K20").setFontSize(10);
  ["B9:B15", "E9:E20", "H9:H15", "K9:K15"].forEach(function (a) { d.getRange(a).setHorizontalAlignment("center"); });

  // charts
  var pie = d.newChart().asPieChart().addRange(d.getRange("A8:B15")).setPosition(23, 1, 0, 0)
    .setOption("title", "Requests by service").setOption("pieHole", 0.5).setOption("width", 470).setOption("height", 300)
    .setOption("colors", [BLUE, PINK, "#2f72ea", "#ff5cb4", "#5a33c4", "#8fb2f2", "#f7a8d2"])
    .setOption("legend", { position: "right" }).build();
  var months = d.newChart().asColumnChart().addRange(d.getRange("D8:E20")).setPosition(23, 5, 0, 0)
    .setOption("title", "Requests per month").setOption("width", 470).setOption("height", 300)
    .setOption("colors", [BLUE]).setOption("legend", { position: "none" }).build();
  var days = d.newChart().asBarChart().addRange(d.getRange("G8:H15")).setPosition(23, 9, 30, 0)
    .setOption("title", "Busiest days").setOption("width", 400).setOption("height", 300)
    .setOption("colors", [PINK]).setOption("legend", { position: "none" }).build();
  d.insertChart(pie); d.insertChart(months); d.insertChart(days);

  // upcoming deadlines and latest requests (row 40+)
  head("A39:E39", "Upcoming deadlines (open jobs)");
  d.getRange("A40:D40").setValues([["Needed by", "Name", "Service", "Status"]]).setFontWeight("bold").setFontColor(BLUE);
  d.getRange("A41").setFormula('=IFERROR(ARRAY_CONSTRAIN(SORT(FILTER({' + R + 'F2:F,' + R + 'B2:B,' + R + 'E2:E,' + R + 'H2:H},' +
    R + 'F2:F>=TODAY(),' + R + 'H2:H<>"Completed",' + R + 'H2:H<>"Cancelled"),1,TRUE),15,4),"Nothing due")');
  d.getRange("A41:A55").setNumberFormat("ddd, mmm d");

  head("G39:L39", "Latest requests");
  d.getRange("G40:J40").setValues([["Received", "Name", "Service", "Status"]]).setFontWeight("bold").setFontColor(BLUE);
  d.getRange("G41").setFormula('=IFERROR(ARRAY_CONSTRAIN(SORT(FILTER({' + R + 'A2:A,' + R + 'B2:B,' + R + 'E2:E,' + R + 'H2:H},' +
    R + 'A2:A<>""),1,FALSE),15,4),"No requests yet")');
  d.getRange("G41:G55").setNumberFormat("mmm d, h:mm am/pm");
  d.getRange("A41:L55").setFontSize(10);
}
