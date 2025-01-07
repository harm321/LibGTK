// Добавьте эту функцию перед document.addEventListener('DOMContentLoaded', function() {
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

        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация таблицы
            const tbody = document.querySelector('table tbody');
            tbody.innerHTML = '';
            // Получаем данные из PHP и преобразуем их в JavaScript
            const records = JSON.parse('<?php echo json_encode($records, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>');
            // Заполняем таблицу данными
            records.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fixed-checkbox">
                        <input type="checkbox" class="row-checkbox">
                    </td>
                    <td>${escapeHtml(record.record_date) || ''}</td>
                    <td>${escapeHtml(record.record_number) || ''}</td>
                    <td>${escapeHtml(record.source_of_supply) || ''}</td>
                    <td>${escapeHtml(record.document_number_or_date) || ''}</td>
                    <td>${escapeHtml(record.total_physical_copies) || ''}</td>
                    <td>${escapeHtml(record.copies_in_kazakh) || ''}</td>
                    <td>${escapeHtml(record.copies_in_other_languages) || ''}</td>
                    <td>${escapeHtml(record.amount_in_tenge) || ''}</td>
                    <td>${escapeHtml(record.total_electronic_copies) || ''}</td>
                    <td>${escapeHtml(record.electronic_copies_in_kazakh) || ''}</td>
                    <td>${escapeHtml(record.electronic_copies_in_other_languages) || ''}</td>
                    <td>${escapeHtml(record.electronic_amount_in_tenge) || ''}</td>
                    <td>${escapeHtml(record.notes) || ''}</td>
                    <td class="fixed-menu">
                        <button class="menu-btn">
                            <img src="./img/library-dashboard/menu-ico.svg" alt="Меню" class="menu-icon">
                        </button>
                        <div class="menu-options">
                            <button class="menu-icon-btn edit-btn" data-id="${escapeHtml(record.record_number)}">
                                <img src="./img/library-dashboard/edit-ico.svg" alt="Редактировать" class="menu-icon">
                            </button>
                            <button class="menu-icon-btn delete-btn" data-id="${escapeHtml(record.record_number)}">
                                <img src="./img/library-dashboard/delete-ico.svg" alt="Удалить" class="menu-icon">
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Обновляем счетчик
            updateRecordCount();

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
                        
                        if (!id) {
                            formData.delete('id');
                        } else {
                            formData.append('id', id);
                        }

                        const response = await fetch('handlers/save_fund_receipt.php', {
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

            // Обработчики кнопок редактирования
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const id = this.dataset.id;
                    try {
                        const response = await fetch(`handlers/get_fund_receipt.php?id=${id}`);
                        if (!response.ok) {
                            throw new Error('Ошибка при загрузке данных');
                        }
                        const result = await response.json();
                        
                        if (!result.success || !result.data) {
                            throw new Error('Данные не найдены');
                        }

                        const data = result.data;
                        const form = document.getElementById('addBookForm');
                        
                        // Устанавливаем ID записи
                        document.getElementById('record_id').value = data.record_number;

                        // Заполняем форму данными
                        Object.keys(data).forEach(key => {
                            const input = form.elements[key];
                            if (input) {
                                input.value = data[key] || '';
                            }
                        });

                        // Открываем модальное окно
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
                        alert('Ошибка при загрузке данных: ' + error.message);
                    }
                });
            });

            // Обработчики кнопок удаления
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                        const id = this.dataset.id;
                        try {
                            const response = await fetch(`handlers/delete_fund_receipt.php?id=${id}`, {
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

                updateRecordCount(true);
            }

            // Обработчик поиска
            const searchInput = document.querySelector('.controls input[type="text"]');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    searchTable(e.target.value);
                });

                // Добавляем очистку поиска при нажатии Escape
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        this.value = '';
                        this.dispatchEvent(new Event('input'));
                    }
                });
            }

            // Функция обновления счетчика записей
            function updateRecordCount(isSearch = false) {
                const tbody = document.querySelector('table tbody');
                const rows = tbody.getElementsByTagName('tr');
                let visibleCount = 0;

                Array.from(rows).forEach(row => {
                    if (row.style.display !== 'none') {
                        visibleCount++;
                    }
                });

                const headerSubtitle = document.getElementById('header-subtitle');
                if (headerSubtitle) {
                    if (isSearch) {
                        const totalCount = rows.length;
                        headerSubtitle.textContent = `Найдено ${visibleCount} из ${totalCount} записей`;
                    } else {
                        headerSubtitle.textContent = `${visibleCount} записей`;
                    }
                }
            }

            // Обработчик выбора всех записей
            const selectAllCheckbox = document.getElementById('selectAll');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', function() {
                    const checkboxes = document.querySelectorAll('.row-checkbox');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = this.checked;
                    });
                });
            }

            // Закрытие модального окна при клике вне его
            window.addEventListener('click', function(e) {
                const modal = document.getElementById('addBookModal');
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Обработчики для навигационной панели
            const navButtons = document.querySelectorAll('.nav-section');
            navButtons.forEach(button => {
                if (button.tagName === 'BUTTON') {
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
                }
            });

            // Закрытие подменю при клике вне навигации
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.sidebar')) {
                    document.querySelectorAll('.submenu').forEach(menu => {
                        menu.style.display = 'none';
                    });
                }
            });

            // Обработчик кнопки экспорта
            const exportButton = document.querySelector('.export-button');
            if (exportButton) {
                exportButton.addEventListener('click', async function() {
                    try {
                        window.location.href = 'handlers/export_fund_receipt.php';
                    } catch (error) {
                        console.error('Ошибка:', error);
                        alert('Произошла ошибка при экспорте данных');
                    }
                });
            }
        });
