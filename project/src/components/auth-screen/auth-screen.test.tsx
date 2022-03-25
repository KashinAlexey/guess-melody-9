// Тест для компонента подключенного к хранилищу
import {render, screen} from '@testing-library/react';
import {createMemoryHistory} from 'history';
import {configureMockStore} from '@jedmao/redux-mock-store';
import {Provider} from 'react-redux';
import userEvent from '@testing-library/user-event';
import HistoryRouter from '../history-route/history-route';
import AuthScreen from './auth-screen';

const mockStore = configureMockStore();

describe('Component: AuthScreen', () => {
  it('should render "AuthScreen" when user navigate to "login" url', () => {
    const history = createMemoryHistory();
    history.push('/login');

    render(
      <Provider store={mockStore({})}>
        <HistoryRouter history={history}>
          <AuthScreen />
        </HistoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/Сыграть ещё раз/i)).toBeInTheDocument();
    expect(screen.getByText(/Хотите узнать свой результат\? Представьтесь!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Логин/i)).toBeInTheDocument(); // поле с таким то лейблом есть в документе
    expect(screen.getByLabelText(/Пароль/i)).toBeInTheDocument();

    userEvent.type(screen.getByTestId('login'), 'keks'); // симуляция действий пользователя, ввод текста в поле login
    userEvent.type(screen.getByTestId('password'), '123456');

    expect(screen.getByDisplayValue(/keks/i)).toBeInTheDocument(); // проверка, ввелся ли текст в те поля
    expect(screen.getByDisplayValue(/123456/i)).toBeInTheDocument();
  });
});
