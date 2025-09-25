import { z } from 'zod/v4';
import { Types, isValidObjectId } from 'mongoose';

const stringIdSchema = z
	.string()
	.refine((val) => isValidObjectId(val), 'Invalid ID');

const dbEntrySchema = z.strictObject({
	_id: z.instanceof(Types.ObjectId),
	createdAt: z.date(),
	updatedAt: z.date(),
	__v: z.int().nonnegative()
});

const paramsSchema = z.object({
	id: stringIdSchema
});
const querySchema = z.object({
	id: stringIdSchema.optional()
});

export { stringIdSchema, dbEntrySchema, paramsSchema, querySchema };
