
const fs = require('fs');
const path = require('path');

// CONFIGURAÇÃO
const API_URL = 'https://guiadecompras.casashopping.com/api'; // Ajuste para a URL de produção se necessário
const ADMIN_EMAIL = 'admin@casashopping.com';
const ADMIN_PASSWORD = 'changeme_admin_password';
const FILE_PATH = path.join("C:/Users/jjjoa/Downloads", 'Infos de lojas.txt');

async function importStores() {
    let token = '';
    
    try {
        const authResponse = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        if (!authResponse.ok) {
            throw new Error(`Falha no login: ${authResponse.statusText}`);
        }

        const authData = await authResponse.json(); 
        token = authData.accessToken;
        console.log('✅ Login realizado com sucesso!');
    } catch (error) {
        console.log(error)
        console.error('❌ Erro crítico no login:', error.message);
        return;
    }

    // 2. Read File
    if (!fs.existsSync(FILE_PATH)) {
        console.error(`❌ Arquivo não encontrado: ${FILE_PATH}`);
        console.log('💡 Crie um arquivo "stores_list.txt" com o formato "Nome, Endereço, Telefone" (uma por linha).');
        return;
    }

    const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    console.log(`📂 Encontradas ${lines.length} lojas para importar.`);

    // 3. Import Loop
    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 2) {
            console.warn(`⚠️ Linha ignorada (formato inválido): ${line}`);
            continue;
        }

        const name = parts[0];
        const address = parts[1];
        // Handle phone if exists, remove specific " (Ramal)" chars if any, or just keep as is.
        // The user example: "Breton, Bloco I, (21) 2108-8244"
        const phone = parts.length > 2 ? parts[2] : ''; 

        const payload = {
            name,
            address,
            phone
        };

        try {
            const response = await fetch(`${API_URL}/stores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Cookie': `Authentication=${token}; access_token=${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log(`✅ Adicionado: ${name}`);
                successCount++;
            } else {
                console.error(`❌ Erro ao adicionar ${name}: ${response.status} ${response.statusText}`);
                errorCount++;
            }
        } catch (err) {
            console.error(`❌ Erro de conexão ao adicionar ${name}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n🏁 Importação finalizada!`);
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
}

importStores();
