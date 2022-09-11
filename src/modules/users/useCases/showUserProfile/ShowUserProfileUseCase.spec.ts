import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe('Show User Profile', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
    );
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to show user by id', async () => {
    const user = await createUserUseCase.execute({
      name: 'Lucas',
      email: 'lucas@email.com',
      password: '1234',
    });

    const result = await showUserProfileUseCase.execute(user.id);

    expect(result).toHaveProperty('id');
  });

  it('should not be able to show a user that does not exist', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('1234');
    }).rejects.toBeInstanceOf(AppError);
  });
});
