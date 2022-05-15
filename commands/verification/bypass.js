module.exports = {
	name: 'bypass',
	run: async (client, message, args, db) => {
		if (!message.channel.permissionsFor(message.author).has('MANAGE_GUILD'))
			return message.channel.send(
				':x: | **あなたはこのコマンドを使用できません！**'
			);
		let options = ['add', 'remove'];
		function check(opt) {
			return options.some(x => x === opt);
		}
		async function fetchUser(ID) {
			let user = await client.users.fetch(ID);
			return user;
		}
		async function checkUser(ID) {
			let user = await fetchUser(ID);
			if (!user) return false;
			else return true;
		}
		let option = args[0];
		let ID =
			args[1] || message.mentions.users.first()
				? message.mentions.users.first().id
				: null;
		if (!option)
			return message.channel.send(
				`:x: | **${options.join(', ')}の中の一つを入れてください。**`
			);
		if (!ID)
			return message.channel.send(
				`:x: | **IDまたはメンションが必要です。**`
			);
		if (!check(option.toLowerCase()))
			return message.channel.send(
				`:x: | **${options.join(', ')}の中の一つを入れてください。**`
			);
		switch (option.toLowerCase()) {
			case 'add':
				if (!checkUser(ID))
					return message.channel.send(`:x: | **(そんなユーザーはい)ないです。**`);
				else {
					let role = message.guild.roles.cache.get(
						db.get(`role_${message.guild.id}`)
					);
					if (role && message.guild.members.cache.get(ID)) {
						message.guild.members.cache
							.get(ID)
							.roles.add(role)
							.catch(err => {});
					}
					let user = await fetchUser(ID);
					let pog = db.get(`bypass_${message.guild.id}`) || [];
					db.push(`bypass_${message.guild.id}`, { id: user.id });
					let data = pog.find(x => x.id === ID);
					if (data)
						return message.channel.send(
							'**そのユーザーは既に除外されてます。**'
						);
					return message.channel.send(
						`${user.tag} は除外されました。`
					);
				}
				break;
			case 'remove':
				if (!checkUser(ID))
					return message.channel.send(`:x: | **(そんなユーザーはい)ないです。`);
				else {
					let role = message.guild.roles.cache.get(
						db.get(`role_${message.guild.id}`)
					);
					if (role && message.guild.members.cache.get(ID)) {
						message.guild.members.cache
							.get(ID)
							.roles.remove(role)
							.catch(err => {});
					}
					let user = await fetchUser(ID);
					let pog = db.get(`bypass_${message.guild.id}`) || [];
					if (pog) {
						let data = pog.find(x => x.id === ID);
						if (!data)
							return message.channel.send(
								'**そのユーザーは除外されてません。**'
							);
						let index = pog.indexOf(data);
						delete pog[index];
						var filter = pog.filter(x => {
							return x != null && x != '';
						});
						db.set(`bypass_${message.guild.id}`, filter);
					}
					return message.channel.send(
						`${user.tag} は除外解除しました。`
					);
				}
				break;
		}
	}
};
