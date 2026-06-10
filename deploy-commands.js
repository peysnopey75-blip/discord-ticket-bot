const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Configurações - Substitua com os dados do seu bot
const CLIENT_ID = 'SEU_CLIENT_ID'1511856516343271455;
const GUILD_ID = 'SEU_GUILD_ID'1487137265330163977; // Cole o ID do servidor para registro instantâneo (modo de teste)
const TOKEN = 'SEU_TOKEN_DO_BOT'MTUxMTg1NjUxNjM0MzI3MTQ1NQ.GPDJTw.gEF422gyYOq-lkuKaG_cHq6mx0wanE0UBKFZwQ;

const commands = [
    // 1. Comando de Configuração do Painel Principal
    new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Configura o painel de tickets no canal atual.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Apenas administradores podem usar
        .setDMPermission(false),

    // 2. Comando para adicionar membro ao ticket
    new SlashCommandBuilder()
        .setName('ticket-add')
        .setDescription('Adiciona um membro ao ticket atual.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que você deseja adicionar ao ticket.')
                .setRequired(true)
        )
        .setDMPermission(false),

    // 3. Comando para remover membro do ticket
    new SlashCommandBuilder()
        .setName('ticket-remove')
        .setDescription('Remove um membro do ticket atual.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que você deseja remover do ticket.')
                .setRequired(true)
        )
        .setDMPermission(false),
].map(command => command.toJSON());

// Prepara a instância do módulo REST
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Faz o deploy dos comandos para o Discord
(async () => {
    try {
        console.log(`Iniciando a atualização de ${commands.length} comandos de barra (/).`);

        // Registra os comandos especificamente no seu servidor de testes (atualiza instantaneamente)
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Sucesso! ${data.length} comandos de barra foram registrados localmente.`);
        
        /* // NOTA: Quando o bot for para produção (público), descomente esta parte e comente a de cima 
        // para registrar os comandos globalmente (pode levar até 1 hora para propagar):
        
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log(`Sucesso! ${data.length} comandos globais registrados.`);
        */
    } catch (error) {
        console.error('Erro ao registrar os comandos:', error);
    }
})();
