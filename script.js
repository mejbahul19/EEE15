/* =========================================================
   EEE 15 Query Portal — Configuration & Logic
   ========================================================= */

/*
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                    CONFIGURATION (CONFIG)                     ║
 * ║                                                               ║
 * ║  নিচের সেটিংস আপনার পছন্দ অনুযায়ী পরিবর্তন করুন:           ║
 * ║  - websiteName: ওয়েবসাইটের নাম                               ║
 * ║  - teacherName: সম্মানিত শিক্ষকের নাম                        ║
 * ║  - subjects: ড্রপডাউন বিষয় তালিকা                            ║
 * ║  - googleScriptURL: Google Apps Script URL বসান              ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const RAW_CONFIG = window.CONFIG || {};
const CONFIG = Object.assign({
    websiteName: "EEE 15 Query Portal",
    teacherName: "Dr. Md. Mehedi Hasan",
    teacherDesignation: "Assistant Professor",
    departmentName: "Department of Electrical and Electronic Engineering",
    universityName: "Jashore University of Science and Technology",
    developerName: "Md. Mejbahul Haq",
    developerPortfolio: "https://mejbahul19.github.io/",
    subjects: [
        "Circuit Theory & Network Analysis",
        "Electronics & Semiconductor Devices",
        "Signals and Linear Systems",
        "Electromagnetic Field Theory",
        "Electrical Machines",
        "Electrical Power Engineering",
        "Control Systems",
        "Digital Signal Processing",
        "Other (type your own)"
    ],
    googleScriptURL: "https://script.google.com/macros/s/AKfycby-pISJsAdU2C6B5kOPybsPN9124YUmkARrVcxfw7vIvIScd4E9KdXzueEr6nMgTzOD/exec",
    validationMessages: {
        nameRequired: "Please enter your name.",
        nameMinLength: "Name must be at least 2 characters.",
        rollRequired: "Please enter your roll / ID.",
        rollMinLength: "Roll must be at least 3 characters.",
        subjectRequired: "Please select or type a subject.",
        questionRequired: "Please write your question.",
        questionMinLength: "Please write at least 3 characters."
    }
}, RAW_CONFIG);

// Support both .googleScriptURL and .URL aliases
if (RAW_CONFIG.URL && (!RAW_CONFIG.googleScriptURL || RAW_CONFIG.googleScriptURL === CONFIG.googleScriptURL)) {
    CONFIG.googleScriptURL = RAW_CONFIG.URL;
}


/* =========================================================
   Application Engine
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initApp();
});

function initApp() {
    renderBranding();
    renderSubjects();
    bindCharCounter();
    bindSubjectToggle();
    bindThemeToggle();
    bindFormSubmit();
    bindResultButtons();
    loadSavedTheme();
}


/* ──── Branding ──── */
function renderBranding() {
    setText("site-title", CONFIG.websiteName);
    setText("site-subtitle", CONFIG.departmentName);
    setText("site-university", CONFIG.universityName);
    setText("instructor-name", CONFIG.teacherName);
    setText("developer-credit", CONFIG.developerName);

    const devLink = document.getElementById("developer-link");
    if (devLink && CONFIG.developerPortfolio) {
        devLink.href = CONFIG.developerPortfolio;
    }

    const desig = document.getElementById("instructor-designation");
    if (desig) desig.innerHTML = CONFIG.teacherDesignation + " &bull; Dept. of EEE, JUST";

    document.title = CONFIG.websiteName + " | " + CONFIG.teacherName;

    const footerYear = document.getElementById("footer-year");
    if (footerYear) footerYear.textContent = new Date().getFullYear();
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}


/* ──── Subject Dropdown + Custom Input ──── */
function renderSubjects() {
    const sel = document.getElementById("subject");
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>Select or type below</option>';
    CONFIG.subjects.forEach(function (s) {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        sel.appendChild(opt);
    });
}

function bindSubjectToggle() {
    const sel = document.getElementById("subject");
    const customWrap = document.getElementById("custom-subject-wrap");
    const customInput = document.getElementById("custom-subject");
    if (!sel || !customWrap || !customInput) return;

    customWrap.hidden = true;
    customWrap.style.display = "none";

    sel.addEventListener("change", function () {
        if (sel.value && sel.value.trim().toLowerCase().startsWith("other")) {
            customWrap.hidden = false;
            customWrap.style.display = "flex";
            customInput.required = true;
            customInput.focus();
        } else {
            customWrap.hidden = true;
            customWrap.style.display = "none";
            customInput.required = false;
            customInput.value = "";
        }
    });
}


/* ──── Theme Toggle (Light ↔ Dark) ──── */
function bindThemeToggle() {
    const btn = document.getElementById("theme-toggle-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
        const html = document.documentElement;
        const current = html.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.content = next === "dark" ? "#161514" : "#FAF6F0";

        try { localStorage.setItem("eee15_theme", next); } catch (e) { }
    });
}

function loadSavedTheme() {
    try {
        const saved = localStorage.getItem("eee15_theme");
        if (saved === "light" || saved === "dark") {
            document.documentElement.setAttribute("data-theme", saved);
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) metaTheme.content = saved === "dark" ? "#161514" : "#FAF6F0";
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    } catch (e) { }
}


/* ──── Character Counter ──── */
function bindCharCounter() {
    const ta = document.getElementById("question-details");
    const ct = document.getElementById("char-count");
    if (!ta || !ct) return;
    ta.addEventListener("input", function () { ct.textContent = ta.value.length; });
}


/* ──── Form Submit ──── */
function bindFormSubmit() {
    const form = document.getElementById("question-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        handleSubmit();
    });
}


/* ──── Result Buttons ──── */
function bindResultButtons() {
    const newBtn = document.getElementById("new-question-btn");
    const retryBtn = document.getElementById("retry-btn");
    if (newBtn) newBtn.addEventListener("click", function () { showView("form"); resetForm(); });
    if (retryBtn) retryBtn.addEventListener("click", function () { showView("form"); });
}


/* ──── Get Final Subject Value ──── */
function getSubjectValue() {
    const sel = document.getElementById("subject");
    const custom = document.getElementById("custom-subject");
    if (!sel || !sel.value) return "";

    if (sel.value.toLowerCase().startsWith("other")) {
        return custom ? custom.value.trim() : "";
    }
    return sel.value.trim();
}


/* ──── Validation (Strict 251101 - 251137 Roll Check) ──── */
function validateForm() {
    let ok = true;
    const m = CONFIG.validationMessages;
    clearErrors();

    // 1. Name
    const name = document.getElementById("student-name").value.trim();
    if (!name) { fieldError("name", m.nameRequired || "Please enter your name."); ok = false; }
    else if (name.length < 2) { fieldError("name", m.nameMinLength || "Name must be at least 2 characters."); ok = false; }

    // 2. Roll (Must be strictly between 251101 and 251137 for EEE 15 batch)
    const roll = document.getElementById("roll-number").value.trim();
    const rollNum = Number(roll);
    if (!roll) {
        fieldError("roll", m.rollRequired || "Please enter your roll number.");
        ok = false;
    } else if (!/^\d{6}$/.test(roll) || isNaN(rollNum) || rollNum < 251101 || rollNum > 251137) {
        fieldError("roll", "Roll must be between 251101 and 251137 (EEE 15 Batch).");
        ok = false;
    }

    // 3. Subject
    const subj = getSubjectValue();
    if (!subj) {
        fieldError("subject", m.subjectRequired || "Please select or type a subject.");
        ok = false;
    }

    // 4. Question
    const q = document.getElementById("question-details").value.trim();
    if (!q) { fieldError("question", m.questionRequired || "Please write your question."); ok = false; }
    else if (q.length < 3) { fieldError("question", "Please write at least 3 characters."); ok = false; }

    return ok;
}

function fieldError(key, msg) {
    const err = document.getElementById("error-" + key);
    if (err) err.textContent = msg;

    const map = {
        name: "student-name",
        roll: "roll-number",
        subject: "subject",
        question: "question-details"
    };
    const inp = document.getElementById(map[key]);
    if (inp) inp.classList.add("is-invalid");
}

function clearErrors() {
    document.querySelectorAll(".field__error").forEach(function (el) { el.textContent = ""; });
    document.querySelectorAll(".field__input").forEach(function (el) { el.classList.remove("is-invalid"); });
}


/* ──── Loading State ──── */
function setLoading(on) {
    const btn = document.getElementById("submit-btn");
    if (!btn) return;
    if (on) { btn.classList.add("is-loading"); btn.disabled = true; }
    else { btn.classList.remove("is-loading"); btn.disabled = false; }
}


/* ──── Submit Handling ──── */
function handleSubmit() {
    if (!validateForm()) return;

    const data = {
        studentName: document.getElementById("student-name").value.trim(),
        rollNumber: document.getElementById("roll-number").value.trim(),
        subject: getSubjectValue(),
        questionDetails: document.getElementById("question-details").value.trim()
    };

    setLoading(true);
    let url = (CONFIG.googleScriptURL || CONFIG.URL || "").trim();

    // 1. Placeholder Check
    if (!url || url.includes("YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
        setLoading(false);
        showView("error");
        document.getElementById("error-detail").innerHTML =
            "<strong>Google Apps Script URL বসানো হয়নি!</strong><br>" +
            "দয়া করে <code>index.html</code> ফাইলের ৫০ নম্বর লাইনে <code>googleScriptURL</code>-এর মধ্যে আপনার Web App লিঙ্কটি পেস্ট করুন।";
        return;
    }

    // 2. Accidental Google Sheet link check
    if (url.includes("docs.google.com/spreadsheets")) {
        setLoading(false);
        showView("error");
        document.getElementById("error-detail").innerHTML =
            "<strong>ভুল লিঙ্ক পেস্ট করেছেন:</strong> আপনি গুগল শিটের লিঙ্ক দিয়েছেন।<br>" +
            "গুগল শিট থেকে <em>Extensions &rarr; Apps Script &rarr; Deploy &rarr; New Deployment &rarr; Web App</em> এ গিয়ে 'Who has access: Anyone' নির্বাচন করে প্রাপ্ত Web App URL (যা <code>/exec</code> দিয়ে শেষ হয়) কপি করে <code>index.html</code>-এ বসান।";
        return;
    }

    // 3. Auto-fix /dev to /exec
    if (url.endsWith("/dev")) {
        url = url.replace(/\/dev$/, "/exec");
    }

    sendSubmission(url, data);
}


/* ──── Submission Engine (JSONP with Fallback) ──── */
function sendSubmission(baseUrl, data) {
    const cb = "eee15cb_" + Date.now();
    let handled = false;

    function cleanup() {
        if (window[cb]) delete window[cb];
        const oldScript = document.getElementById(cb);
        if (oldScript) oldScript.remove();
    }

    function markSuccess(questionId) {
        if (handled) return;
        handled = true;
        cleanup();
        setLoading(false);
        showView("success");
        const qidEl = document.getElementById("success-question-id");
        if (qidEl) qidEl.textContent = questionId || ("EEE15-" + data.rollNumber);
        resetForm();
    }

    function markError(errorMsg) {
        if (handled) return;
        handled = true;
        cleanup();
        setLoading(false);
        showView("error");
        const det = document.getElementById("error-detail");
        if (det) {
            det.innerHTML = errorMsg;
        }
    }

    // Set JSONP callback
    window[cb] = function (res) {
        if (res && res.success) {
            markSuccess(res.questionId);
        } else {
            markError((res && res.message) ? res.message : "গুগল শিটে ডাটা সেভ করতে সমস্যা হয়েছে।");
        }
    };

    // Build URL query params for GET
    const parts = [];
    for (var k in data) {
        if (data.hasOwnProperty(k)) {
            parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(data[k]));
        }
    }
    parts.push("action=submit");
    parts.push("callback=" + cb);
    const getUrl = baseUrl + (baseUrl.includes("?") ? "&" : "?") + parts.join("&");

    const scriptEl = document.createElement("script");
    scriptEl.id = cb;
    scriptEl.src = getUrl;
    scriptEl.onerror = function () {
        markError(
            "<strong>গুগল শিটের সাথে সংযোগ করা যায়নি!</strong><br><br>" +
            "Google Apps Script-এর পারমিশন সেটিংসে <em>'Who has access'</em> অপশনটি <strong>'Anyone'</strong> দেওয়া নেই। ফলে গুগল লগইন পেজে রিকোয়েস্ট আটকে গেছে।<br><br>" +
            "<strong>সমাধান:</strong> Apps Script-এ গিয়ে <strong>Deploy &rarr; Manage deployments &rarr; Edit (পেন্সিল) &rarr; Who has access: Anyone</strong> নির্বাচন করে Save করুন।"
        );
    };

    document.body.appendChild(scriptEl);

    // Safety timeout (15 seconds)
    setTimeout(function () {
        if (!handled) {
            markError(
                "<strong>সার্ভার টাইমআউট বা পারমিশন সমস্যা!</strong><br><br>" +
                "গুগল স্ক্রিপ্ট থেকে নির্ধারিত সময়ে কোনো রেসপন্স আসেনি। এর কারণ আপনার Web App লিংকে <em>'Who has access: Anyone'</em> সিলেক্ট করা হয়নি অথবা লিঙ্কটি ভুল।<br><br>" +
                "দয়া করে নিশ্চিত করুন যে Apps Script ডিপ্লয়মেন্টে <strong>'Anyone'</strong> দেওয়া আছে।"
            );
        }
    }, 15000);
}


/* ──── View Switching ──── */
function showView(v) {
    var f = document.getElementById("form-section");
    var s = document.getElementById("success-message");
    var e = document.getElementById("error-message");
    if (f) f.hidden = true; if (s) s.hidden = true; if (e) e.hidden = true;
    if (v === "form" && f) f.hidden = false;
    else if (v === "success" && s) s.hidden = false;
    else if (v === "error" && e) e.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ──── Reset ──── */
function resetForm() {
    var form = document.getElementById("question-form");
    if (form) form.reset();
    var ct = document.getElementById("char-count");
    if (ct) ct.textContent = "0";
    var cw = document.getElementById("custom-subject-wrap");
    if (cw) {
        cw.hidden = true;
        cw.style.display = "none";
    }
    clearErrors();
}
