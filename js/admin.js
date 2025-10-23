import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://zwczthjsxzstedtodgfe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3p0aGpzeHpzdGVkdG9kZ2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA1NDEsImV4cCI6MjA3NjIwNjU0MX0.R1MFe-WIb1Nju-D27BfY1BiFkDo_V_PKthMP3hhkhDc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
let currentEditId = null;

// DOM elementen
const loginContainer = document.getElementById("login-container");
const dashboard = document.getElementById("admin-dashboard");
const openModalBtn = document.getElementById("open-modal-btn");
const modal = new bootstrap.Modal(document.getElementById("plaatModal"));
const platenContainer = document.getElementById("haardplaten-container");
const form = document.getElementById("plaat-form");

// Inloggen
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert("Login mislukt: " + error.message);
  loginContainer.style.display = "none";
  dashboard.style.display = "block";
  renderHaardplaten();
});

// Filter-knoppen
const radioHaardplaten = document.getElementById("option1");
const radioHaardbokken = document.getElementById("option2");
radioHaardplaten.addEventListener("change", renderHaardplaten);
radioHaardbokken.addEventListener("change", renderHaardplaten);

// Renderen
async function renderHaardplaten() {
  const isHaardplaat = radioHaardplaten.checked;
  const { data, error } = await supabase.from("haardplaten").select("*");
  if (error) return console.error(error);

  platenContainer.innerHTML = "";
  const row = document.createElement("div");
  row.classList.add("row", "g-4");

  data
    .filter(p => p.isHaardplaat === isHaardplaat)
    .forEach(p => {
      const col = document.createElement("div");
      col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${p.afbeelding}" class="card-img-top" alt="${p.titel}">
          <div class="card-body">
            <h5 class="card-title fw-bold text-secondary">${p.titel}</h5>
            ${p.beschrijving ? `<p class="card-text fw-bold fst-italic">${p.beschrijving}</p>` : ""}
            <p class="card-text price">€${p.prijs}</p>
            <p class="card-text">${p.code}</p>
            <p class="card-text">${p.afmeting}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-dark edit-btn" data-id="${p.id}">✏️ Bewerken</button>
            <button class="btn btn-sm btn-outline-dark verkocht-btn" id="open-modal-btn" data-id="${p.id}" data-verkocht="${p.isVerkocht}">${p.isVerkocht ? `✅` : `❌`} Verkocht</button>
            <button class="btn btn-danger btn-sm verwijder-btn" data-id="${p.id}" data-afbeelding="${p.afbeelding}">🗑️ Verwijder</button>
          </div>
        </div>
      `;
      row.appendChild(col);
    });

  platenContainer.appendChild(row);

  // Verwijder-knoppen activeren
  document.querySelectorAll(".verwijder-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const afbeelding = e.target.dataset.afbeelding;
      if (confirm("Weet je zeker dat je deze haardplaat wilt verwijderen?")) {
        await deletePlaat(id, afbeelding);
      }
    });
  });
  // Verkocht-knoppen activeren
  document.querySelectorAll(".verkocht-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const isVerkocht = e.target.dataset.verkocht;
      await markeerVerkocht(id, isVerkocht);
    });
  });

  //Bewerkt plaat
  platenContainer.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("edit-btn")) return;

    const id = e.target.dataset.id;
    currentEditId = id;

    // Haal de data van deze plaat
    const { data, error } = await supabase
      .from("haardplaten")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return alert("Kon gegevens niet ophalen: " + error.message);

    // Vul de modal velden in
    document.getElementById("modal-title").textContent = "Bewerk haardplaat";
    document.getElementById("titel").value = data.titel;
    document.getElementById("prijs").value = data.prijs;
    document.getElementById("afmeting").value = data.afmeting;
    document.getElementById("code").value = data.code;
    document.getElementById("beschrijving").value = data.beschrijving;
    document.getElementById("haardplaat").checked = data.isHaardplaat;
    document.getElementById("haardbok").checked = !data.isHaardplaat;
    document.getElementById("publicUrl").value = data.afbeelding;
    modal.show();
  });


}


async function deletePlaat(id, afbeeldingUrl) {
  try {
    const { error: deleteError } = await supabase
      .from("haardplaten")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    const urlParts = afbeeldingUrl.split("/storage/v1/object/public/images/");
    const filePath = urlParts[1]; 
    if (!filePath) throw new Error("Kon pad naar afbeelding niet bepalen");

    const { error: storageError } = await supabase
      .storage
      .from("images") 
      .remove([filePath]); 

    if (storageError) throw storageError;

    renderHaardplaten();

  } catch (err) {
    console.error("Fout bij verwijderen:", err.message);
    alert("❌ Er is iets misgegaan bij het verwijderen van de haardplaat of afbeelding.");
  }
}

async function markeerVerkocht(id, isVerkocht) {
  try {
    if(isVerkocht === "true"){
      isVerkocht = true;
    } else {
      isVerkocht = false
    }
    // Keer de waarde om
    isVerkocht = !isVerkocht;

    const { error } = await supabase
      .from("haardplaten")
      .update({ isVerkocht: isVerkocht })
      .eq("id", id);

    if (error) throw error;
    renderHaardplaten(); // ververs de lijst
  } catch (err) {
    console.error("Fout bij markeren als verkocht:", err.message);
    alert("❌ Kon de haardplaat niet als verkocht markeren.");
  }
}

openModalBtn.addEventListener("click", () => {
  form.reset();
  document.getElementById("modal-title").textContent = "Nieuwe haardplaat";
  currentEditId = null;
  modal.show();
});


// Toevoegen
document.getElementById("submit-btn").addEventListener("click", async (e) => { 
  e.preventDefault(); 
  const btn = e.target;
  btn.disabled = true; 
  btn.textContent = "Bezig met opslaan..."; 

  const titel = document.getElementById("titel").value; 
  const prijs = document.getElementById("prijs").value; 
  const afmeting = document.getElementById("afmeting").value; 
  const code = document.getElementById("code").value;
  const beschrijving = document.getElementById("beschrijving").value; 
  const isHaardplaat = document.getElementById("haardplaat").checked; 
  const file = document.getElementById("afbeelding").files[0]; 

  let publicUrl = document.getElementById("publicUrl").value;

  // Upload nieuwe afbeelding indien geselecteerd
  if (file) {
    if(publicUrl) {
      const urlParts = publicUrl.split("/storage/v1/object/public/images/");
      const filePath = urlParts[1]; 
      if (!filePath) throw new Error("Kon pad naar afbeelding niet bepalen");

      const { error: storageError } = await supabase
        .storage
        .from("images") 
        .remove([filePath]); 

      if (storageError) throw storageError;
    }
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(`public/${file.name}`, file, { cacheControl: "3600", upsert: true });

    if (uploadError) { 
      alert("Upload mislukt: " + uploadError.message); 
      btn.disabled = false; 
      btn.textContent = currentEditId ? "Opslaan" : "Toevoegen"; 
      return;   
    }

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(uploadData.path);
    publicUrl = publicUrlData.publicUrl;
  }

  try {
    if (currentEditId) {
      // Update
      const { error } = await supabase.from("haardplaten").update({
        titel,
        prijs,
        afmeting,
        code,
        beschrijving,
        isHaardplaat,
        ...(publicUrl && { afbeelding: publicUrl }) // Alleen bij nieuwe afbeelding
      }).eq("id", currentEditId);

      if (error) throw error;
    } else {
      // Insert nieuw
      if (!file) { 
        alert("Upload een afbeelding"); 
        btn.disabled = false; 
        btn.textContent = "Toevoegen"; 
        return; 
      }
      const { error } = await supabase.from("haardplaten").insert([{
        titel,
        prijs,
        afmeting,
        code,
        beschrijving,
        isHaardplaat,
        afbeelding: publicUrl
      }]);
      if (error) throw error;
    }

    renderHaardplaten();
    modal.hide();
    form.reset();
    currentEditId = null;

  } catch (err) {
    alert("Kon niet opslaan: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = currentEditId ? "Opslaan" : "Toevoegen";
  }
});
