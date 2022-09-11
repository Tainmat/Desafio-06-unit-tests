import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { AppError } from "../../../../shared/errors/AppError";

describe('Get Statement Operation', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;
  let createUserUseCase: CreateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;

  const user = {
    name: 'lucas',
    email: 'lucas@email.com',
    password: '1234'
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to get statement operation by id', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const statement = await createStatementUseCase.execute({
      user_id: userCreated.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'first deposit',
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: userCreated.id,
      statement_id: statement.id,
    });

    expect(result).toHaveProperty('id');
    expect(result.amount).toEqual(100);
  });

  it('should not be able to get statement operation if the user does not exist', async () => {
    expect(async () => {
      const userCreated = await createUserUseCase.execute(user);

      const statement = await createStatementUseCase.execute({
        user_id: userCreated.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'first deposit',
      });

      await getStatementOperationUseCase.execute({
        user_id: '1111',
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get statement operation if the statement does not exist', async () => {
    expect(async () => {
      const userCreated = await createUserUseCase.execute(user);

      await getStatementOperationUseCase.execute({
        user_id: userCreated.id,
        statement_id: '1111',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
