import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  ActionRowBuilder,
} from 'discord.js';
import {
  addAllowedRole,
  removeAllowedRole,
  getAllowedRoleIds,
} from '../services/guildConfigService';
import { t } from '../services/i18nService';

// Command name
const COMMAND_NAME = 'set-allowed-role';

export default {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription('Manage roles that can use bot commands')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a role that can use bot commands')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('The role to add to allowed roles')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from being able to use bot commands')
        .addRoleOption((option) =>
          option
            .setName('role')
            .setDescription('The role to remove from allowed roles')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all roles that can use bot commands')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    // Only admins can use this command (enforced by setDefaultMemberPermissions above)
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'add') {
        const role = interaction.options.getRole('role');
        if (!role) {
          await interaction.reply({
            content: 'Invalid role selected.',
            ephemeral: true,
          });
          return;
        }

        const success = await addAllowedRole(interaction.guildId, role.id);

        if (success) {
          await interaction.reply({
            content: `Role ${role.name} can now use bot commands.`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'Failed to add role. Please try again later.',
            ephemeral: true,
          });
        }
      } else if (subcommand === 'remove') {
        const role = interaction.options.getRole('role');
        if (!role) {
          await interaction.reply({
            content: 'Invalid role selected.',
            ephemeral: true,
          });
          return;
        }

        const success = await removeAllowedRole(interaction.guildId, role.id);

        if (success) {
          await interaction.reply({
            content: `Role ${role.name} can no longer use bot commands.`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'Failed to remove role. Please try again later.',
            ephemeral: true,
          });
        }
      } else if (subcommand === 'list') {
        const allowedRoleIds = await getAllowedRoleIds(interaction.guildId);

        if (allowedRoleIds.length === 0) {
          await interaction.reply({
            content: 'No roles have been configured. Using default roles: Zoadores, Admins.',
            ephemeral: true,
          });
          return;
        }

        // Format the role mentions
        const roleList = allowedRoleIds.map((id) => `<@&${id}>`).join(', ');

        await interaction.reply({
          content: `Roles that can use bot commands: ${roleList}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error managing allowed roles:', error);
      await interaction.reply({
        content: 'An error occurred while managing allowed roles.',
        ephemeral: true,
      });
    }
  },
};
