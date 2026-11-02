
from getpass import getpass

from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

db = SessionLocal()

try:
    print("Create the first Admin account")

    full_name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password (hidden): ")

    if len(full_name) < 2:
        raise ValueError("Name must contain at least 2 characters.")

    if len(password) < 8 or len(password) > 72:
        raise ValueError("Password must be 8 to 72 characters.")

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise ValueError(
            "This email already exists. Use a different email."
        )

    admin = User(
        full_name=full_name,
        email=email,
        password=hash_password(password),
        role="Admin"
    )

    db.add(admin)
    db.commit()

    print("Admin account created successfully!")

except Exception as error:
    db.rollback()
    print("Error:", error)

finally:
    db.close()
