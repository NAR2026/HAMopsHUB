/* ============================================================
   Theme
   ============================================================ */
function applyTheme(){ const s = localStorage.getItem("tk_ham_theme") || "light"; if(s === "dark") document.documentElement.dataset.theme = "dark"; else document.documentElement.removeAttribute("data-theme"); const i = $("themeIcon"); if(i) i.innerHTML = s === "dark" ? `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>` : `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`; }
$("btnTheme").addEventListener("click", () => { const c = localStorage.getItem("tk_ham_theme") || "light"; localStorage.setItem("tk_ham_theme", c === "dark" ? "light" : "dark"); applyTheme(); });
