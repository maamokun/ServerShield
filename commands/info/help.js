const Discord = require('discord.js');

module.exports = {
	name: 'help',
	run: async (client, message, args) => {
		let embed = new Discord.MessageEmbed()
			.setTitle(`${client.user.username} | ヘルプ`)
			.setDescription(`コマンドは下のようです。`)
			.addField(`サブ垢対策`, '`fetch-alts`')
			.addField(`認証`, '`bypass` | `config` | `verify`')
			.setThumbnail(client.user.displayAvatarURL())
			.setColor('RANDOM')
			.setFooter(client.user.username + ' | securebot.maamokun.cloud', client.user.displayAvatarURL());
		return message.channel.send({ embed: embed });
	}
};
