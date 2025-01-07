from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class LibraryRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    inventory_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    authors = db.Column(db.String(255))
    publication_year = db.Column(db.Integer)
    publisher = db.Column(db.String(255))
    isbn = db.Column(db.String(20))
    total_copies = db.Column(db.Integer)
    available_copies = db.Column(db.Integer)

    def __repr__(self):
        return f'<LibraryRecord {self.title}>'
