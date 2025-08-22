import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  if (!req.headers.cookie) {
    next(new Error('Unauthorized, please sign in', { cause: 401 }));
  }

  //   console.log(req.headers.cookie);

  const cookies = req.headers.cookie?.split('; ');
  //   console.log(cookies);

  const cookieArrays = cookies.map(cookie => cookie.split('='));
  //   console.log(cookieArrays);

  const cookiesObj = Object.fromEntries(cookieArrays);
  //   console.log(cookiesObj);

  const { token } = cookiesObj;
  //   console.log(token);

  if (!token) {
    next(new Error('Unauthorized, please sign in', { cause: 401 }));
  }

  const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  //   console.log(userId);

  req.userId = userId;
  next();
};

export default verifyToken;
