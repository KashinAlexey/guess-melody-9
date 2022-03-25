import {Action} from 'redux';
import thunk, {ThunkDispatch} from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import {configureMockStore} from '@jedmao/redux-mock-store';
import {createAPI} from '../services/api';
import {checkAuthAction, loginAction, fetchQuestionAction, logoutAction} from './api-actions';
import {loadQuestions} from './game-data/game-data';
import {requireAuthorization} from './user-process/user-process';
import {APIRoute} from '../const';
import {State} from '../types/state';
import {AuthData} from '../types/auth-data';
import {makeFakeGenreQuestion, makeFakeArtistQuestion} from '../utils/mocks';

describe('Async actions', () => {
  const api = createAPI(); // наш реальный api
  const mockAPI = new MockAdapter(api); // Обеспечивает имитацию похода на сервер (на реальный не ходим)
  const middlewares = [thunk.withExtraArgument(api)];

  const mockStore = configureMockStore<
      State,
      Action,
      ThunkDispatch<State, typeof api, Action>
    >(middlewares);

  it('should authorization status is «auth» when server return 200', async () => {
    const store = mockStore();
    mockAPI
      .onGet(APIRoute.Login) // по указанному маршруту
      .reply(200, []); // возвращаем 200 и пустой массив

    expect(store.getActions()).toEqual([]); // никаких действий еще не было []

    await store.dispatch(checkAuthAction()); // диспатчим нужное реальное действие

    const actions = store.getActions().map(({type}) => type); // Получаем текущий массив всех действий

    expect(actions).toContain(requireAuthorization.toString()); // Проверяем, содержит ли действие нужное нам действие
  });

  it('should dispatch RequriedAuthorization and RedirectToRoute when POST /login', async () => {
    const fakeUser: AuthData = {login: 'test@test.ru', password: '123456'}; // имитация авторизации пользователя

    mockAPI
      .onPost(APIRoute.Login)
      .reply(200, {token: 'secret'});


    const store = mockStore();
    Storage.prototype.setItem = jest.fn(); // утилитарный метод позволяющие делать некоторые доп. тесты, jest будет следить за такой пустой функций (см. далее). У нас реальном loginAction есть функциия saveToken. Здесь мы ее имитируем

    await store.dispatch(loginAction(fakeUser));

    const actions = store.getActions().map(({type}) => type);

    expect(actions).toContain(requireAuthorization.toString());

    expect(Storage.prototype.setItem).toBeCalledTimes(1); // количество вызовов функции
    expect(Storage.prototype.setItem).toBeCalledWith('guess-melody-token', 'secret'); // с какими параметрами вызвана функция и т.п.
  });

  it('should dispatch Load_Questions when GET /questions', async () => {
    const mockQuestions = [makeFakeArtistQuestion(), makeFakeGenreQuestion()];
    mockAPI
      .onGet(APIRoute.Questions)
      .reply(200, mockQuestions);

    const store = mockStore();

    await store.dispatch(fetchQuestionAction());

    const actions = store.getActions().map(({type}) => type);

    expect(actions).toContain(loadQuestions.toString());
  });

  it('should dispatch Logout when Delete /logout', async () => {
    mockAPI
      .onDelete(APIRoute.Logout)
      .reply(204);

    const store = mockStore();
    Storage.prototype.removeItem = jest.fn(); // аналогично примеру выше только на удаление параметра в storage (removeItem). Имитация dropToken

    await store.dispatch(logoutAction());

    const actions = store.getActions().map(({type}) => type);

    expect(actions).toContain(requireAuthorization.toString());

    expect(Storage.prototype.removeItem).toBeCalledTimes(1);
    expect(Storage.prototype.removeItem).toBeCalledWith('guess-melody-token');
  });
});
