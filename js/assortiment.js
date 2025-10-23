import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://zwczthjsxzstedtodgfe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3p0aGpzeHpzdGVkdG9kZ2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA1NDEsImV4cCI6MjA3NjIwNjU0MX0.R1MFe-WIb1Nju-D27BfY1BiFkDo_V_PKthMP3hhkhDc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Haal radio buttons op
const radioHaardplaten = document.getElementById("option1");
const radioHaardbokken = document.getElementById("option2");

// Functie om kaarten te renderen op basis van de geselecteerde filter
async function renderHaardplaten() {
  const isHaardplaat = radioHaardplaten.checked; // true als Haardplaten geselecteerd
  const { data, error } = await supabase.from("haardplaten").select("*");

  if (error) {
    console.error(error);
    return;
  }

  const container = document.querySelector("#haardplaten-container");
  container.innerHTML = ""; // eerst leegmaken

  // Maak één rij voor alle kaarten
  const row = document.createElement("div");
  row.classList.add("row", "g-4");

  data.forEach(p => {
    if (p.isHaardplaat === isHaardplaat) {
      const col = document.createElement("div");
      col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${p.afbeelding}" class="card-img-top" alt="${p.titel}">
          <div class="card-body">
            ${p.isVerkocht ? `<h5 class="card-text text-danger">Verkocht</h5>` : 
            `<h5 class="card-title fw-bold text-secondary">${p.titel}</h5>
            ${p.beschrijving ? `<p class="card-text fw-bold fst-italic">${p.beschrijving}</p>` : ""}
            <p class="card-text price">€${p.prijs}</p>
            <p class="card-text">${p.code}</p>
            <p class="card-text">${p.afmeting}</p>`}

          </div>
        </div>
      `;
      row.appendChild(col);
    }
  });

  container.appendChild(row);
}


// Event listeners op radio buttons
radioHaardplaten.addEventListener("change", renderHaardplaten);
radioHaardbokken.addEventListener("change", renderHaardplaten);

// Initieel renderen
renderHaardplaten();
