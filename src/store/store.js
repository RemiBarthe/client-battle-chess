import { createStore } from 'vuex'

export const SET_PLAYERS = 'SET_PLAYERS'
export const SET_CURRENT_PLAYER = 'SET_CURRENT_PLAYER'
export const SET_SELECTED_UNIT = 'SET_SELECTED_UNIT'
export const SET_IS_MY_TURN = 'SET_IS_MY_TURN'
export const SET_UNITS_MODE = 'SET_UNITS_MODE'

export const store = createStore({
    state: {
        players: [],
        selectedUnit: {},
        currentPlayer: {},
        isMyTurn: false,
        unitsMode: "move"
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
        setIsMyTurn({ commit }, payload) {
            commit(SET_IS_MY_TURN, payload)
        },
        setUnitsMode({ commit }, payload) {
            commit(SET_UNITS_MODE, payload)
        }
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
        [SET_IS_MY_TURN](state, payload) {
            state.isMyTurn = payload
        },
        [SET_UNITS_MODE](state, payload) {
            state.unitsMode = payload
        }
    }
})