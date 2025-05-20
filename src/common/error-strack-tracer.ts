export function stackTraceOf(error: Error): string {
  return (error.stack ?? error.toString())
    + '\n'
    + (
      error.cause && error.cause instanceof Error
        ? `Cause: ${stackTraceOf(error.cause)}`
        : ''
    )
}