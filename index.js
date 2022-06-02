const express = require('express')
const app = express()
const port = 3000
const Champion = require("./championModel")
const mongoose = require('mongoose');
const mongoUrl = 'mongodb+srv://manuel:manuel@cluster0.gabq8.mongodb.net/?retryWrites=true&w=majority';


mongoose.connect(mongoUrl, { useNewUrlParser: true });
var db = mongoose.connection;

!db ? console.log("Hubo un error conectandose a la base de datos") : console.log("Conexión a base de datos satisfactoria");
app.listen(port, () => console.log(`App de ejemplo escuchando el puerto ${port}!`))

app.get('/', (req, res) => res.send('Hola mundo!'))

const puppeteer = require("puppeteer");

app.get("/scrapping", function (req, res) {
	let scrape = async () => {
		//const browser = await puppeteer.launch({ headless: false });
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setViewport({ width: 1366, height: 768 });
		await page.setDefaultNavigationTimeout(0);
		await page.goto("https://gacha.altarofgaming.com/raid-sl/champions/", [
            1000,
            { waitUntil: "domcontentloaded" }
            ]);
		const parentRow = "#gach_page_content_main > div.gach_page_content_section > div";
		await page.waitForSelector(parentRow);
		const totalChampions= await page.$eval(parentRow, el => el.childElementCount);
	let championList = [];
	for (var ix = 1; ix < 25; ix++) {
		console.log(`Process ${ix} of ${24}`);
		let elementToClick = `#gach_page_content_main > div.gach_page_content_section > div > div > a:nth-child(${ix}) > div > div > div`;
		await page.waitForSelector(elementToClick);
		await Promise.all([
			page.click(elementToClick),
			page.waitForNavigation({ waitUntil: 'networkidle2' }),
			]);

	  const result = await page.evaluate(() => {
		let name = document.querySelector("#gach_page_content_header > h1")
		.innerText;
		console.log(name);
	let health = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(1) > td.aogg_box_number").innerText;
	let attack = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(2) > td.aogg_box_number").innerText;
	let defense = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(3) > td.aogg_box_number").innerText;
	let criticalRate = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(5) > td.aogg_box_number").innerText;
	let criticalDamage = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(6) > td.aogg_box_number").innerText;
	let speed = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(4) > td.aogg_box_number").innerText;
	let resistance = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(7) > td.aogg_box_number").innerText;
	let accuracy = document.querySelector("#gach_page_content_main > div:nth-child(1) > div > div > div > table > tbody > tr:nth-child(8) > td.aogg_box_number").innerText;
	let rarity = document.querySelector("#gach_page_content_left > div.gach_page_content_section > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(3) > a").innerText
	let faction = document.querySelector("#gach_page_content_left > div.gach_page_content_section > div > div > div > table > tbody > tr:nth-child(4) > td:nth-child(2) > a").innerText
	let type = document.querySelector("#gach_page_content_left > div.gach_page_content_section > div > div > div > table > tbody > tr:nth-child(3) > td:nth-child(2) > a").innerText
	let element = document.querySelector("#gach_page_content_left > div.gach_page_content_section > div > div > div > table > tbody > tr:nth-child(2) > td:nth-child(2) > a").innerText
		let championModel = { 
			name: name,
			rarity: rarity,
			faction: faction,
			type: type,
			element: element,
			stats: {
			  health: health,
			  attack: attack,
			  defense: defense,
			  criticalRate: criticalRate,
			  criticalDamage: criticalDamage,
			  speed: speed,
			  resistance: resistance,
			  accuracy: accuracy
			}
		  }
		  return championModel;
	});
	console.log('championModel ->', result);
	championList.push(result);
	await page.goBack([5000, "domcontetloaded"]);
	}
	//browser.close();
	return championList;
	};
	scrape().then(value => {
		Champion.create(value, function (err, small) {
			if (err) return handleError(err);
		});
		res.send(value);
		return;
	});
});
