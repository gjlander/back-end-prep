import { z } from 'zod/v4';
import { dbEntrySchema } from './shared.ts';

const userInputSchema = z.strictObject({
	firstName: z.string().min(1, 'First name is required').trim(),
	lastName: z.string().min(1, 'Last name is required').trim(),
	email: z.email().trim().toLowerCase(),
	password: z.string().min(6, 'Password must be at least 6 characters long')
});

const userSchema = z.strictObject({
	...userInputSchema.shape,
	...dbEntrySchema.shape
});

export { userInputSchema, userSchema };
