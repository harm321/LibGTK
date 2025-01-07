from flask import Flask, render_template
from models import db, LibraryRecord

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'  # Используйте SQLite для простоты
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()  # Создаем таблицы, если они не существуют

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/book_arrival')
def book_arrival():
    records = LibraryRecord.query.all()  # Получаем все записи из базы данных
    return render_template('book_arrival.html', records=records)

@app.route('/book_retirement')
def book_retirement():
    return render_template('book_retirement.html')

@app.route('/fund_movements')
def fund_movements():
    return render_template('fund_movements.html')

@app.route('/fund_receipt')
def fund_receipt():
    return render_template('fund_receipt.html')

@app.route('/handbook')
def handbook():
    return render_template('handbook.html')

@app.route('/inventory_book')
def inventory_book():
    return render_template('inventory_book.html')

@app.route('/lib_record')
def lib_record():
    return render_template('lib_record.html')

@app.route('/library_catalog')
def library_catalog():
    return render_template('library_catalog.html')

@app.route('/magazine_catalog')
def magazine_catalog():
    return render_template('magazine_catalog.html')

@app.route('/reader_description')
def reader_description():
    return render_template('reader_description.html')




if __name__ == '__main__':
    app.run(debug=True)