import type { RequestHandler } from 'express';
import type { ZodObject } from 'zod/v4';
import { z } from 'zod/v4';

const validateZod =
  (zodSchema: ZodObject): RequestHandler =>
  (req, _res, next) => {
    const { data, error, success } = zodSchema.safeParse(req.body);
    // console.log({ data, error, success });
    if (!success) {
      next(
        new Error(z.prettifyError(error), {
          cause: {
            status: 400
          }
        })
      );
    } else {
      req.body = data;
      next();
    }
  };

export default validateZod;
