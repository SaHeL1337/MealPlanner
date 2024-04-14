const jwt = require('jsonwebtoken');
const accessTokenSecret = 'somerandomaccesstoken';

exports.admin = function (req, res, next) {
    return requirePermission(req,res,next,1);
};


exports.user = function (req, res, next) {
    return requirePermission(req,res,next,2);
};

function requirePermission(req, res, next, requiredRole){
  const authHeader = req.headers.authorization;
  if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, accessTokenSecret, (err, user) => {
          if (err) {
              return res.status(401).json({status:"Unauthorized"});
          }


          if (requiredRole && user.roles.includes(requiredRole) === false){
            return res.status(401).json({status:"Unauthorized"});
          }
          req.loggedInUserID = user.id;
          next();
      });
  } else {
      return res.status(401).json({status:"Unauthorized"});
  }
}
