import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { AppError } from "../../../../shared/errors/AppError";
import { OperationType } from "../../entities/Statement";

describe('Get Balance', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let getBalanceUseCase: GetBalanceUseCase;
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
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it('should not be able get balance if the user does not exist', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: '123' });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to get list with all operations and balance by user id', async () => {
    const userCreated = await createUserUseCase.execute({
      name: 'lucas',
      email: 'lucas@email.com',
      password: '1234'
    });

    await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'first deposit',
    });

    await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'first withdraw',
    });

    const balance = await getBalanceUseCase.execute({ user_id: userCreated.id });

    expect(balance.statement.length).toEqual(2);
    expect(balance.balance).toEqual(50);
  });
})
