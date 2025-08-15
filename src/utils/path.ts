export const trimSeparators = (path: string) =>
  path.replace(/[/\\]+$/, '').replace(/^[/\\]+/, '');
