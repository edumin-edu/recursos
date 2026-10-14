import sqlite3
import shutil
import os

db_orig = r'C:\Users\HP\AppData\Local\Google\DriveFS\113087828932978045344\metadata_sqlite_db'
db_copy = r'c:\Users\HP\Documents\GitHub\materiales-diplomados\temp_db.sqlite'
shutil.copyfile(db_orig, db_copy)

conn = sqlite3.connect(db_copy)
c = conn.cursor()

tables = [row[0] for row in c.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
print('Tables:', tables)

for t in tables:
    cols = [col[1] for col in c.execute(f"PRAGMA table_info({t});").fetchall()]
    text_cols = [col for col in cols if 'title' in col.lower() or 'name' in col.lower() or 'id' in col.lower()]
    print(t, '->', text_cols)

conn.close()
if os.path.exists(db_copy):
    os.remove(db_copy)
