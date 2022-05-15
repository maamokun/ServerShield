const Discord = require('discord.js');

module.exports = {
	name: 'config',
	run: async (client, message, args, db) => {
		if (!message.channel.permissionsFor(message.author).has('MANAGE_GUILD'))
			return message.channel.send(
				':x: | **あなたはこのコマンドを使用できません！**'
			);
		let options = ['warningchannel', 'logs', 'punishment', 'role', 'show', 'toggle'];
		function check(opt, array) {
			return array.some(x => x.toLowerCase() === opt.toLowerCase());
		}
		if (!args[0]) {
			return message.channel.send(
				`:x: | **${options.join(', ')}の中の一つを入れてください。** 便利なWebダッシュボードもお勧めします: https://securebot.maamokun.cloud`
			);
		}
		if (!check(args[0], options)) {
			return message.channel.send(
				`:x: | **${options.join(', ')}の中の一つを入れてください。** 便利なWebダッシュボードもお勧めします: https://securebot.maamokun.cloud`
			);
		}
		let channel = message.mentions.channels.first();
		switch (args[0]) {
			case 'warningchannel':
				if (!channel) {
					return message.channel.send(':x: | **チャンネルを指定してください。**');
				}
				db.set(`warningchannel_${message.guild.id}`, channel.id);
				return message.channel.send('**警告チャンネルが設定されました。**');
				break;
			case 'logs':
				if (!channel) {
					return message.channel.send(':x: | **チャンネルを指定してください。**');
				}
				db.set(`logs_${message.guild.id}`, channel.id);
				return message.channel.send('**ログチャンネルを設定しました。**');
				break;
			case 'role':
				let role =
					message.mentions.roles.first() ||
					message.guild.roles.cache.get(args[1]);
				if (!role) {
					return message.channel.send(':x: | **ロールを指定してください。**');
				}
				db.set(`role_${message.guild.id}`, role.id);
				return message.channel.send('**認証済みロールを設定しました。**');
				break;
			case 'show':
				let warningChan =
					message.guild.channels.cache.get(
						db.get(`warningchannel_${message.guild.id}`)
					) || 'なし';
				let logsChan =
					message.guild.channels.cache.get(
						db.get(`logs_${message.guild.id}`)
					) || 'なし';
				let verificationRole =
					message.guild.roles.cache.get(db.get(`role_${message.guild.id}`)) ||
					'なし';
				let punish = db.get(`punishment_${message.guild.id}`) || 'なし';
				let embed = new Discord.MessageEmbed()
					.setTitle('設定')
					.setDescription(
						'このサーバーの設定は下のようです。'
					)
					.addField('認証失敗したら', punish)
					.addField('警告チャンネル', warningChan)
					.addField('ログチャンネル', logsChan)
					.addField('認証済みロール', verificationRole)
					.setColor('RANDOM')
					.setFooter(
						message.guild.name + ' | securebot.maamokun.cloud',
						message.guild.iconURL({ dynamic: true })
					);
				return message.channel.send({ embed: embed });
				break;
			case 'punishment':
				const punishment = args[1].toLowerCase().trim();
				const punishments = ['kick', 'ban'];
				if (!punishment)
					return message.channel.send('認証失敗したらどうすればいいか入れてください！');
				if (!punishments.includes(punishment))
					return message.channel.send(
						`\n${punishments
							.map(x => `**${x}**`)
							.join(', ')}の中の一つを入れてください。`
					);
				db.set(`punishment_${message.guild.id}`, punishment);
				return message.channel.send(
					`認証失敗したら **${
						message.guild.name
					}**ユーザーが**${punishment}**されます。`
				);
				break;
		}
	}
};
