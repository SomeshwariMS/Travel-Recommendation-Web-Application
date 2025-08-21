// SPA router: show section by hash (#home, #about, #contact)
function renderRoute() {
  const hash = (location.hash || "#home").toLowerCase();
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  const target = document.querySelector(hash);
  (target || document.querySelector("#home")).classList.add("active");

  // Search bar only on Home as per guidelines
  document.getElementById("searchBar").style.visibility =
    hash === "#home" ? "visible" : "hidden";
}
window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", () => {
  renderRoute();
  wireUI();
  loadData(); // fetch JSON (with fallback) once at start
});

// ---------- DATA LOADING ----------
let DATA = null;

// Fallback images for placeholders in the given JSON
const FALLBACKS = {
  "sydney": "https://images.unsplash.com/photo-1510746512290-9d4812e48e9b?q=80&w=1400&auto=format&fit=crop",
  "melbourne": "https://images.unsplash.com/photo-1542300058-0f4be9c3cde7?q=80&w=1400&auto=format&fit=crop",
  "tokyo": "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1400&auto=format&fit=crop",
  "kyoto": "https://images.unsplash.com/photo-1553514029-1318c9127859?q=80&w=1400&auto=format&fit=crop",
  "rio": "https://images.unsplash.com/photo-1526406915894-6c1d6f3e4bb9?q=80&w=1400&auto=format&fit=crop",
  "sao-paulo": "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1400&auto=format&fit=crop",
  "angkor-wat": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1400&auto=format&fit=crop",
  "taj-mahal": "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1400&auto=format&fit=crop",
  "bora-bora": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1400&auto=format&fit=crop",
  "copacabana": "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=1400&auto=format&fit=crop"
};

// Built-in fallback data (in case fetch is blocked by file://)
const LOCAL_FALLBACK = {
  countries: [
    {
      id: 1, name: "Australia",
      cities: [
        { name: "Sydney, Australia", imageUrl: FALLBACKS["sydney"],
          description: "Beautiful harbour city with the Opera House, Harbour Bridge and beaches." },
        { name: "Melbourne, Australia", imageUrl: FALLBACKS["melbourne"],
          description: "Arts, coffee culture and laneways — Australia’s cultural capital." }
      ]
    },
    {
      id: 2, name: "Japan",
      cities: [
        { name: "Tokyo, Japan", imageUrl: FALLBACKS["tokyo"],
          description: "Ultra-modern meets tradition; food, tech and neon nights." },
        { name: "Kyoto, Japan", imageUrl: FALLBACKS["kyoto"],
          description: "Temples, gardens and teahouses with timeless charm." }
      ]
    },
    {
      id: 3, name: "Brazil",
      cities: [
        { name: "Rio de Janeiro, Brazil", imageUrl: FALLBACKS["rio"],
          description: "Christ the Redeemer, Sugarloaf and a carnival spirit." },
        { name: "São Paulo, Brazil", imageUrl: FALLBACKS["sao-paulo"],
          description: "Big-city energy, culture and incredible cuisine." }
      ]
    }
  ],
  temples: [
    { id: 1, name: "Angkor Wat, Cambodia", imageUrl: FALLBACKS["angkor-wat"],
      description: "UNESCO site and the world’s largest religious monument." },
    { id: 2, name: "Taj Mahal, India", imageUrl: FALLBACKS["taj-mahal"],
      description: "Iconic marble mausoleum and symbol of love." }
  ],
  beaches: [
    { id: 1, name: "Bora Bora, French Polynesia", imageUrl: FALLBACKS["bora-bora"],
      description: "Turquoise lagoon and overwater bungalows." },
    { id: 2, name: "Copacabana Beach, Brazil", imageUrl: FALLBACKS["copacabana"],
      description: "Golden curve of sand with a vibrant scene." }
  ]
};

async function loadData() {
  try {
    const res = await fetch("travel_recommendation_api.json");
    if (!res.ok) throw new Error("Fetch failed");
    const json = await res.json();
    DATA = normalizeImages(json);
  } catch (e) {
    // Use local fallback if fetching local JSON is blocked
    DATA = LOCAL_FALLBACK;
  }
}

// Replace placeholder image strings with real URLs
function normalizeImages(json) {
  const clone = JSON.parse(JSON.stringify(json));
  const fix = (name, url) => {
    const key = name.toLowerCase()
      .replace("sydney, australia","sydney")
      .replace("melbourne, australia","melbourne")
      .replace("tokyo, japan","tokyo")
      .replace("kyoto, japan","kyoto")
      .replace("rio de janeiro, brazil","rio")
      .replace("são paulo, brazil","sao-paulo")
      .replace("angkor wat, cambodia","angkor-wat")
      .replace("taj mahal, india","taj-mahal")
      .replace("bora bora, french polynesia","bora-bora")
      .replace("copacabana beach, brazil","copacabana");
    if (url && !url.startsWith("enter_your_image")) return url;
    return FALLBACKS[key] || FALLBACKS["bora-bora"];
  };

  clone.countries?.forEach(c =>
    c.cities?.forEach(city => city.imageUrl = fix(city.name, city.imageUrl)));
  clone.temples?.forEach(t => t.imageUrl = fix(t.name, t.imageUrl));
  clone.beaches?.forEach(b => b.imageUrl = fix(b.name, b.imageUrl));
  return clone;
}

// ---------- UI & SEARCH ----------
function wireUI() {
  document.getElementById("searchBtn").addEventListener("click", search);
  document.getElementById("resetBtn").addEventListener("click", reset);
  document.getElementById("searchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); search(); }
  });
  document.getElementById("bookBtn").addEventListener("click", () =>
    alert("Booking feature coming soon!"));
}

function search() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const out = document.getElementById("results");
  out.innerHTML = "";

  if (!DATA || !q) {
    if (!q) out.innerHTML = "<p>Type a keyword: <em>beach</em>, <em>temple</em>, or a country like <em>Japan</em>.</p>";
    return;
  }

  let results = [];

  // beaches/temples keywords (accept plural/any case)
  if (/^beach(es)?$/.test(q)) results.push(...(DATA.beaches || []).slice(0,2));
  if (/^temple(s)?$/.test(q)) results.push(...(DATA.temples || []).slice(0,2));

  // country name → two cities
  DATA.countries?.forEach(country => {
    if (country.name.toLowerCase() === q) {
      results.push(...(country.cities || []).slice(0,2));
    }
  });

  // also try city match (optional)
  DATA.countries?.forEach(country => {
    country.cities?.forEach(city => {
      if (city.name.toLowerCase().includes(q)) results.push(city);
    });
  });

  if (!results.length) {
    out.innerHTML = `<p>No results found for <strong>${q}</strong>.</p>`;
    return;
  }

  results.slice(0,6).forEach(item => out.appendChild(card(item)));
  // jump to results
  location.hash = "#home";
  window.scrollTo({top: document.getElementById("results").offsetTop - 20, behavior: "smooth"});
}

function reset() {
  document.getElementById("searchInput").value = "";
  document.getElementById("results").innerHTML = "";
}

function card(item){
  const el = document.createElement("article");
  el.className = "card";
  el.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}">
    <div class="body">
      <span class="chip">Recommendation</span>
      <h3>${item.name}</h3>
      <p>${item.description || ""}</p>
      <button class="btn btn-primary" onclick="alert('Opening details for ${item.name}…')">Visit</button>
    </div>
  `;
  return el;
}
