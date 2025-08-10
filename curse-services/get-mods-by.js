const BASE_URL = "https://api.curseforge.com/v1";
const API_KEY = process.env.API_KEY
const headers = {
	Accept: "application/json",
	"x-api-key": `${API_KEY}`,
};

const methods = {
	games: fetch(`${BASE_URL}/games`, {
		headers: headers,
		method: "GET",
	})
}

methods.games.then(res => res.json()).then(console.log)
