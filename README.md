# newfeeds_express
Bước 1.
- clone project
  - git clone https://github.com/hoangluc98/newfeeds_express.git
- Tải Studio3T hoặc MongoDB
  - https://studio3t.com/download/
  - https://www.mongodb.com/download-center/community
- Tải Redis
  - https://github.com/microsoftarchive/redis/releases

Bước 2.
- Chạy redis:
  - redis-server.exe
  - redis-cli.exe
- Import file express-database
- Chạy ứng dụng:
  - pm2 start index.js

Bước 3.
Chạy API
- Login, Logout (emai: luc@gmail.com, password: luc)
  - http://localhost:3000/auth/login
  - http://localhost:3000/auth/logout
- Users
  - http://localhost:3000/users/list
  - http://localhost:3000/users/item/:id
  - http://localhost:3000/users/insert
  - http://localhost:3000/users/update
  - http://localhost:3000/users/delete/:id
- Articles
  - http://localhost:3000/articles/list?page=...&userId=...
  - http://localhost:3000/articles/item/:id
  - http://localhost:3000/articles/insert
  - http://localhost:3000/articles/update
  - http://localhost:3000/articles/delete/:id
- Comments
  - http://localhost:3000/comments/list?articleId=...
  - http://localhost:3000/comments/item/:id
  - http://localhost:3000/comments/insert
  - http://localhost:3000/comments/update
  - http://localhost:3000/comments/delete/:id
- Statisticals
  - http://localhost:3000/statisticals/user-online
  - http://localhost:3000/statisticals/user-access?date=2019-10-29
  - http://localhost:3000/statisticals/like-of-article?articleId=...
  - http://localhost:3000/statisticals/comment-of-article?articleId=...
  - http://localhost:3000/statisticals/article-of-user
  - http://localhost:3000/statisticals/like-of-user
  - http://localhost:3000/statisticals/comment-of-user
