const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ChannelType, 
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// ID do seu cargo de suporte configurado
const ID_CARGO_SUPORTE = '1487137265946988764'; 

client.once('ready', () => {
    console.log(`🚀 Bot online e pronto: ${client.user.tag}`);
});

// Ouvinte de interações (Comandos, Menus e Botões)
client.on('interactionCreate', async (interaction) => {
    
    // --- 1. LÓGICA DOS COMMANDS DE BARRA (/) ---
    if (interaction.isChatInputCommand()) {
        
        // Comando /ticket-setup
        if (interaction.commandName === 'ticket-setup') {
            const embed = new EmbedBuilder()
                .setTitle('🎫 Central de Atendimento')
                .setDescription('Precisa de ajuda? Selecione a categoria abaixo correspondente ao seu problema para abrir um ticket privado.')
                .setColor('#5865F2')
                .setFooter({ text: 'Sistema de Tickets Automático' });

            const menu = new StringSelectMenuBuilder()
                .setCustomId('menu_tickets')
                .setPlaceholder('Escolha o motivo do atendimento...')
                .addOptions([
                    {
                        label: 'Suporte Geral',
                        description: 'Dúvidas, problemas ou ajuda com o servidor.',
                        value: 'ticket_suporte',
                        emoji: '🛠️',
                    },
                    {
                        label: 'Denúncias',
                        description: 'Reportar jogadores ou violações de regras.',
                        value: 'ticket_denuncia',
                        emoji: '⚠️',
                    },
                    {
                        label: 'Financeiro / VIP',
                        description: 'Problemas ou dúvidas sobre compras e vantagens.',
                        value: 'ticket_financeiro',
                        emoji: '💰',
                    },
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.reply({ 
                content: '✅ Painel de tickets configurado com sucesso neste canal!', 
                ephemeral: true 
            });
            
            // Envia o painel no canal onde o comando foi digitado
            await interaction.channel.send({ embeds: [embed], components: [row] });
        }

        // Comando /ticket-add
        if (interaction.commandName === 'ticket-add') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: '❌ Este comando só pode ser usado dentro de um canal de ticket.', ephemeral: true });
            }
            const usuario = interaction.options.getUser('usuario');
            await interaction.channel.permissionOverwrites.create(usuario, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });
            await interaction.reply({ content: `✅ ${usuario} foi adicionado ao ticket.` });
        }

        // Comando /ticket-remove
        if (interaction.commandName === 'ticket-remove') {
            if (!interaction.channel.name.startsWith('ticket-')) {
                return interaction.reply({ content: '❌ Este comando só pode ser usado dentro de um canal de ticket.', ephemeral: true });
            }
            const usuario = interaction.options.getUser('usuario');
            await interaction.channel.permissionOverwrites.delete(usuario);
            await interaction.reply({ content: `❌ ${usuario} foi removido do ticket.` });
        }
    }

    // --- 2. LÓGICA DO MENU DE SELEÇÃO (Abertura do Ticket) ---
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'menu_tickets') {
            // Evita que o menu fique travado "pensando"
            await interaction.deferReply({ ephemeral: true });

            const tipoTicket = interaction.values[0];
            let nomeCategoria = 'atendimento';
            
            if (tipoTicket === 'ticket_suporte') nomeCategoria = 'suporte';
            if (tipoTicket === 'ticket_denuncia') nomeCategoria = 'denuncia';
            if (tipoTicket === 'ticket_financeiro') nomeCategoria = 'financeiro';

            const nomeCanal = `ticket-${nomeCategoria}-${interaction.user.username}`.toLowerCase();

            // Evita que o mesmo usuário abra múltiplos tickets com o mesmo nome
            const canalExistente = interaction.guild.channels.cache.find(c => c.name === nomeCanal);
            if (canalExistente) {
                return interaction.editReply({ content: `⚠️ Você já possui um ticket aberto em ${canalExistente}.` });
            }

            // Cria o canal de texto privado com as permissões corretas
            const canal = await interaction.guild.channels.create({
                name: nomeCanal,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel], // Oculta para o servidor inteiro
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ], // Libera para quem abriu o ticket
                    },
                    {
                        id: ID_CARGO_SUPORTE,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ], // Libera para a sua equipe de suporte
                    },
                ],
            });

            // Cria o botão de fechar o ticket
            const botaoFechar = new ButtonBuilder()
                .setCustomId('fechar_ticket')
                .setLabel('Fechar Ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger);

            const rowBotao = new ActionRowBuilder().addComponents(botaoFechar);

            const embedTicket = new EmbedBuilder()
                .setTitle(`🎫 Ticket Aberto - ${nomeCategoria.toUpperCase()}`)
                .setDescription(`Olá ${interaction.user}, bem-vindo ao seu suporte.\nPor favor, envie os detalhes do seu problema e aguarde a nossa equipe.\n\nPara encerrar este atendimento, clique no botão abaixo.`)
                .setColor('#2ECC71')
                .setTimestamp();

            // Envia a mensagem inicial marcando o usuário e o cargo de suporte
            await canal.send({ 
                content: `${interaction.user} | <@&${ID_CARGO_SUPORTE}>`, 
                embeds: [embedTicket], 
                components: [rowBotao] 
            });

            await interaction.editReply({ content: `🎉 Seu ticket foi criado com sucesso! Acesse aqui: ${canal}` });
        }
    }

    // --- 3. LÓGICA DO BOTÃO DE FECHAR TICKET ---
    if (interaction.isButton()) {
        if (interaction.customId === 'fechar_ticket') {
            await interaction.reply({ content: '🔒 Este ticket será deletado em 5 segundos...' });
            
            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (err) {
                    console.error('Erro ao deletar o canal:', err);
                }
            }, 5000);
        }
    }
});

// Tratamento de erros globais para evitar que o bot caia por completo
client.on('error', (error) => {
    console.error('❌ Erro no bot:', error);
});

client.on('warn', (warning) => {
    console.warn('⚠️ Aviso:', warning);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não tratada:', error);
});

// AQUI ESTÁ A PROTEÇÃO: O bot lerá o token de forma oculta pelo painel da sua hospedagem
client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        console.log('🔑 Login realizado com sucesso!');
    })
    .catch((err) => {
        console.error('❌ Falha crítica ao conectar:', err);
    });
