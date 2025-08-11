const BASE_URL = "https://api.curseforge.com/v1";
const API_KEY = process.env.API_KEY;
const headers = {
	Accept: "application/json",
	"x-api-key": `${API_KEY}`,
};

const modLoaderTypes = {
	"Any": 0,
	"Forge": 1,
	"Cauldron": 2,
	"LiteLoader": 3,
	"Fabric": 4,
	"Quilt": 5,
	"NeoForge": 6,
};

const methods = {
	async getGames() {
		const res = await fetch(`${BASE_URL}/games`, {
			headers: headers,
			method: "GET",
		});
		return await res.json();
	},
	async getMinecraftGameId() {
		const games = await this.getGames();
		const minecraftGame = games.data.find(game => game.slug === "minecraft");

		if (!minecraftGame) {
			throw Error("Minecraft game not found");
		}

		return minecraftGame.id;
	},
	async searchModsMinecraftForge(modsSearchData) {

		const gameId = await this.getMinecraftGameId();

		const modsIdsPromises = modsSearchData.slugs.map((modName) => {
			const url = new URL(`${BASE_URL}/mods/search`);
			const searchParams = new URLSearchParams({
				gameId,
				modLoaderType: modLoaderTypes.Forge,
				gameVersion: modsSearchData.gameVersion,
				slug: modName.toLowerCase()
			});

			url.search = searchParams.toString();

			return fetch(url.href, {
				method: 'GET',
				headers: headers
			}).then((res) => {
				return res.json();
			});
		});

		const modsIds = await Promise.all(modsIdsPromises);

		modsIds.map(data => console.log(data.data[0]?.slug))
		/* const searchParams = new URLSearchParams({
			slug: modsSearchData.slugs[0].toLowerCase()
		});


		url.search = searchParams.toString();


		const res = await fetch(url.href, {
			method: 'GET',
			headers: headers
		});

		const data = await res.json();

		return data; */
	}
};
let data;

const modsSearchData = {
	gameVersion: "1.20.1",
	slugs: [
		"Croptopia",
		"Steam_Rails",
		"ad_astra-forge",
		"advanced-xray-forge",
		"architectury",
		"botarium-forge",
		"canary",
		"create",
		"create_structures_arise",
		"createbigcannons",
		"createdeco",
		"ferritecore",
		"ftb-chunks-forge",
		"ftb-essentials-forge",
		"ftb-library-forge",
		"ftb-teams-forge",
		"ftbbackups2-forge",
		"gravestone-forge",
		"jei",
		"journeymap",
		"kotlinforforge",
		"modernfix-forge",
		"polylib-forge",
		"resourcefulconfig-forge",
		"resourcefullib-forge",
		"starlight",
		"tfmg",
	]
};

methods.searchModsMinecraftForge(modsSearchData)
	.then(data1 => {
		console.log("Success:", data1);
		data = data1;
		console.log("🪵AVA data", data, "AVA");
	})
	.catch(error => console.error("Error:", error));

console.log("end")
