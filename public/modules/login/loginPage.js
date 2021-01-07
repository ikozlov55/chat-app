export default class LoginPage {
  constructor(appContainer) {
    this.appContainer = appContainer;
  }

  set onSubmit(handler) {
    this.appContainer.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      if (action && action === 'login') {
        const form = this.appContainer.querySelector('.login__form');
        event.preventDefault();
        if (form.checkValidity()) {
          const username = form.elements.username.value;
          handler(username);
        } else {
          form.reportValidity();
        }
      }
    });
  }

  set onLogout(handler) {
    window.addEventListener('beforeunload', handler);
  }

}
