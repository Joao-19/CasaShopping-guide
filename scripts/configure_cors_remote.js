
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Configuração
const ENDPOINT = 'http://137.131.170.247:9000';
const ACCESS_KEY = 'admin';
const SECRET_KEY = 'password123';
const BUCKET = 'casashopping';

async function configureCors() {
    console.log(`Conectando a ${ENDPOINT}...`);

    const client = new S3Client({
        region: 'us-east-1',
        endpoint: ENDPOINT,
        forcePathStyle: true,
        credentials: {
            accessKeyId: ACCESS_KEY,
            secretAccessKey: SECRET_KEY
        },
        // Desabilitar checksums para evitar erros de compatibilidade
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED"
    });

    const corsRules = [
        {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "POST", "DELETE", "GET"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000
        }
    ];

    try {
        console.log(`Configurando CORS para o bucket '${BUCKET}'...`);
        const command = new PutBucketCorsCommand({
            Bucket: BUCKET,
            CORSConfiguration: {
                CORSRules: corsRules
            },
            // Hack para tentar evitar checksum header se possível
            checksumAlgorithm: undefined 
        });

        await client.send(command);
        console.log('✅ CORS configurado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao configurar CORS:', error);
        
        if (error.Code === 'NotImplemented') {
             console.log('Tentando novamente sem alguns headers...');
        }
    }
}

configureCors();
