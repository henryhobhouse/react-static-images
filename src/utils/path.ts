export const trimSeparators = (path: string) => {
  return path.replace(/[/\\]+$/, '').replace(/^[/\\]+/, '');
};
