const authHeaders = {
    headers: {
        "x-access-token": localStorage.getItem("token"),
    }
}

module.exports = {authHeaders};