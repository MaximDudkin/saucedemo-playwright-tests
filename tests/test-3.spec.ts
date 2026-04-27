import { test, expect } from '@playwright/test';

//Функция для перехода на главную и авторизации
async function login(page, username, password) {
  await page.goto('https://www.saucedemo.com');
  await page.locator('#user-name').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#login-button').click();
}

test.describe('Sauce Demo - Комплексная проверка магазина', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'standard_user', 'secret_sauce');
  });

  test('Успешная авторизация', async ({ page }) => {
    // Проверка, что авторизация прошла успешно
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('Добавление товара в корзину', async ({ page }) => {
    // Шаг 1: Добавляем первый товар в корзину
    await page.getByText('Add to cart').first().click();

    // Шаг 2: Добавляем второй товар в корзину
    await page.getByText('Add to cart').nth(1).click();

    // Шаг 3: Проверяем, что счётчик корзины изменился
    const counter = page.locator('.shopping_cart_badge');
    await expect(counter).toHaveText('2');
  });

  test('Проверка сортировки товаров по имени (A-Z)', async ({ page }) => {
    // 1. Выбираем в выпадающем списке сортировку "Name (A to Z)"
    await page.waitForSelector('.product_sort_container');
    await page.locator('.product_sort_container').click();
    await page.selectOption('select', 'az');

    // 2. Собираем все названия товаров в массив строк
    const itemNames = await page.locator('.inventory_item_name').allInnerTexts();

    // 3. Создаем копию массива и сортируем её по алфавиту программно
    const sortedNames = [...itemNames].sort();

    // 4. Сравниваем полученный список с эталонным
    expect(itemNames).toEqual(sortedNames);
  });

  test('Разлогин пользователя', async ({ page }) => {
    // Шаг 4: Открываем боковое меню. Кликаем кнопку разлогин
    await page.locator('#react-burger-menu-btn').click();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await page.locator('#logout_sidebar_link').click();

    // Проверка, что разлогин прошел успешно
    const loginButton = page.locator('#login-button');
    await expect(loginButton).toBeVisible();
  });
});
