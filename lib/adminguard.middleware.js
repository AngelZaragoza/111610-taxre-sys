function checkAdmin(req, res, next) {
  if (req.user["rol_id"] === 1) {
    console.log('Acceso: Admin');
    next();
  } else {
    console.log('Acceso: denegado');
    let username = req.user['alias'];
    res
      .status(403)
      .json({ success: false, message: `El usuario ${username} no tiene privilegios de Admin` });
  }
}

module.exports = checkAdmin;