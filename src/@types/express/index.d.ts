// Sobreescrevendo o request do express para ter o user_id nos atributos possiveis
declare namespace Express {
  export interface Request {
    user_id: string;
  }
}
