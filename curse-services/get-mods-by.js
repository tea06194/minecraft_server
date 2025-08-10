const BASE_URL = "https://api.curseforge.com/v1";
const API_KEY = process.env.API_KEY
const headers = {
	Accept: "application/json",
	"x-api-key": `${API_KEY}`,
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
			throw Error("Minecraft game not found")
		}

		return minecraftGame.id;
	},
	async searchModsMinecraft() {
		const url = new URL(`${BASE_URL}/mods/search`)

		const gameId = await this.getMinecraftGameId()
		url.searchParams.append("gameId", gameId)

		console.log(url)

		const res = await fetch(url.href, {
			method: 'GET',
			headers: headers
		})

		const data = await res.json()

		return data
	}
}

methods.searchModsMinecraft()
	.then(data => console.log("Success:", data))
	.catch(error => console.error("Error:", error));
