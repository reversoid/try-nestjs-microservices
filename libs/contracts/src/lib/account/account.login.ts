export namespace AccountLogin {
  const topic = 'account.login.command';

  class Request {
    email: string;
    password: string;
  }

  class Response {
    access_token: string;
  }
}
