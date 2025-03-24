from flask import Flask, render_template, request, redirect, session, url_for
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key'

# データベース初期化
def init_db():
    conn = sqlite3.connect('data.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media TEXT,
            article_id TEXT,
            title TEXT,
            source TEXT,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route("/", methods=["GET", "POST"])
def form():
    if request.method == "POST":
        media = request.form.get("media")
        article_id = request.form.get("article_id")
        title = request.form.get("title")
        source = request.form.get("source")
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = sqlite3.connect("data.db")
        c = conn.cursor()
        c.execute("INSERT INTO sources (media, article_id, title, source, created_at) VALUES (?, ?, ?, ?, ?)",
                  (media, article_id, title, source, created_at))
        conn.commit()
        conn.close()

        return render_template("form.html", message="保存完了！")
    
    return render_template("form.html", message="")

@app.route("/history", methods=["GET", "POST"])
def history():
    results = []
    latest = []
    searched = False

    conn = sqlite3.connect("data.db")
    c = conn.cursor()

    if request.method == "POST":
        article_id = request.form.get("article_id")
        c.execute("SELECT media, article_id, title, source, created_at, id FROM sources WHERE article_id = ?", (article_id,))
        results = c.fetchall()
        searched = True
    else:
        c.execute("SELECT media, article_id, title, source, created_at, id FROM sources ORDER BY id DESC LIMIT 10")
        latest = c.fetchall()

    conn.close()
    return render_template("history.html", results=results, searched=searched, latest=latest)

@app.route("/delete", methods=["POST"])
def delete():
    delete_id = request.form.get("delete_id")
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("DELETE FROM sources WHERE id = ?", (delete_id,))
    conn.commit()
    conn.close()
    return redirect("/history")

def is_logged_in():
    return session.get("authenticated") == True

@app.before_request
def require_login():
    if request.endpoint not in ("login", "static") and not is_logged_in():
        return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        password = request.form.get("password")
        if password == "media":
            session["authenticated"] = True
            return redirect(url_for("form"))
        else:
            error = "パスワードが違います"

    return render_template("login.html", error=error)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

