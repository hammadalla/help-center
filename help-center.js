let content = { categories: [], articles: [] };

// مسارات الملفات لكل لغة
const FILES = {
  en: {
    css: "help-center.css",
    json: "helpcenter-data.json",
    searchPh: "Search articles...",
    btnLabel: "عربي"
  },
  ar: {
    css: "./help-center-ar/help-center-ar.css",
    json: "./help-center-ar/helpcenter-data-ar.json",
    searchPh: "ابحث في المقالات...",
    btnLabel: "English"
  }
};

// تحميل افتراضي إنجليزي
switchLanguage("en");

function switchLanguage(lang) {
  const html = document.documentElement;
  const mainStyle = document.getElementById("mainStyle");
  const search = document.getElementById("search");
  const toggleBtn = document.getElementById("langToggle");

  // خصائص الاتجاه واللغة
  if (lang === "ar") {
    html.lang = "ar";
    html.dir = "rtl";
    document.body.classList.add("rtl");

    document.getElementById("pageTitle").textContent = "مركز المساعدة";
    document.getElementById("pageSubtitle").textContent = "ابحث عن إجابات أو تصفح الفئات";
    document.getElementById("homeBtn").textContent = "الرئيسية";
    document.getElementById("backBtn").textContent = "رجوع";
    document.getElementById("articlesTitle").textContent = "المقالات";
    document.getElementById("resultsLabel").textContent = "النتائج:";
    document.getElementById("ratingQuestion").textContent = "هل كانت هذه المعلومات مفيدة؟";
    document.getElementById("btnYes").textContent = "نعم";
    document.getElementById("btnNo").textContent = "لا";
  } else {
    html.lang = "en";
    html.dir = "ltr";
    document.body.classList.remove("rtl");

    document.getElementById("pageTitle").textContent = "Help Center";
    document.getElementById("pageSubtitle").textContent = "Find answers or browse categories";
    document.getElementById("homeBtn").textContent = "Home";
    document.getElementById("backBtn").textContent = "Back";
    document.getElementById("articlesTitle").textContent = "Articles";
    document.getElementById("resultsLabel").textContent = "Results:";
    document.getElementById("ratingQuestion").textContent = "Was this information helpful?";
    document.getElementById("btnYes").textContent = "Yes";
    document.getElementById("btnNo").textContent = "No";
  }

  // تبديل الاستايل
  mainStyle.href = FILES[lang].css;

  // Placeholder + نص زرار
  search.placeholder = FILES[lang].searchPh;
  toggleBtn.textContent = FILES[lang].btnLabel;

  // تحميل الداتا
  loadData(FILES[lang].json);
}

function loadData(file) {
  fetch(file)
    .then(res => {
      if (!res.ok) throw new Error(`JSON not found: ${file}`);
      return res.json();
    })
    .then(data => {
      content = data;
      loadCategories();
      renderList(content.articles);
    })
    .catch(err => {
      console.error("Error loading data:", err);
      // لو فشل العربي، يرجع للإنجليزي كـ fallback
      if (document.documentElement.lang === "ar") {
        switchLanguage("en");
      }
    });
}

function loadCategories() {
  const categoriesEl = document.getElementById("categories");
  categoriesEl.innerHTML = "";
  content.categories.forEach(cat => {
    const item = document.createElement("a");
    item.className = "list-group-item list-group-item-action";
    item.innerHTML = `<i class="fa-solid ${cat.icon} mr-2"></i> ${cat.name}`;
    item.addEventListener("click", () => {
      const filtered = content.articles.filter(a => a.cat === cat.name);
      renderList(filtered);

      // قفل السايدبار في الموبايل بعد الاختيار
      if (window.innerWidth < 768) {
        document.getElementById("sidebar").classList.remove("active");
      }
    });
    categoriesEl.appendChild(item);
  });
}

function renderList(items) {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";
  items.forEach(a => {
    const col = document.createElement("div");
    col.className = "col-md-6 mb-3";
    col.innerHTML = `
      <div class="card-article p-3 shadow-sm" onclick="openArticle(${a.id})">
        <h6>${a.title}</h6>
        <p>${a.intro}</p>
      </div>`;
    resultsEl.appendChild(col);
  });
  document.getElementById("count").textContent = items.length;
}

window.openArticle = function (id) {
  const a = content.articles.find(x => x.id === id);
  if (!a) return;
  document.getElementById("articleTitle").textContent = a.title;
  document.getElementById("articleIntro").textContent = a.intro;
  document.getElementById("crumbs").textContent = `${a.cat} › ${a.title}`;
  const stepsEl = document.getElementById("articleSteps");
  stepsEl.innerHTML = "";
  a.steps.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    stepsEl.appendChild(li);
  });

  const extraLink = document.getElementById("extraLink");
  if (a.link) {
    extraLink.href = a.link;
    extraLink.textContent = (document.documentElement.lang === "ar") ? "اضغط هنا" : "Click here";
    extraLink.style.display = "inline-block";
  } else {
    extraLink.style.display = "none";
  }

  document.getElementById("listView").style.display = "none";
  document.getElementById("articleView").style.display = "block";
};

// بحث
document.getElementById("searchBtn").addEventListener("click", doSearch);
document.getElementById("search").addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch();
});
function doSearch() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  if (!q) return renderList(content.articles);
  const res = content.articles.filter(a =>
    (a.title + " " + a.intro + " " + a.cat).toLowerCase().includes(q)
  );
  renderList(res);
}

// تبديل اللغة بالزر
document.getElementById("langToggle").addEventListener("click", () => {
  const isEn = document.documentElement.lang === "en";
  switchLanguage(isEn ? "ar" : "en");
});

// فتح/قفل السايدبار في الموبايل
document.getElementById("toggleSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("active");
});
document.getElementById("closeSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("active");
});

// زر Back
document.getElementById("backBtn").addEventListener("click", () => {
  document.getElementById("articleView").style.display = "none";
  document.getElementById("listView").style.display = "block";
});
