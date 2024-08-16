export { };

declare global {
   //Adding additional members to the Object class to support basic functionality
   interface Object {
      is(type: Function): boolean;
      getType(): Type;
      equals(other: any): boolean;
      getHashCode(): number;
   }

   //Declares that Array<T> has a remove method.
   interface Array<T> extends ICollection<T>, IEnumerable<T> {
      //Adds the item to the end of the array.
      //The array is returned for chaining.
      add(item: T): T[];

      //Adds the items to the end of the array.
      //The array is returned for chaining.
      addRange(items: T[]): T[];

      //Removes the first item in the array equal to the item.
      //The array is returned for chaining.
      remove(item: T): T[];

      //Removes the element at the specified index.
      //The array is returned for chaining.
      removeAt(index: number): T[];

      //Clears all elements from the collection.
      clear(): T[];

      //Returns the element at the specified index.
      get(index: number): T[];

      //Returns the element at the specified index.
      set(index: number, item: T): T[];
   }

   /**
    A sequence of items that can be enumerated one at a time. 
    IEnumerables serve to allow common functionality to be defined for 
    collections like arrays, sets, dictionaries or more complex data 
    structures that have still represent some kind of collection.
    @typeparam [T] The type of item in the sequence.
    @remarks 
       An enumeration is not constrainted to be finite but 
       it is assumed that they are unless otherwise specified.
   */
   interface IEnumerable<T> extends Object {
      //Enumerates the elements of the sequence, calling the enumerator for each.
      getEnumerator(): IEnumerator<T>;

      //Enumerates the sequence
      forEach(operation: (item?: T) => void): void;

      //Returns an IEnumerable implementation that is queryable.
      query(): IQueryable<T>;

      //Returns a JavaScript array.
      toArray(): T[];

      //Counts the number of elements in a sequence.
      count(): number;
   }

   /**
   Defines an object which performs the enumeration for a particular implementation of IEnumerable.
   @typeparam [T] The type of item which is enumerated.
   @seealso IEnumerable<T>
   */
   interface IEnumerator<T> extends Object {
      current: T;
      moveNext(): boolean;
   }

   /**
   Defines an sequence with a getter.
   @typeparam [T] The type of item in the collection.
   @remarks 
      The get method cannot assumed to be fast though by convention is it implemented to be when possible. 
      It is safe to assume that retrieving an object using the get method requires a traversal of the collection.
   */
   interface IAccessibleCollection<T> extends IEnumerable<T> {

      //Returns the element at the specified index.
      get(index: number): T;
   }

   /**
   Defines a collection that can be used for storing and retrieving objects.
   @typeparam [T] The type of item in the collection.
   @remarks Array<T> implemements ICollection.
   @seealso Array<T>
   */
   interface ICollection<T> extends IAccessibleCollection<T> {

      //Adds an item to the collection.
      add(item: T): ICollection<T>;

      //Adds a sequence of items to the collection.
      addRange(items: IEnumerable<T>): ICollection<T>;

      //Removes all instances of the item from the collection.
      remove(item: T): ICollection<T>;

      //Removes the element at the specified index.
      removeAt(index: number): ICollection<T>;

      //Clears all elements from the collection.
      clear(): ICollection<T>;

      //Returns the element at the specified index.
      set(index: number, item: T): ICollection<T>;
   }

   /**
   Defines a lazily executed query that performs a computation on a sequence of data.
   @typeparam [T] The type of item being queried.
   @remarks 
      Not all methods of IQueryable are lazily executed.
      In particular, methods which don't return IQueryables 
      are expected to have executed the query.
   */
   interface IQueryable<T> extends IEnumerable<T> {

      //Iterates through the elements in the queried sequence.
      forEach(operation: (item: T) => void): IQueryable<T>;

      //Casts the elements of the query to a new type.
      cast<TElement>(): IQueryable<TElement>;

      //Returns a queryable containing the items that satisfy the predicate.
      where(predicate: (item: T) => boolean): IQueryable<T>;

      //Returns a queryable containing the items selected by the selector.
      select<TSelected>(selector: (item: T) => TSelected): IQueryable<TSelected>;

      //Returns a queryable containing the concatenation of all sequences selected by the selector.
      selectMany<TSelected>(selector: (item: T) => IEnumerable<TSelected>): IQueryable<TSelected>;

      //Returns a queryable ordered by the selected item.
      orderBy<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;

      //Returns a queryable ordered by the selected item in descending order.
      orderByDescending<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;

      //Returns the accumulation of the elements in the sequence, starting with a seed.
      aggregate<TAccumulate>(accumulator: (first: TAccumulate, second: T) => TAccumulate, seed?: TAccumulate): TAccumulate;

      //Sums the selected values from the sequence.
      //If the array is empty, zero is returned.
      sum(selector?: (item: T) => number): number;

      //Returns the max of the values in the array.
      //If the array is empty, undefined is returned.
      max(selector?: (item: T) => number): number | null;

      //Sums the selected values from the sequence.
      //If the array is empty, undefined is returned.
      min(selector?: (item: T) => number): number | null;

      //Returns the first element satisfying the predicate.
      //Throws an exception if empty.
      first(predicate?: (item: T) => boolean): T;

      //Returns the first element satisfying the predicate, or null if empty.
      firstOrDefault(predicate?: (item: T) => boolean): T | null;

      //Returns the last element satisfying the predicate.
      //Throws an exception if empty.
      last(predicate?: (item: T) => boolean): T;

      //Returns the last element satisfying the predicate, or null if empty.
      lastOrDefault(predicate?: (item: T) => boolean): T | null;

      //Returns the only element satisfying the predicate.
      //Throws an exception if more then one satisfy the predicate.
      single(predicate?: (item: T) => boolean): T;

      //Returns the only element satisfying the predicate, or null if empty.
      //Throws an exception if more then one satisfy the predicate.
      singleOrDefault(predicate?: (item: T) => boolean): T | null;

      //Skips up to the specified count, and returns the remaining elements.
      skip(count: number): IQueryable<T>;

      //Takes up to the specified count, omitting the remaining elements.
      take(count: number): IQueryable<T>;

      //Returns the item at the specified index.
      at(index: number): T;

      //Concatenates this query with the other query.
      concat(other: IEnumerable<T>): IQueryable<T>;

      //Returns whether the queryable has any items in it.
      hasAny(predicate?: (item: T) => boolean): boolean;

      //Returns whether the queryable is empty.
      hasNone(predicate?: (item: T) => boolean): boolean;

      //Returns the distinct elements of a sequence.
      distinct(): IQueryable<T>;

      //Reverses the order of the sequence.
      reverse(): IQueryable<T>;

      //Returns a dictionary with the specified keys and values selected from the sequence.
      toDictionary<TKey, TValue>(
         keySelector: (item: T) => TKey,
         valueSelector: (item: T) => TValue):
         Dictionary<TKey, TValue>;

      //Returns an executed version of the query which can be passed around without risk of redundant calculation.
      execute(): IQueryable<T>;

      //Return the result of executing the query, as a basi JavaScript array.
      result(): Array<T>;

      //Enumerates the elements of the sequence, calling the enumerator for each.
      getEnumerator(): IEnumerator<T>;

      //Returns an IEnumerable implementation that is queryable.
      query(): IQueryable<T>;

      //Returns a JavaScript array.
      toArray(): T[];

      //Counts the number of elements in a sequence.
      count(): number;
   }

   //A typeOf operator that works on JavaScript objects
   function typeOf(ctor: Function): Type

   /**
    * Defines options for including or excluding certain members when querying a type.
    */
   interface IMemberOptions {
      includePublic?: boolean;
      includePrivate?: boolean;
      includeInherited?: boolean;
   }
}