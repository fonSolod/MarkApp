from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.popup import Popup
import requests

class AuthApp(App):
    def build(self):
        self.layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Поле для логина
        self.login_input = TextInput(hint_text='Логин', multiline=False)
        self.layout.add_widget(self.login_input)

        # Поле для пароля
        self.password_input = TextInput(hint_text='Пароль', multiline=False, password=True)
        self.layout.add_widget(self.password_input)

        # Кнопка для отправки данных
        self.submit_button = Button(text='Войти', on_press=self.send_auth_request)
        self.layout.add_widget(self.submit_button)

        return self.layout

    def send_auth_request(self, instance):
        login = self.login_input.text
        password = self.password_input.text

        # URL для отправки запроса (замените на ваш)
        url = 'https://l4.ihubzone.ru/api/auth/'

        # Данные для отправки
        data = {
            'username': login,
            'password': password
        }

        try:
            # Отправка POST-запроса
            response = requests.post(url, data=data)
            if response.status_code == 200:
                # Получение токена из ответа
                token = response.json().get('token')
                self.show_popup('Успех', f'Токен: {token}')
            else:
                self.show_popup('Ошибка', 'Неверный логин или пароль')
        except Exception as e:
            self.show_popup('Ошибка', f'Произошла ошибка: {str(e)}')

    def show_popup(self, title, message):
        # Создание всплывающего окна
        popup_layout = BoxLayout(orientation='vertical', padding=10, spacing=10)
        popup_layout.add_widget(Label(text=message))
        close_button = Button(text='Закрыть')
        popup_layout.add_widget(close_button)

        popup = Popup(title=title, content=popup_layout, size_hint=(0.8, 0.4))
        close_button.bind(on_press=popup.dismiss)
        popup.open()

if __name__ == '__main__':
    AuthApp().run()