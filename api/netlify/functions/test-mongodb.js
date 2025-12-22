// netlify/functions/test-mongodb.js
const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  // Usa variável de ambiente do Netlify
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: "MONGODB_URI não configurada",
        hint: "Configure no painel do Netlify: Settings > Environment Variables"
      })
    };
  }
  
  console.log('Tentando conectar ao MongoDB Atlas...');
  
  const client = new MongoClient(uri);
  
  try {
    // Conectar (timeout de 10 segundos)
    await client.connect();
    console.log('✅ Conectado ao MongoDB Atlas');
    
    // Testar ping no database
    const db = client.db();
    const pingResult = await db.command({ ping: 1 });
    
    // Listar databases disponíveis
    const databases = await client.db().admin().listDatabases();
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: "🎉 MongoDB Atlas conectado com sucesso!",
        cluster: "Cluster0.ejn2tbl.mongodb.net",
        ping: pingResult,
        databases: databases.databases.map(db => ({
          name: db.name,
          size: db.sizeOnDisk
        })),
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Erro MongoDB:', error);
    
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: "Falha na conexão com MongoDB Atlas",
        message: error.message,
        hint: "Verifique: 1) Connection string 2) IP whitelist 3) Usuário/senha"
      })
    };
  } finally {
    await client.close();
  }
};