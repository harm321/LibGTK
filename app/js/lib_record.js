        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация таблицы (убрали createTableHeader)
            loadTableData();

            // Обработчик открытия модального окна
            document.querySelector('.add-book-btn').addEventListener('click', function() {
                document.getElementById('addBookModal').style.display = 'block';
            });

            // Обработчик закрытия модального окна
            document.querySelector('.close').addEventListener('click', function() {
                document.getElementById('addBookModal').style.display = 'none';
            });

            // Закытие модального окна при клике вне его
            window.addEventListener('click', function(event) {
                const modal = document.getElementById('addBookModal');
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Обработчик чекбокса "Выбрать все"
            const selectAllCheckbox = document.getElementById('selectAll');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', function() {
                    const rowCheckboxes = document.querySelectorAll('table tbody .row-checkbox');
                    rowCheckboxes.forEach(checkbox => {
                        checkbox.checked = selectAllCheckbox.checked;
                    });
                });
            }

            // Обработка меню для каждой записи
            document.addEventListener('click', function(e) {
                // Если клик был по кнопке меню
                if (e.target.closest('.menu-btn')) {
                    e.stopPropagation();

                    // Закрываем все открытые меню
                    document.querySelectorAll('.menu-options').forEach(menu => {
                        if (menu !== e.target.closest('.menu-btn').nextElementSibling) {
                            menu.style.display = 'none';
                        }
                    });

                    // Переключаем текущее меню
                    const menuOptions = e.target.closest('.menu-btn').nextElementSibling;
                    menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
                }
                // Если клик был вне меню, закрываем все меню
                else if (!e.target.closest('.menu-options')) {
                    document.querySelectorAll('.menu-options').forEach(menu => {
                        menu.style.display = 'none';
                    });
                }
            });

            // Делегирование события для кнопок удаления
            document.addEventListener('click', async function(e) {
                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn) {
                    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                        const id = deleteBtn.dataset.id;
                        try {
                            console.log('Отправляем запрос на удаление id:', id); // Для отладки
                            const response = await fetch(`api/delete_lib_record.php?id=${id}`);
                            
                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error('Ответ сервера:', errorText); // Для отладки
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }

                            const result = await response.json();
                            console.log('Результат удаления:', result); // Для отладки

                            if (result.success) {
                                await loadTableData();
                                alert('Запись успешно удалена');
                            } else {
                                throw new Error(result.error || 'Ошибка при удалении записи');
                            }
                        } catch (error) {
                            console.error('Ошибка:', error);
                            alert(`Ошибка при удалении: ${error.message}`);
                        }
                    }
                }
            });

            // Делегирование события для кнопок редактирования
            document.addEventListener('click', async function(e) {
                const editBtn = e.target.closest('.edit-btn');
                if (editBtn) {
                    const id = editBtn.dataset.id; // Получаем id
                    try {
                        console.log('Отправляем запрос на получение данных для id:', id); // Для отладки
                        const response = await fetch(`api/get_lib_records.php?id=${id}`);
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error('Ответ сервера:', errorText);
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const result = await response.json();
                        console.log('Полученные данные:', result); // Для отладки

                        if (result.success && result.data) {
                            // Заполняем форму данными
                            const form = document.getElementById('addBookForm');
                            const record = result.data;

                            // Заполняем поля формы
                            form.querySelector('[name="title"]').value = record.title || '';
                            form.querySelector('[name="authors"]').value = record.authors || '';
                            form.querySelector('[name="publication_year"]').value = record.publication_year || '';
                            form.querySelector('[name="publisher"]').value = record.publisher || '';
                            form.querySelector('[name="ISBN"]').value = record.ISBN || '';
                            form.querySelector('[name="quantity"]').value = record.quantity || '';
                            form.querySelector('[name="condition"]').value = record.condition || '';

                            // Сохраняем id для редактирования
                            form.dataset.editId = id;

                            // Меняем заголовок модального окна
                            const modalTitle = document.querySelector('#addBookModal h2');
                            if (modalTitle) {
                                modalTitle.textContent = 'Редактировать запись';
                            }

                            // Открываем модальное окно
                            document.getElementById('addBookModal').style.display = 'block';
                        } else {
                            throw new Error(result.error || 'Запись не найдена');
                        }
                    } catch (error) {
                        console.error('Ошибка:', error);
                        alert(`Ошибка при загрузке данных: ${error.message}`);
                    }
                }
            });

            // Обновляем обработчик отправки формы
            document.getElementById('addBookForm').addEventListener('submit', async function(e) {
                e.preventDefault();

                try {
                    const formData = new FormData(this);
                    const data = {};

                    // Собираем данные формы
                    formData.forEach((value, key) => {
                        data[key] = value.trim();
                    });

                    // Определяем, это редактирование или добавление
                    const isEdit = this.dataset.editId !== undefined;
                    
                    // Если это редактирование, добавляем id
                    if (isEdit) {
                        data.id = this.dataset.editId;
                    }

                    console.log('Отправляемые данные:', data); // Для отладки

                    const response = await fetch(isEdit ? 'api/lib_record_update.php' : 'api/lib_record_add.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Ответ сервера:', errorText);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    console.log('Результат сохранения:', result); // Для отладки

                    if (result.success) {
                        alert(isEdit ? 'Запись успешно обновлена!' : 'Запись успешно добавлена!');
                        
                        // Закрываем модальное окно
                        document.getElementById('addBookModal').style.display = 'none';
                        
                        // Очищаем форму и удаляем ID редактируемой записи
                        this.reset();
                        delete this.dataset.editId;
                        
                        // Возвращаем заголовок модального окна
                        const modalTitle = document.querySelector('#addBookModal h2');
                        if (modalTitle) {
                            modalTitle.textContent = 'Добавить новую запись';
                        }
                        
                        // Обновляем таблицу
                        await loadTableData();
                    } else {
                        throw new Error(result.error || 'Неизвестная ошибка при сохранении записи');
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert(`Ошибка: ${error.message}`);
                }
            });

            // Упрощенный оработчик поиска
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function(e) {
                const searchText = e.target.value.toLowerCase();
                const tbody = document.querySelector('table tbody');
                const rows = tbody.getElementsByTagName('tr');

                for (let row of rows) {
                    let found = false;
                    const cells = row.getElementsByTagName('td');
                    for (let i = 0; i < cells.length - 1; i++) {
                        const cellText = cells[i].textContent.toLowerCase();
                        if (cellText.includes(searchText)) {
                            found = true;
                            break;
                        }
                    }
                    row.style.display = found ? '' : 'none';
                }

                // Обновляем счетчик видимых записей
                updateBookCount(true);
            });

            // Очистка поиска по Escape
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    this.dispatchEvent(new Event('input'));
                }
            });

            // Обновляем функцию подсчета записей
            function updateBookCount(isSearch = false) {
                const tbody = document.querySelector('table tbody');
                const rows = tbody.getElementsByTagName('tr');
                let visibleCount = 0;

                for (let row of rows) {
                    if (row.style.display !== 'none') {
                        visibleCount++;
                    }
                }

                const headerSubtitle = document.getElementById('header-subtitle');
                if (headerSubtitle) {
                    if (isSearch) {
                        const totalCount = rows.length;
                        headerSubtitle.textContent = `Найдено ${visibleCount} из ${totalCount} книг`;
                    } else {
                        headerSubtitle.textContent = `${visibleCount} книг`;
                    }
                }
            }

            // Добавляем стили для поля поиска
            searchInput.style.padding = '8px';
            searchInput.style.border = '1px solid #ddd';
            searchInput.style.borderRadius = '4px';
            searchInput.style.marginBottom = '10px';
            searchInput.style.width = '200px';

            // Добавляем очистку поиска при нажатии Escape
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.value = '';
                    this.dispatchEvent(new Event('input'));
                }
            });

            // Добавляем иконку поиска
            const searchWrapper = document.createElement('div');
            searchWrapper.style.position = 'relative';
            searchWrapper.style.display = 'inline-block';

            const searchIcon = document.createElement('img');
            searchIcon.src = './img/search-ico.svg'; // Убедитесь, что путь иконке правильныйя
            searchIcon.style.position = 'absolute';
            searchIcon.style.right = '10px';
            searchIcon.style.top = '50%';
            searchIcon.style.transform = 'translateY(-50%)';
            searchIcon.style.width = '16px';
            searchIcon.style.height = '16px';
            searchIcon.style.opacity = '0.5';

            // Оборачиваем input в контейнер с иконкой
            searchInput.parentNode.insertBefore(searchWrapper, searchInput);
            searchWrapper.appendChild(searchInput);
            searchWrapper.appendChild(searchIcon);

            // Добавляем placeholder с подсказкой
            searchInput.placeholder = 'Поиск по всем полям...';

            // Добавляем кнопку очистки
            const clearButton = document.createElement('button');
            clearButton.innerHTML = '×';
            clearButton.style.position = 'absolute';
            clearButton.style.right = '30px';
            clearButton.style.top = '50%';
            clearButton.style.transform = 'translateY(-50%)';
            clearButton.style.border = 'none';
            clearButton.style.background = 'none';
            clearButton.style.fontSize = '18px';
            clearButton.style.color = '#999';
            clearButton.style.cursor = 'pointer';
            clearButton.style.display = 'none';
            clearButton.title = 'Очистить поиск';

            searchWrapper.appendChild(clearButton);

            // Покаываем/скрываем кнопку очистки
            searchInput.addEventListener('input', function() {
                clearButton.style.display = this.value ? 'block' : 'none';
            });

            // Обработчик клика по кнопке очиски
            clearButton.addEventListener('click', function() {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                this.style.display = 'none';
                searchInput.focus();
            });

            // Обработчик кнопки экспорта
            document.querySelector('.export-button').addEventListener('click', async function() {
                try {
                    // Показываем индикатор загрузки
                    this.disabled = true;
                    this.innerHTML = '<img src="./img/loading.gif" alt="Загрузка..." class="button-icon">Экспорт...';

                    const response = await fetch('api/export_excel.php');

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    // Получаем blob и ответа
                    const blob = await response.blob();

                    // Создаем ссылку для скачивания
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `lib_record_${new Date().toISOString().split('T')[0]}.xlsx`;

                    // Добавляем ссылку на страницу и эмулируем клик
                    document.body.appendChild(a);
                    a.click();

                    // Удаляем ссылку
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                } catch (error) {
                    console.error('Ошибка экспорта:', error);
                    alert(`Ошибка при экспорте: ${error.message}`);
                } finally {
                    // Возвращаем кнопку в исходно состояние
                    this.disabled = false;
                    this.innerHTML = '<img src="./img/ico-export.svg" alt="Иконка экспорта" class="button-icon">Экспортировать';
                }
            });
        });

        // Функция загрузки данных таблицы
        async function loadTableData() {
            try {
                const response = await fetch('api/get_lib_records.php');
                const result = await response.json();

                const tbody = document.querySelector('table tbody');
                tbody.innerHTML = '';

                if (result.success && Array.isArray(result.data)) {
                    result.data.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="fixed-checkbox">
                                <input type="checkbox" class="row-checkbox">
                            </td>
                            <td>${escapeHtml(row.title)}</td>
                            <td>${escapeHtml(row.authors)}</td>
                            <td>${escapeHtml(row.publication_year)}</td>
                            <td>${escapeHtml(row.publisher)}</td>
                            <td>${escapeHtml(row.ISBN)}</td>
                            <td>${escapeHtml(row.quantity)}</td>
                            <td>${escapeHtml(row.condition)}</td>
                            <td class="fixed-menu">
                                <button class="menu-btn">
                                    <img src="./img/library-dashboard/menu-ico.svg" alt="Меню" class="menu-icon">
                                </button>
                                <div class="menu-options">
                                    <button class="menu-icon-btn edit-btn" data-id="${escapeHtml(row.id)}">
                                        <img src="./img/library-dashboard/edit-ico.svg" alt="Редактировать" class="menu-icon">
                                    </button>
                                    <button class="menu-icon-btn delete-btn" data-id="${escapeHtml(row.id)}">
                                        <img src="./img/library-dashboard/delete-ico.svg" alt="Удалить" class="menu-icon">
                                    </button>
                                </div>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });

                    updateBookCount();
                } else {
                    throw new Error(result.error || 'Неверный формат данных');
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                const tbody = document.querySelector('table tbody');
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: red;">Ошибка загрузки данных: ${error.message}</td></tr>`;
            }
        }

        // Функция обновления счетчика книг
        function updateBookCount() {
            const rows = document.querySelector('table tbody').getElementsByTagName('tr');
            const headerSubtitle = document.getElementById('header-subtitle');
            if (headerSubtitle) {
                headerSubtitle.textContent = `${rows.length} книг`;
            }
        }

        // Фунция для безопасного эканирования HTML
        function escapeHtml(unsafe) {
            if (unsafe === null || unsafe === undefined) return '';
            return unsafe
                .toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Функция для работы навигации
        document.addEventListener('DOMContentLoaded', function() {
            // Получаем все кнопки навигации
            const navButtons = document.querySelectorAll('.nav-section');

            // Добавляем обработчик для каждой кнопки
            navButtons.forEach(button => {
                if (button.tagName !== 'A') { // Пропускаем ссылки
                    button.addEventListener('click', function() {
                        // Находим следующий элемент (подменю)
                        const submenu = this.nextElementSibling;

                        // Закрываем все остальные подменю
                        document.querySelectorAll('.submenu').forEach(menu => {
                            if (menu !== submenu) {
                                menu.style.display = 'none';
                            }
                        });

                        // Переключаем видимость текущего подменю
                        if (submenu && submenu.classList.contains('submenu')) {
                            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                        }
                    });
                }
            });

            // Закрытие подменю при клике вне его
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.nav-section') && !event.target.closest('.submenu')) {
                    document.querySelectorAll('.submenu').forEach(menu => {
                        menu.style.display = 'none';
                    });
                }
            });

            // Добавляем активный класс для текущей страницы
            const currentPage = window.location.pathname.split('/').pop();
            document.querySelectorAll('.submenu a').forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.style.backgroundColor = '#e0e0e0';
                    link.parentElement.style.display = 'block';
                }
            });
        });
