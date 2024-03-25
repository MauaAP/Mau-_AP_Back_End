import { User } from "../../../../shared/domain/entities/user";

export class GetAllUsersViewmodel {
  name: string;
  email: string;
  role: string;

  constructor(user: User) {
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
  }
}