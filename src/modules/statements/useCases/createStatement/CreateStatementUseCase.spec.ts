import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { AppError } from "../../../../shared/errors/AppError";


describe('Create Statement', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  const user = {
    name: 'lucas',
    email: 'lucas@email.com',
    password: '1234'
  }

  it('should be able to create a new withdrawal', async () => {
    const userCreated = await createUserUseCase.execute(user);

    await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'first deposit',
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: userCreated.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'first withdrawal',
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create a new withdrawal with insufficient amount', async () => {
    expect(async () => {
      const userCreated = await createUserUseCase.execute(user);

      await createStatementUseCase.execute({
        user_id: userCreated.id,
        type: OperationType.DEPOSIT,
        amount: 50,
        description: 'first deposit',
      });

      const statement = await inMemoryStatementsRepository.create({
        user_id: userCreated.id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'first withdrawal',
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to create a new deposit', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const statement = await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'first deposit',
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be possible to perform the operations if the user does not exist', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: '123456',
        type: OperationType.DEPOSIT,
        amount: 50,
        description: 'first deposit',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
