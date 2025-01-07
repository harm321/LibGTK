from flask import Flask, app, render_template, request, redirect, url_for, Response
from models import db, LibraryRecord
import csv

@app.route('/book_arrival', methods=['GET', 'POST'])
def book_arrival():
    if request.method == 'POST':
        # Получаем данные из формы
        inventory_number = request.form['inventory_number']
        title = request.form['title']
        authors = request.form['authors']
        publication_year = request.form['publication_year']
        publisher = request.form['publisher']
        isbn = request.form['isbn']
        total_copies = request.form['total_copies']
        available_copies = request.form['available_copies']

        # Создаем новую запись
        new_record = LibraryRecord(
            inventory_number=inventory_number,
            title=title,
            authors=authors,
            publication_year=publication_year,
            publisher=publisher,
            isbn=isbn,
            total_copies=total_copies,
            available_copies=available_copies
        )

        # Добавляем запись в базу данных
        db.session.add(new_record)
        db.session.commit()

        return redirect(url_for('book_arrival'))

    search_query = request.args.get('search', '')
    if search_query:
        records = LibraryRecord.query.filter(LibraryRecord.title.contains(search_query)).all()
    else:
        records = LibraryRecord.query.all()  # Получаем все записи из базы данных

    return render_template('book_arrival.html', records=records, search_query=search_query) 

@app.route('/export')
def export():
    records = LibraryRecord.query.all()
    output = Response(content_type='text/csv')
    output.headers["Content-Disposition"] = "attachment; filename=library_records.csv"
    writer = csv.writer(output)

    # Записываем заголовки
    writer.writerow(['Инвентарный номер', 'Название', 'Автор(ы)', 'Год издания', 'Издательство', 'ISBN', 'Всего экземпляров', 'Доступные экземпляры'])

    # Записываем данные
    for record in records:
        writer.writerow([record.inventory_number, record.title, record.authors, record.publication_year, record.publisher, record.isbn, record.total_copies, record.available_copies])

    return output 