export function deboucnce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout;

  return function (...args: any) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
