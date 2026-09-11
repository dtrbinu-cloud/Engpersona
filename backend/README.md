# Backend

Kode baru diletakkan berdasarkan layer: `routes`, `controllers`, `requests`, `services`, `repositories`, `resources`, `middleware`, `utils`, dan `database`.

API memakai prefix `/api/v1`. Endpoint `/auth/register` dan `/auth/login` mengembalikan JWT access token. Refresh token berada di cookie `HttpOnly`; gunakan `/auth/refresh` dan `/auth/logout` untuk rotasi dan pencabutan token.
