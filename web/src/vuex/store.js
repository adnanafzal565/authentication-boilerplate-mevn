import { createStore } from "vuex"

export default createStore({
	state() {
		return {
			user: null
		}
	},

	mutations: {
		setUser: function (state, val) {
			state.user = val
		}
	},

	getters: {
		getUser: function (state) {
			return state.user
		}
	}
})