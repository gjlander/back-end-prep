import { z } from 'zod/v4';
import { isValidObjectId, Types } from 'mongoose';

const stringIdSchema = z
	.string()
	.refine((val) => isValidObjectId(val), 'Invalid ID');

const dbEntrySchema = z.strictObject({
	_id: z.instanceof(Types.ObjectId),
	createdAt: z.date(),
	updatedAt: z.date(),
	__v: z.int().nonnegative()
});

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

const duckSchema = z.object({
	...dbEntrySchema.shape,
	...duckInputSchema.shape,
	owner: z.instanceof(Types.ObjectId)
});

const paramsSchema = z.object({
	id: stringIdSchema
});

export { duckInputSchema, duckUpdateInputSchema, duckSchema, paramsSchema };
