async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
        alert("✅ Account aangemaakt! Log nu in.");
        window.location.href = "login.html";
    } else {
        alert(data.error);
    }
}
