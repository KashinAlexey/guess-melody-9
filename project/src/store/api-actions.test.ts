import {Action} from 'redux';
import thunk, {ThunkDispatch} from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import {configureMockStore} from '@jedmao/redux-mock-store';
import {createAPI} from '../services/api';
import {checkAuthAction} from './api-actions';
import {requireAuthorization} from './user-process/user-process';
import {APIRoute} from '../const';
import {State} from '../types/state';

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
});
