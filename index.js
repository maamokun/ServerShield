//Verification bot by legendjs >:D
const Client = require('./Structures/ShieldClient.js'),
	Discord = require('discord.js'),
	{ prefix: defaultPrefix, token } = require('./config').bot,
	client = new Client({ disableMentions: 'everyone' }),
	db = require('quick.db'),
	dashboard = require('./dashboard/index'),
	moment = require('moment'),
	config = require('./config');

client.loadCommands();

console.log('-------------------------------------');
console.log(`サーバーシールド v1.0`);

console.log('-------------------------------------');
console.log(
	'[CREDITS]: made by maamokun | https://github.com/maamokun'
);
console.log('[WARNING]: できたらクレジットを置いといてね！');
console.log('-------------------------------------');
//this took me some time so dont you dare remove credits, if u do remove credits then you will have copy right issues.
client.on('ready', () => {
	console.log(`[INFO]: Ready on client (${client.user.tag})`);
	console.log(
		`[INFO]: watching ${client.guilds.cache.size} Servers, ${
			client.channels.cache.size
		} channels & ${client.users.cache.size} users`
	);
	console.log('-------------------------------------');
	client.user.setActivity('!help | securebot.maamokun.cloud', {
		type: 'PLAYING'
	});
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.guild) return;
	let prefix = db.get(`prefix_${message.guild.id}`) || defaultPrefix;
	if (!message.content.startsWith(prefix)) return;
	if (!message.member)
		message.member = await message.guild.members.fetch(message);

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const cmd = args.shift().toLowerCase();

	if (cmd.length === 0) return;

	let command = client.commands.get(cmd);
	if (!command) command = client.commands.get(client.aliases.get(cmd));
	if (command) command.run(client, message, args, db);
});

client.on('guildMemberAdd', async member => {
	let { guild, user } = member;
	let prefix = db.get(`prefix_${member.guild.id}`) || defaultPrefix;
	let bypassed = db.get(`bypass_${guild.id}`) || [];
	if (bypassed.includes(user.id)) return;
	let warningChan = member.guild.channels.cache.get(
		db.get(`warningchannel_${member.guild.id}`)
	);
	let logsChan = member.guild.channels.cache.get(
		db.get(`logs_${member.guild.id}`)
	);

	let embed = new Discord.MessageEmbed()
		.setTitle(`認証ログ`)
		.setDescription(`メンバーが入ってきました。`)
		.setFooter(member.guild.name, member.guild.iconURL())
		.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
		.addField(`メンバー情報`, `<@${member.user.id}> (${member.user.id})`)
		.addField(
			`アカウント年齢`,
			`${moment(member.user.createdAt).fromNow()}`
		)
		.setColor(
			`${
				Date.now() - member.user.createdAt < 60000 * 60 * 24 * 7
					? '#FF0000'
					: '#00FF00'
			}`
		); //sets the color to red if the account age is less then a week else it sets it to green
	logsChan.send({ embed: embed }).catch(err => {});
	member.user
		.send(
			`やあ ${member.user.username}！
${member.guild.name}へようこそ！${
				client.user.username
			}です。恐れ入りますが、参加前にhttps://${
				config.website.domain
			}/verify/${member.guild.id}\nでのアカウント認証が必要です。15分以内に完了してください。
${member.guild.name} より`
		)
		.catch(err => {
			warningChan.send(
				`やあ <@${
					member.user.id
				}>, DMできないよ！DM送れるようにして\`${prefix}verify\` でアカウント認証してください。`
			);
		});
	warningChan
		.send(
			`やあ <@${
				member.user.id
			}>！ サーバーに参加する前にアカウント認証が必要です。15分以内にDMで送った内容より認証を完了してください。`
		)
		.catch(err => {});
	//totally didnt steal these messages from AltDentifier
	setTimeout(function() {
		if (!member) return;
		if (db.get(`verified_${guild.id}_${user.id}`) || false) {
			return;
		} else {
			let kicked = true;
			member.user
				.send('時間内に認証完了しなかったため、サーバーからキックされました。')
				.catch(err => {});
			member.kick().catch(err => {
				kicked = false;
			});
			let embed = new Discord.MessageEmbed()
				.setTitle(`認証ログ`)
				.setDescription(`メンバーをキックしました。`)
				.setFooter(member.guild.name, member.guild.iconURL())
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addField(`メンバー情報`, `<@${member.user.id}> (${member.user.id})`)
				.addField('理由', '時間内に認証しなかった')
				.setColor('#00FF00');

			let embed2 = new Discord.MessageEmbed()
				.setTitle(`認証ログ`)
				.setDescription(`メンバーをキックできませんでした。`)
				.setFooter(member.guild.name, member.guild.iconURL())
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addField(`メンバー情報`, `<@${member.user.id}> (${member.user.id})`)
				.addField('理由', '時間内に認証しなかった')
				.setColor('#FF0000');
			if (kicked) return logsChan.send({ embed: embed });
			else return logsChan.send({ embed: embed2 });
		}
	}, 60000 * 15);
});

client.on('guildMemberRemove', async member => {
  db.delete(`ip_${member.guild.id}_${member.user.id}`);
	db.delete(`verified_${member.guild.id}_${member.user.id}`);
});

client.login(token).catch(err => {
	console.log('[ERROR]: Invalid Token Provided');
});
dashboard(client);
