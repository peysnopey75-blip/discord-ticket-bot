const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// IDs configurados diretamente e de forma limpa
const CLIENT_ID = '1511856516343271455';
const GUILD_ID = '1487137265330163977'; 

// Puxa o token de forma segura do painel da sua hospedagem
const TOKEN = process.env.DISCORD_TOKEN;

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
        console.log(`⏳ Iniciando a atualização de ${commands.length} comandos de barra (/).`);

        // Registra os comandos especificamente no seu servidor de testes
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`🟢 Sucesso! ${data.length} comandos de barra foram registrados localmente.`);
    } catch (error) {
        console.error('❌ Erro ao registrar os comandos:', error);
    }
})();
