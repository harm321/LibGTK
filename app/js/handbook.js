// Обработчики для навигационной панели
    const navButtons = document.querySelectorAll('.nav-section.dropdown');
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем переход по ссылке для dropdown элементов
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
