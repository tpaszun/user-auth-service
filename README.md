Authentication service
======================

Functions:

  - check if user is logged in and return logged user
  - log in
  - log out
  - register account
  - activate account
  - delete account
  - reset account's password

Redis:

  - Sessions (SHA25 hash)
  - Users
  - RememberMe tokens (SHA256 hash)
  - Activation tokens (SHA256 hash)
  - PassReset tokens (SHA256 hash)


### `GET /check`

response: `uid`

###`GET /user`

response: User object json

    {
	    id: '12836127',
	    email: 'test@example.com',
	    fullname: 'Test Example'
    }

### `POST /login`

req params:

  - `email`
  - `pass`

response:
set-cookie Session

### `POST /logout`
response:
delete cookie

### `POST /register`
req params:

  - `email`
  - `pass`

### `POST /deleteaccount`

req params:

  - `pass`

### `GET /activate/:id`
response:
set-cookie Session

### `POST /resetpass/:id`

req params:

  - `newpass`
