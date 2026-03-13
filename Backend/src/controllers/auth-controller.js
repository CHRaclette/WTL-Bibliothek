const Users = require("../db/users");
const Sessions = require("../db/sessions");  
const { verifyPassword } = require("../utils/password");
const { AppError, catchAsync } = require("../middleware/error");

function normalize(s) {
  return (typeof s === "string" ? s : "").trim();
}
exports.login = catchAsync((req, res) => {
  const username = normalize(req.body?.username);
  const password = normalize(req.body?.password);

  if (!username || !password) {
    throw new AppError("Missing credentials", 400, "VALIDATION_ERROR");
  }

  const user = Users.getByUsername(username);
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const ok = verifyPassword(
    password,
    user.passwordHash,
    user.passwordSalt,
    user.passwordIterations
  );

  if (!ok) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }
  const existing = Sessions.getSessionByUser(user.id);
  const sessionId = existing?.sessionId || Sessions.createSession(user.id, user.role);

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    maxAge: 86400000,
  });

  return res.json({ id: user.id, role: user.role });
});


exports.me = (req, res) => {
  return res.json({
    id: req.user.id,
    role: req.user.role,
  });
};

exports.logout = catchAsync((req, res) => {
  const sid = req.cookies?.sessionId;

  if (sid) {
    Sessions.deleteSession(sid);
  }

  res.clearCookie("sessionId", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  res.json({ success: true });
});
