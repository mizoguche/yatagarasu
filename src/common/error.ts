export type AppError =
  | { type: 'GITHUB_API_ERROR'; message: string; cause?: unknown }
  | { type: 'CONFIG_ERROR'; message: string }
  | { type: 'NETWORK_ERROR'; message: string; cause?: unknown }
  | { type: 'UNKNOWN_ERROR'; message: string; cause?: unknown };

export const createError = (
  type: AppError['type'],
  message: string,
  cause?: unknown,
): AppError => {
  return { type, message, cause };
};
