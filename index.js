// Exemplo de lógica dentro do seu index.js ao receber o comando ticket-setup
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// ... dentro do seu event interactionCreate ...
if (interaction.commandName === 'ticket-setup') {
    const embed = new EmbedBuilder()
        .setTitle('Suporte e Atendimento')
        .setDescription('Precisa de ajuda? Selecione a categoria abaixo para abrir um ticket.')
        .setColor('#5865F2');

    const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select_menu')
        .setPlaceholder('Escolha uma categoria...')
        .addOptions([
            {
                label: 'Suporte Geral',
                description: 'Dúvidas, problemas ou ajuda com o servidor.',
                value: 'ticket_suporte',
                emoji: '🛠️',
            },
            {
                label: 'Denúncias',
                description: 'Reportar jogadores ou membros que quebraram regras.',
                value: 'ticket_denuncia',
                emoji: '⚠️',
            },
            {
                label: 'Financeiro / Compras',
                description: 'Problemas com doações, VIP ou loja.',
                value: 'ticket_financeiro',
                emoji: '💰',
            },
        ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row] });
}
