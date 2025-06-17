from flask import Flask, render_template, request, redirect, url_for, session, send_file
import csv
import io
import psycopg2
import os
from datetime import datetime
from flask import jsonify
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # 任意の秘密鍵でOK
ADMIN_PASSWORD = "your-admin-password"

# PostgreSQL接続
def get_db_connection():
    return psycopg2.connect(
        dbname=os.environ.get("SUPABASE_DB_NAME"),
        user=os.environ.get("SUPABASE_DB_USER"),
        password=os.environ.get("SUPABASE_DB_PASSWORD"),
        host=os.environ.get("SUPABASE_DB_HOST"),
        port=os.environ.get("SUPABASE_DB_PORT", "5432")
    )

# 初回だけテーブル作成（ローカルで1回動かすかpsqlで実行してね）
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sources (
            id SERIAL PRIMARY KEY,
            media TEXT,
            article_id TEXT,
            title TEXT,
            source TEXT,
            created_at TEXT,
            sp_rank TEXT,
            pc_rank TEXT,
            note TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.route("/", methods=["GET", "POST"])
def form():
    if request.method == "POST":
        media = request.form.get("media")
        article_id = request.form.get("article_id")
        sp_rank = request.form.get("sp_rank")
        pc_rank = request.form.get("pc_rank")
        title = request.form.get("title")
        source = request.form.get("source")
        note = request.form.get("note")
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO sources (media, article_id, title, source, created_at, sp_rank, pc_rank, note)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (media, article_id, title, source, created_at, sp_rank, pc_rank, note))
        conn.commit()
        conn.close()
        return render_template("form.html", message="保存完了！")
    
    return render_template("form.html", message="")

@app.route("/form")
def form_redirect():
    return redirect("/")

@app.route("/history", methods=["GET", "POST"])
def history():
    results = []
    latest = []
    searched = False

    conn = get_db_connection()
    cur = conn.cursor()

    if request.method == "POST":
        article_id = request.form.get("article_id")
        cur.execute("""
            SELECT media, article_id, title, source, created_at, id, sp_rank, pc_rank, note
            FROM sources
            WHERE article_id = %s
        """, (article_id,))
        results = cur.fetchall()
        searched = True
    else:
        cur.execute("""
            SELECT media, article_id, title, source, created_at, id, sp_rank, pc_rank, note
            FROM sources
            ORDER BY id DESC LIMIT 10
        """)
        latest = cur.fetchall()

    conn.close()
    return render_template("history.html", results=results, searched=searched, latest=latest)

@app.route("/delete", methods=["POST"])
def delete():
    delete_id = request.form.get("delete_id")
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM sources WHERE id = %s", (delete_id,))
    conn.commit()
    conn.close()
    return redirect("/history")

# ログイン関連
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

@app.route("/diff")
def diff():
    return render_template("diff.html")

@app.route("/js-ad")
def js_ad():
    return render_template("js_ad.html")

@app.route("/ad-creator")
def ad_creator():
    return render_template("ad_creator.html")

@app.route("/highlight")
def highlight():
    return render_template("highlight.html")

@app.route("/article-master")
def article_master():
    return render_template("article_master.html")

@app.route("/api/rank_history/<article_id>")
def rank_history(article_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT created_at, sp_rank, pc_rank
        FROM sources
        WHERE article_id = %s
        ORDER BY created_at
    """, (article_id,))
    rows = cur.fetchall()
    conn.close()

    history = [
        {"created_at": row[0], "sp_rank": row[1], "pc_rank": row[2]}
        for row in rows
        if row[1] is not None or row[2] is not None
    ]
    return {"history": history}

# 管理画面
@app.route("/admin", methods=["GET", "POST"])
def admin():
    error = None
    if request.method == "POST":
        password = request.form.get("admin_password")
        if password == "mogly":  # パスワードは適宜変更してください
            session["is_admin"] = True
            return redirect("/admin")
        else:
            error = "パスワードが違います"
    return render_template("admin.html", error=error)

@app.route("/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    return redirect("/admin")

@app.route("/admin/download")
def download_csv():
    if not session.get("is_admin"):
        return redirect("/admin")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT media, article_id, title, source, created_at, sp_rank, pc_rank, note FROM sources")
    rows = cur.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["media", "article_id", "title", "source", "created_at", "sp_rank", "pc_rank", "note"])
    writer.writerows(rows)
    output.seek(0)

    return send_file(io.BytesIO(output.getvalue().encode("utf-8")),
                    mimetype="text/csv",
                    as_attachment=True,
                    download_name="sources.csv")

@app.route("/admin/upload", methods=["POST"])
def upload_csv():
    if not session.get("is_admin"):
        return redirect("/admin")

    file = request.files.get("csv_file")
    if not file:
        return redirect("/admin")

    stream = io.StringIO(file.stream.read().decode("utf-8"))
    reader = csv.DictReader(stream)

    conn = get_db_connection()
    cur = conn.cursor()

    for row in reader:
        cur.execute("""
            INSERT INTO sources (media, article_id, title, source, created_at, sp_rank, pc_rank, note)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
            row["media"], row["article_id"], row["title"], row["source"],
            row["created_at"], row.get("sp_rank"), row.get("pc_rank"), row.get("note")
        ))
    conn.commit()
    conn.close()

    return redirect("/admin")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
