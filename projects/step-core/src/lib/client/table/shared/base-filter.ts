import {
  And,
  Equals,
  False,
  Filter,
  Fulltext,
  Gt,
  Gte,
  Includes,
  Lt,
  Lte,
  Not,
  Or,
  Regex,
  True,
} from '../../generated';

export type BaseFilter =
  | Equals
  | Fulltext
  | Gt
  | Gte
  | Includes
  | Lt
  | Lte
  | Regex
  | Filter
  | And
  | False
  | Not
  | Or
  | True;
