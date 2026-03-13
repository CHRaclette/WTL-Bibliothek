const {AppError, catchAsync} = require("../middleware/error");
const Users = require("../db/users");


exports.login = catchAsync((req, res) => {
    const {username, password} = req.body ?? {};
    
    if (!username || !password) {
        throw new AppError("Username und Passwort müssen angegeben werden.", 400, "VALIDATION_ERROR");
    }
    
    const user = Users.getByUsername(username);
    if (!user || user.password !== password) {
        throw new AppError("Ungültige Anmeldedaten.", 401, "INVALID_CREDENTIALS");
    }
    
    return res.json({id: user.id, username: user.username, role: user.role});
    });

exports.createUser = catchAsync((req, res) => {
    const {username, password, role} = req.body ?? {};
    
    if (!username || !password || !role) {
        throw new AppError("Username, Passwort und Rolle müssen angegeben werden.", 400, "VALIDATION_ERROR");
    }
    
    const id = Users.createUser(username, password, role);
    return res.status(201).json({id, username, role});
});



exports.deleteUser = catchAsync((req, res) => {
  const id = req.params.id;

  const user = Users.getById(id);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.role === "admin") {
    const admins = Users.countAdmins(); 
    if (admins <= 1) {
    
      throw new AppError(
        "Es muss mindestens ein Admin-User vorhanden sein!",
        409,
        "AT_LEAST_ONE_ADMIN"
      );
    }
  }

  Users.remove(id);
  return res.status(204).send();
});

exports.getUsers = catchAsync((req, res) => {
    let result = Users.getAll();

    const {username} = req.query;
    if (username) {
        const lower = username.toLowerCase();
        result = result.filter(u => u.username.toLowerCase().includes(lower));
    }

    res.json(result);
}
);

exports.patchUser = catchAsync((req, res) => {
    const id = req.params.id;
    const user = Users.getById(id);
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const {username, role} = req.body ?? {};

    if (username !== undefined) {
        user.username = username;
    }
   
    if (role !== undefined) {
        user.role = role;
    }

    Users.update(id,
         username !== undefined ? username : user.username, 
         role !== undefined ? role : user.role);
    return res.json(user);
});

exports.getUserById = catchAsync((req, res) => {
    const id = req.params.id;
    const user = Users.getById(id);
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return res.json(user);
}
);

