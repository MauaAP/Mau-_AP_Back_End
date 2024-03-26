import { PrismaClient } from "@prisma/client";
import { UserProps } from "../../../shared/domain/entities/user";
import { IUserRepository } from "../../../shared/domain/repositories/user_repository_interface";
import { User } from "../../domain/entities/user";
import { ROLE } from "../../domain/enums/role_enum";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export class UserRepositoryPrisma implements IUserRepository {
  async createUser(userProps: UserProps): Promise<User> {
    try {
      console.log("Criando novo usuário:", userProps);

      const existingUser = await prisma.user.findUnique({
        where: {
          email: userProps.email,
        },
      });

      if (existingUser) {
        throw new Error("User already exists in the database.");
      }

      const hashedPassword = await bcrypt.hash(userProps.password, 10);

      const createdUserFromPrisma = await prisma.user.create({
        data: {
          name: userProps.name,
          email: userProps.email,
          role: userProps.role as string,
          password: hashedPassword,
          telefone: userProps.telefone || '', 
          cpf: userProps.cpf || '', 
          registration: userProps.registration,
        },
      });

      const createdUser = new User({
        name: createdUserFromPrisma.name,
        email: createdUserFromPrisma.email,
        role: createdUserFromPrisma.role as ROLE,
        password: createdUserFromPrisma.password,
        telefone: createdUserFromPrisma.telefone,
        cpf: createdUserFromPrisma.cpf,
        registration: createdUserFromPrisma.registration,
      });

      console.log("Usuário criado com sucesso:", createdUser);

      return createdUser;
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      if (error.message.includes("User already exists in the database.")) {
        throw new Error("Usuário já cadastrado.");
      }
      throw new Error("Erro ao criar usuário no banco de dados.");
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!existingUser) {
        return undefined; // Usuário não encontrado
      }

      return new User({
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role as ROLE,
        password: existingUser.password,
        telefone: existingUser.telefone,
        cpf: existingUser.cpf,
        registration: existingUser.registration,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      throw new Error("Erro ao buscar usuário por email");
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const allUsersFromPrisma = await prisma.user.findMany();

      const allUsers = allUsersFromPrisma.map((user) => {
        return new User({
          name: user.name,
          email: user.email,
          role: user.role as ROLE,
          password: user.password,
          telefone: user.telefone,
          cpf: user.cpf,
          registration: user.registration,
        });
      });

      return allUsers;
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      throw new Error("Erro ao buscar todos os usuários");
    }
  }
}
