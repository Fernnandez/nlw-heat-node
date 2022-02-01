import axios from "axios";
import prismaClient from "../prisma";
import { sign } from "jsonwebtoken";

/* 
Receber o code(string)
Recuperar o access_token no github
Buscar informações do user no usuario
verificar se o user existe no DB
if true = Gera um token
if false = Cria no DB e depois gera um access_token
Retornar o token com as informarções do user logado
*/

interface IAccessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string;
  name: string;
  login: string;
  id: number;
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } =
      await axios.post<IAccessTokenResponse>(url, null, {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: { Accept: "application/json" },
      });

    const response = await axios.get<IUserResponse>(
      "http://api.github.com/user",
      {
        headers: {
          authorization: `bearer ${accessTokenResponse.access_token}`,
        },
      }
    );

    const { login, id, avatar_url, name } = response.data;

    let user = await prismaClient.user.findFirst({
      where: { github_id: id },
    });

    if (!user) {
      user = await prismaClient.user.create({
        data: { github_id: id, login, avatar_url, name },
      });
    }

    // autenticando user com jwt
    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.JWT_SECRET,
      { subject: user.id, expiresIn: "1d" }
    );

    return { token, user };
  }
}

export { AuthenticateUserService };
