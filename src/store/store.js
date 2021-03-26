import { createStore } from 'vuex'

export const SET_PLAYERS = 'SET_PLAYERS'
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER'
export const SET_SELECTED_UNIT = 'SET_SELECTED_UNIT'
export const SET_PLAYER_TURN = 'SET_PLAYER_TURN'

export const store = createStore({
    state: {
        players: [],
        selectedUnit: {},
        currentPlayer: {},
        playerTurn: null
    },
    actions: {
        setPlayers({ commit }, payload) {
            commit(SET_PLAYERS, payload)
        },
        setCurrentPlayer({ commit }, payload) {
            commit(SET_CURRENT_PLAYER, payload)
        },
        setSelectedUnit({ commit }, payload) {
            commit(SET_SELECTED_UNIT, payload)
        },
        setPlayerTurn({ commit }, payload) {
            commit(SET_PLAYER_TURN, payload)
        },
    },
    mutations: {
        [SET_PLAYERS](state, payload) {
            state.players = payload
        },
        [SET_CURRENT_PLAYER](state, payload) {
            state.currentPlayer = payload
        },
        [SET_SELECTED_UNIT](state, payload) {
            state.selectedUnit = payload
        },
        [SET_PLAYER_TURN](state, payload) {
            state.playerTurn = payload
        },
    }
})