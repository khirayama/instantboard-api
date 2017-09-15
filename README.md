# Instantboard API Server

## Getting started

```
# initialize
$ npm run db:create
$ npm run db:migrate

$ npm run dev
```

## Test

```
# initialize
$ npm run db:create
$ NODE_ENV=test npm run db:migrate

# run test
$ npm test
```

## E2E Test

```
# initialize
$ npm run db:create
$ NODE_ENV=test npm run db:migrate

# run test
$ NODE_ENV=test npm run dev
$ npm run test:e2e
```

## Database

- users(id / uid / provider / name / created_at / updated_at)
- labels(id / user_id / name / created_at / updated_at)
- label_statuses(id / user_id / label_id / priority / visibled)
- tasks(id / user_id / label_id / content / priority / completed / created_at / updated_at)
- requests(id / user_id / label_id / status / created_at / updated_at)

## End Points

- `/api`
  - `/v1`
    - `/user`
      - `/` GET: show current user
      - `/` PUT: update current user
      - `/` DELETE: delete current user
    - `/tasks`
      - `/` GET: index task
      - `/` POST: create task
      - `/:id` GET: show task
      - `/:id` PUT: update task
      - `/:id` DELETE: delete task
      - `/:id/sort` PUT: sort task
    - `/labels`
      - `/` GET: index label
      - `/` POST: create label
      - `/:id` GET: show label
      - `/:id` PUT: update label
      - `/:id` DELETE: delete label
      - `/:id/sort` PUT: sort label
    - `/requests`
      - `/` GET: index request
      - `/` POST: create request
      - `/:id` GET: show request
      - `/:id` PUT: update request
      - `/:id` DELETE: delete request
    - `/members`
      - `/` GET: index members
    - `/search`
      - `/users`
        - `/` GET: search users
