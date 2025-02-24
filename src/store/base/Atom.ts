// export type State<T> = T;
// export type Action<T> = (payload?: T) => void;

// interface StoreOptions {
//   [key: string]: State<any> | Action<any>;
// }

// export const createStore = (options: StoreOptions) => {};

// type Atom<T> =

// class Atom<T> {
//   private value;

//   constructor(initialValue: T) {
//     this.value = initialValue;
//   }
// }

interface Atom<T> {
  value: T;
}

export const createAtom = <T>(initialValue: T) => {
  const _store: Atom<T> = { value: initialValue };
  const _proxy = new Proxy(_store, {
    get() {
      return _store.value;
    },
    set({ value }) {
      _store.value = value;
      return true;
    },
  });
  return _proxy;
};
