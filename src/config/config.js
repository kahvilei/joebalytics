const authHeaders = {
    headers: {
        "x-access-token": localStorage.getItem("token"),
    }
}

const rootAddress = {
    production: "",
    development: "http://localhost:3000",
}

module.exports = {authHeaders, rootAddress};