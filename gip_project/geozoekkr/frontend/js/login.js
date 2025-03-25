async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        alert("✅ Ingelogd!");
        window.location.href = "spel.html"; // Stuur door naar het spel
    } else {
        alert(data.message);
    }
}
