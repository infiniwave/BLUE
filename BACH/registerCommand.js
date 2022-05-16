const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require("discord.js");

const permissionsList = [];

Object.keys(Permissions.FLAGS).map((permission) => {
  permissionsList.push(permission);
});

async function registerCommand(client, cmd) {
  const command = require(cmd);

  if (command.notCommand) return false;

  const { id, description, aliases, slash, expectedArgs } = command;

  if (slash === "both" || slash === true) {
    command.data = new SlashCommandBuilder().setName(id).setDescription(description);

    let isSubcommand = false;

    for (let i = 0; i < expectedArgs.length; i++) {
      try {
        const arg = expectedArgs[i];

        if (isSubcommand || arg.type.toLowerCase() === "subcommand") {
          isSubcommand = true;
          command.subcommanded = true;

          command.data.addSubcommand((subcommand) => {
            subcommand.setName(arg.name.toLowerCase()).setDescription(arg.description);
            for (let o = 0; o < arg.expectedArgs.length; o++) {
              const subcommandArg = arg.expectedArgs[o];
              const { type, name, required, description, options } = subcommandArg;

              let dynamicOption = `add${type.charAt(0).toUpperCase() + type.toLowerCase().slice(1)}Option`;
              subcommandArg.type = type.charAt(0).toUpperCase() + type.toLowerCase().slice(1);

              subcommand[dynamicOption]((option) => {
                if (options) option.setChoices(...options);
                return option
                  .setName(name.toLowerCase())
                  .setDescription(description)
                  .setRequired(required || false);
              });
            }

            return subcommand;
          });
        } else {
          const { type, name, required, description, options } = arg;

          let dynamicOption = `add${type.charAt(0).toUpperCase() + type.toLowerCase().slice(1)}Option`;
          expectedArgs[i].type = type.charAt(0).toUpperCase() + type.toLowerCase().slice(1);

          command.data[dynamicOption]((option) => {
            option
              .setName(name.toLowerCase())
              .setDescription(description)
              .setRequired(required || false);

            if (options) option.setChoices(...options);

            return option;
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (command.permissions) {
    for (let i = 0; i < command.permissions.length; i++) {
      const permission = command.permissions[i];
      if (!permissionsList.includes(permission))
        return console.error(
          `\n------------------------------------\n!!! Invalid permission '${permission}' in command '${command.id}'\n------------------------------------\n`
        );
    }
  }

  for (let i = 0; i < aliases.length; i++) {
    const alias = aliases[i];

    client.commands.set(alias, {
      alias: true,
      cmdName: id,
    });
  }

  client.commands.set(id, command);

  console.log(`Module '${id}' of ${command?.category ? command.category : ""} ready`);

  if (command.init) await command.init({ client });

  return command;
}

module.exports = { register: registerCommand };
