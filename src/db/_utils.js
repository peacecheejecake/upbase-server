export const format = (data) => {
  const _data = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  const keys = Object.keys(_data);
  const values = Object.values(_data);

  const columnNames = keys.join(', ');
  const columnBlanks = keys.map((_, i) => `$${i + 1}`).join(', ');

  return { names: columnNames, blanks: columnBlanks, values };
};
