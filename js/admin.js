import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://zwczthjsxzstedtodgfe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3p0aGpzeHpzdGVkdG9kZ2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA1NDEsImV4cCI6MjA3NjIwNjU0MX0.R1MFe-WIb1Nju-D27BfY1BiFkDo_V_PKthMP3hhkhDc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase_service = createClient(SUPABASE_URL, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Y3p0aGpzeHpzdGVkdG9kZ2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMDU0MSwiZXhwIjoyMDc2MjA2NTQxfQ.1Q3UfgSh1U8dWC4C0ofB5KBpZ9wGfGVZ6ln8HuAxvWg");

// DOM elementen
const loginContainer = document.getElementById("login-container");
const adminFormContainer = document.getElementById("admin-form-container");

// const { data, error } = await supabase_service.auth.admin.createUser({
//   email: 'oudehaardplaten@gmail.com',
//   password: '@Oudeplaten562!',
//   email_confirm: true
// })

// if (error) console.log(error)
// else console.log(data)
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return alert("Login mislukt: " + error.message);

  // Login succesvol
  loginContainer.style.display = "none";
  adminFormContainer.style.display = "block";
});

document.getElementById("submit-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Bezig met uploaden...";

  const titel = document.getElementById("titel").value;
  const prijs = document.getElementById("prijs").value;
  const afmeting = document.getElementById("afmeting").value;
  const code = document.getElementById("code").value;
  const beschrijving = document.getElementById("beschrijving").value;
  const isHaardplaat = document.getElementById("haardplaat").checked;
  const file = document.getElementById("afbeelding").files[0];

  if (!file) {
    alert("Upload een afbeelding");
    btn.disabled = false;
    btn.textContent = "Toevoegen";
    return;
  }

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("images")
    .upload(`public/${file.name}`, file, { cacheControl: "3600", upsert: true });

  if (uploadError) {
    alert("Upload mislukt: " + uploadError.message);
    btn.disabled = false;
    btn.textContent = "Toevoegen";
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(uploadData.path);
  const publicUrl = publicUrlData.publicUrl;

  const { error } = await supabase.from("haardplaten").insert([{
    titel, prijs, afmeting, code, beschrijving, isHaardplaat, afbeelding: publicUrl
  }]);

  btn.disabled = false;
  btn.textContent = "Toevoegen";

  if (error) alert("Kon niet toevoegen: " + error.message);
  else {
    alert("✅ Haardplaat succesvol toegevoegd!");
    document.getElementById("admin-form-container").reset;
  }
});

