The API returns commissions for all transactions after a new a transaction is posted.

Add a new transaction:

```
POST http://localhost:3000/transaction
{
    "date": "2021-07-29",
    "amount": "1",
    "currency": "EUR",
    "client_id": 4
}
```

You can get transactions (with commission info) for specific clients by calling
```
GET http://localhost:3000/transaction?clientId=42
```

## Installation

```bash
$ yarn
```

## Running the app

```bash
$ yarn start
```

## Test

```bash
$ yarn test
```

### Debugging

```bash
yarn start:debug
```

If you're using VS Code, a `launch.json` config exists. A debugger can be `Attach`ed once app is started.

Tests can also be debugged with VS Code running `Debug Jest Current File` configuration in opened test file.
