const https = require('https');
const fs = require('fs');
const path = require('path');

// Criar pasta de fontes
const fontsDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir);
    console.log('✅ Pasta fonts/ criada');
}

console.log('📥 Baixando fontes gratuitas com suporte UTF-8...\n');

// Roboto - fonte moderna e gratuita do Google
const fonts = [
    {
        name: 'Roboto-Regular.ttf',
        url: 'https://github.com/google/roboto/raw/main/src/hinted/Roboto-Regular.ttf'
    },
    {
        name: 'Roboto-Bold.ttf',
        url: 'https://github.com/google/roboto/raw/main/src/hinted/Roboto-Bold.ttf'
    },
    {
        name: 'Roboto-Italic.ttf',
        url: 'https://github.com/google/roboto/raw/main/src/hinted/Roboto-Italic.ttf'
    }
];

function downloadFont(fontInfo) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(fontsDir, fontInfo.name);
        
        console.log(`⬇️  Baixando ${fontInfo.name}...`);
        
        https.get(fontInfo.url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Seguir redirect
                https.get(response.headers.location, (redirectResponse) => {
                    const fileStream = fs.createWriteStream(filePath);
                    redirectResponse.pipe(fileStream);
                    
                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`✅ ${fontInfo.name} baixada!`);
                        resolve();
                    });
                }).on('error', reject);
            } else {
                const fileStream = fs.createWriteStream(filePath);
                response.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`✅ ${fontInfo.name} baixada!`);
                    resolve();
                });
            }
        }).on('error', reject);
    });
}

async function downloadAllFonts() {
    try {
        for (const font of fonts) {
            await downloadFont(font);
        }
        
        console.log('\n🎉 Todas as fontes foram baixadas com sucesso!');
        console.log('📁 Localização: ' + fontsDir);
        console.log('\n✨ Agora você pode usar essas fontes no PDF com acentos perfeitos!');
        
    } catch (error) {
        console.error('❌ Erro ao baixar fontes:', error.message);
        console.log('\n📝 ALTERNATIVA: Baixe manualmente em:');
        console.log('https://fonts.google.com/specimen/Roboto');
        console.log('E coloque os arquivos .ttf na pasta: ' + fontsDir);
    }
}

downloadAllFonts();
