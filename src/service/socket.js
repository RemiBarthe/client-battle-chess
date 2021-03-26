import io from "socket.io-client"

let uri = window.location.search.substring(1)
let params = new URLSearchParams(uri)
let query = "secondPlayer=false"

if (params.get("idroom")) {
    query = "secondPlayer=true"
}

export const socket = io("http://localhost:3000", { query: query })