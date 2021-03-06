const registerCommand = require('./register-command')

module.exports = (robot) => {
  registerCommand(robot, {
    name: 'coffee',
    usage: 'coffee',
    description: 'Order a coffee',
    action: async (command, args, context, previousMessageToken) => {
      const state = command.getState()

      if (!state) {
        return command.createResponse(':coffee: I am coffeebot and I am here to take your order. What would you like to do?', {
          attachments: [
            {
              type: 'button',
              color: '#5A352D',
              text: 'Start a coffee order',
              // value is what is sent from Slack to us when the user clicks this button. It is a token (hash) that points to the new state
              value: await command.extendState({orderStep: 'LOAD_OPTIONS'})
            }
          ]
        });

      } else if (state['orderStep'] === 'LOAD_OPTIONS') {
        // This edits the current message instead of creating a new one
        return command.editResponse(previousMessageToken, 'Great! What can I get started for you?', {
          attachments: [
            {
              type: 'select',
              text: 'Select the type of coffee you would like to order',
              options: [
                { text: 'Cappuccino', value: await command.extendState({orderStep: 'CHOOSE_MILK', coffeeType: 'cappuccino'}) },
                { text: 'Americano',  value: await command.extendState({orderStep: 'CHOOSE_MILK', coffeeType: 'americano'}) },
              ]
            }
          ]
        })
      } else if (state['orderStep'] === 'CHOOSE_MILK') {
        return command.editResponse(previousMessageToken, `:white_check_mark: **${state['coffeeType']}**\nWhat type of milk would you like?`, {
          attachments: [
            {
              type: 'select',
              text: 'Select the type of milk you want',
              options: [
                { text: 'Skim', value: await command.extendState({orderStep: 'CHOOSE_SUGAR', milkType: 'skim'}) },
                { text: '2%',   value: await command.extendState({orderStep: 'CHOOSE_SUGAR', milkType: '2%'}) },
                { text: 'Soy',  value: await command.extendState({orderStep: 'CHOOSE_SUGAR', milkType: 'soy'}) },
              ]
            }
          ]
        })
      } else if (state['orderStep'] === 'CHOOSE_SUGAR') {
        return command.editResponse(previousMessageToken, `:white_check_mark: **${state['coffeeType']}**\n:white_check_mark: **${state['milkType']} milk**\nWould you like sugar?`, {
          attachments: [
            {
              type: 'button',
              text: 'Yes please!',
              value: await command.extendState({orderStep: 'FINISH', sugar: 'sugar'})
            },
            {
              type: 'button',
              text: 'No thank you',
              value: await command.extendState({orderStep: 'FINISH', sugar: 'no sugar'})
            }
          ]
        })
      } else if (state['orderStep'] === 'FINISH') {
        // clear the state upon sending this message because we are done.
        return command.finish(previousMessageToken, `:white_check_mark: **${state['coffeeType']}**\n:white_check_mark: **${state['milkType']} milk**\n:white_check_mark: **${state['sugar']}**\nYour ${state['coffeeType']} with ${state['milkType']} milk with ${state['sugar']} is ready!\n:coffee:`)
      }
    }
  })
}
