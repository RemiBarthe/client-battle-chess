import { createStore } from 'vuex'

export const SET_PLAYERS = 'SET_PLAYERS'
export const SET_CURRENT_ID = 'SET_CURRENT_ID'

export const store = createStore({
    state: {
        players: [],
        currentId: null
    },
    actions: {
        setPlayers({ commit }, payload) {
            commit(SET_PLAYERS, payload)
        },
        setCurrentId({ commit }, payload) {
            commit(SET_CURRENT_ID, payload)
        }
    },
    mutations: {
        [SET_PLAYERS](state, payload) {
            state.players = payload
        },
        [SET_CURRENT_ID](state, payload) {
            state.currentId = payload
        },
    }
})