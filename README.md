# akb

## Another Knowelege Base
### get started

- docker  
run in root of project
`sudo docker-compose up -d`  
_after testing don't forget run 'sudo docker-compose' and delete images_  
- local
for local starting you should comment .env file and run  
`npm i`  
`npm start`  

**API**  
_there is postman collection in .devel directory._  
auth  
| method  | route               | description           |
|---------|---------------------|-----------------------|
| POST    | /auth/register      | registartion          |
| POST    | /auth/login         | login and auth        |
| POST    | /auth/refresh       | auth by refresh token |
| POST    | /auth/logout        | logout                |  

user  
| method  | route               | description           |
|---------|---------------------|-----------------------|
| PUT     | /user/:uuid         | update nickname       |
| GET     | /user/list          | get list of users     |
| GET     | /user/:uuid         | get one user by uuid  |
| DELETE  | /user/:uuid         | delete user by uuid   |  

post  
| method  | route               | description           |
|---------|---------------------|-----------------------|
| POST    | /post               | create post           |
| PUT     | /post/:uuid         | update post           |
| GET     | /post/list          | get list of posts     |
| GET     | /post/:uuid         | get one post by uuid  |
| DELETE  | /post/:uuid         | delete post by uuid   |

