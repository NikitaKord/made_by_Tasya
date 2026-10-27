# MadeByTasya — лабораторный проект

Проект создан в папке `C:\Users\Пользователь\Desktop\labs\sait`.

## Как запустить
1. Открыть папку проекта в браузере/VS Code.
2. Запустить `index.html` (лучше через Live Server).

## Развертывание на GitHub Pages
Проект подготовлен для лабораторной работы №4. В репозитории должен быть включен
GitHub Pages с источником `GitHub Actions`. После отправки ветки `main` workflow
`.github/workflows/pages.yml` автоматически опубликует сайт.

```powershell
git init
git add .
git commit -m "Prepare site for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPOSITORY>.git
git push -u origin main
```

После успешного запуска workflow адрес сайта будет иметь вид:
`https://<USERNAME>.github.io/<REPOSITORY>/`.

## Покрытие требований
- **ЛР1**: 3 страницы, меню, логотип, отдельный `style.css`, 6 изображений в галерее (CSS Grid) на главной.
- **ЛР2**: JS-навигация, 2+ динамические формы (авторизация/регистрация, заказ), API-загрузка новинок.
- **ЛР3**: структура БД из 2 таблиц в `db/schema.sql`.

## Файлы
- `index.html` — главная страница
- `product.html` — страница товара
- `contacts.html` — контакты
- `style.css` — стили
- `assets/js/script.js` — динамика
- `docs/TZ_MadeByTasya.md` — техническое задание
- `db/schema.sql` — SQL-структура
- `.github/workflows/pages.yml` — автоматическое развертывание на GitHub Pages
