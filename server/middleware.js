const jwt = require("jsonwebtoken");

module.exports.isLoggedIn = (req, res, next) => {
  const token = req.headers["x-access-token"]?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(403).json({ error: "Failed to authorize", isLoggedIn: false });
        req.user = {};
        req.user.id = decoded.id
        req.user.username = decoded.username
        next()
    });
  } else {
    res.status(403).json({ error: "Incorrect token", isLoggedIn: false });
  }
};

module.exports.isAdmin = (req, res, next) => {
  const token = req.headers["x-access-token"]?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(403).json({ error: "Failed to authorize", isLoggedIn: false });
        if(!decoded.admin) return res.status(403).json({ error: "Not an admin", isAdmin: false });
        req.user = {};
        req.user.id = decoded.id
        req.user.username = decoded.username
        req.user.admin = decoded.admin
        next()
    });
  } else {
    res.status(403).json({ error: "Incorrect token", isLoggedIn: false });
  }
}
