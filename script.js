document.addEventListener('DOMContentLoaded', async function () {
   'use strict';

   //Входные глобальные данные для скрипта (элементы HTML)
   const categoriesList = document.querySelector('.categories__list');
   const productsGrid = document.querySelector('.products__grid');
   const sortBtn = document.querySelector('.categories__option');
   let currentProducts;

   //todo 1) ЗАПРОСЫ НА СЕРВЕР ЧЕРЕЗ ОБЪЕКТ REQUEST и PROMISE ALL НА СПИСОК КАТЕГОРИЙ И ПРОДУКТЫ


   const request = {

      //Массив с адрессами запросов
      URLS: ['https://fakestoreapi.com/products/categories', 'https://fakestoreapi.com/products?limit=8'],

      //Метод отправляет запрос и возвращает запарсенные данные
      sendRequest: async (url) => {
         let responce, data;
         try {
            responce = await fetch(`${url}`);
            if (responce.ok === false) {
               throw new Error(`Responce: ${responce.url} failed with ${responce.status}`);
            }
            data = await responce.json();

         } catch (error) {
            console.log(error);
         }
         return data
      }
   }

   //Для каждого адреса из масива адресов вызыаем метод sendRequest - отправка fetch-запроса
   //в request.data - помещаются результаты завершения массива промисов работы методов sendRequest - промисов
   try {
      request.data = await Promise.all(request.URLS.map(url => request.sendRequest(url)));
      console.log(request);
   } catch (error) {
      console.log(error.message);
      alert(error.message);
   }

   //Получение данных от сервера (categories и products) путем деструктуризации массива с запарсенным данными
   const [categories, productsAll] = request.data;
   console.log(categories);
   console.log(productsAll);
   //Записываем полученный список продуктов в глобальную переменную - массив текущих отрисованных продуктов
   currentProducts = productsAll;
   //todo 2) Рендеринг в макете полученных данных
   //Список категорий
   generateCategoriesHtml(categories);

   //Карточки продуктов
   generateProductsHtml(productsAll);

   //todo 3) Обоаботка нажатия по списку категорий и отрисовываю нужные продукты
   // Деллигируем событие на родительский блок UL и проверяем нажатие на ссылку в Li
   categoriesList.addEventListener('click', async function (event) {

      //Если кликнули не по ссылке, то выходим
      if (!(event.target.tagName === 'A')) {
         console.log('Кликнули в пустом месте');
         return
      }

      //Сперва убираем стили со всех елементов Li, чтоб потом добавить конкретному
      const listItems = categoriesList.querySelectorAll('.categories__item');
      listItems.forEach(item => item.classList.remove('active'));
      //добавляем елементу Li нажатой ссылки класс со стилями Active
      event.target.parentElement.classList.add('active');

      //Обработка клика по категории
      const currentCategory = event.target.parentElement.getAttribute('category');
      console.log(currentCategory);

      //Если нажали по кнопке ALL Products -> удаляем все текущие отрисованные карточки и рендерим первоначальный набор продуктов и выхожу из функции
      if (currentCategory === "all products") {
         generateProductsHtml(productsAll);
         //Записываем первоначальный список продуктов в глобальную переменную - массив текущих отрисованных продуктов
         currentProducts = productsAll;
         console.log('Опять отрисовал все продукты и вышел');
         console.log(currentProducts);
         return
      };
      // Пушим URL с выбранной (нажатой) категорией в массив URL объекта request
      request.URLS.push(`https://fakestoreapi.com/products/category/${currentCategory}`);

      // Отправляем запрос по запушенной URL и получаем список продуктов в указанной категории
      const currentCategoryProducts = await request.sendRequest(request.URLS.at(-1));
      console.log(currentCategoryProducts);
      //Рендерим нужные товары в указанной категории
      generateProductsHtml(currentCategoryProducts);

      //Пушим полученные данные в поле data объекта request
      request.data.push(currentCategoryProducts);
      //Записываем полученный список продуктов в глобальную переменную - массив текущих отрисованных продуктов
      currentProducts = currentCategoryProducts;
      console.log(currentProducts);
   })

   //todo 4) Реализация сортировки карточек по цене
   sortBtn.addEventListener('click', function () {
      // Массив текущих прдуктов разбиваем в новый массив, сортируем по цене и записываем в массив отсортированных прродуктов
      const sortedProducts = [...currentProducts].sort((a, b) => a.price - b.price);
      console.log(sortedProducts);
      // Рендерим отсортированный массив продуктов
      generateProductsHtml(sortedProducts);
   })

   // Функция генерации списка категорий в HTML из ответа сервера
   function generateCategoriesHtml(categories) {
      categories.forEach((element) => {
         categoriesList.insertAdjacentHTML('beforeend', `<li category="${element}" class="categories__item"><a href="#">${capitalize(element)}</a></li>`);
      })
      //Вспомогательная Функция, в которой первая буква категории становится заглавной
      function capitalize(text) {
         return text.charAt(0).toUpperCase() + text.slice(1);
      }
   }

   // Функция которая удаляет все карточки продуктов из макета
   function removeProductsHTML() {
      const removeItems = document.querySelectorAll('.product');
      removeItems.forEach(item => item.remove())
   }

   // Функция генерации карточек продуктов в HTML из ответа сервера
   function generateProductsHtml(products) {

      removeProductsHTML() //для безопасности удаляем все продукты и создаем новые
      products.forEach((element) => {

         // Блок оболочка Product (карточка товара)
         const product = document.createElement('div');
         product.classList.add('product');
         product.setAttribute('category', `${element.category}`);
         productsGrid.append(product);

         //Внутри карточки товара - ссылка с картинкой внутри
         const linkTag = document.createElement('a')
         product.insertAdjacentElement('afterbegin', linkTag);
         linkTag.classList.add('product__image');

         // Картианка товара
         const productImg = document.createElement('img')
         linkTag.insertAdjacentElement('afterbegin', productImg);
         productImg.src = `${element.image}`;
         productImg.alt = `${element.title}`;

         // Блок с названием и ценой после ссылки(картинки)
         const productInfo = document.createElement('div')
         product.insertAdjacentElement('beforeend', productInfo);
         productInfo.classList.add('product__info');

         //Название продукта в блоке Инфо
         const productName = document.createElement('div')
         productInfo.insertAdjacentElement('afterbegin', productName);
         productName.textContent = `${element.title}`;
         productName.classList.add('product__name');

         //Цена продукта в блоке Инфо
         const productPrice = document.createElement('div')
         productInfo.insertAdjacentElement('beforeend', productPrice)
         productPrice.textContent = `$${element.price}`;
         productPrice.classList.add('product__price');
      })
   }
})



