const validateBody = schema => (req, res, next) => {
  const error = true;
  // body validation logic here...

  if (error) {
    next(new Error(`Invalid ${schema}!`, { cause: 400 }));
  } else {
    console.log(`Validation passed! This is a valid ${schema}`);
    req.sanitizedBody = req.body; // after going through validation
    next();
  }
};

export default validateBody;
