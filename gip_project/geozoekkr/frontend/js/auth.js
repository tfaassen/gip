async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.location.href = "singleplayer.html";
    } else {
      alert("Inloggen mislukt");
    }
  }
  
  async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    alert("Account aangemaakt! Log nu in.");
  }
  