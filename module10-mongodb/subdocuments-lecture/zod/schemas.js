import { z } from 'zod/v4';

const locationSchema = z.object({
  country: z.string(),
  zipCode: z.string(),
  city: z.string()
});

const pondDuckSchema = z.object({
  duckId: z.string().length(24),
  notes: z.string().default('')
});

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Invalid email.'),
  location: locationSchema.optional(),
  myPond: z.array(pondDuckSchema).optional()
});

const duckSchema = z.object({
  name: z.string().min(1, 'Your duck must have a name'),
  imgUrl: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain
  }),
  quote: z.string().optional(),
  owner: z.string().min(1)
});

export { userSchema, duckSchema, pondDuckSchema };
