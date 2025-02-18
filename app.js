const prompt = require('prompt-sync')();
const watson = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();

// Preencha com suas credenciais e URL
const ASSISTANT_URL = '';
const ASSISTANT_IAM_APIKEY = '';
const ASSISTANT_ID = ''; // Assistant ID
const ENVIRONMENT_ID = ''; // Adicione o environmentId aqui

// Inicializa o Assistant
const assistant = new watson({
  version:  process.env.VERSION || '2021-11-27',  //'2021-11-27', // Use a versão mais recente da API
  authenticator: new IamAuthenticator({ apikey: process.env.ASSISTANT_IAM_APIKEY || ASSISTANT_IAM_APIKEY }),
  url: process.env.ASSISTANT_URL || ASSISTANT_URL,
});

// Função para enviar mensagens e receber respostas
async function tratarMensagem(sessionId, message) {
  try {
    const payload = {
      assistantId: process.env.ASSISTANT_ID || ASSISTANT_ID,
      sessionId: sessionId,
      input: {
        message_type: 'text',
        text: message,
      },
      environmentId: process.env.ENVIRONMENT_ID || ENVIRONMENT_ID,
    };

    const response = await assistant.message(payload);
   
    // Sair de acordo com a intenção de despedida do chatbot
    if (response.result.output.intents && response.result.output.intents.length > 0 &&  response.result.output.intents[0].intent === 'despedida'   ) {
        response.result.output.generic.forEach(() => {
          console.log('Resposta do Watson:', 'sair');
          
        });
      } 
       // Exibe a resposta do Watson
    else if (response.result.output.generic  ) {
        response.result.output.generic.forEach((message) => {
          console.log('Resposta do Watson:', message.text);
        });
      }

    // Verifica se há intenções detectadas
    if (response.result.output.intents && response.result.output.intents.length > 0) {
      console.log('Intenção detectada:', response.result.output.intents[0].intent);
    }
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  }
  
}

// Função principal para iniciar a conversação
async function startConversation() {
  try {
    // Cria uma nova sessão
    const session = await assistant.createSession({
      assistantId: process.env.ASSISTANT_ID || ASSISTANT_ID,
    });
    const sessionId = session.result.session_id;

    console.log('Sessão criada com ID:', sessionId);

    await tratarMensagem(sessionId, ''); // Envia a mensagem para o Watson

    // Loop para interação contínua
    while (true) {
      const userMessage = prompt('>> '); // Captura a mensagem do usuário
      if (userMessage.toLowerCase() === 'sair') {
        console.log('Encerrando a conversa...');
        break; // Sai do loop se o usuário digitar "sair"
      }

      await tratarMensagem(sessionId, userMessage); // Envia a mensagem para o Watson
    }
  } catch (err) {
    console.error('Erro ao iniciar a conversação:', err);
  }
}

// Inicia a conversação
startConversation();