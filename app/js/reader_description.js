        document.addEventListener('DOMContentLoaded', function() {
            const tbody = document.querySelector('table tbody');
            tbody.innerHTML = '';
            const records = JSON.parse('<?php echo json_encode($records, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>');

            records.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fixed-checkbox">
                        <input type="checkbox" class="row-checkbox">
                    </td>
                    <td>${record.full_name || ''}</td>
                    <td>${record.birth_date || ''}</td>
                    <td>${record.nationality || ''}</td>
                    <td>${record.phone || ''}</td>
                    <td>${record.email || ''}</td>
                    <td>${record.student_id || ''}</td>
                    <td>${record.course || ''}</td>
                    <td>${record.groups || ''}</td>
                    <td>${record.books_taken || ''}</td>
                    <td>${record.debt ? 'Есть' : 'Нет'}</td>
                    <td class="fixed-menu">
                        <button class="menu-btn">
                            <img src="./img/library-dashboard/menu-ico.svg" alt="Меню" class="menu-icon">
                        </button>
                        <div class="menu-options">
                            <button class="menu-icon-btn edit-btn" data-id="${record.id}">
                                <img src="./img/library-dashboard/edit-ico.svg" alt="Редактировать" class="menu-icon">
                            </button>
                            <button class="menu-icon-btn delete-btn" data-id="${record.id}">
                                <img src="./img/library-dashboard/delete-ico.svg" alt="Удалить" class="menu-icon">
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Обновляем счетчик
            updateBookCount();

            // Обработчик кнопки "Добавить новую запись"
            const addButton = document.querySelector('.add-book-btn');
            if (addButton) {
                addButton.addEventListener('click', function() {
                    const modal = document.getElementById('addBookModal');
                    if (modal) {
                        // Очищаем форму
                        const form = document.getElementById('addBookForm');
                        form.reset();
                        form.id.value = ''; // Очищаем скрытое поле id
                        
                        // Возвращаем заголовок
                        const modalTitle = modal.querySelector('h2');
                        if (modalTitle) {
                            modalTitle.textContent = 'Добавить новую запись';
                        }
                        
                        modal.style.display = 'block';
                    }
                });
            }

            // Обработчик закрытия модального окна
            const closeButton = document.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    const modal = document.getElementById('addBookModal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                });
            }

            // Обработчик формы добавления/редактирования
            const addBookForm = document.getElementById('addBookForm');
            if (addBookForm) {
                addBookForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    try {
                        const formData = new FormData(this);
                        
                        // Удаляем пустой id при добавлении новой записи
                        if (!formData.get('id')) {
                            formData.delete('id');
                        }

                        const response = await fetch('handlers/save_reader.php', {
                            method: 'POST',
                            body: formData
                        });

                        const result = await response.json();
                        
                        if (result.success) {
                            alert(result.message || 'Данные успешно сохранены');
                            // Очищаем форму
                            this.reset();
                            this.id.value = ''; // Очищаем скрытое поле id
                            
                            // Возвращаем заголовок модального окна
                            const modalTitle = document.querySelector('#addBookModal h2');
                            if (modalTitle) {
                                modalTitle.textContent = 'Добавить новую запись';
                            }
                            
                            document.getElementById('addBookModal').style.display = 'none';
                            location.reload();
                        } else {
                            throw new Error(result.error || 'Ошибка при сохранении');
                        }
                    } catch (error) {
                        console.error('Ошибка:', error);
                        if (error.message.includes('UNIQUE constraint failed')) {
                            alert('Читатель с таким номером студенческого билета уже существует');
                        } else {
                            alert('Произошла ошибка при сохранении данных: ' + error.message);
                        }
                    }
                });
            }

            // Обработчики кнопок редактирования
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const id = this.dataset.id;
                    try {
                        const response = await fetch(`handlers/get_reader.php?id=${id}`);
                        if (!response.ok) {
                            throw new Error('Ошибка при загрузке данных');
                        }
                        const data = await response.json();
                        
                        // Заполняем форму данными
                        const form = document.getElementById('addBookForm');
                        form.id.value = data.id; // Устанавливаем ID в скрытое поле
                        
                        // Заполняем остальные поля
                        ['full_name', 'birth_date', 'nationality', 'phone', 'email', 
                         'student_id', 'course', 'groups', 'books_taken'].forEach(field => {
                            const input = form[field];
                            if (input) {
                                input.value = data[field] || '';
                            }
                        });

                        // Обрабатываем чекбокс задолженности отдельно
                        if (form.debt) {
                            form.debt.value = data.debt ? "1" : "0";
                        }

                        // Показываем модальное окно
                        const modal = document.getElementById('addBookModal');
                        if (modal) {
                            // Меняем заголовок модального окна
                            const modalTitle = modal.querySelector('h2');
                            if (modalTitle) {
                                modalTitle.textContent = 'Редактировать запись';
                            }
                            modal.style.display = 'block';
                        }
                    } catch (error) {
                        console.error('Ошибка:', error);
                        alert('Ошибка при загрузке данных');
                    }
                });
            });

            // Обработчики кнопок удаления
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                        const id = this.dataset.id;
                        try {
                            const response = await fetch(`handlers/delete_reader.php?id=${id}`, {
                                method: 'DELETE'
                            });
                            
                            if (response.ok) {
                                location.reload(); // Перезагружаем страницу после успешного удаления
                            } else {
                                throw new Error('Ошибка при удалении');
                            }
                        } catch (error) {
                            console.error('Ошибка:', error);
                            alert('Произошла ошибка при удалении записи');
                        }
                    }
                });
            });

            // Обработчик кнопки экспорта
            const exportButton = document.querySelector('.export-btn');
            if (exportButton) {
                exportButton.addEventListener('click', async function() {
                    try {
                        window.location.href = 'handlers/export_readers.php';
                    } catch (error) {
                        console.error('Ошибка:', error);
                        alert('Произошла ошибка при экспорте данных');
                    }
                });
            }

            // Обработчики для навигационной панели
            const navButtons = document.querySelectorAll('.nav-section');
            navButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Если это кнопка с подменю
                    const submenu = this.nextElementSibling;
                    if (submenu && submenu.classList.contains('submenu')) {
                        // Закрываем все остальные подменю
                        document.querySelectorAll('.submenu').forEach(menu => {
                            if (menu !== submenu) {
                                menu.style.display = 'none';
                            }
                        });
                        // Переключаем текущее подменю
                        submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                    }
                });
            });

            // Закрытие подменю при клике вне навигации
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.sidebar')) {
                    document.querySelectorAll('.submenu').forEach(menu => {
                        menu.style.display = 'none';
                    });
                }
            });
        });

        // Функция обновления счетчика
        function updateBookCount() {
            const rows = document.querySelector('table tbody').getElementsByTagName('tr');
            document.getElementById('header-subtitle').textContent = `${rows.length} чиателей`;
        }

        // Обработчики для кнопок меню
        document.addEventListener('click', function(e) {
            const menuBtn = e.target.closest('.menu-btn');
            if (menuBtn) {
                e.stopPropagation();
                const menuOptions = menuBtn.nextElementSibling;
                // Закрываем все открытые меню
                document.querySelectorAll('.menu-options').forEach(menu => {
                    if (menu !== menuOptions) {
                        menu.style.display = 'none';
                    }
                });
                // Переключаем текущее меню
                menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
            }
            // Закрываем меню при клике вне его
            else if (!e.target.closest('.menu-options')) {
                document.querySelectorAll('.menu-options').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });

        // Обработчик сортировки
        const sortDropdown = document.querySelector('.sort-dropdown');
        const sortButton = document.querySelector('.dropdown-button');

        if (sortButton && sortDropdown) {
            sortButton.addEventListener('click', function(e) {
                e.stopPropagation();
                sortDropdown.style.display = sortDropdown.style.display === 'block' ? 'none' : 'block';
            });

            // Закрытие сортировки при клике вне
            document.addEventListener('click', function(e) {
                if (!sortDropdown.contains(e.target) && !sortButton.contains(e.target)) {
                    sortDropdown.style.display = 'none';
                }
            });
        }

        // Функция поиска
        function searchTable(searchText) {
            const tbody = document.querySelector('table tbody');
            const rows = tbody.getElementsByTagName('tr');
            const searchLower = searchText.toLowerCase();

            for (let row of rows) {
                let found = false;
                // Пропускаем первую ячейку (чекбокс) и седнюю (меню)
                const cells = Array.from(row.getElementsByTagName('td')).slice(1, -1);
                
                for (let cell of cells) {
                    const text = cell.textContent || cell.innerText;
                    if (text.toLowerCase().includes(searchLower)) {
                        found = true;
                        break;
                    }
                }
                
                row.style.display = found ? '' : 'none';
            }

            // Обновляем счетчик видимых записей
            updateBookCount();
        }

        // Добавляем обработчик для поля поиска
        const searchInput = document.querySelector('.controls input[type="text"]');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                searchTable(e.target.value);
            });
        }

        // Обновляем функцию подсчета записей
        function updateBookCount() {
            const rows = document.querySelector('table tbody').getElementsByTagName('tr');
            const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
            document.getElementById('header-subtitle').textContent = `${visibleRows.length} читателей`;
        }

        function editRecord(id) {
            // ... уществующий код ...
            form.groups.value = record.groups;  // Изменено с group на groups
            // ... остальной код ...
        }