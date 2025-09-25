declare global {
	namespace Express {
		export interface Request {
			validatedQuery?: object;
		}
	}
}

export {};
