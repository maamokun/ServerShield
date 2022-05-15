module.exports = {
	name: 'fetch-alts',
	run: async (client, message, args) => {
		const Discord = require('discord.js');
		const members = await message.guild.members.fetch();
		const age = args.join(' ');
    if (!age) return message.channel.send(`:x: | **年齢がありません。**`)
		const ms = client.parseMs(age);
		if (!ms) return message.channel.send(':x: | **年齢が無効です。**');
		const alts = members
			.filter(member => Date.now() - member.user.createdTimestamp <= ms)
			.array();
    if (!alts.length) return message.channel.send(":x: | **サブ垢は見つかりません。**");
		const altsMap = alts.map((x, i) => {
			return `**${i + 1}. - ${x.id} - ${Math.round(
				(Date.now() - x.user.createdTimestamp) / client.parseMs('1d')
			)} days**\n${x.user.tag}`;
		});
		let pages = [];
		for (var i = 0; i < altsMap.length; i += 10) {
			pages.push(altsMap.slice(i, i + 10));
		}
		const symbols = ['➡️', '⏹', '⬅️'];
		let page = 0;
		let e = new Discord.MessageEmbed()
			.setDescription(pages[page].join('\n'))
			.setFooter(`ページ ${page + 1} / ${pages.length} (${alts.length} entries)` + " | サーバーシールド")
			.setColor('RANDOM');
		const msg = await message.channel.send({ embed: e });
		symbols.forEach(symbol => msg.react(symbol));
		let doing = true;
		while (doing) {
			let r;
			const filter = (r, u) =>
				symbols.includes(r.emoji.name) && u.id == message.author.id;
			try {
				r = await msg.awaitReactions(filter, {
					max: 1,
					time: 20000,
					errors: ['time']
				});
			} catch {
				return message.channel.send(':x: | **コマンドの期限が切れました。**');
			}
			const u = message.author;
			r = r.first();
			if (r.emoji.name == symbols[0]) {
				if (!pages[page + 1])
					msg.reactions
						.resolve(r.emoji.name)
						.users.remove(u.id)
						.catch(err => {});
				else {
					page++;
					msg.reactions
						.resolve(r.emoji.name)
						.users.remove(u.id)
						.catch(err => {});
					let newEmbed = new Discord.MessageEmbed()
						.setDescription(pages[page].join('\n'))
						.setFooter(
							`ページ ${page + 1} / ${pages.length} (${alts.length} entries)` + " | サーバーシールド"
						)
						.setColor('RANDOM');
					msg.edit(newEmbed);
				}
			} else if (r.emoji.name == symbols[2]) {
				if (!pages[page - 1])
					msg.reactions
						.resolve(r.emoji.name)
						.users.remove(u.id)
						.catch(err => {});
				else {
					page--;
					msg.reactions
						.resolve(r.emoji.name)
						.users.remove(u.id)
						.catch(err => {});
					let newEmbed = new Discord.MessageEmbed()
						.setDescription(pages[page].join('\n'))
						.setFooter(
							`ページ ${page + 1} / ${pages.length} (${alts.length} entries)` + " | サーバーシールド"
						)
						.setColor('RANDOM');
					msg.edit(newEmbed);
				}
			} else if (r.emoji.name == symbols[1]) {
				msg.reactions.removeAll();
				return;
			}
		}
	}
};
