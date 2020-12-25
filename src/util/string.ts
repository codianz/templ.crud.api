export function anyToString(v: unknown) {
  switch (typeof v) {
    case "string": {
      return `"${v as string}"`;
    }
    case "number": {
      return `${v as number}`;
    }
    case "boolean": {
      return `${(v as boolean) ? "true" : "false"}`;
    }
    case "undefined": {
      return "undefined";
    }
  }
  return v == null ? "null" : JSON.stringify(v, null, 1);
}

export function errorToString(err: Error | string) {
  if (err instanceof Error) {
    return JSON.stringify(
      {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      null,
      1
    );
  } else {
    return anyToString(err);
  }
}
