import { z } from 'zod/v4';
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Invalid email.')
});

const duckSchema = z.object({
  name: z.string().min(1, 'Your duck must have a name'),
  imgUrl: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain
  }),
  quote: z.string().optional(),
  owner: z.string().length(24)
});

export { userSchema, duckSchema };
