import { z } from 'zod/v4';
import { Types } from 'mongoose';
import { stringIdSchema, dbEntrySchema } from './shared.ts';
import { userInputSchema } from './user.ts';

const duckInputSchema = z.strictObject({
	name: z
		.string()
		.min(1, 'Your duck must have a name')
		.max(255, 'Maximum name length is 255 characters'),
	imgUrl: z.url({
		protocol: /^https?$/,
		hostname: z.regexes.domain
	}),
	quote: z.string().min(1, 'A quote is required'),
	owner: stringIdSchema
});

const duckUpdateInputSchema = duckInputSchema.omit({ owner: true });

const populatedUserSchema = z.object({
	...userInputSchema.omit({ password: true }).shape,
	_id: z.instanceof(Types.ObjectId)
});

const duckSchema = z.object({
	...dbEntrySchema.shape,
	...duckInputSchema.shape,
	owner: populatedUserSchema
});

export {
	duckInputSchema,
	duckUpdateInputSchema,
	duckSchema,
	populatedUserSchema
};
