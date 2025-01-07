
        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация таблицы
            const tbody = document.querySelector('table tbody');
            tbody.innerHTML = '';

            // Получаем данные из PHP и преобразуем их в JavaScript
            // const records = <?php echo json_encode($records, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;

            // Заполняем таблицу данными
            records.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fixed-checkbox">
                        <input type="checkbox" class="row-checkbox">
                    </td>
                    <td>${record.title || ''}</td>
                    <td>${record.authors || ''}</td>
                    <td>${record.publication_year || ''}</td>
                    <td>${record.publisher || ''}</td>
                    <td>${record.ISBN || ''}</td>
                    <td>${record.inventory_number || ''}</td>
                    <td>${record.category || ''}</td>
                    <td>${record.location || ''}</td>
                    <td>${record.entry_date || ''}</td>
                    <td>${record.condition || ''}</td>
                    <td>${record.availability ? 'Доступна' : 'Недоступна'}</td>
                    <td class="fixed-menu">
                        <button class="menu-btn">
                            <img src="./img/library-dashboard/menu-ico.svg" alt="Меню" class="menu-icon">
                        </button>
                        <div class="menu-options">
                            <button class="menu-icon-btn edit-btn" data-id="${record.inventory_number}">
                                <img src="./img/library-dashboard/edit-ico.svg" alt="Редактировать" class="menu-icon">
                            </button>
                            <button class="menu-icon-btn delete-btn" data-id="${record.inventory_number}">
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
                        const form = document.getElementById('addBookForm');
                        form.reset();
                        form.id.value = '';

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
                        const id = document.getElementById('record_id').value;
                        
                        // Если есть ID, добавляем его в formData
                        if (id) {
                            formData.set('id', id);
                        }

                        const response = await fetch('handlers/save_inventory.php', {
                            method: 'POST',
                            body: formData
                        });

                        const result = await response.json();
                        
                        if (result.success) {
                            alert(result.message || 'Данные успешно сохранены');
                            this.reset();
                            document.getElementById('record_id').value = '';
                            
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
                        alert('Произошла ошибка при сохранении данных: ' + error.message);
                    }
                });
            }

            // Обработчики кнопок редактирования
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const id = this.dataset.id;
                    try {
                        const response = await fetch(`handlers/get_inventory.php?id=${id}`);
                        if (!response.ok) {
                            throw new Error('Ошибка при загрузке данных');
                        }
                        const data = await response.json();
                        
                        const form = document.getElementById('addBookForm');
                        document.getElementById('record_id').value = id;
                        
                        ['title', 'authors', 'publication_year', 'publisher', 'ISBN', 
                         'inventory_number', 'category', 'location', 'entry_date', 'condition', 'availability'].forEach(field => {
                            const input = form[field];
                            if (input) {
                                if (field === 'availability') {
                                    input.value = data[field] ? "1" : "0";
                                } else {
                                    input.value = data[field] || '';
                                }
                            }
                        });

                        const modal = document.getElementById('addBookModal');
                        if (modal) {
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
                            const response = await fetch(`handlers/delete_inventory.php?id=${id}`, {
                                method: 'DELETE'
                            });
                            
                            if (response.ok) {
                                location.reload();
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
            const exportButton = document.querySelector('.export-button');
            if (exportButton) {
                exportButton.addEventListener('click', async function() {
                    try {
                        window.location.href = 'handlers/export_inventory.php';
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
                    const submenu = this.nextElementSibling;
                    if (submenu && submenu.classList.contains('submenu')) {
                        document.querySelectorAll('.submenu').forEach(menu => {
                            if (menu !== submenu) {
                                menu.style.display = 'none';
                            }
                        });
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

            // Обработчики для кнопок меню записей
            document.addEventListener('click', function(e) {
                const menuBtn = e.target.closest('.menu-btn');
                if (menuBtn) {
                    e.stopPropagation();
                    const menuOptions = menuBtn.nextElementSibling;
                    document.querySelectorAll('.menu-options').forEach(menu => {
                        if (menu !== menuOptions) {
                            menu.style.display = 'none';
                        }
                    });
                    menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
                } else if (!e.target.closest('.menu-options')) {
                    document.querySelectorAll('.menu-options').forEach(menu => {
                        menu.style.display = 'none';
                    });
                }
            });

            // Функция поиска
            function searchTable(searchText) {
                const tbody = document.querySelector('table tbody');
                const rows = tbody.getElementsByTagName('tr');
                const searchLower = searchText.toLowerCase();

                for (let row of rows) {
                    let found = false;
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

                updateBookCount();
            }

            // Обработчик поиска
            const searchInput = document.querySelector('.controls input[type="text"]');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    searchTable(e.target.value);
                });
            }

            // Функция обновления счетчика
            function updateBookCount() {
                const rows = document.querySelector('table tbody').getElementsByTagName('tr');
                const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
                document.getElementById('header-subtitle').textContent = `${visibleRows.length} книг`;
            }
        });
