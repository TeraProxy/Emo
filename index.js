
module.exports = function Emo(dispatch) {
	
	let cid = { high: 0, low: 0 }
	let emote = 0
	let emoted = false
	let enabled = false
	
	dispatch.hook('S_LOGIN', 1, (event) => {
		cid = event.cid
		enabled = true
	})

	function doEmote(emote) {
		if (emoted || emote === 0 || !enabled) return

		dispatch.toServer('C_SOCIAL', 1, { emote: emote, unk: 0 })
	}

	dispatch.hook('S_EACH_SKILL_RESULT', 1, (event) => {
		if (!enabled) return
		if ((emote !== 0) && (event.target.equals(cid))) {
			emoted = false
			doEmote(emote)
		}
	})

	dispatch.hook('S_SOCIAL', 1, (event) => {
		if (!enabled) return
		if (event.target.equals(cid)) {
			if (event.animation === emote) {
				emoted = true
			}
			else {
				emote = event.animation
			}
		}
	})

	dispatch.hook('C_PLAYER_LOCATION', 1, () => { emote = 0; })
	dispatch.hook('C_PRESS_SKILL', 1, () => { emote = 0; }) 
	dispatch.hook('C_START_SKILL', 1, () => { emote = 0; })
	dispatch.hook('S_LOAD_TOPO', 1, () => { emote = 0; })
	dispatch.hook('S_RETURN_TO_LOBBY', 1, () => { emote = 0; })
	
	dispatch.hook('C_WHISPER', 1, (event) => {
		if (/^<FONT>!emo?<\/FONT>$/i.test(event.message)) {
			if (!enabled) {
				enabled = true
				message('Emote repeater <font color="#00EE00">enabled</font>. Whisper "!emo" to disable.')
			}
			else {
				enabled = false
				clearInterval(interval)
				message('Emote repeater <font color="#DC143C">disabled</font>. Whisper "!emo" to enable.')
			}
			return false
		}
	})
  
	function message(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 24,
			authorID: 0,
			unk1: 0,
			gm: 0,
			unk2: 0,
			authorName: '',
			message: msg
		})
	}
}
