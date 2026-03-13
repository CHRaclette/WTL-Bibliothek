const Sessions = require("../db/sessions");



exports.requireLogin = (req, res, next) => {
  const sid = req.cookies?.sessionId;
  if (!sid) return res.status(401).json({ message: "Not logged in" });

  const s = Sessions.getSession(sid);
  if (!s) return res.status(401).json({ message: "Invalid session" });

  req.user = { id: s.userId, role: s.role };
  next();
};


exports.requireAdmin = (req, res, next) => {
  const id = req.cookies?.sessionId;
  if (!id) return res.status(401).json({ success:false, error:{ code:"UNAUTHORIZED", message:"Not logged in" } });

  const session = Sessions.getSession(id);
  if (!session) return res.status(401).json({ success:false, error:{ code:"INVALID_SESSION", message:"Invalid session" } });

  if (session.role !== "admin") {
    return res.status(403).json({ success:false, error:{ code:"FORBIDDEN", message:"Admins only" } });
  }

  req.user = { id: session.userId, role: session.role };
  next();
};