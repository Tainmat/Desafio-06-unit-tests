import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

describe('Authenticate User', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;

  const user = {
    name: 'lucas',
    email: 'lucas@email.com',
    password: '1234',
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
    );
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to authenticate an user', async () => {
    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty('token');
  });

  it('should not be possible to authenticate the user with wrong email', () => {
    expect(async () => {
      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: 'lucas2@email.com',
        password: user.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be possible to authenticate the user with wrong password', () => {
    expect(async () => {
      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: '567',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
