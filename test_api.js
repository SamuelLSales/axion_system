const payload = {
    nome_projeto: 'ITABIRITO',
    cliente: 'Exbel',
    empresa: 'Aldebaran Consultoria',
    direitos_minerarios: '51510206',
    area_id: 1,
    diretor_projeto: 'mateus',
    data_inicio: '2026-06-02T00:00:00.000Z',
    data_entrega_final: '2026-06-23T00:00:00.000Z',
    dias_campo_total: 1,
    observacoes: ''
};

async function run() {
    try {
        const loginRes = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin' }) // Guessing admin:admin, or we can use another user if we know it.
        });
        
        // Wait, if we don't know the password, we can just try to login with a common one
        const loginData = await loginRes.json();
        
        if (!loginData.token) {
            console.log("Login failed", loginData);
            return;
        }

        const token = loginData.token;
        const res = await fetch('http://localhost:8000/contratos', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
